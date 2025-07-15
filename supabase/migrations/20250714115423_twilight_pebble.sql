/*
  # Create farmers table

  1. New Tables
    - `farmers`
      - `id` (uuid, primary key)
      - `first_name` (text)
      - `last_name` (text)
      - `middle_initial` (text, nullable)
      - `location_group` (text)
      - `barangay` (text)
      - `town` (text)
      - `contact_number` (text)
      - `land_area` (numeric, nullable)
      - `planted_date` (date, nullable)
      - `harvest_date` (date, nullable)
      - `created_at` (timestamp)
      - `user_id` (uuid, foreign key)

  2. Security
    - Enable RLS on `farmers` table
    - Add policies for authenticated users to manage farmers
*/

CREATE TABLE IF NOT EXISTS farmers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  middle_initial text,
  location_group text NOT NULL,
  barangay text NOT NULL,
  town text NOT NULL,
  contact_number text NOT NULL,
  land_area numeric,
  planted_date date,
  harvest_date date,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read all farmers
CREATE POLICY "Authenticated users can read farmers"
  ON farmers
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for authenticated users to insert farmers
CREATE POLICY "Authenticated users can insert farmers"
  ON farmers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for authenticated users to update farmers they created
CREATE POLICY "Users can update own farmers"
  ON farmers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for authenticated users to delete farmers they created
CREATE POLICY "Users can delete own farmers"
  ON farmers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for admin users to manage all farmers
CREATE POLICY "Admin users can manage all farmers"
  ON farmers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );