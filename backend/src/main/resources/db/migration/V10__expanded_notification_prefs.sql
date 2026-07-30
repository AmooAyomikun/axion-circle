-- ============================================================
-- CleanReport — V10 Migration
-- Expanded notification preferences per category
-- Date: 2026-07-30
-- ============================================================

-- Comments notifications
ALTER TABLE users ADD COLUMN IF NOT EXISTS notif_comments_push  BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notif_comments_email BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notif_comments_sms   BOOLEAN NOT NULL DEFAULT false;

-- Tags/@mention notifications
ALTER TABLE users ADD COLUMN IF NOT EXISTS notif_tags_push  BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notif_tags_email BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notif_tags_sms   BOOLEAN NOT NULL DEFAULT false;

-- Reminders notifications
ALTER TABLE users ADD COLUMN IF NOT EXISTS notif_reminders_push  BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notif_reminders_email BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notif_reminders_sms   BOOLEAN NOT NULL DEFAULT false;

-- More activity notifications (likes, etc.)
ALTER TABLE users ADD COLUMN IF NOT EXISTS notif_more_activity_push  BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notif_more_activity_email BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notif_more_activity_sms   BOOLEAN NOT NULL DEFAULT false;
