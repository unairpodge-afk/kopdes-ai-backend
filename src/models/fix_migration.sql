-- ============================================================
-- Kopdes AI - Fix Migration (Schema Patch)
-- Jalankan SQL ini di SQL Editor Supabase Anda
-- ============================================================

-- 1. Fix delphi_surveys: Add is_active column (controller uses is_active, not status)
ALTER TABLE public.delphi_surveys ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 2. Fix delphi_rounds: Add options (JSONB) and summary columns
ALTER TABLE public.delphi_rounds ADD COLUMN IF NOT EXISTS options JSONB;
ALTER TABLE public.delphi_rounds ADD COLUMN IF NOT EXISTS summary_from_previous_round TEXT;

-- 3. Fix members: Add created_at column
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. Fix orders: Add id column and member_id column
-- The original schema used order_id as PK, but controller inserts 'id'
-- We need to restructure: drop order_id constraint, add id as primary key
-- First drop the dependent order_items FK
ALTER TABLE public.order_items DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;

-- Drop old PK and add new columns
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_pkey;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS member_id TEXT;

-- Set id = order_id for existing rows (if any)
UPDATE public.orders SET id = order_id WHERE id IS NULL AND order_id IS NOT NULL;

-- Make id the new primary key
ALTER TABLE public.orders ADD PRIMARY KEY (id);

-- Re-add foreign key on order_items (pointing to new id column)
ALTER TABLE public.order_items ADD CONSTRAINT order_items_order_id_fkey 
  FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

-- 5. Create cart_items table
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id TEXT NOT NULL,
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(member_id, product_id)
);

-- 6. Create supply_chain_shipments table
CREATE TABLE IF NOT EXISTS public.supply_chain_shipments (
    id TEXT PRIMARY KEY,
    product_name TEXT NOT NULL,
    quantity TEXT NOT NULL,
    destination TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Gudang',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed supply chain data
INSERT INTO public.supply_chain_shipments (id, product_name, quantity, destination, status, updated_at)
VALUES 
  ('TRK-2026-001', 'Kopi Arabika Gayo', '200 Kg', 'Distributor Regional Medan', 'Pengiriman', '2026-06-22T08:00:00Z'),
  ('TRK-2026-002', 'Beras Premium Cianjur', '500 Kg', 'Gudang Penyaluran Desa', 'Gudang', '2026-06-22T10:30:00Z'),
  ('TRK-2026-003', 'Madu Hutan Liar', '120 Botol', 'Toko Koperasi Pusat', 'Selesai', '2026-06-21T16:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- 7. Enable RLS (Row Level Security) but allow all for service role
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_chain_shipments ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for service role
DROP POLICY IF EXISTS "Allow all for service role" ON public.cart_items;
CREATE POLICY "Allow all for service role" ON public.cart_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for service role" ON public.supply_chain_shipments;
CREATE POLICY "Allow all for service role" ON public.supply_chain_shipments FOR ALL USING (true) WITH CHECK (true);

-- 8. Also seed the initial member data if table is empty
INSERT INTO public.members (id, name, email, password, phone, status, joined_date, avatar_url, qr_code, balance)
SELECT '1205 2024 0001', 'Budi Santoso', 'budi.santoso@kopdes.id', 'password123', '081234567890', 'Anggota Aktif', '2024-05-12', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200', 'KOPDES-BUDI-120520240001', 10000000
WHERE NOT EXISTS (SELECT 1 FROM public.members WHERE id = '1205 2024 0001');

INSERT INTO public.members (id, name, email, password, phone, status, joined_date, avatar_url, qr_code, balance)
SELECT '1205 2026 0002', 'Dewi Lestari', 'dewi.lestari@kopdes.id', 'password123', '081298765432', 'Anggota Aktif', '2026-01-15', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200', 'KOPDES-DEWI-120520260002', 15000000
WHERE NOT EXISTS (SELECT 1 FROM public.members WHERE id = '1205 2026 0002');

-- Admin user for testing
INSERT INTO public.members (id, name, email, password, phone, status, joined_date, avatar_url, qr_code, balance)
SELECT 'ADM-KOPDES-001', 'Admin Kopdes', 'admin@kopdes.id', 'admin123', '081200000001', 'Admin Koperasi', '2024-01-01', 'https://ui-avatars.com/api/?name=Admin+Kopdes&background=065f46&color=fff&size=200', 'KOPDES-ADMIN-001', 50000000
WHERE NOT EXISTS (SELECT 1 FROM public.members WHERE id = 'ADM-KOPDES-001');

-- Investor user for testing  
INSERT INTO public.members (id, name, email, password, phone, status, joined_date, avatar_url, qr_code, balance)
SELECT 'INV-2026-001', 'Investor Demo', 'investor@kopdes.id', 'investor123', '081200000002', 'Mitra Investor', '2026-01-01', 'https://ui-avatars.com/api/?name=Investor+Demo&background=065f46&color=fff&size=200', 'KOPDES-INV-001', 100000000
WHERE NOT EXISTS (SELECT 1 FROM public.members WHERE id = 'INV-2026-001');

-- 9. Seed products if empty
INSERT INTO public.products (id, name, category, price, unit, stock, image, description)
SELECT 'p1', 'Beras Premium Cianjur', 'Sembako', 14500, 'Kg', 120, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=300', 'Beras pandan wangi kualitas premium langsung dari petani Cianjur.'
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE id = 'p1');

INSERT INTO public.products (id, name, category, price, unit, stock, image, description)
SELECT 'p2', 'Kopi Arabika Gayo', 'Minuman', 70000, 'Kg', 80, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=300', 'Biji kopi arabika pilihan dengan aroma dan cita rasa khas tanah Gayo.'
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE id = 'p2');

