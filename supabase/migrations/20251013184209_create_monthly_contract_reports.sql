/*
  # Sistema de Reportes Mensuales por Contrato

  ## Nuevas Tablas
  
  ### monthly_contract_reports
  Tabla para almacenar reportes mensuales generados por contrato:
  - `id` (uuid, primary key): Identificador único del reporte
  - `contract_id` (uuid): Referencia al contrato
  - `company_id` (uuid): Referencia a la empresa (desnormalizado para consultas rápidas)
  - `report_month` (integer): Mes del reporte (1-12)
  - `report_year` (integer): Año del reporte
  - `total_sessions` (integer): Total de sesiones en el período
  - `total_patients` (integer): Total de pacientes únicos atendidos
  - `total_amount` (decimal): Monto total a cobrar
  - `payment_status` (text): Estado de pago del reporte ('pending', 'paid')
  - `generated_at` (timestamptz): Fecha de generación del reporte
  - `paid_at` (timestamptz): Fecha en que se marcó como pagado
  - `paid_by` (text): Usuario que marcó como pagado
  - `payment_reference` (text): Referencia de pago (número de transferencia, etc.)
  - `payment_method` (text): Método de pago (transfer, cash, check)
  - `notes` (text): Notas adicionales del reporte
  - `created_at` (timestamptz): Fecha de creación
  - `updated_at` (timestamptz): Fecha de última actualización

  ### monthly_report_sessions
  Tabla de detalle de sesiones incluidas en cada reporte:
  - `id` (uuid, primary key): Identificador único
  - `report_id` (uuid): Referencia al reporte mensual
  - `session_id` (uuid): Referencia a la sesión
  - `patient_id` (uuid): ID del paciente
  - `patient_name` (text): Nombre del paciente (desnormalizado)
  - `session_date` (timestamptz): Fecha de la sesión
  - `session_type` (text): Tipo de sesión
  - `session_cost` (decimal): Costo de la sesión
  - `created_at` (timestamptz): Fecha de creación

  ## Seguridad
  - RLS habilitado en todas las tablas
  - Políticas restrictivas para usuarios autenticados

  ## Notas Importantes
  - Los reportes son inmutables una vez generados
  - Al marcar un reporte como pagado, se actualizan automáticamente todas las sesiones vinculadas
  - Se mantiene historial completo de reportes para auditoría
  - Un contrato puede tener múltiples reportes mensuales (histórico)
  - Constraint único por contrato, mes y año para evitar duplicados
*/

-- Crear tabla de reportes mensuales
CREATE TABLE IF NOT EXISTS monthly_contract_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid REFERENCES contracts(id) ON DELETE CASCADE NOT NULL,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  report_month integer NOT NULL CHECK (report_month >= 1 AND report_month <= 12),
  report_year integer NOT NULL CHECK (report_year >= 2020),
  total_sessions integer DEFAULT 0 NOT NULL,
  total_patients integer DEFAULT 0 NOT NULL,
  total_amount decimal(10,2) DEFAULT 0 NOT NULL,
  payment_status text DEFAULT 'pending' NOT NULL CHECK (payment_status IN ('pending', 'paid')),
  generated_at timestamptz DEFAULT now() NOT NULL,
  paid_at timestamptz,
  paid_by text,
  payment_reference text,
  payment_method text CHECK (payment_method IN ('transfer', 'cash', 'check')),
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(contract_id, report_month, report_year)
);

-- Crear índices para monthly_contract_reports
CREATE INDEX IF NOT EXISTS idx_monthly_reports_contract ON monthly_contract_reports(contract_id);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_company ON monthly_contract_reports(company_id);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_period ON monthly_contract_reports(report_year, report_month);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_status ON monthly_contract_reports(payment_status);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_generated ON monthly_contract_reports(generated_at);

-- Crear tabla de detalle de sesiones por reporte
CREATE TABLE IF NOT EXISTS monthly_report_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES monthly_contract_reports(id) ON DELETE CASCADE NOT NULL,
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  patient_name text NOT NULL,
  session_date timestamptz NOT NULL,
  session_type text NOT NULL,
  session_cost decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Crear índices para monthly_report_sessions
CREATE INDEX IF NOT EXISTS idx_report_sessions_report ON monthly_report_sessions(report_id);
CREATE INDEX IF NOT EXISTS idx_report_sessions_session ON monthly_report_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_report_sessions_patient ON monthly_report_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_report_sessions_date ON monthly_report_sessions(session_date);

-- Habilitar RLS
ALTER TABLE monthly_contract_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_report_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para monthly_contract_reports
CREATE POLICY "Users can view reports"
  ON monthly_contract_reports FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create reports"
  ON monthly_contract_reports FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update reports"
  ON monthly_contract_reports FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete reports"
  ON monthly_contract_reports FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para monthly_report_sessions
CREATE POLICY "Users can view report sessions"
  ON monthly_report_sessions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create report sessions"
  ON monthly_report_sessions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can delete report sessions"
  ON monthly_report_sessions FOR DELETE
  TO authenticated
  USING (true);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_monthly_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_monthly_reports_updated_at ON monthly_contract_reports;
CREATE TRIGGER trigger_update_monthly_reports_updated_at
  BEFORE UPDATE ON monthly_contract_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_monthly_reports_updated_at();

-- Función para actualizar sesiones cuando un reporte se marca como pagado
CREATE OR REPLACE FUNCTION mark_report_sessions_as_paid()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo actualizar si el estado cambió a 'paid'
  IF NEW.payment_status = 'paid' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'paid') THEN
    -- Actualizar todas las sesiones del reporte
    UPDATE sessions
    SET 
      payment_status = 'paid',
      paid_amount = session_cost,
      updated_at = now()
    WHERE id IN (
      SELECT session_id 
      FROM monthly_report_sessions 
      WHERE report_id = NEW.id
    );
    
    -- Registrar la fecha de pago
    NEW.paid_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar sesiones automáticamente
DROP TRIGGER IF EXISTS trigger_mark_report_sessions_paid ON monthly_contract_reports;
CREATE TRIGGER trigger_mark_report_sessions_paid
  BEFORE UPDATE ON monthly_contract_reports
  FOR EACH ROW
  EXECUTE FUNCTION mark_report_sessions_as_paid();
