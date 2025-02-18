/*
  # Create guests table and security policies

  1. New Tables
    - `guests`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text)
      - `guests` (integer)
      - `confirmation_date` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `guests` table
    - Add policies for:
      - Public can insert new guests
      - Only authenticated users (admins) can view and delete guests
*/

CREATE TABLE IF NOT EXISTS guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  guests integer NOT NULL DEFAULT 1,
  confirmation_date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert new guests
CREATE POLICY "Anyone can insert guests"
  ON guests
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Only authenticated users (admins) can view guests
CREATE POLICY "Only authenticated users can view guests"
  ON guests
  FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated users (admins) can delete guests
CREATE POLICY "Only authenticated users can delete guests"
  ON guests
  FOR DELETE
  TO authenticated
  USING (true);