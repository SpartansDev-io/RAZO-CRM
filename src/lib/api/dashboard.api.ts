import type {
  ApiResponse,
  DashboardStats,
  AppointmentsResponse,
  PatientsResponse,
  DashboardOverview
} from '@/types/dashboard.types';

const API_BASE_URL = '/api/dashboard';

/**
 * Obtiene las estadísticas generales del dashboard
 */
export async function getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store' // Siempre obtener datos frescos
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      success: false,
      error: 'Error al obtener estadísticas',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Obtiene las citas del día (o de una fecha específica)
 */
export async function getDashboardAppointments(
  date?: string,
  limit: number = 10
): Promise<ApiResponse<AppointmentsResponse>> {
  try {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    params.append('limit', limit.toString());

    const response = await fetch(`${API_BASE_URL}/appointments?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return {
      success: false,
      error: 'Error al obtener citas',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Obtiene la lista de pacientes recientes
 */
export async function getDashboardPatients(
  limit: number = 10,
  sortBy: 'created_at' | 'updated_at' | 'last_session' = 'created_at',
  order: 'asc' | 'desc' = 'desc'
): Promise<ApiResponse<PatientsResponse>> {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      sortBy,
      order
    });

    const response = await fetch(`${API_BASE_URL}/patients?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching patients:', error);
    return {
      success: false,
      error: 'Error al obtener pacientes',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Obtiene el resumen general del dashboard (alertas, actividad, etc.)
 */
export async function getDashboardOverview(): Promise<ApiResponse<DashboardOverview>> {
  try {
    const response = await fetch(`${API_BASE_URL}/overview`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    return {
      success: false,
      error: 'Error al obtener resumen del dashboard',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Obtiene todos los datos del dashboard en una sola llamada
 * Útil para optimizar carga inicial
 */
export async function getDashboardData() {
  try {
    const [stats, appointments, patients, overview] = await Promise.all([
      getDashboardStats(),
      getDashboardAppointments(),
      getDashboardPatients(),
      getDashboardOverview()
    ]);

    return {
      success: true,
      data: {
        stats: stats.data,
        appointments: appointments.data,
        patients: patients.data,
        overview: overview.data
      },
      errors: [
        stats.error,
        appointments.error,
        patients.error,
        overview.error
      ].filter(Boolean)
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      success: false,
      error: 'Error al obtener datos del dashboard',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
