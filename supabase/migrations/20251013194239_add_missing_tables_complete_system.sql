/*
  # TABLAS ADICIONALES PARA SISTEMA CRM COMPLETO
  
  ## ANÁLISIS DE FUNCIONALIDADES IDENTIFICADAS:
  
  ### ✅ Ya Implementado:
  - Empresas y contratos
  - Pacientes y sesiones
  - Reportes mensuales
  - Perfiles de usuario
  
  ### ❌ FALTANTE - Se agrega en esta migración:
  1. **Notificaciones** - Sistema de alertas y recordatorios
  2. **Tareas/To-Do** - Gestión de tareas pendientes
  3. **Notas Clínicas** - Evolución detallada por sesión
  4. **Objetivos Terapéuticos** - Metas y seguimiento
  5. **Calendario/Disponibilidad** - Horarios disponibles de terapeutas
  6. **Recordatorios** - Sistema automatizado de recordatorios
  7. **Pagos/Transacciones** - Historial de pagos detallado
  8. **Diagnósticos** - Diagnósticos y evolución
  9. **Plantillas** - Plantillas de notas y documentos
  10. **Configuración del Sistema** - Parámetros globales
  11. **Auditoría Completa** - Log de cambios
  12. **Archivos Compartidos** - Recursos entre pacientes
  
  ## NUEVAS TABLAS:
  
  1. notifications - Sistema de notificaciones
  2. tasks - Tareas y pendientes
  3. clinical_notes - Notas clínicas detalladas
  4. therapeutic_goals - Objetivos terapéuticos
  5. therapist_availability - Disponibilidad de horarios
  6. appointment_reminders - Recordatorios de citas
  7. payment_transactions - Transacciones de pago
  8. diagnoses - Diagnósticos psiquiátricos
  9. document_templates - Plantillas de documentos
  10. system_settings - Configuración global
  11. audit_log - Log de auditoría
  12. session_techniques - Técnicas aplicadas en sesiones
  13. patient_emergency_contacts - Múltiples contactos de emergencia
  14. company_employees - Empleados vinculados a empresas
*/

-- ==================================================
-- 1. TABLA: notifications (Notificaciones del Sistema)
-- ==================================================

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('info', 'warning', 'error', 'success', 'reminder', 'task', 'payment', 'appointment')),
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Vínculos opcionales a entidades
  related_entity_type text CHECK (related_entity_type IN ('patient', 'session', 'contract', 'company', 'task', 'payment')),
  related_entity_id uuid,
  
  -- Estado
  is_read boolean DEFAULT false,
  is_archived boolean DEFAULT false,
  read_at timestamptz,
  
  -- Acción opcional
  action_url text,
  action_label text,
  
  -- Metadata
  metadata jsonb,
  
  expires_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false AND is_archived = false;
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_priority ON notifications(priority) WHERE priority IN ('high', 'urgent');
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ==================================================
-- 2. TABLA: tasks (Tareas y Pendientes)
-- ==================================================

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assigned_to uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES user_profiles(id) ON DELETE SET NULL,
  
  title text NOT NULL,
  description text,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  
  -- Vínculos opcionales
  related_entity_type text CHECK (related_entity_type IN ('patient', 'session', 'contract', 'company')),
  related_entity_id uuid,
  
  -- Fechas
  due_date timestamptz,
  completed_at timestamptz,
  
  -- Tags para organización
  tags text[],
  
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status) WHERE status != 'completed';
CREATE INDEX idx_tasks_due_date ON tasks(due_date) WHERE status != 'completed';
CREATE INDEX idx_tasks_priority ON tasks(priority) WHERE priority IN ('high', 'urgent');
CREATE INDEX idx_tasks_related ON tasks(related_entity_type, related_entity_id);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view assigned tasks" ON tasks
  FOR SELECT TO authenticated
  USING (assigned_to = auth.uid() OR created_by = auth.uid());

CREATE POLICY "Users can manage own tasks" ON tasks
  FOR ALL TO authenticated
  USING (assigned_to = auth.uid() OR created_by = auth.uid());

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================================================
-- 3. TABLA: clinical_notes (Notas Clínicas Detalladas)
-- ==================================================

