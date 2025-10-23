import { NextResponse } from 'next/server';
import { prisma } from '@/modules/shared/infrastructure/database/prisma';

export async function GET(request: Request) {
  console.log('Received request for appointments');

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const dateParam = searchParams.get('date');

    // Manejo robusto de fechas
    let targetDate: Date;
    if (dateParam) {
      targetDate = new Date(dateParam + 'T00:00:00-06:00');
    } else {
      // Fecha actual en GMT-6
      const now = new Date();
      const offset = 6 * 60 * 60000; // GMT-6 en milisegundos
      targetDate = new Date(now.getTime() - offset);
      targetDate.setHours(0, 0, 0, 0);
    }

    // Asegurar que estamos usando el día correcto en GMT-6
    const dateString = targetDate.toISOString().split('T')[0];

    // Rango del día en GMT-6 convertido a UTC
    const dayStart = new Date(`${dateString}T00:00:00-06:00`);
    const dayEnd = new Date(`${dateString}T23:59:59.999-06:00`);

    console.log('Target date:', dateString);
    console.log('Date range START (UTC):', dayStart.toISOString());
    console.log('Date range END (UTC):', dayEnd.toISOString());
    console.log('Date range START (Local):', dayStart.toString());
    console.log('Date range END (Local):', dayEnd.toString());

    // Verificar que las fechas sean válidas
    if (isNaN(dayStart.getTime()) || isNaN(dayEnd.getTime())) {
      throw new Error('Invalid date range');
    }

    // Obtener las sesiones del día
    const appointments = await prisma.session.findMany({
      where: {
        sessionDate: {
          gte: dayStart,
          lte: dayEnd,
        },
        status: {
          in: ['scheduled', 'confirmed', 'in_progress'],
        },
        deletedAt: null,
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            photoUrl: true,
          },
        },
        therapist: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        sessionDate: 'asc',
      },
      take: limit,
    });

    console.log(`Found ${appointments.length} appointments`);

    // Define the type for formatted appointments
    type FormattedAppointment = {
      id: string;
      patientId?: string;
      patientName: string;
      patientEmail: string;
      patientPhone: string;
      patientPhoto: string | null;
      time: string;
      fullDateTime: Date;
      type: string;
      duration: number;
      appointmentType: string;
      meetLink?: string | null;
      status: string;
      confirmed: boolean;
      therapistId?: string;
      therapistName: string;
      therapistAvatar: string | null;
    };

    // Transformar resultados
    // Define the type for the session object returned by Prisma
    type SessionWithRelations = {
      id: string;
      sessionDate: Date;
      sessionType: string;
      sessionDurationMinutes: number;
      appointmentType?: string | null;
      meetLink?: string | null;
      status: string;
      confirmedAt?: Date | null;
      deletedAt?: Date | null;
      patient?: {
        id: string;
        name: string;
        email: string;
        phone: string;
        photoUrl?: string | null;
      } | null;
      therapist?: {
        id: string;
        fullName: string;
        avatarUrl?: string | null;
      } | null;
    };

    const formattedAppointments: FormattedAppointment[] = appointments.map(
      (apt: SessionWithRelations) => {
        const sessionDate = new Date(apt.sessionDate);

        // Convertir a hora local GMT-6 para display
        const timeString = sessionDate.toLocaleTimeString('es-MX', {
          timeZone: 'America/Mexico_City', // Ajusta según tu zona GMT-6
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });

        return {
          id: apt.id,
          patientId: apt.patient?.id,
          patientName: apt.patient?.name || 'Desconocido',
          patientEmail: apt.patient?.email || '',
          patientPhone: apt.patient?.phone || '',
          patientPhoto: apt.patient?.photoUrl || null,
          time: timeString,
          fullDateTime: apt.sessionDate,
          type: apt.sessionType,
          duration: apt.sessionDurationMinutes,
          appointmentType: apt.appointmentType || 'presencial',
          meetLink: apt.meetLink,
          status: apt.status,
          confirmed: apt.confirmedAt ? true : false,
          therapistId: apt.therapist?.id,
          therapistName: apt.therapist?.fullName || 'Sin asignar',
          therapistAvatar: apt.therapist?.avatarUrl || null,
        };
      },
    );

    // Obtener conteo total del día
    const totalCount = await prisma.session.count({
      where: {
        sessionDate: {
          gte: dayStart,
          lte: dayEnd,
        },
        status: {
          in: ['scheduled', 'confirmed', 'in_progress'],
        },
        deletedAt: null,
      },
    });

    // Generar resumen
    const summary = {
      confirmed: formattedAppointments.filter(
        (a: FormattedAppointment) => a.status === 'confirmed',
      ).length,
      pending: formattedAppointments.filter(
        (a: FormattedAppointment) => a.status === 'scheduled',
      ).length,
      inProgress: formattedAppointments.filter(
        (a: FormattedAppointment) => a.status === 'in_progress',
      ).length,
    };

    return NextResponse.json({
      success: true,
      data: {
        appointments: formattedAppointments,
        total: totalCount,
        date: dateString,
        summary,
        debug: {
          dateRange: {
            start: dayStart.toISOString(),
            end: dayEnd.toISOString(),
          },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener citas',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
