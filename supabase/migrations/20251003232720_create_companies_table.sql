/*
  # Create Companies Table

  ## Overview
  This migration creates the companies table to store information about companies/organizations
  registered in the CRM system. Each company can have multiple employees (users) associated with it.

  ## New Tables
    - `companies`
      - `id` (uuid, primary key) - Unique identifier for the company
      - `name` (text) - Company name
      - `email` (text, unique) - Company contact email
      - `phone` (text, optional) - Company contact phone
      - `address` (text, optional) - Company physical address
      - `website` (text, optional) - Company website URL
      - `industry` (text, optional) - Industry sector
      - `employee_count` (integer, default 0) - Number of registered employees
      - `is_active` (boolean, default true) - Whether the company is active
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  ## Security
    - Enable RLS on `companies` table
    - Add policy for authenticated users to read all companies
    - Add policy for authenticated users to insert new companies
    - Add policy for authenticated users to update companies
    - Add policy for authenticated users to delete companies

  ## Important Notes
    1. All companies are accessible to authenticated users for now
    2. Employee count will be updated via application logic
    3. Future migrations may add role-based access control
*/

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  address text,
  website text,
  industry text,
  employee_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can view all companies"
  ON companies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert companies"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update companies"
  ON companies FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete companies"
  ON companies FOR DELETE
  TO authenticated
  USING (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_email ON companies(email);
CREATE INDEX IF NOT EXISTS idx_companies_is_active ON companies(is_active);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();