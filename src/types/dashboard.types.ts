// Dashboard Statistics Types
export interface DashboardStats {
  activePatients: StatItem;
  appointmentsToday: StatItem;
  revenueThisMonth: RevenueStatItem;
  attendanceRate: StatItem;
}

export interface StatItem {
  value: number;
  change: string;
  changeType: 'increase' | 'decrease';
  label: string;
}

export interface RevenueStatItem extends StatItem {
  formatted: string;
}

// Dashboard Appointments Types
export interface DashboardAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientPhoto?: string;
  time: string;
  fullDateTime: string;
  type: string;
  duration: number;
  appointmentType: 'presencial' | 'videollamada' | 'visita';
  meetLink?: string;
  status: 'scheduled' | 'confirmed' | 'in_progress';
  confirmed: boolean;
  therapistId?: string;
  therapistName: string;
  therapistAvatar?: string;
}

export interface AppointmentsResponse {
  appointments: DashboardAppointment[];
  total: number;
  date: string;
  summary: {
    confirmed: number;
    pending: number;
    inProgress: number;
  };
}

// Dashboard Patients Types
export interface DashboardPatient {
  id: string;
  name: string;
  email: string;
  phone: string;
  photoUrl?: string;
  status: string;
  company: {
    id: string;
    name: string;
  } | null;
  primaryTherapist: {
    id: string;
    name: string;
  } | null;
  lastSession: {
    date: string;
    status: string;
    formatted: string;
  } | null;
  sessionCount: {
    total: number;
    completed: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PatientsResponse {
  patients: DashboardPatient[];
  total: number;
  newThisMonth: number;
  returned: number;
}

// Dashboard Overview Types
export interface DashboardOverview {
  alerts: {
    unreadNotifications: number;
    pendingTasks: number;
    overdueTasks: number;
    upcomingSessions: number;
    expiringContracts: number;
    pendingReports: number;
  };
  financial: {
    pendingPayments: {
      count: number;
      amount: number;
      formatted: string;
    };
  };
  activity: {
    uniquePatientsToday: number;
    cancellationRate: number;
    cancellationRateFormatted: string;
    activeCompanies: number;
  };
  summary: {
    needsAttention: number;
    hasUrgentItems: boolean;
  };
}

// API Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}
