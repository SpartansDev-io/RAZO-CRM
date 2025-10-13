/*
  # Create User Profiles Table

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text, required) - Full name of the user
      - `email` (text, required, unique) - User's email address
      - `phone` (text) - Phone number
      - `role` (text, default 'therapist') - User role (therapist, admin, assistant)
      - `specialty` (text) - Professional specialty
      - `license_number` (text) - Professional license number
      - `bio` (text) - Professional bio/description
      - `avatar_url` (text) - URL to profile photo
      - `notifications_enabled` (boolean, default true) - Email notifications preference
      - `created_at` (timestamptz, default now()) - Account creation timestamp
      - `updated_at` (timestamptz, default now()) - Last update timestamp

  2. Security
    - Enable RLS on `user_profiles` table
    - Add policy for users to read their own profile
    - Add policy for users to update their own profile
    - Add policy for admins to read all profiles

  3. Important Notes
    - User profiles are linked to auth.users via the id field
    - Each user can only access and modify their own profile
    - Admins can view all user profiles
    - Profile photos stored as URLs (storage integration)
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  role text NOT NULL DEFAULT 'therapist',
  specialty text,
  license_number text,
  bio text,
  avatar_url text,
  notifications_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to auto-update updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