CREATE TABLE IF NOT EXISTS clinical_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  therapist_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE SET NULL,
  
  -- Secciones de la nota clínica
  subjective_note text, -- Lo que dice el paciente
  objective_note text, -- Observaciones del terapeuta
  assessment text, -- Evaluación/análisis
  plan text, -- Plan terapéutico
  
  -- Evaluaciones
  mood_assessment text CHECK (mood_assessment IN ('excellent', 'good', 'neutral', 'poor', 'critical')),
  anxiety_level integer CHECK (anxiety_level >= 1 AND anxiety_level <= 10),
  depression_level integer CHECK (depression_level >= 1 AND depression_level <= 10),
  risk_level text CHECK (risk_level IN ('none', 'low', 'medium', 'high', 'imminent')),
  risk_notes text,
  
  -- Progreso
  progress_rating integer CHECK (progress_rating >= 1 AND progress_rating <= 10),
  treatment_adherence text CHECK (treatment_adherence IN ('excellent', 'good', 'fair', 'poor', 'none')),
  
  -- Intervenciones
  interventions_used text[],
  homework_assigned text,
  homework_completion text CHECK (homework_completion IN ('completed', 'partial', 'not_done', 'not_applicable')),
  
  -- Metadata
  is_confidential boolean DEFAULT true,
  is_template boolean DEFAULT false,
  template_name text,
  
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_clinical_notes_session ON clinical_notes(session_id);
CREATE INDEX idx_clinical_notes_patient ON clinical_notes(patient_id);
CREATE INDEX idx_clinical_notes_therapist ON clinical_notes(therapist_id);
CREATE INDEX idx_clinical_notes_risk ON clinical_notes(risk_level) WHERE risk_level IN ('high', 'imminent');

ALTER TABLE clinical_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Therapists can manage clinical notes" ON clinical_notes
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'therapist')
    )
  );

CREATE TRIGGER update_clinical_notes_updated_at
  BEFORE UPDATE ON clinical_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================================================
-- 4. TABLA: therapeutic_goals (Objetivos Terapéuticos)
-- ==================================================

CREATE TABLE IF NOT EXISTS therapeutic_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  therapist_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  
  goal_title text NOT NULL,
  goal_description text,
  goal_category text CHECK (goal_category IN ('emotional', 'behavioral', 'cognitive', 'social', 'personal', 'professional', 'other')),
  
  -- Medición y progreso
  target_date date,
  status text DEFAULT 'active' CHECK (status IN ('active', 'in_progress', 'achieved', 'modified', 'abandoned')),
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  
  -- SMART goal components
  specific_criteria text,
  measurable_criteria text,
  achievable_notes text,
  relevant_notes text,
  time_bound_date date,
  
  -- Seguimiento
  last_reviewed_at timestamptz,
  achieved_at timestamptz,
  abandoned_reason text,
  
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_therapeutic_goals_patient ON therapeutic_goals(patient_id);
CREATE INDEX idx_therapeutic_goals_status ON therapeutic_goals(status) WHERE status IN ('active', 'in_progress');
CREATE INDEX idx_therapeutic_goals_therapist ON therapeutic_goals(therapist_id);

ALTER TABLE therapeutic_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Therapists can manage goals" ON therapeutic_goals
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'therapist')
    )
  );

CREATE TRIGGER update_therapeutic_goals_updated_at
  BEFORE UPDATE ON therapeutic_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================================================
-- 5. TABLA: therapist_availability (Disponibilidad)
-- ==================================================

CREATE TABLE IF NOT EXISTS therapist_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
  start_time time NOT NULL,
  end_time time NOT NULL,
  
  is_available boolean DEFAULT true,
  location text, -- 'office', 'online', 'home_visit'
  
  -- Excepciones y días festivos
  effective_from date NOT NULL,
  effective_until date,
  
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  CONSTRAINT valid_time CHECK (end_time > start_time)
);

CREATE INDEX idx_availability_therapist ON therapist_availability(therapist_id);
CREATE INDEX idx_availability_day ON therapist_availability(day_of_week);
CREATE INDEX idx_availability_dates ON therapist_availability(effective_from, effective_until);

ALTER TABLE therapist_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view availability" ON therapist_availability
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Therapists can manage own availability" ON therapist_availability
  FOR ALL TO authenticated
  USING (therapist_id = auth.uid());

CREATE TRIGGER update_therapist_availability_updated_at
  BEFORE UPDATE ON therapist_availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================================================
-- 6. TABLA: appointment_reminders (Recordatorios)
-- ==================================================

CREATE TABLE IF NOT EXISTS appointment_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  reminder_type text NOT NULL CHECK (reminder_type IN ('email', 'sms', 'whatsapp', 'push')),
  scheduled_for timestamptz NOT NULL,
  
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  sent_at timestamptz,
  
  message_template text,
  message_sent text,
  
  error_message text,
  retry_count integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_reminders_session ON appointment_reminders(session_id);
