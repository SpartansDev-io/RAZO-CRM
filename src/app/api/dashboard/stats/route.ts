import { NextResponse } from 'next/server';
import { prisma } from '@/modules/shared/infrastructure/database/prisma';
export async function GET() {
  try {
    const currentDate = new Date();
    const currentMonthStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const lastMonthStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1,
    );
    const lastMonthEnd = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0,
    );
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1️⃣ Total de pacientes activos
    const activePatientsCount = await prisma.patient.count({
      where: {
        status: 'active',
        deletedAt: null,
      },
    });

    // Pacientes del mes pasado para calcular cambio
    const lastMonthPatientsCount = await prisma.patient.count({
      where: {
        status: 'active',
        deletedAt: null,
        createdAt: { lt: currentMonthStart },
      },
    });

    const patientsChange =
      lastMonthPatientsCount > 0
        ? (
            ((activePatientsCount - lastMonthPatientsCount) /
              lastMonthPatientsCount) *
            100
          ).toFixed(1)
        : '0';

    // 2️⃣ Citas de hoy
    const todayStart = new Date(currentDate);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(currentDate);
    todayEnd.setHours(23, 59, 59, 999);

    const appointmentsTodayCount = await prisma.session.count({
      where: {
        sessionDate: { gte: todayStart, lte: todayEnd },
        status: { in: ['scheduled', 'confirmed', 'in_progress'] },
        deletedAt: null,
      },
    });

    // Citas de ayer para calcular cambio
    const yesterdayStart = new Date();
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    yesterdayStart.setHours(0, 0, 0, 0);

    const yesterdayEnd = new Date();
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
    yesterdayEnd.setHours(23, 59, 59, 999);

    const yesterdayAppointmentsCount = await prisma.session.count({
      where: {
        sessionDate: { gte: yesterdayStart, lte: yesterdayEnd },
        status: { in: ['scheduled', 'confirmed', 'in_progress'] },
        deletedAt: null,
      },
    });

    const appointmentsChange =
      appointmentsTodayCount - yesterdayAppointmentsCount;

    // 3️⃣ Ingresos del mes actual
    const revenueThisMonth = await prisma.session.aggregate({
      _sum: { sessionCost: true },
      where: {
        sessionDate: { gte: currentMonthStart },
        status: 'completed',
        deletedAt: null,
      },
    });

    const revenueLastMonth = await prisma.session.aggregate({
      _sum: { sessionCost: true },
      where: {
        sessionDate: { gte: lastMonthStart, lte: lastMonthEnd },
        status: 'completed',
        deletedAt: null,
      },
    });

    const revenueThisMonthValue = revenueThisMonth._sum.sessionCost || 0;
    const revenueLastMonthValue = revenueLastMonth._sum.sessionCost || 0;

    const revenueChange =
      Number(revenueLastMonthValue) > 0
        ? (
            ((Number(revenueThisMonthValue) - Number(revenueLastMonthValue)) /
              Number(revenueLastMonthValue)) *
            100
          ).toFixed(1)
        : '0';

    // 4️⃣ Tasa de asistencia últimos 30 días
    const attendanceData = await prisma.session.findMany({
      where: {
        sessionDate: { gte: thirtyDaysAgo, lte: currentDate },
        status: { in: ['completed', 'no_show', 'cancelled'] },
        deletedAt: null,
      },
      select: { status: true },
    });

    type SessionStatusOnly = { status: string };

    const totalSessionsLast30Days = attendanceData.length;
    const completedSessions = attendanceData.filter(
      (s: SessionStatusOnly) => s.status === 'completed',
    ).length;
    const attendanceRate =
      totalSessionsLast30Days > 0
        ? ((completedSessions / totalSessionsLast30Days) * 100).toFixed(1)
        : '0';

    // Tasa de asistencia período anterior (30-60 días atrás)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const previousAttendanceData = await prisma.session.findMany({
      where: {
        sessionDate: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        status: { in: ['completed', 'no_show', 'cancelled'] },
        deletedAt: null,
      },
      select: { status: true },
    });

    const previousTotalSessions = previousAttendanceData.length;
    const previousCompletedSessions = previousAttendanceData.filter(
      (s: SessionStatusOnly) => s.status === 'completed',
    ).length;
    const previousAttendanceRate =
      previousTotalSessions > 0
        ? (previousCompletedSessions / previousTotalSessions) * 100
        : 0;

    const attendanceChange = (
      parseFloat(attendanceRate) - previousAttendanceRate
    ).toFixed(1);

    return NextResponse.json({
      success: true,
      data: {
        activePatients: {
          value: activePatientsCount,
          change: patientsChange,
          changeType: parseFloat(patientsChange) >= 0 ? 'increase' : 'decrease',
          label: 'vs mes anterior',
        },
        appointmentsToday: {
          value: appointmentsTodayCount,
          change:
            appointmentsChange >= 0
              ? `+${appointmentsChange}`
              : `${appointmentsChange}`,
          changeType: appointmentsChange >= 0 ? 'increase' : 'decrease',
          label: 'vs ayer',
        },
        revenueThisMonth: {
          value: revenueThisMonthValue,
          formatted: new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0,
          }).format(Number(revenueLastMonthValue)),
          change: revenueChange,
          changeType: parseFloat(revenueChange) >= 0 ? 'increase' : 'decrease',
          label: 'vs mes anterior',
        },
        attendanceRate: {
          value: parseFloat(attendanceRate),
          formatted: `${attendanceRate}%`,
          change: attendanceChange,
          changeType:
            parseFloat(attendanceChange) >= 0 ? 'increase' : 'decrease',
          label: 'últimos 30 días',
        },
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener estadísticas del dashboard',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
