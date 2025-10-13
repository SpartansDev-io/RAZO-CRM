/*
  # Create contracts table for company service agreements

  1. New Tables
    - `contracts`
      - `id` (uuid, primary key) - Unique identifier
      - `company_id` (uuid, foreign key) - References companies table
      - `contract_name` (text) - Name/identifier of the contract
      - `start_date` (date) - Contract start date
      - `end_date` (date) - Contract end date
      - `cost_per_session` (decimal) - Cost per consultation/session in MXN
      - `monthly_limit` (decimal, optional) - Monthly spending limit in MXN
      - `payment_frequency` (text) - Payment frequency (monthly, quarterly, annual)
      - `status` (text) - Contract status (active, expired, cancelled, pending)
      - `notes` (text, optional) - Additional contract notes
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp

  2. Security
    - Enable RLS on `contracts` table
    - Add policy for authenticated users to read contracts
    - Add policy for authenticated users to create contracts
    - Add policy for authenticated users to update contracts
    - Add policy for authenticated users to delete contracts

  3. Indexes
    - Index on company_id for efficient lookups
    - Index on status for filtering
    - Index on end_date for expiration checks
*/

-- Create contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  contract_name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  cost_per_session decimal(10, 2) NOT NULL,
  monthly_limit decimal(10, 2),
  payment_frequency text NOT NULL DEFAULT 'monthly' CHECK (payment_frequency IN ('monthly', 'quarterly', 'annual')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_dates CHECK (end_date > start_date),
  CONSTRAINT positive_cost CHECK (cost_per_session > 0),
  CONSTRAINT positive_limit CHECK (monthly_limit IS NULL OR monthly_limit > 0)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_contracts_company_id ON contracts(company_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_end_date ON contracts(end_date);

-- Enable Row Level Security
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view contracts"
  ON contracts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create contracts"
  ON contracts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update contracts"
  ON contracts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete contracts"
  ON contracts FOR DELETE
  TO authenticated
  USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();