-- ============================================================
-- CleanReport — V12 Migration
-- Add suspended flag to users for admin user management
-- Date: 2026-08-01
-- ============================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended BOOLEAN NOT NULL DEFAULT false;
