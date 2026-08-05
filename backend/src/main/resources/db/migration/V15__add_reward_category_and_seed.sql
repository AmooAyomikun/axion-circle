-- ============================================================
-- CleanReport — V15 Migration
-- Add category to rewards + seed demo rewards data
-- Date: 2026-08-05
-- ============================================================

ALTER TABLE rewards ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- Seed demo rewards (only if table is empty)
INSERT INTO rewards (id, name, description, credits_required, quantity_available, is_active, image_url, category, created_at)
SELECT * FROM (VALUES
  (gen_random_uuid(), 'Jumia Discount Code',        'Get 15% off your next Jumia order. Valid for 30 days after redemption.',              50,  100,  true, 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=80', 'Discount Code', NOW()),
  (gen_random_uuid(), 'Konga Voucher ₦500',         'A ₦500 shopping voucher redeemable on Konga.com on any product.',                    75,   50,  true, 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80', 'Discount Code', NOW()),
  (gen_random_uuid(), 'Plant a Tree Donation',      'We plant a tree in your name in a Nigerian reforestation project.',                   30,  500,  true, 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&q=80', 'Donation',      NOW()),
  (gen_random_uuid(), 'School Supplies Donation',   'School supplies donated to a child in your community on your behalf.',               40,  200,  true, 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80', 'Donation',      NOW()),
  (gen_random_uuid(), 'CleanReport Tote Bag',       'Branded eco-friendly tote bag shipped to your address.',                            100,   30,  true, 'https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=400&q=80', 'Merchandise',   NOW()),
  (gen_random_uuid(), 'CleanReport T-Shirt',        'Official CleanReport community t-shirt. Sizes: S, M, L, XL.',                      150,   20,  true, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80', 'Merchandise',   NOW()),
  (gen_random_uuid(), 'Community Hero Certificate', 'Digital certificate recognising you as a CleanReport Community Hero.',               20, 1000,  true, 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400&q=80', 'Recognition',   NOW()),
  (gen_random_uuid(), 'Feature on Homepage',        'Your profile featured on the CleanReport homepage for one week.',                  200,    4,  true, 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80', 'Recognition',   NOW())
) AS v(id, name, description, credits_required, quantity_available, is_active, image_url, category, created_at)
WHERE NOT EXISTS (SELECT 1 FROM rewards LIMIT 1);
