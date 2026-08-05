-- ============================================================
-- CleanReport — V15 Migration
-- Add category to rewards + seed demo rewards data
-- Date: 2026-08-05
-- ============================================================

ALTER TABLE rewards ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- Seed demo rewards (only if table is empty)
INSERT INTO rewards (id, name, description, credits_required, quantity_available, is_active, image_url, category, created_at)
SELECT * FROM (VALUES
  (gen_random_uuid(), 'Jumia Discount Code', 'Get 15% off your next Jumia order. Valid for 30 days after redemption.', 50, 100, true, 'https://res.cloudinary.com/fxwxretv/image/upload/v1/cleanreport/rewards/jumia.png', 'Discount Code', NOW()),
  (gen_random_uuid(), 'Konga Voucher ₦500', 'A ₦500 shopping voucher redeemable on Konga.com on any product.', 75, 50, true, 'https://res.cloudinary.com/fxwxretv/image/upload/v1/cleanreport/rewards/konga.png', 'Discount Code', NOW()),
  (gen_random_uuid(), 'Plant a Tree Donation', 'We plant a tree in your name in a Nigerian reforestation project.', 30, 500, true, 'https://res.cloudinary.com/fxwxretv/image/upload/v1/cleanreport/rewards/tree.png', 'Donation', NOW()),
  (gen_random_uuid(), 'School Supplies Donation', 'School supplies donated to a child in your community on your behalf.', 40, 200, true, 'https://res.cloudinary.com/fxwxretv/image/upload/v1/cleanreport/rewards/school.png', 'Donation', NOW()),
  (gen_random_uuid(), 'CleanReport Tote Bag', 'Branded eco-friendly tote bag shipped to your address.', 100, 30, true, 'https://res.cloudinary.com/fxwxretv/image/upload/v1/cleanreport/rewards/tote.png', 'Merchandise', NOW()),
  (gen_random_uuid(), 'CleanReport T-Shirt', 'Official CleanReport community t-shirt. Sizes: S, M, L, XL.', 150, 20, true, 'https://res.cloudinary.com/fxwxretv/image/upload/v1/cleanreport/rewards/tshirt.png', 'Merchandise', NOW()),
  (gen_random_uuid(), 'Community Hero Certificate', 'Digital certificate recognising you as a CleanReport Community Hero.', 20, 1000, true, 'https://res.cloudinary.com/fxwxretv/image/upload/v1/cleanreport/rewards/certificate.png', 'Recognition', NOW()),
  (gen_random_uuid(), 'Feature on Homepage', 'Your profile featured on the CleanReport homepage for one week.', 200, 4, true, 'https://res.cloudinary.com/fxwxretv/image/upload/v1/cleanreport/rewards/feature.png', 'Recognition', NOW())
) AS v(id, name, description, credits_required, quantity_available, is_active, image_url, category, created_at)
WHERE NOT EXISTS (SELECT 1 FROM rewards LIMIT 1);