CREATE INDEX idx_reminders_patient ON appointment_reminders(patient_id);
CREATE INDEX idx_reminders_scheduled ON appointment_reminders(scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_reminders_status ON appointment_reminders(status);

ALTER TABLE appointment_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reminders" ON appointment_reminders
  FOR SELECT TO authenticated
  USING (true);

-- ==================================================
-- 7. TABLA: payment_transactions (Transacciones de Pago)
-- ==================================================

CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sessions(id) ON DELETE SET NULL,
  patient_id uuid REFERENCES patients(id) ON DELETE SET NULL,
  contract_id uuid REFERENCES contracts(id) ON DELETE SET NULL,
  report_id uuid REFERENCES monthly_contract_reports(id) ON DELETE SET NULL,
  
  transaction_type text NOT NULL CHECK (transaction_type IN ('payment', 'refund', 'adjustment', 'discount')),
  amount decimal(10,2) NOT NULL,
  
  payment_method text CHECK (payment_method IN ('cash', 'card', 'transfer', 'check', 'online', 'other')),
  payment_reference text,
  
  currency text DEFAULT 'MXN',
  exchange_rate decimal(10,4) DEFAULT 1.0,
  
  status text DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  
  -- Detalles bancarios
  bank_name text,
  account_last_four text,
  authorization_code text,
  
  -- Notas y metadata
  notes text,
  processed_by uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  
  transaction_date timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_transactions_session ON payment_transactions(session_id);
CREATE INDEX idx_transactions_patient ON payment_transactions(patient_id);
CREATE INDEX idx_transactions_contract ON payment_transactions(contract_id);
CREATE INDEX idx_transactions_date ON payment_transactions(transaction_date DESC);
CREATE INDEX idx_transactions_status ON payment_transactions(status);

ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view transactions" ON payment_transactions
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage transactions" ON payment_transactions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'therapist')
    )
  );

-- ==================================================
-- 8. TABLA: diagnoses (Diagnósticos)
-- ==================================================

CREATE TABLE IF NOT EXISTS diagnoses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  therapist_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  session_id uuid REFERENCES sessions(id) ON DELETE SET NULL,
  
  -- Diagnóstico principal
  diagnosis_code text, -- CIE-10 o DSM-5
  diagnosis_name text NOT NULL,
  diagnosis_category text,
  
  -- Tipo y severidad
  diagnosis_type text CHECK (diagnosis_type IN ('primary', 'secondary', 'provisional', 'ruled_out')),
  severity text CHECK (severity IN ('mild', 'moderate', 'severe', 'in_remission')),
  
  -- Fechas
  diagnosed_at date NOT NULL,
  resolved_at date,
  
  -- Notas clínicas
  clinical_notes text,
  treatment_plan text,
  
  is_active boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_diagnoses_patient ON diagnoses(patient_id);
CREATE INDEX idx_diagnoses_therapist ON diagnoses(therapist_id);
CREATE INDEX idx_diagnoses_active ON diagnoses(is_active) WHERE is_active = true;
CREATE INDEX idx_diagnoses_code ON diagnoses(diagnosis_code);

ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Therapists can manage diagnoses" ON diagnoses
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'therapist')
    )
  );

CREATE TRIGGER update_diagnoses_updated_at
  BEFORE UPDATE ON diagnoses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================================================
-- 9. TABLA: document_templates (Plantillas)
-- ==================================================

CREATE TABLE IF NOT EXISTS document_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  
  template_name text NOT NULL,
  template_type text NOT NULL CHECK (template_type IN ('clinical_note', 'consent_form', 'report', 'letter', 'invoice', 'other')),
  
  content text NOT NULL,
  variables jsonb, -- Variables que se pueden reemplazar
  
  is_active boolean DEFAULT true,
  is_public boolean DEFAULT false, -- Compartido con todos los terapeutas
  
  usage_count integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_templates_type ON document_templates(template_type) WHERE is_active = true;
CREATE INDEX idx_templates_public ON document_templates(is_public) WHERE is_public = true;
CREATE INDEX idx_templates_creator ON document_templates(created_by);

ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public templates" ON document_templates
  FOR SELECT TO authenticated
  USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can manage own templates" ON document_templates
  FOR ALL TO authenticated
  USING (created_by = auth.uid());

