/*
  # MEJORAS A TABLAS EXISTENTES Y RELACIONES (Versión Corregida)
*/

-- ==================================================
-- MEJORAS A TABLA: sessions
-- ==================================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sessions' AND column_name = 'appointment_type'
  ) THEN
    ALTER TABLE sessions ADD COLUMN appointment_type text 
      CHECK (appointment_type IN ('presencial', 'videollamada', 'visita'));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sessions' AND column_name = 'meet_link'
  ) THEN
    ALTER TABLE sessions ADD COLUMN meet_link text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sessions' AND column_name = 'location_address'
  ) THEN
    ALTER TABLE sessions ADD COLUMN location_address text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sessions' AND column_name = 'confirmed_at'
  ) THEN
    ALTER TABLE sessions ADD COLUMN confirmed_at timestamptz;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sessions' AND column_name = 'confirmed_by'
  ) THEN
    ALTER TABLE sessions ADD COLUMN confirmed_by text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sessions' AND column_name = 'reminders_sent'
  ) THEN
    ALTER TABLE sessions ADD COLUMN reminders_sent integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sessions' AND column_name = 'last_reminder_sent_at'
  ) THEN
    ALTER TABLE sessions ADD COLUMN last_reminder_sent_at timestamptz;
  END IF;
END $$;

-- ==================================================
-- MEJORAS A TABLA: contracts
-- ==================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contracts' AND column_name = 'send_renewal_notification'
  ) THEN
    ALTER TABLE contracts ADD COLUMN send_renewal_notification boolean DEFAULT true;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contracts' AND column_name = 'last_renewal_notification_sent'
  ) THEN
    ALTER TABLE contracts ADD COLUMN last_renewal_notification_sent timestamptz;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contracts' AND column_name = 'billing_email'
  ) THEN
    ALTER TABLE contracts ADD COLUMN billing_email text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contracts' AND column_name = 'terms_accepted_at'
  ) THEN
    ALTER TABLE contracts ADD COLUMN terms_accepted_at timestamptz;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contracts' AND column_name = 'terms_accepted_by'
  ) THEN
    ALTER TABLE contracts ADD COLUMN terms_accepted_by text;
  END IF;
END $$;

-- ==================================================
-- MEJORAS A TABLA: patients
-- ==================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'patients' AND column_name = 'photo_url'
  ) THEN
    ALTER TABLE patients ADD COLUMN photo_url text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'patients' AND column_name = 'preferred_contact_method'
  ) THEN
    ALTER TABLE patients ADD COLUMN preferred_contact_method text 
      CHECK (preferred_contact_method IN ('email', 'phone', 'sms', 'whatsapp'));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'patients' AND column_name = 'preferred_language'
  ) THEN
    ALTER TABLE patients ADD COLUMN preferred_language text DEFAULT 'es';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'patients' AND column_name = 'insurance_provider'
  ) THEN
    ALTER TABLE patients ADD COLUMN insurance_provider text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'patients' AND column_name = 'insurance_policy_number'
  ) THEN
    ALTER TABLE patients ADD COLUMN insurance_policy_number text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'patients' AND column_name = 'insurance_valid_until'
  ) THEN
    ALTER TABLE patients ADD COLUMN insurance_valid_until date;
  END IF;
END $$;

-- ==================================================
-- MEJORAS A TABLA: monthly_contract_reports
-- ==================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'monthly_contract_reports' AND column_name = 'sent_to_company_at'
  ) THEN
    ALTER TABLE monthly_contract_reports ADD COLUMN sent_to_company_at timestamptz;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'monthly_contract_reports' AND column_name = 'sent_by'
  ) THEN
    ALTER TABLE monthly_contract_reports ADD COLUMN sent_by uuid REFERENCES user_profiles(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'monthly_contract_reports' AND column_name = 'pdf_url'
  ) THEN
    ALTER TABLE monthly_contract_reports ADD COLUMN pdf_url text;
  END IF;
END $$;

-- ==================================================
-- VISTA: Calendario Semanal
-- ==================================================

CREATE OR REPLACE VIEW weekly_calendar_view AS
SELECT 
  s.id as session_id,
  s.session_date,
  EXTRACT(DOW FROM s.session_date) as day_of_week,
  s.session_duration_minutes,
  s.session_type,
  s.appointment_type,
  s.meet_link,
  s.status,
  s.confirmed_at,
  p.id as patient_id,
  p.name as patient_name,
  p.phone as patient_phone,
  p.email as patient_email,
  t.id as therapist_id,
  t.full_name as therapist_name,
  s.session_notes,
  s.reminders_sent,
  s.last_reminder_sent_at,
  s.created_at
