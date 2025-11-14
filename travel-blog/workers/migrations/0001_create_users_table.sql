-- Migration: Create users table
-- Created: 2025-11-14
-- Description: Initial user authentication schema with support for future blog posts and media

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('reader', 'contributor')),
  display_name TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Index for fast username lookups (used in every login)
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Index for role-based queries (future: list all contributors)
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
