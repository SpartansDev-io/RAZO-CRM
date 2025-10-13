# 📊 Base de Datos - Sistema CRM de Terapia Psicológica

Este documento describe la estructura completa de la base de datos del sistema CRM, explicando el propósito y funcionamiento de cada tabla.

---

## 📑 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Esquema de Relaciones](#esquema-de-relaciones)
3. [Tablas Principales](#tablas-principales)
4. [Tablas de Soporte](#tablas-de-soporte)
5. [Tablas de Control](#tablas-de-control)
6. [Índices y Optimización](#índices-y-optimización)
7. [Row Level Security (RLS)](#row-level-security-rls)

---

## 🎯 Visión General

El sistema está diseñado para gestionar una consulta de terapia psicológica que trabaja tanto con pacientes directos como con empresas cliente mediante contratos corporativos. La base de datos consta de **22 tablas** organizadas en diferentes categorías:

- **Gestión de Usuarios**: 1 tabla
- **Gestión Empresarial**: 3 tablas
- **Gestión de Pacientes**: 3 tablas
- **Gestión de Sesiones**: 2 tablas
- **Gestión Clínica**: 4 tablas
- **Gestión Financiera**: 2 tablas
- **Gestión de Reportes**: 2 tablas
- **Sistema y Control**: 5 tablas

---

## 🔗 Esquema de Relaciones

```
user_profiles (Terapeutas)
    ↓
    ├─→ companies (Empresas Cliente)
    │       ↓
    │       ├─→ contracts (Contratos)
    │       │       ↓
    │       │       ├─→ sessions (Sesiones)
    │       │       └─→ monthly_contract_reports (Reportes Mensuales)
    │       │               ↓
    │       │               └─→ monthly_report_sessions
    │       └─→ company_employees (Empleados de Empresa)
    │
    └─→ patients (Pacientes)
            ↓
            ├─→ sessions (Sesiones Terapéuticas)
            │       ↓
            │       ├─→ clinical_notes (Notas Clínicas)
            │       ├─→ session_techniques (Técnicas Aplicadas)
            │       ├─→ diagnoses (Diagnósticos)
            │       ├─→ appointment_reminders (Recordatorios)
            │       └─→ payment_transactions (Pagos)
            │
            ├─→ patient_attachments (Archivos Adjuntos)
            ├─→ patient_emergency_contacts (Contactos de Emergencia)
            └─→ therapeutic_goals (Objetivos Terapéuticos)
```

---

## 📋 Tablas Principales

### 1. **user_profiles** (Perfiles de Usuario)

**Propósito**: Almacena información de los terapeutas, administradores y personal del sistema.

**¿Por qué existe?**
- Centraliza la gestión de usuarios del sistema
- Separa los usuarios del sistema de los pacientes
- Permite diferentes roles (admin, terapeuta, asistente)
- Facilita la asignación de pacientes y sesiones a terapeutas específicos

**Campos clave:**
- `id`: UUID - Identificador único (vinculado con auth.users de Supabase)
- `full_name`: Nombre completo del terapeuta
- `email`: Email único para login
- `role`: admin, therapist, assistant
- `specialty`: Especialidad terapéutica
- `license_number`: Cédula profesional
- `notifications_enabled`: Control de notificaciones

**Relaciones:**
- Crea y actualiza: companies, contracts, patients, sessions
- Es terapeuta primario de: patients
- Asignado a: sessions, clinical_notes
- Recibe: notifications, tasks

**Caso de uso:**
```sql
-- Obtener todos los terapeutas activos con su carga de pacientes
SELECT
  up.full_name,
  up.specialty,
  COUNT(DISTINCT p.id) as total_patients,
  COUNT(DISTINCT s.id) as total_sessions_this_month
FROM user_profiles up
LEFT JOIN patients p ON p.primary_therapist_id = up.id
LEFT JOIN sessions s ON s.therapist_id = up.id
  AND s.session_date >= date_trunc('month', CURRENT_DATE)
WHERE up.role = 'therapist' AND up.is_active = true
GROUP BY up.id;
```

---

### 2. **companies** (Empresas Cliente)

**Propósito**: Registra las empresas que contratan servicios de terapia para sus empleados.

**¿Por qué existe?**
- Modelo B2B: empresas contratan servicios corporativos
- Gestión de contratos empresariales
- Facturación y reportes mensuales por empresa
- Seguimiento de empleados beneficiarios

**Campos clave:**
- `name`: Nombre de la empresa
- `email`: Email corporativo
- `tax_id`: RFC o identificador fiscal
- `billing_contact_*`: Datos de contacto para facturación
- `employee_count`: Total de empleados
- `active_contracts_count`: Contratos vigentes

**Relaciones:**
- Tiene: contracts, patients, monthly_reports, company_employees
- Creada/actualizada por: user_profiles

**Caso de uso:**
```sql
-- Dashboard de empresas: contratos activos y uso del servicio
SELECT
  c.name,
  c.active_contracts_count,
  COUNT(DISTINCT p.id) as employees_in_therapy,
  COUNT(DISTINCT s.id) as sessions_this_month,
  SUM(s.session_cost) as monthly_revenue
FROM companies c
LEFT JOIN contracts ct ON ct.company_id = c.id AND ct.status = 'active'
LEFT JOIN patients p ON p.company_id = c.id AND p.status = 'active'
LEFT JOIN sessions s ON s.patient_id = p.id
  AND s.session_date >= date_trunc('month', CURRENT_DATE)
WHERE c.is_active = true
GROUP BY c.id;
```

---

### 3. **contracts** (Contratos de Servicio)

**Propósito**: Define los términos y condiciones de servicios entre empresas y la consulta.

**¿Por qué existe?**
- Control de servicios empresariales
- Pricing diferenciado por contrato
- Límites mensuales de gasto
- Gestión de renovaciones automáticas
- Histórico de relaciones comerciales

**Campos clave:**
- `company_id`: Empresa contratante
- `contract_number`: Número único de contrato
- `start_date` / `end_date`: Vigencia
- `cost_per_session`: Precio por sesión
- `monthly_limit`: Límite mensual de facturación
- `status`: draft, active, expired, cancelled, suspended
- `auto_renew`: Renovación automática

**Relaciones:**
- Pertenece a: companies
- Genera: sessions, monthly_contract_reports, payment_transactions

**Caso de uso:**
```sql
-- Contratos próximos a vencer (30 días)
SELECT
  c.contract_name,
  co.name as company_name,
  c.end_date,
  c.end_date - CURRENT_DATE as days_remaining,
  COUNT(s.id) as sessions_used_this_month
FROM contracts c
JOIN companies co ON co.id = c.company_id
LEFT JOIN sessions s ON s.contract_id = c.id
  AND s.session_date >= date_trunc('month', CURRENT_DATE)
WHERE c.status = 'active'
  AND c.end_date <= CURRENT_DATE + INTERVAL '30 days'
  AND c.send_renewal_notification = true
GROUP BY c.id, co.name;
```

---

### 4. **patients** (Pacientes)

**Propósito**: Registro completo de pacientes en terapia (directos y corporativos).

**¿Por qué existe?**
- Base del sistema: sin pacientes no hay sesiones
- Historial clínico completo
- Información de contacto y emergencia
- Datos demográficos y sociales
- Vinculación con empresas (si aplica)

**Campos clave (56 total):**

**Identificación:**
- `name`, `email`, `phone`, `birth_date`, `gender`

**Vinculación:**
- `company_id`: Empresa (si es empleado)
- `primary_therapist_id`: Terapeuta asignado

**Información Terapéutica:**
- `therapy_type`: individual, pareja, familiar, grupo
- `reason_for_therapy`: Motivo de consulta
- `therapeutic_goals_text`: Objetivos iniciales
- `referral_source`: Cómo llegó al servicio

**Historial Clínico:**
- `previous_therapy`: Terapias previas
- `current_medications`: Medicamentos actuales
- `allergies`: Alergias
- `medical_conditions`: Condiciones médicas
- `psychiatric_diagnoses`: Diagnósticos psiquiátricos previos
- `family_psychiatric_history`: Historial familiar
- `substance_use`: Uso de sustancias
- `risk_assessment`: Evaluación de riesgo

**Información Social:**
- `marital_status`: Estado civil
- `has_children` / `children_count`: Hijos
- `occupation`: Ocupación
- `education_level`: Nivel educativo
- `living_situation`: Situación de vivienda

**Estado:**
- `status`: active, inactive, discharged, pending, on_hold
- `consent_signed` / `consent_date`: Consentimiento informado

**Relaciones:**
- Pertenece a: companies (opcional)
- Tiene: sessions, attachments, clinical_notes, therapeutic_goals
- Genera: appointment_reminders, payment_transactions

**Caso de uso:**
```sql
-- Pacientes de alto riesgo que necesitan seguimiento
SELECT
  p.name,
  p.email,
  p.phone,
  p.risk_assessment,
  p.primary_therapist_id,
  up.full_name as therapist_name,
  MAX(s.session_date) as last_session_date,
  COUNT(s.id) as total_sessions
FROM patients p
LEFT JOIN user_profiles up ON up.id = p.primary_therapist_id
LEFT JOIN sessions s ON s.patient_id = p.id
WHERE p.risk_assessment IN ('high', 'crisis')
  AND p.status = 'active'
GROUP BY p.id, up.full_name
ORDER BY MAX(s.session_date) DESC NULLS LAST;
```

---

### 5. **sessions** (Sesiones Terapéuticas)

**Propósito**: Registro de cada sesión terapéutica realizada o programada.

**¿Por qué existe?**
- Core del negocio: facturación por sesión
- Historial terapéutico del paciente
- Agenda y calendario del terapeuta
- Base para reportes mensuales a empresas
- Control de pagos y asistencia

**Campos clave (43 total):**

**Identificación:**
- `patient_id`: Paciente atendido
- `therapist_id`: Terapeuta que atiende
- `session_number`: Número de sesión del paciente

**Programación:**
- `session_date`: Fecha y hora
- `session_duration_minutes`: Duración (default 60)
- `session_type`: Tipo de terapia
- `session_modality`: in_person, online, phone, home_visit
- `appointment_type`: presencial, videollamada, visita
- `meet_link`: Link de videollamada (si aplica)
- `location_address`: Dirección (si es visita)

**Facturación:**
- `session_cost`: Costo de la sesión
- `billing_type`: contract, direct, insurance, pro_bono
- `contract_id`: Contrato asociado (si aplica)
- `payment_status`: pending, partial, paid, written_off
- `paid_amount`: Monto pagado
- `payment_date`: Fecha de pago

**Clínico:**
- `session_notes`: Notas generales
- `progress_notes`: Notas de progreso
- `interventions`: Intervenciones aplicadas
- `homework_assigned`: Tarea asignada
- `next_session_plan`: Plan para próxima sesión
- `risk_level`: low, medium, high, crisis

**Estado:**
- `status`: scheduled, confirmed, in_progress, completed, cancelled, no_show, rescheduled
- `confirmed_at` / `confirmed_by`: Confirmación
- `reminders_sent`: Recordatorios enviados
- `cancelled_reason` / `cancelled_by`: Cancelación

**Relaciones:**
- Pertenece a: patients, user_profiles (therapist), contracts
- Tiene: clinical_notes, appointment_reminders, payment_transactions
- Genera: diagnoses, monthly_report_sessions, session_techniques

**Caso de uso:**
```sql
-- Agenda del día del terapeuta
SELECT
  s.session_date,
  p.name as patient_name,
  p.phone,
  s.session_type,
  s.appointment_type,
  s.meet_link,
  s.status,
  s.session_duration_minutes
FROM sessions s
JOIN patients p ON p.id = s.patient_id
WHERE s.therapist_id = 'therapist-uuid'
  AND s.session_date::date = CURRENT_DATE
  AND s.status IN ('scheduled', 'confirmed', 'in_progress')
ORDER BY s.session_date ASC;
```

---

### 6. **patient_attachments** (Archivos del Paciente)

**Propósito**: Almacena referencias a documentos y archivos del paciente.

**¿Por qué existe?**
- Requisitos legales: consentimientos firmados
- Estudios médicos y laboratorios
- Reportes de otros profesionales
- Imágenes y documentos relevantes
- Historia clínica completa

**Campos clave:**
- `file_name`: Nombre del archivo
- `file_url`: URL en storage de Supabase
- `file_type`: document, image, consent, medical_record, other
- `file_size_kb`: Tamaño del archivo
- `is_confidential`: Marcador de confidencialidad
- `uploaded_by`: Usuario que subió el archivo

**Relaciones:**
- Pertenece a: patients
- Subido por: user_profiles

**Caso de uso:**
```sql
-- Pacientes sin consentimiento firmado
SELECT
  p.name,
  p.email,
  p.created_at,
  COUNT(pa.id) FILTER (WHERE pa.file_type = 'consent') as consent_count
FROM patients p
LEFT JOIN patient_attachments pa ON pa.patient_id = p.id
  AND pa.file_type = 'consent'
WHERE p.consent_signed = false
  AND p.status = 'active'
GROUP BY p.id
HAVING COUNT(pa.id) FILTER (WHERE pa.file_type = 'consent') = 0;
```

---

### 7. **monthly_contract_reports** (Reportes Mensuales)

**Propósito**: Reportes de facturación mensual por contrato para empresas.

**¿Por qué existe?**
- Facturación corporativa mensual
- Transparencia con empresas cliente
- Control de pagos pendientes
- Histórico de facturación
- Base para reconciliación contable

**Campos clave:**
- `contract_id` / `company_id`: Identificadores
- `report_month` / `report_year`: Período
- `period_start_date` / `period_end_date`: Fechas exactas
- `total_sessions`: Sesiones en el período
- `total_patients`: Pacientes únicos atendidos
- `total_amount`: Monto total a facturar
- `payment_status`: pending, paid, overdue
- `invoice_number` / `invoice_date`: Factura
- `due_date`: Fecha de vencimiento
- `paid_at` / `paid_by`: Fecha y usuario que marcó como pagado
- `sent_to_company_at`: Fecha de envío a empresa
- `pdf_url`: URL del PDF generado

**Relaciones:**
- Pertenece a: contracts, companies
- Tiene: monthly_report_sessions (detalle)
- Genera: payment_transactions

**Caso de uso:**
```sql
-- Reportes pendientes de pago vencidos
SELECT
  mcr.invoice_number,
  c.name as company_name,
  mcr.report_month,
  mcr.report_year,
  mcr.total_amount,
  mcr.due_date,
  CURRENT_DATE - mcr.due_date as days_overdue,
  ct.billing_email
FROM monthly_contract_reports mcr
JOIN contracts ct ON ct.id = mcr.contract_id
JOIN companies c ON c.id = mcr.company_id
WHERE mcr.payment_status IN ('pending', 'overdue')
  AND mcr.due_date < CURRENT_DATE
ORDER BY mcr.due_date ASC;
```

---

### 8. **monthly_report_sessions** (Detalle de Sesiones en Reportes)

**Propósito**: Desglose de sesiones incluidas en cada reporte mensual.

**¿Por qué existe?**
- Transparencia total: qué sesiones se están cobrando
- Evita disputas con empresas
- Auditoría y trazabilidad
- Permite regenerar reportes si es necesario

**Campos clave:**
- `report_id`: Reporte al que pertenece
- `session_id`: Sesión específica
- `patient_id` / `patient_name`: Paciente atendido
- `therapist_id` / `therapist_name`: Terapeuta
- `session_date`: Fecha de la sesión
- `session_type`: Tipo de terapia
- `session_cost`: Costo de esa sesión

**Relaciones:**
- Pertenece a: monthly_contract_reports, sessions, patients, user_profiles

**Caso de uso:**
```sql
-- Desglose detallado de un reporte mensual
SELECT
  mrs.session_date,
  mrs.patient_name,
  mrs.therapist_name,
  mrs.session_type,
  mrs.session_cost
FROM monthly_report_sessions mrs
WHERE mrs.report_id = 'report-uuid'
ORDER BY mrs.session_date ASC;
```

---

## 🏥 Tablas de Soporte Clínico

### 9. **clinical_notes** (Notas Clínicas)

**Propósito**: Registro detallado de observaciones clínicas por sesión (formato SOAP).

**¿Por qué existe?**
- Documentación clínica profesional
- Seguimiento del progreso terapéutico
- Requisito ético y legal
- Base para reportes y diagnósticos
- Evaluación de riesgo

**Formato SOAP:**
- **S**ubjective: `subjective_note` - Lo que el paciente reporta
- **O**bjective: `objective_note` - Observaciones del terapeuta
- **A**ssessment: `assessment` - Evaluación y análisis
- **P**lan: `plan` - Plan de tratamiento

**Campos adicionales:**
- `mood_assessment`: excellent, good, neutral, poor, critical
- `anxiety_level` / `depression_level`: Escala 1-10
- `risk_level`: none, low, medium, high, imminent
- `treatment_adherence`: excellent, good, fair, poor, none
- `interventions_used`: Array de intervenciones
- `homework_assigned`: Tarea para casa
- `homework_completion`: completed, partial, not_done

**Caso de uso:**
```sql
-- Evolución del estado de ánimo de un paciente
SELECT
  cn.created_at::date as session_date,
  cn.mood_assessment,
  cn.anxiety_level,
  cn.depression_level,
  cn.risk_level,
  cn.progress_rating
FROM clinical_notes cn
WHERE cn.patient_id = 'patient-uuid'
ORDER BY cn.created_at ASC;
```

---

### 10. **therapeutic_goals** (Objetivos Terapéuticos)

**Propósito**: Objetivos SMART del proceso terapéutico del paciente.

**¿Por qué existe?**
- Estructura el proceso terapéutico
- Mide progreso objetivo
- Motiva al paciente
- Justifica el tratamiento
- Base para evaluación de resultados

**Metodología SMART:**
- **S**pecific: `specific_criteria` - Criterios específicos
- **M**easurable: `measurable_criteria` - Cómo se medirá
- **A**chievable: `achievable_notes` - Por qué es alcanzable
- **R**elevant: `relevant_notes` - Relevancia para el paciente
- **T**ime-bound: `time_bound_date` - Fecha límite

**Campos clave:**
- `goal_title`: Título del objetivo
- `goal_description`: Descripción detallada
- `goal_category`: emotional, behavioral, cognitive, social
- `progress_percentage`: 0-100%
- `status`: active, in_progress, achieved, modified, abandoned

**Caso de uso:**
```sql
-- Objetivos próximos a cumplirse
SELECT
  p.name as patient_name,
  tg.goal_title,
  tg.progress_percentage,
  tg.target_date,
  tg.target_date - CURRENT_DATE as days_remaining
FROM therapeutic_goals tg
JOIN patients p ON p.id = tg.patient_id
WHERE tg.status IN ('active', 'in_progress')
  AND tg.target_date <= CURRENT_DATE + INTERVAL '7 days'
  AND tg.progress_percentage >= 70
ORDER BY tg.target_date ASC;
```

---

### 11. **diagnoses** (Diagnósticos)

**Propósito**: Registro de diagnósticos clínicos formales (DSM-5, CIE-10).

**¿Por qué existe?**
- Diagnóstico profesional formal
- Codificación para seguros
- Justificación del tratamiento
- Histórico diagnóstico
- Base para reportes médicos

**Campos clave:**
- `diagnosis_code`: Código DSM-5 o CIE-10
- `diagnosis_name`: Nombre del diagnóstico
- `diagnosis_category`: Categoría diagnóstica
- `diagnosis_type`: primary, secondary, provisional, ruled_out
- `severity`: mild, moderate, severe, in_remission
- `diagnosed_at`: Fecha de diagnóstico
- `resolved_at`: Fecha de resolución
- `treatment_plan`: Plan de tratamiento

**Caso de uso:**
```sql
-- Distribución de diagnósticos activos
SELECT
  d.diagnosis_category,
  d.diagnosis_name,
  COUNT(DISTINCT d.patient_id) as patient_count,
  AVG(DATE_PART('day', CURRENT_DATE - d.diagnosed_at)) as avg_days_in_treatment
FROM diagnoses d
WHERE d.is_active = true
GROUP BY d.diagnosis_category, d.diagnosis_name
ORDER BY patient_count DESC;
```

---

### 12. **session_techniques** (Técnicas Terapéuticas)

**Propósito**: Registro de técnicas terapéuticas aplicadas en cada sesión.

**¿Por qué existe?**
- Documentación de intervenciones
- Evaluación de efectividad
- Aprendizaje y mejora continua
- Base para investigación interna
- Justificación de abordaje terapéutico

**Campos clave:**
- `technique_name`: Nombre de la técnica
- `technique_category`: cognitive, behavioral, psychodynamic, mindfulness
- `effectiveness_rating`: Calificación 1-10
- `patient_response`: Respuesta del paciente
- `notes`: Notas adicionales

**Caso de uso:**
```sql
-- Técnicas más efectivas por categoría
SELECT
  st.technique_category,
  st.technique_name,
  COUNT(*) as times_used,
  AVG(st.effectiveness_rating) as avg_effectiveness,
  COUNT(DISTINCT s.patient_id) as patients_count
FROM session_techniques st
JOIN sessions s ON s.id = st.session_id
WHERE st.effectiveness_rating IS NOT NULL
GROUP BY st.technique_category, st.technique_name
HAVING COUNT(*) >= 5
ORDER BY avg_effectiveness DESC, times_used DESC;
```

---

## 💰 Tablas Financieras

### 13. **payment_transactions** (Transacciones de Pago)

**Propósito**: Registro detallado de todos los movimientos financieros.

**¿Por qué existe?**
- Control financiero completo
- Conciliación bancaria
- Auditoría de pagos
- Reembolsos y ajustes
- Reportes fiscales

**Campos clave:**
- `transaction_type`: payment, refund, adjustment, discount
- `amount`: Monto de la transacción
- `payment_method`: cash, card, transfer, check, online
- `payment_reference`: Referencia bancaria
- `currency`: Moneda (default MXN)
- `exchange_rate`: Tipo de cambio
- `status`: pending, processing, completed, failed, cancelled
- `authorization_code`: Código de autorización
- `processed_by`: Usuario que procesó

**Relaciones:**
- Relacionado con: sessions, patients, contracts, monthly_contract_reports

**Caso de uso:**
```sql
-- Conciliación diaria de pagos
SELECT
  DATE(pt.transaction_date) as payment_date,
  pt.payment_method,
  COUNT(*) as transaction_count,
  SUM(pt.amount) FILTER (WHERE pt.transaction_type = 'payment') as total_income,
  SUM(pt.amount) FILTER (WHERE pt.transaction_type = 'refund') as total_refunds,
  SUM(pt.amount) FILTER (WHERE pt.transaction_type = 'payment') -
    SUM(pt.amount) FILTER (WHERE pt.transaction_type = 'refund') as net_income
FROM payment_transactions pt
WHERE pt.status = 'completed'
  AND pt.transaction_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(pt.transaction_date), pt.payment_method
ORDER BY payment_date DESC, pt.payment_method;
```

---

## 🔔 Tablas de Sistema

### 14. **notifications** (Notificaciones)

**Propósito**: Sistema de notificaciones internas para usuarios.

**¿Por qué existe?**
- Comunicación interna efectiva
- Alertas de tareas pendientes
- Recordatorios automáticos
- Seguimiento de eventos importantes

**Campos clave:**
- `user_id`: Usuario destinatario
- `title` / `message`: Contenido
- `type`: info, warning, error, success, reminder, task, payment
- `priority`: low, normal, high, urgent
- `related_entity_type` / `related_entity_id`: Entidad relacionada
- `is_read` / `read_at`: Estado de lectura
- `action_url` / `action_label`: Acción asociada

**Caso de uso:**
```sql
-- Notificaciones urgentes no leídas
SELECT
  n.title,
  n.message,
  n.type,
  n.related_entity_type,
  n.created_at,
  up.full_name as user_name
FROM notifications n
JOIN user_profiles up ON up.id = n.user_id
WHERE n.is_read = false
  AND n.priority IN ('high', 'urgent')
  AND n.is_archived = false
ORDER BY n.created_at DESC;
```

---

### 15. **tasks** (Tareas)

**Propósito**: Gestión de tareas y pendientes del equipo.

**¿Por qué existe?**
- Organización del trabajo
- Seguimiento de pendientes
- Asignación de responsabilidades
- Control de vencimientos

**Campos clave:**
- `assigned_to` / `created_by`: Asignación
- `title` / `description`: Contenido
- `priority`: low, medium, high, urgent
- `status`: pending, in_progress, completed, cancelled
- `related_entity_type` / `related_entity_id`: Entidad relacionada
- `due_date`: Fecha de vencimiento
- `tags`: Etiquetas para organización

**Caso de uso:**
```sql
-- Tareas vencidas por usuario
SELECT
  up.full_name,
  COUNT(*) as overdue_tasks,
  COUNT(*) FILTER (WHERE t.priority = 'urgent') as urgent_count,
  MIN(t.due_date) as oldest_task_date
FROM tasks t
JOIN user_profiles up ON up.id = t.assigned_to
WHERE t.status IN ('pending', 'in_progress')
  AND t.due_date < CURRENT_DATE
GROUP BY up.id, up.full_name
ORDER BY overdue_tasks DESC;
```

---

### 16. **appointment_reminders** (Recordatorios de Citas)

**Propósito**: Sistema automatizado de recordatorios de citas.

**¿Por qué existe?**
- Reduce no-shows
- Mejora la asistencia
- Automatización de comunicación
- Mejor experiencia del paciente

**Campos clave:**
- `session_id` / `patient_id`: Cita y paciente
- `reminder_type`: email, sms, whatsapp, push
- `scheduled_for`: Cuándo enviar
- `status`: pending, sent, failed, cancelled
- `sent_at`: Cuándo se envió
- `error_message`: Error si falló
- `retry_count`: Intentos de reenvío

**Caso de uso:**
```sql
-- Recordatorios pendientes para hoy
SELECT
  ar.scheduled_for,
  ar.reminder_type,
  p.name as patient_name,
  p.email,
  p.phone,
  s.session_date,
  s.appointment_type
FROM appointment_reminders ar
JOIN sessions s ON s.id = ar.session_id
JOIN patients p ON p.id = ar.patient_id
WHERE ar.status = 'pending'
  AND ar.scheduled_for::date = CURRENT_DATE
  AND ar.scheduled_for <= CURRENT_TIMESTAMP
ORDER BY ar.scheduled_for ASC;
```

---

### 17. **therapist_availability** (Disponibilidad de Terapeutas)

**Propósito**: Horarios de disponibilidad de cada terapeuta.

**¿Por qué existe?**
- Gestión de agenda
- Previene conflictos de horarios
- Facilita agendamiento
- Respeta horarios laborales

**Campos clave:**
- `therapist_id`: Terapeuta
- `day_of_week`: Día (0-6, 0=Domingo)
- `start_time` / `end_time`: Horario
- `is_available`: Disponible o bloqueado
- `location`: Ubicación (consultorio, online)
- `effective_from` / `effective_until`: Vigencia

**Caso de uso:**
```sql
-- Disponibilidad de la semana actual
SELECT
  up.full_name,
  ta.day_of_week,
  ta.start_time,
  ta.end_time,
  ta.location,
  COUNT(s.id) as sessions_scheduled
FROM therapist_availability ta
JOIN user_profiles up ON up.id = ta.therapist_id
LEFT JOIN sessions s ON s.therapist_id = ta.therapist_id
  AND EXTRACT(DOW FROM s.session_date) = ta.day_of_week
  AND s.session_date::time >= ta.start_time
  AND s.session_date::time < ta.end_time
  AND s.session_date >= date_trunc('week', CURRENT_DATE)
  AND s.session_date < date_trunc('week', CURRENT_DATE) + INTERVAL '1 week'
WHERE ta.is_available = true
  AND ta.effective_from <= CURRENT_DATE
  AND (ta.effective_until IS NULL OR ta.effective_until >= CURRENT_DATE)
GROUP BY up.id, ta.id
ORDER BY ta.day_of_week, ta.start_time;
```

---

### 18. **patient_emergency_contacts** (Contactos de Emergencia)

**Propósito**: Contactos de emergencia de cada paciente.

**¿Por qué existe?**
- Seguridad del paciente
- Protocolo de crisis
- Requisito ético
- Acceso rápido en emergencias

**Campos clave:**
- `patient_id`: Paciente
- `contact_name` / `relationship`: Información del contacto
- `phone` / `alternate_phone` / `email`: Medios de contacto
- `is_primary`: Contacto principal
- `priority`: Orden de contacto

**Caso de uso:**
```sql
-- Contactos de emergencia de pacientes de alto riesgo
SELECT
  p.name as patient_name,
  p.risk_assessment,
  pec.contact_name,
  pec.relationship,
  pec.phone,
  pec.is_primary
FROM patient_emergency_contacts pec
JOIN patients p ON p.id = pec.patient_id
WHERE p.risk_assessment IN ('high', 'crisis')
  AND p.status = 'active'
ORDER BY pec.is_primary DESC, pec.priority ASC;
```

---

### 19. **company_employees** (Empleados de Empresa)

**Propósito**: Registro de empleados de empresas cliente.

**¿Por qué existe?**
- Control de beneficiarios
- Vinculación empleado-paciente
- Validación de acceso a servicios
- Reportes corporativos

**Campos clave:**
- `company_id`: Empresa
- `patient_id`: Paciente (si ya está en terapia)
- `employee_name` / `employee_email`: Datos del empleado
- `employee_id_number`: ID corporativo
- `department` / `position`: Organización
- `is_active`: Estado
- `start_date` / `end_date`: Periodo laboral

**Caso de uso:**
```sql
-- Empleados sin asignar a paciente
SELECT
  ce.employee_name,
  ce.employee_email,
  ce.department,
  c.name as company_name,
  ce.start_date
FROM company_employees ce
JOIN companies c ON c.id = ce.company_id
WHERE ce.patient_id IS NULL
  AND ce.is_active = true
  AND c.is_active = true
ORDER BY ce.start_date ASC;
```

---

### 20. **document_templates** (Plantillas de Documentos)

**Propósito**: Plantillas reutilizables para documentos comunes.

**¿Por qué existe?**
- Estandarización de documentos
- Ahorro de tiempo
- Consistencia profesional
- Personalización con variables

**Campos clave:**
- `template_name`: Nombre descriptivo
- `template_type`: clinical_note, consent_form, report, letter, invoice
- `content`: Contenido del template
- `variables`: Variables dinámicas (JSON)
- `is_public`: Compartido o personal
- `usage_count`: Veces usado

**Caso de uso:**
```sql
-- Plantillas más usadas
SELECT
  dt.template_name,
  dt.template_type,
  dt.usage_count,
  up.full_name as created_by,
  dt.created_at
FROM document_templates dt
LEFT JOIN user_profiles up ON up.id = dt.created_by
WHERE dt.is_active = true
ORDER BY dt.usage_count DESC
LIMIT 10;
```

---

### 21. **system_settings** (Configuración del Sistema)

**Propósito**: Configuraciones globales del sistema.

**¿Por qué existe?**
- Centralización de configuraciones
- Parámetros modificables sin código
- Control de comportamiento del sistema
- Personalización por instalación

**Campos clave:**
- `setting_key`: Clave única
- `setting_value`: Valor (JSON)
- `setting_type`: string, number, boolean, json, array
- `description`: Descripción
- `category`: Categoría
- `is_public`: Visible en frontend

**Ejemplos de configuraciones:**
- Costos por defecto
- Horarios de atención
- Emails de notificación
- Límites de sistema
- Textos de plantillas

---

### 22. **audit_log** (Registro de Auditoría)

**Propósito**: Log completo de acciones importantes en el sistema.

**¿Por qué existe?**
- Trazabilidad completa
- Seguridad y compliance
- Investigación de incidentes
- Requisitos legales
- Análisis de uso

**Campos clave:**
- `user_id`: Usuario que realizó la acción
- `action`: Acción realizada
- `entity_type` / `entity_id`: Entidad afectada
- `changes`: JSON con cambios
- `ip_address` / `user_agent`: Información técnica
- `severity`: info, warning, error, critical

**Caso de uso:**
```sql
-- Acciones de alto riesgo recientes
SELECT
  al.created_at,
  up.full_name as user_name,
  al.action,
  al.entity_type,
  al.severity,
  al.ip_address
FROM audit_log al
LEFT JOIN user_profiles up ON up.id = al.user_id
WHERE al.severity IN ('error', 'critical')
  AND al.created_at >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY al.created_at DESC;
```

---

## 📊 Índices y Optimización

### Índices Principales

Cada tabla tiene índices estratégicos para optimizar las consultas más frecuentes:

**Búsquedas comunes:**
```sql
-- patients
CREATE INDEX idx_patients_name ON patients(name);
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_patients_status ON patients(status);
CREATE INDEX idx_patients_company ON patients(company_id);

-- sessions
CREATE INDEX idx_sessions_date ON sessions(session_date);
CREATE INDEX idx_sessions_patient ON sessions(patient_id);
CREATE INDEX idx_sessions_therapist ON sessions(therapist_id);
CREATE INDEX idx_sessions_status ON sessions(status);

-- notifications
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_priority ON notifications(priority);
```

**Índices compuestos para queries complejas:**
```sql
-- Sesiones del mes por terapeuta
CREATE INDEX idx_sessions_therapist_date
  ON sessions(therapist_id, session_date);

-- Reportes pendientes por empresa
CREATE INDEX idx_reports_company_status
  ON monthly_contract_reports(company_id, payment_status);
```

---

## 🔒 Row Level Security (RLS)

### Principios de Seguridad

Todas las tablas implementan **Row Level Security** con políticas restrictivas:

**1. Políticas por Defecto:**
```sql
-- Habilitar RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Sin políticas = Sin acceso
-- Los usuarios solo ven datos para los que tienen políticas explícitas
```

**2. Políticas de Lectura (SELECT):**
```sql
-- Los terapeutas solo ven a sus pacientes
CREATE POLICY "Therapists can view their patients"
  ON patients FOR SELECT
  TO authenticated
  USING (
    primary_therapist_id = auth.uid() OR
    created_by = auth.uid()
  );

-- Los admins ven todo
CREATE POLICY "Admins can view all patients"
  ON patients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

**3. Políticas de Escritura (INSERT/UPDATE):**
```sql
-- Solo usuarios autenticados pueden crear sesiones
CREATE POLICY "Authenticated users can create sessions"
  ON sessions FOR INSERT
  TO authenticated
  WITH CHECK (
    therapist_id = auth.uid() OR
    created_by = auth.uid()
  );

-- Solo el terapeuta asignado puede modificar la sesión
CREATE POLICY "Therapists can update their sessions"
  ON sessions FOR UPDATE
  TO authenticated
  USING (therapist_id = auth.uid())
  WITH CHECK (therapist_id = auth.uid());
```

**4. Políticas de Eliminación (DELETE):**
```sql
-- Soft delete: solo marcar como eliminado
-- Solo admins pueden eliminar físicamente
CREATE POLICY "Only admins can delete"
  ON patients FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Funciones Helper para RLS

```sql
-- Verificar si es admin
CREATE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar si es terapeuta del paciente
CREATE FUNCTION auth.is_therapist_of_patient(patient_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM patients
    WHERE id = patient_uuid
    AND primary_therapist_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 📈 Vistas Útiles

### Vista: Pacientes con Carga de Trabajo

```sql
CREATE VIEW patients_workload AS
SELECT
  p.id,
  p.name,
  p.status,
  up.full_name as therapist_name,
  COUNT(DISTINCT s.id) as total_sessions,
  COUNT(DISTINCT s.id) FILTER (
    WHERE s.session_date >= date_trunc('month', CURRENT_DATE)
  ) as sessions_this_month,
  MAX(s.session_date) as last_session_date,
  COUNT(DISTINCT tg.id) FILTER (WHERE tg.status IN ('active', 'in_progress')) as active_goals
FROM patients p
LEFT JOIN user_profiles up ON up.id = p.primary_therapist_id
LEFT JOIN sessions s ON s.patient_id = p.id
LEFT JOIN therapeutic_goals tg ON tg.patient_id = p.id
WHERE p.deleted_at IS NULL
GROUP BY p.id, up.full_name;
```

### Vista: Dashboard Financiero

```sql
CREATE VIEW financial_dashboard AS
SELECT
  DATE_TRUNC('month', s.session_date) as month,
  COUNT(DISTINCT s.id) as total_sessions,
  COUNT(DISTINCT s.patient_id) as unique_patients,
  SUM(s.session_cost) as total_revenue,
  SUM(s.paid_amount) as collected_amount,
  SUM(s.session_cost) - SUM(s.paid_amount) as pending_amount,
  COUNT(*) FILTER (WHERE s.status = 'completed') as completed_sessions,
  COUNT(*) FILTER (WHERE s.status = 'cancelled') as cancelled_sessions,
  COUNT(*) FILTER (WHERE s.status = 'no_show') as no_show_sessions
FROM sessions s
WHERE s.deleted_at IS NULL
  AND s.session_date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', s.session_date);
```

---

## 🚀 Mejores Prácticas

### 1. **Soft Deletes**
Todas las tablas principales usan `deleted_at` en lugar de DELETE físico:
```sql
-- Mal
DELETE FROM patients WHERE id = 'uuid';

-- Bien
UPDATE patients SET deleted_at = NOW() WHERE id = 'uuid';
```

### 2. **Timestamps Automáticos**
Todas las tablas tienen `created_at` y `updated_at`:
```sql
created_at TIMESTAMPTZ DEFAULT NOW()
updated_at TIMESTAMPTZ DEFAULT NOW()
```

### 3. **UUIDs como IDs**
Uso de UUIDs en lugar de integers secuenciales:
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
```

### 4. **Validación en Base de Datos**
Constraints y checks en la BD:
```sql
ALTER TABLE sessions
  ADD CONSTRAINT check_session_cost_positive
  CHECK (session_cost >= 0);
```

### 5. **Valores Default Significativos**
```sql
status VARCHAR DEFAULT 'active'
is_active BOOLEAN DEFAULT true
session_duration_minutes INTEGER DEFAULT 60
```

---

## 📝 Conclusión

Esta base de datos está diseñada para:

✅ **Gestión Completa**: Pacientes, sesiones, clínica, financiero
✅ **Modelo B2B**: Contratos corporativos y reportes empresariales
✅ **Seguridad**: RLS en todas las tablas
✅ **Auditoría**: Trazabilidad completa de acciones
✅ **Escalabilidad**: Índices optimizados y estructura normalizada
✅ **Compliance**: Cumple con requisitos éticos y legales
✅ **Flexibilidad**: Soporta múltiples modalidades y tipos de terapia

El sistema permite gestionar desde una pequeña consulta individual hasta un centro de terapia corporativa con múltiples terapeutas y contratos empresariales.
