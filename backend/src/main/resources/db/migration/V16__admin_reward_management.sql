-- ============================================================
-- CleanReport V16 — Admin Reward Management
-- credit_rules, partner_stores tables
-- Date: 2026-08-12
-- ============================================================

CREATE TABLE IF NOT EXISTS credit_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description VARCHAR(300),
    credits INTEGER NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- REPORT_SUBMIT, REPORT_ACKNOWLEDGED, REPORT_RESOLVED, etc.
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS partner_stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    location VARCHAR(300),
    redemption_limit INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, SUSPENDED
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed default credit rules
INSERT INTO credit_rules (name, description, credits, event_type, is_active)
VALUES
    ('Report Submission', 'Credits awarded when a user submits a new report', 2, 'REPORT_SUBMIT', true),
    ('Report Acknowledged', 'Bonus credits when admin acknowledges a report', 5, 'REPORT_ACKNOWLEDGED', true),
    ('Report Resolved', 'Bonus credits when a report is resolved', 10, 'REPORT_RESOLVED', true)
ON CONFLICT DO NOTHING;

-- Seed demo partner stores
INSERT INTO partner_stores (name, category, location, redemption_limit, status)
VALUES
    ('Jumia Nigeria', 'E-Commerce', 'Lagos, Nigeria', 100, 'ACTIVE'),
    ('Konga', 'E-Commerce', 'Lagos, Nigeria', 50, 'ACTIVE'),
    ('Trees for the Future', 'Environmental NGO', 'Abuja, Nigeria', 500, 'ACTIVE')
ON CONFLICT DO NOTHING;

-- Add REJECTED to claim_status enum
ALTER TYPE claim_status ADD VALUE IF NOT EXISTS 'REJECTED';