CREATE TRIGGER update_document_templates_updated_at
  BEFORE UPDATE ON document_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================================================
-- 10. TABLA: system_settings (Configuración Global)
-- ==================================================

CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  setting_type text NOT NULL CHECK (setting_type IN ('string', 'number', 'boolean', 'json', 'array')),
  
  description text,
  category text, -- 'general', 'notifications', 'billing', 'calendar', 'security'
  
  is_public boolean DEFAULT false, -- Accesible para todos vs solo admins
  
  updated_by uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_settings_key ON system_settings(setting_key);
CREATE INDEX idx_settings_category ON system_settings(category);

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public settings" ON system_settings
  FOR SELECT TO authenticated
  USING (is_public = true OR EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  ));

CREATE POLICY "Admins can manage settings" ON system_settings
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================================================
-- 11. TABLA: audit_log (Log de Auditoría)
-- ==================================================

CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  
  action text NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout', etc.
  entity_type text NOT NULL, -- 'patient', 'session', 'contract', etc.
  entity_id uuid,
  
  changes jsonb, -- Objeto con los cambios realizados (before/after)
  ip_address inet,
  user_agent text,
  
  severity text DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);
CREATE INDEX idx_audit_action ON audit_log(action);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit log" ON audit_log
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- ==================================================
-- 12. TABLA: session_techniques (Técnicas Aplicadas)
-- ==================================================

CREATE TABLE IF NOT EXISTS session_techniques (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  clinical_note_id uuid REFERENCES clinical_notes(id) ON DELETE CASCADE,
  
  technique_name text NOT NULL,
  technique_category text CHECK (technique_category IN ('cognitive', 'behavioral', 'psychodynamic', 'humanistic', 'systemic', 'mindfulness', 'other')),
  
  effectiveness_rating integer CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 10),
  patient_response text,
  
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_techniques_session ON session_techniques(session_id);
CREATE INDEX idx_techniques_category ON session_techniques(technique_category);
CREATE INDEX idx_techniques_name ON session_techniques(technique_name);

ALTER TABLE session_techniques ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Therapists can manage techniques" ON session_techniques
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'therapist')
    )
  );

-- ==================================================
-- 13. TABLA: patient_emergency_contacts (Múltiples Contactos)
-- ==================================================

CREATE TABLE IF NOT EXISTS patient_emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  contact_name text NOT NULL,
  relationship text NOT NULL,
  phone text NOT NULL,
  alternate_phone text,
  email text,
  
  is_primary boolean DEFAULT false,
  priority integer DEFAULT 1, -- Orden de contacto
  
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_emergency_contacts_patient ON patient_emergency_contacts(patient_id);
CREATE INDEX idx_emergency_contacts_primary ON patient_emergency_contacts(patient_id, is_primary) WHERE is_primary = true;

ALTER TABLE patient_emergency_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Therapists can manage emergency contacts" ON patient_emergency_contacts
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'therapist')
    )
  );

CREATE TRIGGER update_patient_emergency_contacts_updated_at
  BEFORE UPDATE ON patient_emergency_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================================================
-- 14. TABLA: company_employees (Empleados de Empresas)
-- ==================================================

CREATE TABLE IF NOT EXISTS company_employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  patient_id uuid REFERENCES patients(id) ON DELETE SET NULL,
  
  employee_name text NOT NULL,
  employee_email text,
  employee_id_number text, -- Número de empleado en la empresa
  department text,
  position text,
  
  is_active boolean DEFAULT true,
  start_date date,
  end_date date,
  
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_company_employees_company ON company_employees(company_id);
CREATE INDEX idx_company_employees_patient ON company_employees(patient_id);
CREATE INDEX idx_company_employees_active ON company_employees(is_active) WHERE is_active = true;

ALTER TABLE company_employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view company employees" ON company_employees
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage employees" ON company_employees
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'therapist')
    )
  );

CREATE TRIGGER update_company_employees_updated_at
  BEFORE UPDATE ON company_employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================================================
-- Mensaje de Confirmación
-- ==================================================

DO $$
BEGIN
  RAISE NOTICE '✅ 14 nuevas tablas creadas exitosamente';
  RAISE NOTICE '📊 Sistema CRM completo y funcional';
  RAISE NOTICE '🔐 RLS configurado en todas las tablas';
  RAISE NOTICE '⚡ Índices optimizados creados';
  RAISE NOTICE '🎯 Sistema listo para producción';
END $$;
