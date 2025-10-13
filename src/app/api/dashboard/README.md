# API del Dashboard - Documentación

Esta carpeta contiene todos los endpoints de la API para el dashboard del CRM de terapia psicológica.

## 🎯 Endpoints Disponibles

### 1. **GET /api/dashboard/stats**
Obtiene las estadísticas generales del dashboard.

**Respuesta:**
```typescript
{
  success: true,
  data: {
    activePatients: {
      value: 24,
      change: "+12.5",
      changeType: "increase",
      label: "vs mes anterior"
    },
    appointmentsToday: {
      value: 8,
      change: "+2",
      changeType: "increase",
      label: "vs ayer"
    },
    revenueThisMonth: {
      value: 12450.00,
      formatted: "$12,450",
      change: "+8.3",
      changeType: "increase",
      label: "vs mes anterior"
    },
    attendanceRate: {
      value: 94.2,
      formatted: "94.2%",
      change: "+3.1",
      changeType: "increase",
      label: "últimos 30 días"
    }
  }
}
```

**Métricas incluidas:**
- **Pacientes activos**: Total de pacientes con status 'active'
- **Citas hoy**: Sesiones agendadas/confirmadas para hoy
- **Ingresos del mes**: Total de ingresos de sesiones completadas este mes
- **Tasa de asistencia**: Porcentaje de sesiones completadas vs canceladas/no-show (últimos 30 días)

---

### 2. **GET /api/dashboard/appointments**
Obtiene las citas del día (o de una fecha específica).

**Query Parameters:**
- `date` (opcional): Fecha en formato YYYY-MM-DD (default: hoy)
- `limit` (opcional): Número máximo de citas a retornar (default: 10)

**Ejemplo:**
```
GET /api/dashboard/appointments?date=2025-10-13&limit=20
```

**Respuesta:**
```typescript
{
  success: true,
  data: {
    appointments: [
      {
        id: "uuid",
        patientId: "uuid",
        patientName: "María González",
        patientEmail: "maria@example.com",
        patientPhone: "+52 55 1234 5678",
        patientPhoto: "url",
        time: "09:00",
        fullDateTime: "2025-10-13T09:00:00Z",
        type: "Terapia Individual",
        duration: 60,
        appointmentType: "presencial",
        meetLink: null,
        status: "confirmed",
        confirmed: true,
        therapistId: "uuid",
        therapistName: "Dr. Juan Pérez",
        therapistAvatar: "url"
      }
    ],
    total: 8,
    date: "2025-10-13",
    summary: {
      confirmed: 5,
      pending: 2,
      inProgress: 1
    }
  }
}
```

**Estados de cita:**
- `scheduled`: Agendada (sin confirmar)
- `confirmed`: Confirmada
- `in_progress`: En progreso

**Tipos de cita:**
- `presencial`: Sesión presencial en consultorio
- `videollamada`: Sesión en línea (incluye meet_link)
- `visita`: Visita domiciliaria

---

### 3. **GET /api/dashboard/patients**
Obtiene la lista de pacientes recientes con información adicional.

**Query Parameters:**
- `limit` (opcional): Número de pacientes (default: 10)
- `sortBy` (opcional): Campo de ordenamiento
  - `created_at`: Por fecha de creación
  - `updated_at`: Por última actualización
  - `last_session`: Por última sesión
- `order` (opcional): `asc` o `desc` (default: `desc`)

**Ejemplo:**
```
GET /api/dashboard/patients?limit=15&sortBy=last_session&order=desc
```

**Respuesta:**
```typescript
{
  success: true,
  data: {
    patients: [
      {
        id: "uuid",
        name: "Laura Fernández",
        email: "laura@example.com",
        phone: "+52 55 9876 5432",
        photoUrl: "url",
        status: "active",
        company: {
          id: "uuid",
          name: "TechCorp Solutions"
        },
        primaryTherapist: {
          id: "uuid",
          name: "Dr. Juan Pérez"
        },
        lastSession: {
          date: "2025-10-10T14:00:00Z",
          status: "completed",
          formatted: "10 oct 2025"
        },
        sessionCount: {
          total: 15,
          completed: 12
        },
        createdAt: "2025-01-15T10:00:00Z",
        updatedAt: "2025-10-10T15:00:00Z"
      }
    ],
    total: 45,
    newThisMonth: 5,
    returned: 15
  }
}
```

**Información incluida:**
- Datos básicos del paciente
- Empresa asociada (si aplica)
- Terapeuta primario asignado
- Última sesión (fecha y estado)
- Estadísticas de sesiones

---

### 4. **GET /api/dashboard/overview**
Obtiene un resumen general del dashboard con alertas y actividad.

