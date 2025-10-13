import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'created_at'; // created_at, updated_at, last_session
    const order = searchParams.get('order') || 'desc';

    let query = supabase
      .from('patients')
      .select(`
        id,
        name,
        email,
        phone,
        photo_url,
        status,
        created_at,
        updated_at,
        company:companies (
          id,
          name
        ),
        primary_therapist:user_profiles!primary_therapist_id (
          id,
          full_name
        )
      `)
      .eq('status', 'active')
      .is('deleted_at', null);

    // Ordenamiento
    if (sortBy === 'created_at' || sortBy === 'updated_at') {
      query = query.order(sortBy, { ascending: order === 'asc' });
    }

    query = query.limit(limit);

    const { data: patients, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    // Para cada paciente, obtener la última sesión
    const patientsWithSessions = await Promise.all(
      (patients || []).map(async (patient: any) => {
        const company = Array.isArray(patient.company) ? patient.company[0] : patient.company;
        const therapist = Array.isArray(patient.primary_therapist) ? patient.primary_therapist[0] : patient.primary_therapist;
        const { data: lastSession } = await supabase
          .from('sessions')
          .select('session_date, status')
          .eq('patient_id', patient.id)
          .is('deleted_at', null)
          .order('session_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        // Contar total de sesiones
        const { count: totalSessions } = await supabase
          .from('sessions')
          .select('*', { count: 'exact', head: true })
          .eq('patient_id', patient.id)
          .is('deleted_at', null);

        // Contar sesiones completadas
        const { count: completedSessions } = await supabase
          .from('sessions')
          .select('*', { count: 'exact', head: true })
          .eq('patient_id', patient.id)
          .eq('status', 'completed')
          .is('deleted_at', null);

        return {
          id: patient.id,
          name: patient.name,
          email: patient.email,
          phone: patient.phone,
          photoUrl: patient.photo_url,
          status: patient.status,
          company: company ? {
            id: company.id,
            name: company.name
          } : null,
          primaryTherapist: therapist ? {
            id: therapist.id,
            name: therapist.full_name
          } : null,
          lastSession: lastSession ? {
            date: lastSession.session_date,
            status: lastSession.status,
            formatted: new Date(lastSession.session_date).toLocaleDateString('es-MX', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })
          } : null,
          sessionCount: {
            total: totalSessions || 0,
            completed: completedSessions || 0
          },
          createdAt: patient.created_at,
          updatedAt: patient.updated_at
        };
      })
    );

    // Si se solicitó ordenar por última sesión, hacerlo aquí
    if (sortBy === 'last_session') {
      patientsWithSessions.sort((a, b) => {
        const dateA = a.lastSession?.date ? new Date(a.lastSession.date).getTime() : 0;
        const dateB = b.lastSession?.date ? new Date(b.lastSession.date).getTime() : 0;
        return order === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }

    // Estadísticas adicionales
    const { count: totalActivePatients } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .is('deleted_at', null);

    const { count: newPatientsThisMonth } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .is('deleted_at', null)
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

    return NextResponse.json({
      success: true,
      data: {
        patients: patientsWithSessions,
        total: totalActivePatients || 0,
        newThisMonth: newPatientsThisMonth || 0,
        returned: patientsWithSessions.length
      }
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener pacientes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