INSERT INTO public.products (id, name, category, price, unit, stock, image, description)
SELECT 'p3', 'Madu Hutan Liar', 'Kesehatan', 85000, 'Botol', 60, 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=300', 'Madu murni alami yang dipanen langsung dari hutan belantara.'
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE id = 'p3');

INSERT INTO public.products (id, name, category, price, unit, stock, image, description)
SELECT 'p4', 'Kakao Bubuk Organik', 'Bahan Kue', 28500, 'Kg', 150, 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?auto=format&fit=crop&q=80&w=300', 'Bubuk cokelat organik hasil olahan perkebunan kakao desa.'
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE id = 'p4');

-- 10. Seed finance summary if empty
INSERT INTO public.finance_summary (total_assets, total_savings, total_loans, total_sales, shu_this_year, savings_pokok, savings_wajib, savings_sukarela)
SELECT 5200000000, 5000000000, 2780000000, 12080000000, 1100000000, 1000000000, 2500000000, 1500000000
WHERE NOT EXISTS (SELECT 1 FROM public.finance_summary);

-- 11. Seed announcements if empty
INSERT INTO public.announcements (id, title, content, date, author)
SELECT 'a1', 'Rapat Anggota Tahunan (RAT) Buku 2025', 'Dihimbau kepada seluruh anggota Koperasi Kopdes AI untuk menghadiri RAT yang akan dilaksanakan pada tanggal 10 Juli 2026.', '2026-06-20', 'Pengurus Koperasi'
WHERE NOT EXISTS (SELECT 1 FROM public.announcements WHERE id = 'a1');

INSERT INTO public.announcements (id, title, content, date, author)
SELECT 'a2', 'Pembagian Sisa Hasil Usaha (SHU) V1.0', 'Pemberitahuan pencairan dana SHU tahun buku 2025 dapat diambil melalui aplikasi Kopdes Pay mulai tanggal 25 Juni 2026.', '2026-06-18', 'Bendahara Koperasi'
WHERE NOT EXISTS (SELECT 1 FROM public.announcements WHERE id = 'a2');

-- 12. Seed votings if empty
INSERT INTO public.votings (id, title, description, start_date, end_date)
SELECT 'v1', 'Persetujuan Rencana Anggaran Belanja (RAB) 2026', 'Pemilihan suara elektronik persetujuan anggaran pengembangan program Koperasi Desa Digital 2026.', '2026-06-10', '2026-06-30'
WHERE NOT EXISTS (SELECT 1 FROM public.votings WHERE id = 'v1');

INSERT INTO public.voting_options (id, voting_id, text, votes)
SELECT 'opt1', 'v1', 'Setuju', 840
WHERE NOT EXISTS (SELECT 1 FROM public.voting_options WHERE id = 'opt1');

INSERT INTO public.voting_options (id, voting_id, text, votes)
SELECT 'opt2', 'v1', 'Tidak Setuju', 120
WHERE NOT EXISTS (SELECT 1 FROM public.voting_options WHERE id = 'opt2');

INSERT INTO public.voting_options (id, voting_id, text, votes)
SELECT 'opt3', 'v1', 'Golput', 10
WHERE NOT EXISTS (SELECT 1 FROM public.voting_options WHERE id = 'opt3');

-- 13. Seed delphi_experts if empty
INSERT INTO public.delphi_experts (member_id, expertise_area, status)
SELECT '1205 2024 0001', 'Pertanian Kopi', 'active'
WHERE NOT EXISTS (SELECT 1 FROM public.delphi_experts WHERE member_id = '1205 2024 0001');

INSERT INTO public.delphi_experts (member_id, expertise_area, status)
SELECT '1205 2026 0002', 'Perdagangan Komoditas', 'active'
WHERE NOT EXISTS (SELECT 1 FROM public.delphi_experts WHERE member_id = '1205 2026 0002');

INSERT INTO public.delphi_experts (member_id, expertise_area, status)
SELECT 'ADM-KOPDES-001', 'Kebijakan Koperasi', 'active'
WHERE NOT EXISTS (SELECT 1 FROM public.delphi_experts WHERE member_id = 'ADM-KOPDES-001');

-- 14. Seed investment projects if empty
INSERT INTO public.investment_projects (id, title, description, target_amount, raised_amount, duration_months, estimated_roi, image, status)
SELECT 'inv-1', 'Ekspansi Perkebunan Kopi Arabika Gayo', 'Pendanaan perluasan lahan perkebunan kopi arabika di tanah Gayo.', 150000000, 95000000, 12, 15.5, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=400', 'funding'
WHERE NOT EXISTS (SELECT 1 FROM public.investment_projects WHERE id = 'inv-1');

INSERT INTO public.investment_projects (id, title, description, target_amount, raised_amount, duration_months, estimated_roi, image, status)
SELECT 'inv-2', 'Pengadaan Mesin Giling Padi Modern Cianjur', 'Penyediaan mesin rice milling modern di sentra beras Cianjur.', 200000000, 180000000, 8, 12.0, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400', 'funding'
WHERE NOT EXISTS (SELECT 1 FROM public.investment_projects WHERE id = 'inv-2');

-- 15. Seed blockchain genesis if empty
INSERT INTO public.blockchain (index, timestamp, data, previous_hash, hash)
SELECT 0, NOW(), '{"type": "GENESIS", "message": "Genesis Block - Kopdes AI Blockchain Ledger Initialized"}'::jsonb, '0000000000000000000000000000000000000000000000000000000000000000', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
WHERE NOT EXISTS (SELECT 1 FROM public.blockchain WHERE index = 0);
