import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  try {
    const currentDate = new Date();
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const lastMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    const thirtyDaysAgo = new Date(currentDate);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Total de pacientes activos
    const { count: activePatientsCount, error: patientsError } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .is('deleted_at', null);

    if (patientsError) throw patientsError;

    // Pacientes del mes pasado para calcular cambio
    const { count: lastMonthPatientsCount } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .is('deleted_at', null)
      .lt('created_at', currentMonthStart.toISOString());

    const patientsChange = lastMonthPatientsCount && lastMonthPatientsCount > 0
      ? (((activePatientsCount || 0) - lastMonthPatientsCount) / lastMonthPatientsCount * 100).toFixed(1)
      : '0';

    // 2. Citas de hoy
    const todayStart = new Date(currentDate.setHours(0, 0, 0, 0)).toISOString();
    const todayEnd = new Date(currentDate.setHours(23, 59, 59, 999)).toISOString();

    const { count: appointmentsTodayCount, error: appointmentsError } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .gte('session_date', todayStart)
      .lte('session_date', todayEnd)
      .in('status', ['scheduled', 'confirmed', 'in_progress'])
      .is('deleted_at', null);

    if (appointmentsError) throw appointmentsError;

    // Citas de ayer para calcular cambio
    const yesterdayStart = new Date();
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    yesterdayStart.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date();
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
    yesterdayEnd.setHours(23, 59, 59, 999);

    const { count: yesterdayAppointmentsCount } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .gte('session_date', yesterdayStart.toISOString())
      .lte('session_date', yesterdayEnd.toISOString())
      .in('status', ['scheduled', 'confirmed', 'in_progress'])
      .is('deleted_at', null);

    const appointmentsChange = (appointmentsTodayCount || 0) - (yesterdayAppointmentsCount || 0);

    // 3. Ingresos del mes actual
    const { data: revenueData, error: revenueError } = await supabase
      .from('sessions')
      .select('session_cost')
      .gte('session_date', currentMonthStart.toISOString())
      .eq('status', 'completed')
      .is('deleted_at', null);

    if (revenueError) throw revenueError;

    const revenueThisMonth = revenueData?.reduce((sum, session) => {
      return sum + (parseFloat(session.session_cost) || 0);
    }, 0) || 0;

    // Ingresos del mes pasado para calcular cambio
    const { data: lastMonthRevenueData } = await supabase
      .from('sessions')
      .select('session_cost')
      .gte('session_date', lastMonthStart.toISOString())
      .lte('session_date', lastMonthEnd.toISOString())
      .eq('status', 'completed')
      .is('deleted_at', null);

    const revenueLastMonth = lastMonthRevenueData?.reduce((sum, session) => {
      return sum + (parseFloat(session.session_cost) || 0);
    }, 0) || 0;

    const revenueChange = revenueLastMonth > 0
      ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth * 100).toFixed(1)
      : '0';

    // 4. Tasa de asistencia (últimos 30 días)
    const { data: attendanceData, error: attendanceError } = await supabase
      .from('sessions')
      .select('status')
      .gte('session_date', thirtyDaysAgo.toISOString())
      .lte('session_date', currentDate.toISOString())
      .in('status', ['completed', 'no_show', 'cancelled'])
      .is('deleted_at', null);

    if (attendanceError) throw attendanceError;

    const totalSessionsLast30Days = attendanceData?.length || 0;
    const completedSessions = attendanceData?.filter(s => s.status === 'completed').length || 0;
    const attendanceRate = totalSessionsLast30Days > 0
      ? ((completedSessions / totalSessionsLast30Days) * 100).toFixed(1)
      : '0';

    // Tasa de asistencia del período anterior (30-60 días atrás)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const { data: previousAttendanceData } = await supabase
      .from('sessions')
      .select('status')
      .gte('session_date', sixtyDaysAgo.toISOString())
      .lt('session_date', thirtyDaysAgo.toISOString())
      .in('status', ['completed', 'no_show', 'cancelled'])
      .is('deleted_at', null);

    const previousTotalSessions = previousAttendanceData?.length || 0;
    const previousCompletedSessions = previousAttendanceData?.filter(s => s.status === 'completed').length || 0;
    const previousAttendanceRate = previousTotalSessions > 0
      ? ((previousCompletedSessions / previousTotalSessions) * 100)
      : 0;

    const attendanceChange = (parseFloat(attendanceRate) - previousAttendanceRate).toFixed(1);

    return NextResponse.json({
      success: true,
      data: {
        activePatients: {
          value: activePatientsCount || 0,
          change: patientsChange,
          changeType: parseFloat(patientsChange) >= 0 ? 'increase' : 'decrease',
          label: 'vs mes anterior'
        },
        appointmentsToday: {
          value: appointmentsTodayCount || 0,
          change: appointmentsChange >= 0 ? `+${appointmentsChange}` : `${appointmentsChange}`,
          changeType: appointmentsChange >= 0 ? 'increase' : 'decrease',
          label: 'vs ayer'
        },
        revenueThisMonth: {
          value: revenueThisMonth,
          formatted: new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0
          }).format(revenueThisMonth),
          change: revenueChange,
          changeType: parseFloat(revenueChange) >= 0 ? 'increase' : 'decrease',
          label: 'vs mes anterior'
        },
        attendanceRate: {
          value: parseFloat(attendanceRate),
          formatted: `${attendanceRate}%`,
          change: attendanceChange,
          changeType: parseFloat(attendanceChange) >= 0 ? 'increase' : 'decrease',
          label: 'últimos 30 días'
        }
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener estadísticas del dashboard',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
