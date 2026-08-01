-- ============================================================
-- CleanReport — V14 Migration (NON-TRANSACTIONAL)
-- 1. Add REJECTED to report_status enum
-- 2. Anti-abuse: image hash dedup + report flags table
-- @formatter:off
-- ============================================================

-- REJECTED status (dead-end — no further transitions allowed)
ALTER TYPE report_status ADD VALUE IF NOT EXISTS 'REJECTED';

-- Store perceptual hash of report photos for duplicate image detection
ALTER TABLE reports ADD COLUMN IF NOT EXISTS photo_hash VARCHAR(64) NULL;
CREATE INDEX IF NOT EXISTS idx_reports_photo_hash ON reports(photo_hash) WHERE photo_hash IS NOT NULL;

-- Track daily report count per user (for rate limiting checks)
-- (computed at query time from reports table — no separate table needed)

-- Abuse flags: system-generated signals for admin review
CREATE TABLE IF NOT EXISTS report_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    flag_type VARCHAR(50) NOT NULL,
    -- DAILY_LIMIT_EXCEEDED, DUPLICATE_IMAGE, RAPID_SUBMISSION, LOCATION_SPOOFING, LOW_QUALITY
    details TEXT,
    auto_flagged BOOLEAN NOT NULL DEFAULT true,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_report_flags_report_id ON report_flags(report_id);
CREATE INDEX IF NOT EXISTS idx_report_flags_flag_type ON report_flags(flag_type);
CREATE INDEX IF NOT EXISTS idx_report_flags_reviewed_at ON report_flags(reviewed_at) WHERE reviewed_at IS NULL;
