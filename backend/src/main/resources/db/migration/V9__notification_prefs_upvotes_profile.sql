-- ============================================================
-- CleanReport — V9 Migration
-- Notification preferences, report upvotes, extended profile fields
-- Date: 2026-07-29
-- ============================================================

-- Notification preferences
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS push_notifications BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS sms_notifications BOOLEAN NOT NULL DEFAULT true;

-- Extended profile fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS middle_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS address VARCHAR(300);

-- Report upvotes
CREATE TABLE IF NOT EXISTS report_upvotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_report_upvotes_report_user UNIQUE (report_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_report_upvotes_report_id ON report_upvotes(report_id);
CREATE INDEX IF NOT EXISTS idx_report_upvotes_user_id ON report_upvotes(user_id);
