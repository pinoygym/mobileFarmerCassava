/*
  # Create admin user for login

  1. New Records
    - Insert admin user with username 'admin' and password '12345678'
    - Set role as 'admin'
  
  2. Security
    - User will be able to login with these credentials
    - Password is hashed using SHA-256 (simple hash for demo)
*/

-- First, delete any existing admin user to avoid conflicts
DELETE FROM users WHERE username = 'admin';

-- Insert the admin user with the correct password hash
INSERT INTO users (username, password_hash, role) VALUES (
  'admin',
  'ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f',
  'admin'
);