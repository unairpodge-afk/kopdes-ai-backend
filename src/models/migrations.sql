-- SQL Migrations for Kopdes AI V2.0: Delphi Survey & Supabase Setup
-- Execute this SQL script in the Supabase SQL Editor.

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Delphi Surveys Table
CREATE TABLE IF NOT EXISTS delphi_surveys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  current_round INT NOT NULL DEFAULT 1,
  max_rounds INT NOT NULL DEFAULT 3,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Delphi Rounds Table
CREATE TABLE IF NOT EXISTS delphi_rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id UUID REFERENCES delphi_surveys(id) ON DELETE CASCADE,
  round_number INT NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL, -- Options Array: e.g. [{"id": "o1", "text": "Rp 70.000/Kg"}, ...]
  summary_from_previous_round TEXT DEFAULT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'open', -- 'open' or 'closed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(survey_id, round_number)
);

-- 3. Delphi Responses Table
CREATE TABLE IF NOT EXISTS delphi_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round_id UUID REFERENCES delphi_rounds(id) ON DELETE CASCADE,
  member_id VARCHAR(100) NOT NULL,
  member_name VARCHAR(255) NOT NULL,
  selected_option VARCHAR(100) NOT NULL, -- selected option id
  justification_text TEXT NOT NULL, -- Delphi qualitative argument
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(round_id, member_id)
);

-- 4. Delphi Experts / Panelists Table
CREATE TABLE IF NOT EXISTS delphi_experts (
  member_id VARCHAR(100) PRIMARY KEY,
  expertise_area VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on all tables (Supabase security requirement)
ALTER TABLE delphi_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE delphi_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE delphi_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE delphi_experts ENABLE ROW LEVEL SECURITY;

-- Create public read access policies
CREATE POLICY "Allow public read access on surveys" ON delphi_surveys FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access on rounds" ON delphi_rounds FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access on responses" ON delphi_responses FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access on experts" ON delphi_experts FOR SELECT TO public USING (true);

-- Create authenticated insert policies
CREATE POLICY "Allow authenticated insert responses" ON delphi_responses FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow admin write access on surveys" ON delphi_surveys FOR ALL TO public USING (true);
CREATE POLICY "Allow admin write access on rounds" ON delphi_rounds FOR ALL TO public USING (true);

-- Seed Initial Delphi Survey
INSERT INTO delphi_surveys (id, title, description, current_round, max_rounds, is_active)
VALUES (
  'a3f8b056-bd4e-4f1e-8db2-df6c41b8a531',
  'Prediksi Harga Kopi Arabika Gayo (Bulan Juli 2026)',
  'Konsensus ahli untuk memproyeksikan harga pasar komoditas kopi arabika berdasarkan curah hujan dan permintaan ekspor.',
  1,
  3,
  TRUE
) ON CONFLICT DO NOTHING;

-- Seed Initial Round 1 for the survey
INSERT INTO delphi_rounds (id, survey_id, round_number, question_text, options, status)
VALUES (
  'b284e365-d01e-4cb2-83fc-dbf47e24a7ef',
  'a3f8b056-bd4e-4f1e-8db2-df6c41b8a531',
  1,
  'Berapa proyeksi harga jual Kopi Arabika Gayo per Kg pada bulan Juli 2026?',
  '[
    {"id": "o1", "text": "Rp 68.000 / Kg"},
    {"id": "o2", "text": "Rp 70.000 / Kg (Stabil)"},
    {"id": "o3", "text": "Rp 72.000 / Kg (Meningkat)"},
    {"id": "o4", "text": "Rp 75.000 / Kg (Lonjakan Ekspor)"}
  ]'::jsonb,
  'open'
) ON CONFLICT DO NOTHING;

-- Seed Initial Expert List
INSERT INTO delphi_experts (member_id, expertise_area, status)
VALUES 
  ('1205 2024 0001', 'Pertanian Kopi', 'active'),
  ('1205 2024 0002', 'Perdagangan Komoditas', 'active'),
  ('1205 2024 0003', 'Ekonomi Pedesaan', 'active')
ON CONFLICT DO NOTHING;