**Respuesta:**
```typescript
{
  success: true,
  data: {
    alerts: {
      unreadNotifications: 5,
      pendingTasks: 12,
      overdueTasks: 3,
      upcomingSessions: 23,
      expiringContracts: 2,
      pendingReports: 4
    },
    financial: {
      pendingPayments: {
        count: 15,
        amount: 7500.00,
        formatted: "$7,500.00"
      }
    },
    activity: {
      uniquePatientsToday: 8,
      cancellationRate: 5.2,
      cancellationRateFormatted: "5.2%",
      activeCompanies: 12
    },
    summary: {
      needsAttention: 9,
      hasUrgentItems: true
    }
  }
}
```

**Alertas incluidas:**
- **Notificaciones no leídas**: Total de notificaciones pendientes
- **Tareas pendientes**: Tareas en progreso o pendientes
- **Tareas vencidas**: Tareas con fecha de vencimiento pasada
- **Sesiones próximas**: Citas en los próximos 7 días
- **Contratos por vencer**: Contratos que expiran en 30 días
- **Reportes pendientes**: Reportes mensuales sin pagar

**Información financiera:**
- Pagos pendientes (cantidad y monto total)

**Actividad:**
- Pacientes únicos con sesiones hoy
- Tasa de cancelación (últimos 30 días)
- Empresas activas con contratos

---

## 🔧 Uso desde el Frontend

### Importar funciones helper:
```typescript
import {
  getDashboardStats,
  getDashboardAppointments,
  getDashboardPatients,
  getDashboardOverview,
  getDashboardData // Obtiene todo en una llamada
} from '@/lib/api/dashboard.api';
```

### Ejemplo de uso:
```typescript
// Obtener estadísticas
const { data, success, error } = await getDashboardStats();
if (success && data) {
  console.log('Pacientes activos:', data.activePatients.value);
}

// Obtener citas de hoy
const appointments = await getDashboardAppointments();

// Obtener pacientes recientes
const patients = await getDashboardPatients(10, 'last_session', 'desc');

// Obtener todo en una llamada
const dashboardData = await getDashboardData();
console.log(dashboardData.data.stats);
console.log(dashboardData.data.appointments);
console.log(dashboardData.data.patients);
console.log(dashboardData.data.overview);
```

---

## 🗄️ Base de Datos

Todos los endpoints consultan directamente a **Supabase PostgreSQL** utilizando el cliente de Supabase (`@supabase/supabase-js`).

### Tablas consultadas:
- `patients` - Pacientes
- `sessions` - Sesiones terapéuticas
- `user_profiles` - Perfiles de terapeutas
- `companies` - Empresas cliente
- `contracts` - Contratos de servicio
- `notifications` - Notificaciones del sistema
- `tasks` - Tareas pendientes
- `monthly_contract_reports` - Reportes mensuales

---

## 🔒 Seguridad

- Todos los endpoints implementan **Row Level Security (RLS)** a nivel de base de datos
- Las consultas respetan los permisos definidos en las políticas de Supabase
- Los datos sensibles se filtran apropiadamente
- Se validan todos los parámetros de entrada

---

## ⚠️ Manejo de Errores

Todos los endpoints retornan un formato consistente de error:

```typescript
{
  success: false,
  error: "Error al obtener estadísticas del dashboard",
  details: "Mensaje específico del error"
}
```

**Status codes:**
- `200`: Éxito
- `500`: Error del servidor

---

## 📊 Performance

### Optimizaciones implementadas:
- ✅ Uso de `count` queries para conteos eficientes
- ✅ Índices en columnas de búsqueda frecuente
- ✅ Límite de resultados configurable
- ✅ Consultas paralelas con `Promise.all()` donde es posible
- ✅ Cache deshabilitado (`cache: 'no-store'`) para datos en tiempo real

### Tiempos de respuesta estimados:
- `/stats`: ~200-400ms
- `/appointments`: ~150-300ms
- `/patients`: ~300-500ms (incluye subconsultas)
- `/overview`: ~400-600ms (consultas múltiples)

---

## 🧪 Testing

### Para probar los endpoints:

```bash
# Estadísticas
curl http://localhost:3000/api/dashboard/stats

# Citas de hoy
curl http://localhost:3000/api/dashboard/appointments

# Citas de una fecha específica
curl "http://localhost:3000/api/dashboard/appointments?date=2025-10-15&limit=5"

# Pacientes recientes
curl http://localhost:3000/api/dashboard/patients

# Overview completo
curl http://localhost:3000/api/dashboard/overview
```

---

## 📝 Tipos TypeScript

Todos los tipos están definidos en: `src/types/dashboard.types.ts`

Incluye:
- `DashboardStats`
- `DashboardAppointment`
- `AppointmentsResponse`
- `DashboardPatient`
- `PatientsResponse`
- `DashboardOverview`
- `ApiResponse<T>`

---

## 🚀 Próximas Mejoras

- [ ] Implementar caché con Redis para mejorar performance
- [ ] Agregar filtros adicionales (por terapeuta, empresa, etc.)
- [ ] Endpoint para gráficos y tendencias
- [ ] WebSocket para actualizaciones en tiempo real
- [ ] Endpoint para exportar datos a CSV/Excel
