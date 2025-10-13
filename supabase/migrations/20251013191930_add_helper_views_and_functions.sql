/*
  # Vistas y Funciones Auxiliares para Optimizar Consultas
  
  Este script agrega vistas materializadas y funciones útiles para
  optimizar las consultas más comunes del sistema CRM.
  
  ## Vistas Creadas:
  1. active_patients_summary - Resumen de pacientes activos
  2. therapist_workload - Carga de trabajo por terapeuta
  3. company_contracts_overview - Vista general de contratos por empresa
  4. pending_payments_summary - Resumen de pagos pendientes
  
  ## Funciones Creadas:
  1. get_patient_age() - Calcular edad de paciente
  2. get_contract_status() - Obtener estado actual de contrato
  3. calculate_therapist_revenue() - Calcular ingresos por terapeuta
*/

-- ==================================================
-- FUNCIÓN: Calcular edad de paciente
-- ==================================================

CREATE OR REPLACE FUNCTION get_patient_age(birth_date date)
RETURNS integer AS $$
BEGIN
  RETURN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date))::integer;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ==================================================
-- FUNCIÓN: Determinar estado actual de contrato
-- ==================================================

CREATE OR REPLACE FUNCTION get_contract_status(
  p_status text,
  p_end_date date,
  p_deleted_at timestamptz
)
RETURNS text AS $$
BEGIN
  IF p_deleted_at IS NOT NULL THEN
    RETURN 'deleted';
  END IF;
  
  IF p_status = 'cancelled' THEN
    RETURN 'cancelled';
  END IF;
  
  IF p_end_date < CURRENT_DATE THEN
    RETURN 'expired';
  END IF;
  
  IF p_status = 'active' AND p_end_date >= CURRENT_DATE THEN
    IF p_end_date <= CURRENT_DATE + INTERVAL '30 days' THEN
      RETURN 'expiring_soon';
    END IF;
    RETURN 'active';
  END IF;
  
  RETURN p_status;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ==================================================
-- VISTA: Resumen de Pacientes Activos
-- ==================================================

CREATE OR REPLACE VIEW active_patients_summary AS
SELECT 
  p.id,
  p.name,
  p.email,
  p.phone,
  p.birth_date,
  get_patient_age(p.birth_date) as age,
  p.gender,
  p.company_id,
  COALESCE(c.name, p.company_name) as company_name,
  p.therapy_type,
  p.status,
  p.primary_therapist_id,
  up.full_name as therapist_name,
  COUNT(DISTINCT s.id) as total_sessions,
  COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'completed') as completed_sessions,
  COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'scheduled') as scheduled_sessions,
  MAX(s.session_date) as last_session_date,
  SUM(s.session_cost) FILTER (WHERE s.status = 'completed') as total_billed,
  SUM(s.paid_amount) as total_paid,
  p.created_at,
  p.updated_at
FROM patients p
LEFT JOIN companies c ON p.company_id = c.id
LEFT JOIN user_profiles up ON p.primary_therapist_id = up.id
LEFT JOIN sessions s ON p.id = s.patient_id AND s.deleted_at IS NULL
WHERE p.status = 'active' AND p.deleted_at IS NULL
GROUP BY p.id, c.name, up.full_name;

-- ==================================================
-- VISTA: Carga de Trabajo por Terapeuta
-- ==================================================

CREATE OR REPLACE VIEW therapist_workload AS
SELECT 
  up.id as therapist_id,
  up.full_name as therapist_name,
  up.specialty,
  up.is_active,
  COUNT(DISTINCT p.id) as active_patients,
  COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'scheduled' AND s.session_date >= CURRENT_DATE) as upcoming_sessions,
  COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'completed' AND s.session_date >= CURRENT_DATE - INTERVAL '30 days') as sessions_last_30_days,
  SUM(s.session_cost) FILTER (WHERE s.status = 'completed' AND s.session_date >= CURRENT_DATE - INTERVAL '30 days') as revenue_last_30_days,
  AVG(s.session_duration_minutes) FILTER (WHERE s.status = 'completed') as avg_session_duration,
  MIN(s.session_date) FILTER (WHERE s.status = 'scheduled' AND s.session_date >= CURRENT_DATE) as next_session_date
