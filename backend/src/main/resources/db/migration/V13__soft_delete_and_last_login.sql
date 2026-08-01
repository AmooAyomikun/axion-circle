-- ============================================================
-- CleanReport — V13 Migration
-- Soft delete + last login tracking for admin user management
-- Date: 2026-08-01
-- ============================================================

-- Soft delete flag
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

-- Track last login for inactive user detection
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ NULL;

-- Index for inactive user queries
CREATE INDEX IF NOT EXISTS idx_users_last_login_at ON users(last_login_at);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);
