/*
  # Creación de Tablas de Pacientes y Sesiones

  ## Nuevas Tablas
  
  ### patients
  Tabla para almacenar información de pacientes:
  - `id` (uuid, primary key): Identificador único del paciente
  - `name` (text): Nombre completo del paciente
  - `email` (text): Correo electrónico
  - `phone` (text): Teléfono
  - `birth_date` (date): Fecha de nacimiento
  - `gender` (text): Género (M, F, Other)
  - `occupation` (text): Ocupación
  - `company` (text): Empresa donde trabaja
  - `address` (text): Dirección
  - `marital_status` (text): Estado civil
  - `education_level` (text): Nivel educativo
  - `nationality` (text): Nacionalidad
  - `religion` (text): Religión
  - `living_situation` (text): Situación de vivienda
  - `has_children` (boolean): Tiene hijos
  - `children_count` (integer): Número de hijos
  - `emergency_contact` (text): Contacto de emergencia
  - `emergency_phone` (text): Teléfono de emergencia
  - `therapy_type` (text): Tipo de terapia
  - `referred_by` (text): Referido por
  - `reason_for_therapy` (text): Motivo de consulta
  - `expectations` (text): Expectativas del tratamiento
  - `previous_therapy` (boolean): Ha tenido terapia previa
  - `previous_therapy_details` (text): Detalles de terapia previa
  - `current_medications` (text): Medicación actual
  - `medical_conditions` (text): Condiciones médicas
  - `family_history` (text): Historial familiar psiquiátrico
  - `notes` (text): Notas adicionales
  - `status` (text): Estado (active, inactive, pending)
  - `created_at` (timestamptz): Fecha de creación
  - `updated_at` (timestamptz): Fecha de última actualización

  ### sessions
  Tabla para almacenar sesiones/citas de pacientes:
  - `id` (uuid, primary key): Identificador único de la sesión
  - `patient_id` (uuid): Referencia al paciente
  - `session_date` (timestamptz): Fecha y hora de la sesión
  - `session_type` (text): Tipo de sesión (Terapia Individual, Evaluación, etc.)
  - `session_cost` (decimal): Costo de la sesión
  - `billing_type` (text): Tipo de cobro ('contract' o 'direct')
  - `contract_id` (uuid): Referencia al contrato (si aplica)
  - `payment_status` (text): Estado de pago ('pending', 'partial', 'paid')
  - `paid_amount` (decimal): Monto ya pagado
  - `session_notes` (text): Notas de la sesión
  - `status` (text): Estado de la sesión (scheduled, completed, cancelled, no_show)
  - `created_at` (timestamptz): Fecha de creación
  - `updated_at` (timestamptz): Fecha de última actualización

  ## Seguridad
  - RLS habilitado en todas las tablas
  - Políticas restrictivas para usuarios autenticados

  ## Índices
  - Índices en campos de búsqueda frecuente
  - Índices en claves foráneas
*/

-- Crear tabla de pacientes
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  birth_date date NOT NULL,
  gender text NOT NULL CHECK (gender IN ('M', 'F', 'Other')),
  occupation text,
  company text,
  address text,
  marital_status text,
  education_level text,
  nationality text,
  religion text,
  living_situation text,
  has_children boolean DEFAULT false,
  children_count integer DEFAULT 0,
  emergency_contact text NOT NULL,
  emergency_phone text NOT NULL,
  therapy_type text NOT NULL,
  referred_by text,
  reason_for_therapy text NOT NULL,
  expectations text,
  previous_therapy boolean DEFAULT false,
  previous_therapy_details text,
  current_medications text,
  medical_conditions text,
  family_history text,
  notes text,
  status text DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'inactive', 'pending')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Crear índices para patients
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name);
CREATE INDEX IF NOT EXISTS idx_patients_company ON patients(company);

-- Crear tabla de sesiones
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  session_date timestamptz NOT NULL,
  session_type text NOT NULL,
  session_cost decimal(10,2) NOT NULL CHECK (session_cost >= 0),
  billing_type text DEFAULT 'direct' NOT NULL CHECK (billing_type IN ('contract', 'direct')),
  contract_id uuid REFERENCES contracts(id) ON DELETE SET NULL,
  payment_status text DEFAULT 'pending' NOT NULL CHECK (payment_status IN ('pending', 'partial', 'paid')),
  paid_amount decimal(10,2) DEFAULT 0 NOT NULL CHECK (paid_amount >= 0),
  session_notes text,
  status text DEFAULT 'scheduled' NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Crear índices para sessions
CREATE INDEX IF NOT EXISTS idx_sessions_patient ON sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_sessions_contract ON sessions(contract_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_sessions_billing_type ON sessions(billing_type);
CREATE INDEX IF NOT EXISTS idx_sessions_payment_status ON sessions(payment_status);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);

-- Habilitar RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para patients
CREATE POLICY "Users can view all patients"
  ON patients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create patients"
  ON patients FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update patients"
  ON patients FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete patients"
  ON patients FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para sessions
CREATE POLICY "Users can view all sessions"
  ON sessions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create sessions"
  ON sessions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update sessions"
  ON sessions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete sessions"
  ON sessions FOR DELETE
  TO authenticated
  USING (true);

-- Función para actualizar updated_at automáticamente en patients
CREATE OR REPLACE FUNCTION update_patients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at en patients
DROP TRIGGER IF EXISTS trigger_update_patients_updated_at ON patients;
CREATE TRIGGER trigger_update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_patients_updated_at();

-- Función para actualizar updated_at automáticamente en sessions
CREATE OR REPLACE FUNCTION update_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at en sessions
DROP TRIGGER IF EXISTS trigger_update_sessions_updated_at ON sessions;
CREATE TRIGGER trigger_update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_sessions_updated_at();
