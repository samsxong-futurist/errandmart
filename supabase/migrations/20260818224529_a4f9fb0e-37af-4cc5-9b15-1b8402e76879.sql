CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name text NOT NULL,
  price numeric(12,2) NOT NULL DEFAULT 0,
  image_url text,
  sku text UNIQUE,
  category text,
  is_active boolean NOT NULL DEFAULT true,
  is_sample boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are publicly readable"
  ON public.products FOR SELECT
  USING (is_active);

CREATE INDEX products_name_trgm_idx ON public.products USING gin (product_name gin_trgm_ops);
CREATE INDEX products_category_idx ON public.products (category);
CREATE INDEX products_active_idx ON public.products (is_active);

CREATE TABLE public.import_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text,
  source text NOT NULL DEFAULT 'csv',
  rows_total integer NOT NULL DEFAULT 0,
  rows_created integer NOT NULL DEFAULT 0,
  rows_updated integer NOT NULL DEFAULT 0,
  rows_skipped integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'success',
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.import_runs TO service_role;
ALTER TABLE public.import_runs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER products_set_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.products (product_name, price, sku, category, is_sample) VALUES
('Golden Penny Spaghetti 500g', 1200, 'GRO-001', 'Groceries', true),
('Dangote Rice 5kg', 9500, 'GRO-002', 'Groceries', true),
('Mama Gold Rice 10kg', 18500, 'GRO-003', 'Groceries', true),
('Indomie Chicken Flavour 70g', 900, 'GRO-004', 'Groceries', true),
('Indomie Onion Chicken 120g (Pack of 5)', 3200, 'GRO-005', 'Groceries', true),
('Honeywell Semolina 1kg', 2400, 'GRO-006', 'Groceries', true),
('Golden Penny Flour 1kg', 1750, 'GRO-007', 'Groceries', true),
('Devon King''s Vegetable Oil 3L', 9800, 'GRO-008', 'Groceries', true),
('Kings Groundnut Oil 1L', 3600, 'GRO-009', 'Groceries', true),
('Titus Sardine 125g', 1500, 'GRO-010', 'Groceries', true),
('Gino Tomato Paste 70g', 400, 'GRO-011', 'Groceries', true),
('Maggi Star Cubes (Roll of 10)', 550, 'GRO-012', 'Groceries', true),
('Dangote Sugar 1kg', 1900, 'GRO-013', 'Groceries', true),
('Mr Chef Seasoning 100g', 800, 'GRO-014', 'Groceries', true),
('Agege Bread (Family Loaf)', 1400, 'GRO-015', 'Groceries', true),
('Coca-Cola 50cl PET', 500, 'BEV-001', 'Beverages', true),
('Fanta Orange 50cl PET', 500, 'BEV-002', 'Beverages', true),
('Eva Table Water 75cl', 300, 'BEV-003', 'Beverages', true),
('Chivita 100% Orange Juice 1L', 2200, 'BEV-004', 'Beverages', true),
('Milo Refill Pack 500g', 5200, 'BEV-005', 'Beverages', true),
('Bournvita 500g Tin', 5600, 'BEV-006', 'Beverages', true),
('Nescafe Classic 100g', 4200, 'BEV-007', 'Beverages', true),
('Lipton Yellow Label Tea (50 bags)', 2600, 'BEV-008', 'Beverages', true),
('Gala Sausage Roll', 300, 'SNK-001', 'Snacks', true),
('Pringles Original 110g', 3500, 'SNK-002', 'Snacks', true),
('Digestive Biscuits 250g', 2100, 'SNK-003', 'Snacks', true),
('Cabin Biscuit (Pack)', 750, 'SNK-004', 'Snacks', true),
('Peanut Chikki Bar', 350, 'SNK-005', 'Snacks', true),
('Peak Milk Powder 400g Tin', 6200, 'DAI-001', 'Dairy', true),
('Peak Evaporated Milk 150g', 750, 'DAI-002', 'Dairy', true),
('Hollandia Yoghurt 1L', 2800, 'DAI-003', 'Dairy', true),
('Dano Cool Cow Milk 350g', 3400, 'DAI-004', 'Dairy', true),
('Laughing Cow Cheese 8 Portions', 3900, 'DAI-005', 'Dairy', true),
('Ariel Detergent 900g', 3800, 'HHC-001', 'Household Cleaning', true),
('Omo Washing Powder 1kg', 3500, 'HHC-002', 'Household Cleaning', true),
('Hypo Bleach 1L', 1300, 'HHC-003', 'Household Cleaning', true),
('Morning Fresh Dishwashing Liquid 750ml', 2400, 'HHC-004', 'Household Cleaning', true),
('Harpic Toilet Cleaner 500ml', 2700, 'HHC-005', 'Household Cleaning', true),
('Mortein Insecticide Spray 400ml', 4300, 'HHC-006', 'Household Cleaning', true),
('Nivea Body Lotion 400ml', 5400, 'PER-001', 'Personal Care', true),
('Dove Beauty Bar Soap 100g', 1800, 'PER-002', 'Personal Care', true),
('Rexona Roll-On Deodorant 50ml', 2900, 'PER-003', 'Personal Care', true),
('Always Ultra Sanitary Pads (8s)', 1600, 'PER-004', 'Personal Care', true),
('Close Up Toothpaste 140g', 1500, 'TOI-001', 'Toiletries', true),
('Oral-B Toothbrush (Medium)', 900, 'TOI-002', 'Toiletries', true),
('Rose Toilet Tissue (4 Rolls)', 1700, 'TOI-003', 'Toiletries', true),
('Premier Cool Soap 100g', 850, 'TOI-004', 'Toiletries', true),
('Cussons Baby Powder 200g', 2600, 'BAB-001', 'Baby Products', true),
('Molfix Diapers Medium (Pack of 50)', 12999, 'BAB-002', 'Baby Products', true),
('Nan Optipro 1 Infant Formula 400g', 14500, 'BAB-003', 'Baby Products', true),
('Cerelac Wheat & Milk 400g', 6800, 'BAB-004', 'Baby Products', true),
('Baby Wipes (72 Sheets)', 1900, 'BAB-005', 'Baby Products', true);