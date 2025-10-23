import { NextResponse } from 'next/server';
import { prisma } from '@/modules/shared/infrastructure/database/prisma';
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt'; // createdAt, updatedAt, last_session
    const order = searchParams.get('order') || 'desc';

    // 1️⃣ Obtener pacientes activos con sus relaciones
    const patients = await prisma.patient.findMany({
      where: {
        status: 'active',
        deletedAt: null,
      },
      include: {
        company: true,
        primaryTherapist: true,
      },
      take: limit,
      orderBy: sortBy === 'last_session' ? undefined : { [sortBy]: order },
    });

    // 2️⃣ Mapear pacientes para obtener última sesión y conteos
    const patientsWithSessions = await Promise.all(
      patients.map(async (patient: (typeof patients)[number]) => {
        // Última sesión
        const last_session = await prisma.session.findFirst({
          where: {
            patientId: patient.id,
            deletedAt: null,
          },
          orderBy: { sessionDate: 'desc' },
        });

        // Conteo total de sesiones
        const totalSessions = await prisma.session.count({
          where: {
            patientId: patient.id,
            deletedAt: null,
          },
        });

        // Conteo de sesiones completadas
        const completedSessions = await prisma.session.count({
          where: {
            patientId: patient.id,
            status: 'completed',
            deletedAt: null,
          },
        });

        return {
          id: patient.id,
          name: patient.name,
          email: patient.email,
          phone: patient.phone,
          photoUrl: patient.photoUrl,
          status: patient.status,
          company: patient.company
            ? {
                id: patient.company.id,
                name: patient.company.name,
              }
            : null,
          primaryTherapist: patient.primaryTherapist
            ? {
                id: patient.primaryTherapist.id,
                name: patient.primaryTherapist.fullName,
              }
            : null,
          last_session: last_session
            ? {
                date: last_session.sessionDate,
                status: last_session.status,
                formatted: last_session.sessionDate.toLocaleDateString(
                  'es-MX',
                  {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  },
                ),
              }
            : null,
          sessionCount: {
            total: totalSessions,
            completed: completedSessions,
          },
          createdAt: patient.createdAt,
          updatedAt: patient.updatedAt,
        };
      }),
    );

    // 3️⃣ Ordenar por última sesión si se solicitó
    if (sortBy === 'last_session') {
      patientsWithSessions.sort((a, b) => {
        const dateA = a.last_session?.date
          ? new Date(a.last_session.date).getTime()
          : 0;
        const dateB = b.last_session?.date
          ? new Date(b.last_session.date).getTime()
          : 0;
        return order === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }

    // 4️⃣ Estadísticas adicionales
    const totalActivePatients = await prisma.patient.count({
      where: { status: 'active', deletedAt: null },
    });

    const newPatientsThisMonth = await prisma.patient.count({
      where: {
        status: 'active',
        deletedAt: null,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        patients: patientsWithSessions,
        total: totalActivePatients,
        newThisMonth: newPatientsThisMonth,
        returned: patientsWithSessions.length,
      },
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener pacientes',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
