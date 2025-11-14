-- Migration: Seed test users
-- Created: 2025-11-14
-- Description: Insert test users for development and testing

-- Test user with reader role
-- Username: testuser
-- Password: testpassword123
-- Hash generated with bcrypt cost factor 10
INSERT INTO users (username, password_hash, role, display_name)
VALUES (
  'testuser',
  '$2b$10$3uY2msEgvhygThAlzDzMBetHrD7GSffYj.W8WZ3I9VVlTmepwdPoi',
  'reader',
  'Test User'
);

-- Test contributor with contributor role
-- Username: testcontributor
-- Password: testpassword123
-- Hash generated with bcrypt cost factor 10
INSERT INTO users (username, password_hash, role, display_name)
VALUES (
  'testcontributor',
  '$2b$10$EMFQbA1QWJdpC4NBDVgtUuE2VW53uv/zYP1PD3Pz/X0ucPxYFzJBS',
  'contributor',
  'Test Contributor'
);
