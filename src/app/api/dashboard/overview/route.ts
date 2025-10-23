import { NextResponse } from 'next/server';
import { prisma } from '@/modules/shared/infrastructure/database/prisma';

export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));
    const next7Days = new Date();
    next7Days.setDate(next7Days.getDate() + 7);
    new Date().setDate(new Date().getDate() + 30);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    /** 1️⃣ Notificaciones no leídas */
    const unreadNotifications = await prisma.notification.count({
      where: {
        isRead: false,
        isArchived: false,
      },
    });

    /** 2️⃣ Tareas pendientes */
    const pendingTasks = await prisma.task.count({
      where: {
        status: { in: ['pending', 'in_progress'] },
      },
    });

    /** 3️⃣ Tareas vencidas */
    const overdueTasks = await prisma.task.count({
      where: {
        status: { in: ['pending', 'in_progress'] },
        dueDate: { lt: new Date() },
      },
    });

    /** 4️⃣ Sesiones próximos 7 días */
    const upcomingSessions = await prisma.session.count({
      where: {
        sessionDate: { gte: new Date(), lte: next7Days },
        status: { in: ['scheduled', 'confirmed'] },
        deletedAt: null,
      },
    });

    /** 5️⃣ Pagos pendientes */
    const pendingPayments = await prisma.session.findMany({
      where: {
        paymentStatus: { in: ['pending', 'partial'] },
        status: 'completed',
        deletedAt: null,
      },
      select: {
        sessionCost: true,
        paidAmount: true,
      },
    });

    const totalPendingAmount = pendingPayments.reduce(
      (
        sum: number,
        s: {
          sessionCost: number | string | null;
          paidAmount: number | string | null;
        },
      ) => {
        const cost = Number(s.sessionCost) || 0;
        const paid = Number(s.paidAmount) || 0;
        return sum + (cost - paid);
      },
      0,
    );

    const pendingPaymentsCount = pendingPayments.length;

    /** 6️⃣ Reportes mensuales pendientes */
    const pendingReports = await prisma.monthlyContractReport.count({
      where: {
        paymentStatus: { in: ['pending', 'overdue'] },
      },
    });

    /** 7️⃣ Contratos por vencer (30 días) */
    const expiringContracts = await prisma.contract.count({
      where: {
        status: 'active',
        endDate: {
          gte: new Date(),
          lte: new Date(),
        },
        deletedAt: null,
      },
    });

    /** 8️⃣ Pacientes con sesiones hoy */
    const todaySessionsPatients = await prisma.session.findMany({
      where: {
        sessionDate: { gte: todayStart, lte: todayEnd },
        status: { in: ['scheduled', 'confirmed', 'in_progress'] },
        deletedAt: null,
      },
      select: { patientId: true },
    });

    const uniquePatientsToday = new Set(
      todaySessionsPatients.map(
        (s: { patientId: string | number | null }) => s.patientId,
      ),
    ).size;

    /** 9️⃣ Tasa de cancelación últimos 30 días */
    const recentSessions = await prisma.session.findMany({
      where: {
        sessionDate: { gte: thirtyDaysAgo },
        deletedAt: null,
      },
      select: { status: true },
    });

    const totalRecentSessions = recentSessions.length;
    const cancelledSessions = recentSessions.filter(
      (s: { status: string }) =>
        s.status === 'cancelled' || s.status === 'no_show',
    ).length;

    const cancellationRate =
      totalRecentSessions > 0
        ? ((cancelledSessions / totalRecentSessions) * 100).toFixed(1)
        : '0';

    /** 🔟 Empresas activas con contratos vigentes */
    const activeCompaniesWithContracts = await prisma.company.count({
      where: {
        isActive: true,
        deletedAt: null,
        contracts: {
          some: {
            status: 'active',
            deletedAt: null,
          },
        },
      },
    });

    // ✅ Respuesta final
    return NextResponse.json({
      success: true,
      data: {
        alerts: {
          unreadNotifications,
          pendingTasks,
          overdueTasks,
          upcomingSessions,
          expiringContracts,
          pendingReports,
        },
        financial: {
          pendingPayments: {
            count: pendingPaymentsCount,
            amount: totalPendingAmount,
            formatted: new Intl.NumberFormat('es-MX', {
              style: 'currency',
              currency: 'MXN',
              minimumFractionDigits: 2,
            }).format(totalPendingAmount),
          },
        },
        activity: {
          uniquePatientsToday,
          cancellationRate: parseFloat(cancellationRate),
          cancellationRateFormatted: `${cancellationRate}%`,
          activeCompanies: activeCompaniesWithContracts,
        },
        summary: {
          needsAttention: overdueTasks + expiringContracts + pendingReports,
          hasUrgentItems: overdueTasks > 0 || expiringContracts > 0,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener resumen del dashboard',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
