-- ============================================================
-- CleanReport V17 — Extended fields for admin reward management
-- partner_stores: phone, email, contact_person, address, description
-- rewards: partner_store_id FK
-- credit_rules: multiplier, daily_cap, monthly_cap
-- Date: 2026-08-19
-- ============================================================

ALTER TABLE partner_stores ADD COLUMN IF NOT EXISTS phone VARCHAR(100);
ALTER TABLE partner_stores ADD COLUMN IF NOT EXISTS email VARCHAR(200);
ALTER TABLE partner_stores ADD COLUMN IF NOT EXISTS contact_person VARCHAR(100);
ALTER TABLE partner_stores ADD COLUMN IF NOT EXISTS address VARCHAR(300);
ALTER TABLE partner_stores ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE rewards ADD COLUMN IF NOT EXISTS partner_store_id UUID REFERENCES partner_stores(id) ON DELETE SET NULL;

ALTER TABLE credit_rules ADD COLUMN IF NOT EXISTS multiplier DOUBLE PRECISION NOT NULL DEFAULT 1.0;
ALTER TABLE credit_rules ADD COLUMN IF NOT EXISTS daily_cap INTEGER;
ALTER TABLE credit_rules ADD COLUMN IF NOT EXISTS monthly_cap INTEGER;