FROM user_profiles up
LEFT JOIN patients p ON up.id = p.primary_therapist_id AND p.status = 'active' AND p.deleted_at IS NULL
LEFT JOIN sessions s ON up.id = s.therapist_id AND s.deleted_at IS NULL
WHERE up.role IN ('therapist', 'admin') AND up.is_active = true
GROUP BY up.id;

-- ==================================================
-- VISTA: Vista General de Contratos por Empresa
-- ==================================================

CREATE OR REPLACE VIEW company_contracts_overview AS
SELECT 
  c.id as company_id,
  c.name as company_name,
  c.email as company_email,
  c.is_active as company_active,
  COUNT(DISTINCT ct.id) as total_contracts,
  COUNT(DISTINCT ct.id) FILTER (WHERE ct.status = 'active') as active_contracts,
  COUNT(DISTINCT ct.id) FILTER (WHERE ct.status = 'expired') as expired_contracts,
  COUNT(DISTINCT p.id) as total_patients,
  COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'active') as active_patients,
  COUNT(DISTINCT s.id) as total_sessions,
  COUNT(DISTINCT s.id) FILTER (WHERE s.payment_status = 'pending') as pending_payment_sessions,
  SUM(s.session_cost) FILTER (WHERE s.billing_type = 'contract') as total_contract_billing,
  SUM(s.paid_amount) FILTER (WHERE s.billing_type = 'contract') as total_contract_paid,
  MAX(s.session_date) as last_session_date,
  c.created_at,
  c.updated_at
FROM companies c
LEFT JOIN contracts ct ON c.id = ct.company_id AND ct.deleted_at IS NULL
LEFT JOIN patients p ON c.id = p.company_id AND p.deleted_at IS NULL
LEFT JOIN sessions s ON p.id = s.patient_id AND s.deleted_at IS NULL
WHERE c.deleted_at IS NULL
GROUP BY c.id;

-- ==================================================
-- VISTA: Resumen de Pagos Pendientes
-- ==================================================

CREATE OR REPLACE VIEW pending_payments_summary AS
SELECT 
  s.id as session_id,
  s.session_date,
  s.session_type,
  s.session_cost,
  s.paid_amount,
  (s.session_cost - s.paid_amount) as balance_due,
  s.payment_status,
  s.billing_type,
  s.status as session_status,
  p.id as patient_id,
  p.name as patient_name,
  p.email as patient_email,
  p.company_id,
  COALESCE(co.name, p.company_name) as company_name,
  ct.id as contract_id,
  ct.contract_name,
  up.id as therapist_id,
  up.full_name as therapist_name,
  CASE 
    WHEN s.session_date < CURRENT_DATE - INTERVAL '90 days' THEN 'overdue_90+'
    WHEN s.session_date < CURRENT_DATE - INTERVAL '60 days' THEN 'overdue_60+'
    WHEN s.session_date < CURRENT_DATE - INTERVAL '30 days' THEN 'overdue_30+'
    ELSE 'current'
  END as aging_category,
  s.created_at,
  s.updated_at
FROM sessions s
JOIN patients p ON s.patient_id = p.id
LEFT JOIN companies co ON p.company_id = co.id
LEFT JOIN contracts ct ON s.contract_id = ct.id
LEFT JOIN user_profiles up ON s.therapist_id = up.id
WHERE s.payment_status IN ('pending', 'partial')
  AND s.status = 'completed'
  AND s.deleted_at IS NULL
ORDER BY s.session_date DESC;

-- ==================================================
-- FUNCIÓN: Calcular Ingresos por Terapeuta en Período
-- ==================================================

