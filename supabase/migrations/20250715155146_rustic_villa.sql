/*
  # Create Admin User

  1. New Users
    - Creates an admin user with username 'admin' and password '12345678'
    - Uses proper password hashing for security
    - Sets role to 'admin'

  2. Security
    - Ensures admin user exists for login
    - Uses consistent password hashing
*/

-- First, let's make sure we have the admin user
INSERT INTO users (username, password_hash, role)
VALUES (
  'admin',
  'ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f',
  'admin'
)
ON CONFLICT (username) 
DO UPDATE SET 
  password_hash = 'ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f',
  role = 'admin';