-- 5. Members Table (User Login & Profiles)
CREATE TABLE IF NOT EXISTS members (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL DEFAULT 'password123',
  phone VARCHAR(50),
  status VARCHAR(50) DEFAULT 'Anggota Aktif',
  joined_date DATE DEFAULT CURRENT_DATE,
  avatar_url VARCHAR(500),
  qr_code VARCHAR(255),
  balance NUMERIC DEFAULT 10000000, -- Rp 10.000.000 initial e-wallet balance
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Products Table (Marketplace Catalog)
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price NUMERIC NOT NULL,
  unit VARCHAR(50) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  image VARCHAR(500),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Cart Items Table (Shopping Carts)
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id VARCHAR(100) REFERENCES members(id) ON DELETE CASCADE,
  product_id VARCHAR(100) REFERENCES products(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(member_id, product_id)
);

-- 8. Orders Table (Checkout Invoices)
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(100) PRIMARY KEY,
  member_id VARCHAR(100) REFERENCES members(id) ON DELETE CASCADE,
  total_amount NUMERIC NOT NULL,
  payment_method VARCHAR(100) DEFAULT 'KOPDES_PAY',
  status VARCHAR(50) DEFAULT 'Paid',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Order Items Table (Checkout Details)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id VARCHAR(100) REFERENCES orders(id) ON DELETE CASCADE,
  product_id VARCHAR(100) REFERENCES products(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  price NUMERIC NOT NULL,
  quantity INT NOT NULL,
  total NUMERIC NOT NULL
);

-- 10. Investment Projects Table (Cooperative Ventures)
CREATE TABLE IF NOT EXISTS investment_projects (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  target_amount NUMERIC NOT NULL,
  raised_amount NUMERIC DEFAULT 0,
  duration_months INT NOT NULL,
  estimated_roi NUMERIC NOT NULL, -- Annualized percentage ROI
  image VARCHAR(500),
  status VARCHAR(50) DEFAULT 'funding', -- 'funding', 'closed', 'completed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Investments Table (Investor Contributions)
CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id VARCHAR(100) REFERENCES investment_projects(id) ON DELETE CASCADE,
  member_id VARCHAR(100) REFERENCES members(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'matured'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

-- Permissive public policies for Hackathon Demo purposes
CREATE POLICY "Allow public all access on members" ON members FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on products" ON products FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on cart_items" ON cart_items FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on orders" ON orders FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on order_items" ON order_items FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on investment_projects" ON investment_projects FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on investments" ON investments FOR ALL TO public USING (true) WITH CHECK (true);

-- Seed Members
INSERT INTO members (id, name, email, password, phone, status, joined_date, avatar_url, qr_code, balance)
VALUES 
  (
    '1205 2024 0001', 
    'Budi Santoso', 
    'budi.santoso@kopdes.id', 
    'password123', 
    '081234567890', 
    'Anggota Aktif', 
    '2024-05-12', 
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200', 
    'KOPDES-BUDI-120520240001', 
    10000000
  ),
  (
    '1205 2026 0002', 
    'Dewi Lestari', 
    'dewi.lestari@kopdes.id', 
    'password123', 
    '081298765432', 
    'Anggota Aktif', 
    '2026-01-15', 
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200', 
    'KOPDES-DEWI-120520260002', 
    15000000
  )
ON CONFLICT (id) DO NOTHING;

-- Seed Products
INSERT INTO products (id, name, category, price, unit, stock, image, description)
VALUES
  (
    'p1', 
    'Beras Premium Cianjur', 
    'Sembako', 
    14500, 
    'Kg', 
    120, 
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=300', 
    'Beras pandan wangi kualitas premium langsung dari petani Cianjur.'
  ),
  (
    'p2', 
    'Kopi Arabika Gayo', 
    'Minuman', 
    70000, 
    'Kg', 
    80, 
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=300', 
    'Biji kopi arabika pilihan dengan aroma dan cita rasa khas tanah Gayo.'
  ),
  (
    'p3', 
    'Madu Hutan Liar', 
    'Kesehatan', 
    85000, 
    'Botol', 
    60, 
    'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=300', 
    'Madu murni alami yang dipanen langsung dari hutan belantara.'
  ),
  (
    'p4', 
    'Kakao Bubuk Organik', 
    'Bahan Kue', 
    28500, 
    'Kg', 
    150, 
    'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?auto=format&fit=crop&q=80&w=300', 
    'Bubuk cokelat organik hasil olahan perkebunan kakao desa.'
  )
ON CONFLICT (id) DO NOTHING;

-- Seed Investment Projects
INSERT INTO investment_projects (id, title, description, target_amount, raised_amount, duration_months, estimated_roi, image, status)
VALUES
  (
    'inv-1', 
    'Ekspansi Perkebunan Kopi Arabika Gayo', 
    'Pendanaan perluasan lahan perkebunan kopi arabika di tanah Gayo, mencakup pembelian pupuk organik, pembibitan varietas unggul, dan sertifikasi fair-trade ekspor.', 
    150000000, 
    95000000, 
    12, 
    15.5, 
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=400', 
    'funding'
  ),
  (
    'inv-2', 
    'Pengadaan Mesin Giling Padi Modern Cianjur', 
    'Penyediaan mesin rice milling modern di sentra beras Cianjur untuk meningkatkan rendemen hasil panen beras petani lokal dari 55% menjadi 65%.', 
    200000000, 
    180000000, 
    8, 
    12.0, 
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400', 
    'funding'
  ),
  (
    'inv-3', 
    'Budidaya Madu Hutan Lestari', 
    'Kemitraan penangkaran lebah hutan liar terkelola bersama kelompok tani hutan pedesaan untuk memproduksi madu murni berkualitas tinggi secara berkelanjutan.', 
    80000000, 
    25000000, 
    6, 
    18.0, 
    'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400', 
    'funding'
  )
ON CONFLICT (id) DO NOTHING;

