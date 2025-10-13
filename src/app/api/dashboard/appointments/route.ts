import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const limit = parseInt(searchParams.get('limit') || '10');

    // Parsear la fecha y obtener inicio y fin del día
    const targetDate = new Date(date);
    const dayStart = new Date(targetDate.setHours(0, 0, 0, 0)).toISOString();
    const dayEnd = new Date(targetDate.setHours(23, 59, 59, 999)).toISOString();

    // Obtener citas del día con información del paciente y terapeuta
    const { data: appointments, error } = await supabase
      .from('sessions')
      .select(`
        id,
        session_date,
        session_type,
        session_duration_minutes,
        appointment_type,
        meet_link,
        status,
        confirmed_at,
        patient_id,
        patients!inner (
          id,
          name,
          email,
          phone,
          photo_url
        ),
        therapist_id,
        user_profiles:therapist_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .gte('session_date', dayStart)
      .lte('session_date', dayEnd)
      .in('status', ['scheduled', 'confirmed', 'in_progress'])
      .is('deleted_at', null)
      .order('session_date', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    // Transformar los datos para el frontend
    const formattedAppointments = appointments?.map((apt: any) => {
      const sessionDate = new Date(apt.session_date);
      const patient = Array.isArray(apt.patients) ? apt.patients[0] : apt.patients;
      const therapist = Array.isArray(apt.user_profiles) ? apt.user_profiles[0] : apt.user_profiles;

      return {
        id: apt.id,
        patientId: apt.patient_id,
        patientName: patient?.name || 'Desconocido',
        patientEmail: patient?.email || '',
        patientPhone: patient?.phone || '',
        patientPhoto: patient?.photo_url,
        time: sessionDate.toLocaleTimeString('es-MX', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }),
        fullDateTime: apt.session_date,
        type: apt.session_type,
        duration: apt.session_duration_minutes,
        appointmentType: apt.appointment_type || 'presencial',
        meetLink: apt.meet_link,
        status: apt.status,
        confirmed: apt.confirmed_at ? true : false,
        therapistId: apt.therapist_id,
        therapistName: therapist?.full_name || 'Sin asignar',
        therapistAvatar: therapist?.avatar_url
      };
    }) || [];

    // Obtener el conteo total de citas del día
    const { count: totalCount } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .gte('session_date', dayStart)
      .lte('session_date', dayEnd)
      .in('status', ['scheduled', 'confirmed', 'in_progress'])
      .is('deleted_at', null);

    return NextResponse.json({
      success: true,
      data: {
        appointments: formattedAppointments,
        total: totalCount || 0,
        date: date,
        summary: {
          confirmed: formattedAppointments.filter(a => a.status === 'confirmed').length,
          pending: formattedAppointments.filter(a => a.status === 'scheduled').length,
          inProgress: formattedAppointments.filter(a => a.status === 'in_progress').length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener citas',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
