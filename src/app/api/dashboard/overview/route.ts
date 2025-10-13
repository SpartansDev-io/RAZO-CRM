import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  try {
    const currentDate = new Date();
    const todayStart = new Date(currentDate.setHours(0, 0, 0, 0)).toISOString();
    const todayEnd = new Date(currentDate.setHours(23, 59, 59, 999)).toISOString();
    const next7Days = new Date();
    next7Days.setDate(next7Days.getDate() + 7);

    // 1. Notificaciones no leídas
    const { count: unreadNotifications } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)
      .eq('is_archived', false);

    // 2. Tareas pendientes
    const { count: pendingTasks } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'in_progress']);

    // 3. Tareas vencidas
    const { count: overdueTasks } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'in_progress'])
      .lt('due_date', currentDate.toISOString());

    // 4. Sesiones próximos 7 días
    const { count: upcomingSessions } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .gte('session_date', currentDate.toISOString())
      .lte('session_date', next7Days.toISOString())
      .in('status', ['scheduled', 'confirmed'])
      .is('deleted_at', null);

    // 5. Pagos pendientes
    const { data: pendingPayments, error: paymentsError } = await supabase
      .from('sessions')
      .select('session_cost, paid_amount')
      .in('payment_status', ['pending', 'partial'])
      .eq('status', 'completed')
      .is('deleted_at', null);

    if (paymentsError) throw paymentsError;

    const totalPendingAmount = pendingPayments?.reduce((sum, session) => {
      const cost = parseFloat(session.session_cost) || 0;
      const paid = parseFloat(session.paid_amount) || 0;
      return sum + (cost - paid);
    }, 0) || 0;

    const pendingPaymentsCount = pendingPayments?.length || 0;

    // 6. Reportes mensuales pendientes
    const { count: pendingReports } = await supabase
      .from('monthly_contract_reports')
      .select('*', { count: 'exact', head: true })
      .in('payment_status', ['pending', 'overdue']);

    // 7. Contratos por vencer (próximos 30 días)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const { count: expiringContracts } = await supabase
      .from('contracts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .gte('end_date', currentDate.toISOString().split('T')[0])
      .lte('end_date', thirtyDaysFromNow.toISOString().split('T')[0])
      .is('deleted_at', null);

    // 8. Pacientes con sesiones hoy
    const { data: todaySessionsPatients } = await supabase
      .from('sessions')
      .select('patient_id')
      .gte('session_date', todayStart)
      .lte('session_date', todayEnd)
      .in('status', ['scheduled', 'confirmed', 'in_progress'])
      .is('deleted_at', null);

    const uniquePatientsToday = new Set(todaySessionsPatients?.map(s => s.patient_id)).size;

    // 9. Tasa de cancelación últimos 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentSessions } = await supabase
      .from('sessions')
      .select('status')
      .gte('session_date', thirtyDaysAgo.toISOString())
      .is('deleted_at', null);

    const totalRecentSessions = recentSessions?.length || 0;
    const cancelledSessions = recentSessions?.filter(s =>
      s.status === 'cancelled' || s.status === 'no_show'
    ).length || 0;

    const cancellationRate = totalRecentSessions > 0
      ? ((cancelledSessions / totalRecentSessions) * 100).toFixed(1)
      : '0';

    // 10. Empresas activas con contratos vigentes
    const { count: activeCompaniesWithContracts } = await supabase
      .from('companies')
      .select('*, contracts!inner(*)', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('contracts.status', 'active')
      .is('deleted_at', null)
      .is('contracts.deleted_at', null);

    return NextResponse.json({
      success: true,
      data: {
        alerts: {
          unreadNotifications: unreadNotifications || 0,
          pendingTasks: pendingTasks || 0,
          overdueTasks: overdueTasks || 0,
          upcomingSessions: upcomingSessions || 0,
          expiringContracts: expiringContracts || 0,
          pendingReports: pendingReports || 0
        },
        financial: {
          pendingPayments: {
            count: pendingPaymentsCount,
            amount: totalPendingAmount,
            formatted: new Intl.NumberFormat('es-MX', {
              style: 'currency',
              currency: 'MXN',
              minimumFractionDigits: 2
            }).format(totalPendingAmount)
          }
        },
        activity: {
          uniquePatientsToday: uniquePatientsToday,
          cancellationRate: parseFloat(cancellationRate),
          cancellationRateFormatted: `${cancellationRate}%`,
          activeCompanies: activeCompaniesWithContracts || 0
        },
        summary: {
          needsAttention: (overdueTasks || 0) + (expiringContracts || 0) + (pendingReports || 0),
          hasUrgentItems: (overdueTasks || 0) > 0 || (expiringContracts || 0) > 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener resumen del dashboard',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
