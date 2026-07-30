-- ============================================================
-- CleanReport — V11 Migration
-- Fix VARCHAR length limits on URL columns
-- Cloudinary URLs exceed VARCHAR(500) — convert to TEXT
-- Date: 2026-07-30
-- ============================================================

ALTER TABLE users ALTER COLUMN avatar_url TYPE TEXT;
ALTER TABLE users ALTER COLUMN address TYPE TEXT;
ALTER TABLE reports ALTER COLUMN photo_url TYPE TEXT;