FROM sessions s
JOIN patients p ON s.patient_id = p.id
LEFT JOIN user_profiles t ON s.therapist_id = t.id
WHERE s.deleted_at IS NULL
  AND s.status IN ('scheduled', 'confirmed', 'in_progress')
ORDER BY s.session_date ASC;

-- ==================================================
-- FUNCIÓN: Obtener sesiones de paciente
-- ==================================================

CREATE OR REPLACE FUNCTION get_patient_sessions(p_patient_id uuid)
RETURNS TABLE (
  session_id uuid,
  session_date timestamptz,
  session_type text,
  therapist_name text,
  status text,
  payment_status text,
  session_cost numeric,
  paid_amount numeric,
  has_clinical_notes boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id as session_id,
    s.session_date,
    s.session_type,
    up.full_name as therapist_name,
    s.status,
    s.payment_status,
    s.session_cost,
    s.paid_amount,
    EXISTS(SELECT 1 FROM clinical_notes WHERE session_id = s.id) as has_clinical_notes
  FROM sessions s
  LEFT JOIN user_profiles up ON s.therapist_id = up.id
  WHERE s.patient_id = p_patient_id
    AND s.deleted_at IS NULL
  ORDER BY s.session_date DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ==================================================
-- FUNCIÓN: Verificar disponibilidad
-- ==================================================

CREATE OR REPLACE FUNCTION check_therapist_availability(
  p_therapist_id uuid,
  p_date_time timestamptz,
  p_duration_minutes integer
)
RETURNS boolean AS $$
DECLARE
  v_end_time timestamptz;
  v_conflict_count integer;
BEGIN
  v_end_time := p_date_time + (p_duration_minutes || ' minutes')::interval;
  
  SELECT COUNT(*) INTO v_conflict_count
  FROM sessions
  WHERE therapist_id = p_therapist_id
    AND deleted_at IS NULL
    AND status IN ('scheduled', 'confirmed', 'in_progress')
    AND (
      (p_date_time >= session_date AND p_date_time < session_date + (session_duration_minutes || ' minutes')::interval)
      OR
      (v_end_time > session_date AND v_end_time <= session_date + (session_duration_minutes || ' minutes')::interval)
      OR
      (p_date_time <= session_date AND v_end_time >= session_date + (session_duration_minutes || ' minutes')::interval)
    );
  
  RETURN v_conflict_count = 0;
END;
$$ LANGUAGE plpgsql STABLE;

-- ==================================================
-- FUNCIÓN: Crear notificación
-- ==================================================

CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_title text,
  p_message text,
  p_type text,
  p_priority text DEFAULT 'normal',
  p_related_entity_type text DEFAULT NULL,
  p_related_entity_id uuid DEFAULT NULL,
  p_action_url text DEFAULT NULL,
  p_action_label text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_notification_id uuid;
BEGIN
  INSERT INTO notifications (
    user_id, title, message, type, priority,
    related_entity_type, related_entity_id,
    action_url, action_label
  ) VALUES (
    p_user_id, p_title, p_message, p_type, p_priority,
    p_related_entity_type, p_related_entity_id,
    p_action_url, p_action_label
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- ==================================================
-- Índices adicionales
-- ==================================================

CREATE INDEX IF NOT EXISTS idx_sessions_appointment_type ON sessions(appointment_type);

CREATE INDEX IF NOT EXISTS idx_sessions_therapist_date ON sessions(therapist_id, session_date) 
  WHERE deleted_at IS NULL AND status IN ('scheduled', 'confirmed');

CREATE INDEX IF NOT EXISTS idx_notifications_urgent ON notifications(user_id, created_at DESC) 
  WHERE priority = 'urgent' AND is_read = false;

CREATE INDEX IF NOT EXISTS idx_tasks_pending ON tasks(assigned_to, due_date) 
  WHERE status NOT IN ('completed', 'cancelled');

-- ==================================================
-- Mensaje de Confirmación
-- ==================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Mejoras aplicadas exitosamente';
  RAISE NOTICE '📊 Vistas y funciones creadas';
  RAISE NOTICE '⚡ Índices optimizados agregados';
END $$;