CREATE OR REPLACE FUNCTION calculate_therapist_revenue(
  p_therapist_id uuid,
  p_start_date date,
  p_end_date date
)
RETURNS TABLE (
  total_sessions bigint,
  completed_sessions bigint,
  total_revenue numeric,
  paid_revenue numeric,
  pending_revenue numeric,
  average_session_cost numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::bigint as total_sessions,
    COUNT(*) FILTER (WHERE status = 'completed')::bigint as completed_sessions,
    COALESCE(SUM(session_cost), 0) as total_revenue,
    COALESCE(SUM(paid_amount), 0) as paid_revenue,
    COALESCE(SUM(session_cost - paid_amount), 0) as pending_revenue,
    COALESCE(AVG(session_cost), 0) as average_session_cost
  FROM sessions
  WHERE therapist_id = p_therapist_id
    AND session_date >= p_start_date
    AND session_date <= p_end_date
    AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- ==================================================
-- FUNCIÓN: Obtener Estadísticas de Empresa
-- ==================================================

CREATE OR REPLACE FUNCTION get_company_statistics(p_company_id uuid)
RETURNS TABLE (
  total_contracts bigint,
  active_contracts bigint,
  total_patients bigint,
  active_patients bigint,
  total_sessions bigint,
  completed_sessions bigint,
  total_billed numeric,
  total_paid numeric,
  pending_amount numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT ct.id)::bigint as total_contracts,
    COUNT(DISTINCT ct.id) FILTER (WHERE ct.status = 'active')::bigint as active_contracts,
    COUNT(DISTINCT p.id)::bigint as total_patients,
    COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'active')::bigint as active_patients,
    COUNT(DISTINCT s.id)::bigint as total_sessions,
    COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'completed')::bigint as completed_sessions,
    COALESCE(SUM(s.session_cost), 0) as total_billed,
    COALESCE(SUM(s.paid_amount), 0) as total_paid,
    COALESCE(SUM(s.session_cost - s.paid_amount), 0) as pending_amount
  FROM companies c
  LEFT JOIN contracts ct ON c.id = ct.company_id AND ct.deleted_at IS NULL
  LEFT JOIN patients p ON c.id = p.company_id AND p.deleted_at IS NULL
  LEFT JOIN sessions s ON p.id = s.patient_id AND s.deleted_at IS NULL
  WHERE c.id = p_company_id AND c.deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- ==================================================
-- FUNCIÓN: Obtener Próximas Sesiones
-- ==================================================

CREATE OR REPLACE FUNCTION get_upcoming_sessions(
  p_days_ahead integer DEFAULT 7,
  p_therapist_id uuid DEFAULT NULL
)
RETURNS TABLE (
  session_id uuid,
  session_date timestamptz,
  session_type text,
  patient_id uuid,
  patient_name text,
  therapist_id uuid,
  therapist_name text,
  status text,
  session_duration_minutes integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id as session_id,
    s.session_date,
    s.session_type,
    p.id as patient_id,
    p.name as patient_name,
    s.therapist_id,
    up.full_name as therapist_name,
    s.status,
    s.session_duration_minutes
  FROM sessions s
  JOIN patients p ON s.patient_id = p.id
  LEFT JOIN user_profiles up ON s.therapist_id = up.id
  WHERE s.session_date >= CURRENT_TIMESTAMP
    AND s.session_date <= CURRENT_TIMESTAMP + (p_days_ahead || ' days')::interval
    AND s.status IN ('scheduled', 'confirmed')
    AND s.deleted_at IS NULL
    AND (p_therapist_id IS NULL OR s.therapist_id = p_therapist_id)
  ORDER BY s.session_date ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ==================================================
-- Mensaje de Confirmación
-- ==================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Vistas y funciones auxiliares creadas exitosamente';
  RAISE NOTICE '📊 Vistas: 4';
  RAISE NOTICE '⚡ Funciones: 5';
  RAISE NOTICE '🎯 Sistema optimizado para consultas comunes';
END $$;
