-- Kopdes AI Database Schema & Initial Data for Supabase

-- 1. Members
CREATE TABLE public.members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT,
    status TEXT NOT NULL,
    joined_date DATE NOT NULL,
    avatar_url TEXT,
    qr_code TEXT,
    balance NUMERIC DEFAULT 0
);

-- 2. Products
CREATE TABLE public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC NOT NULL,
    unit TEXT NOT NULL,
    stock INTEGER DEFAULT 0,
    image TEXT,
    description TEXT
);

-- 3. Orders
CREATE TABLE public.orders (
    order_id TEXT PRIMARY KEY,
    total_amount NUMERIC NOT NULL,
    payment_method TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT REFERENCES public.orders(order_id) ON DELETE CASCADE,
    product_id TEXT REFERENCES public.products(id),
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    quantity INTEGER NOT NULL,
    total NUMERIC NOT NULL
);

-- 4. Finance Summary (Single row config table)
CREATE TABLE public.finance_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_assets NUMERIC NOT NULL,
    total_savings NUMERIC NOT NULL,
    total_loans NUMERIC NOT NULL,
    total_sales NUMERIC NOT NULL,
    shu_this_year NUMERIC NOT NULL,
    savings_pokok NUMERIC NOT NULL,
    savings_wajib NUMERIC NOT NULL,
    savings_sukarela NUMERIC NOT NULL
);

-- 5. Announcements
CREATE TABLE public.announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    date DATE NOT NULL,
    author TEXT NOT NULL
);

-- 6. Votings
CREATE TABLE public.votings (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL
);

CREATE TABLE public.voting_options (
    id TEXT PRIMARY KEY,
    voting_id TEXT REFERENCES public.votings(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    votes INTEGER DEFAULT 0
);

CREATE TABLE public.voting_members (
    voting_id TEXT REFERENCES public.votings(id) ON DELETE CASCADE,
    member_id TEXT REFERENCES public.members(id) ON DELETE CASCADE,
    PRIMARY KEY (voting_id, member_id)
);

-- 7. Delphi
CREATE TABLE public.delphi_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    max_rounds INTEGER NOT NULL,
    current_round INTEGER DEFAULT 1,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.delphi_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID REFERENCES public.delphi_surveys(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.delphi_round_options (
    id TEXT NOT NULL,
    round_id UUID REFERENCES public.delphi_rounds(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    PRIMARY KEY (id, round_id)
);

CREATE TABLE public.delphi_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID REFERENCES public.delphi_surveys(id) ON DELETE CASCADE,
    round_id UUID REFERENCES public.delphi_rounds(id) ON DELETE CASCADE,
    member_id TEXT REFERENCES public.members(id),
    member_name TEXT NOT NULL,
    selected_option TEXT NOT NULL,
    justification_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.delphi_experts (
    member_id TEXT PRIMARY KEY,
    expertise_area TEXT NOT NULL,
    status TEXT NOT NULL
);

-- 8. Investment Projects
CREATE TABLE public.investment_projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    target_amount NUMERIC NOT NULL,
    raised_amount NUMERIC DEFAULT 0,
    duration_months INTEGER NOT NULL,
    estimated_roi NUMERIC NOT NULL,
    image TEXT,
    status TEXT NOT NULL
);

CREATE TABLE public.investments (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES public.investment_projects(id) ON DELETE CASCADE,
    member_id TEXT REFERENCES public.members(id),
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Blockchain (Event Log)
CREATE TABLE public.blockchain (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    index INTEGER NOT NULL UNIQUE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    data JSONB NOT NULL,
    previous_hash TEXT NOT NULL,
    hash TEXT NOT NULL UNIQUE
);

-- ==========================================
-- SEED DATA
-- ==========================================

INSERT INTO public.members (id, name, email, password, phone, status, joined_date, avatar_url, qr_code, balance)
VALUES 
('1205 2024 0001', 'Budi Santoso', 'budi.santoso@kopdes.id', 'password123', '081234567890', 'Anggota Aktif', '2024-05-12', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200', 'KOPDES-BUDI-120520240001', 10000000),
('1205 2026 0002', 'Dewi Lestari', 'dewi.lestari@kopdes.id', 'password123', '081298765432', 'Anggota Aktif', '2026-01-15', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200', 'KOPDES-DEWI-120520260002', 15000000);

INSERT INTO public.products (id, name, category, price, unit, stock, image, description)
VALUES 
('p1', 'Beras Premium Cianjur', 'Sembako', 14500, 'Kg', 120, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=300', 'Beras pandan wangi kualitas premium langsung dari petani Cianjur.'),
('p2', 'Kopi Arabika Gayo', 'Minuman', 70000, 'Kg', 80, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=300', 'Biji kopi arabika pilihan dengan aroma dan cita rasa khas tanah Gayo.'),
('p3', 'Madu Hutan Liar', 'Kesehatan', 85000, 'Botol', 60, 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=300', 'Madu murni alami yang dipanen langsung dari hutan belantara.'),
('p4', 'Kakao Bubuk Organik', 'Bahan Kue', 28500, 'Kg', 150, 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?auto=format&fit=crop&q=80&w=300', 'Bubuk cokelat organik hasil olahan perkebunan kakao desa.');

INSERT INTO public.finance_summary (total_assets, total_savings, total_loans, total_sales, shu_this_year, savings_pokok, savings_wajib, savings_sukarela)
VALUES (5200000000, 5000000000, 2780000000, 12080000000, 1100000000, 1000000000, 2500000000, 1500000000);

INSERT INTO public.announcements (id, title, content, date, author)
VALUES 
('a1', 'Rapat Anggota Tahunan (RAT) Buku 2025', 'Dihimbau kepada seluruh anggota Koperasi Kopdes AI untuk menghadiri RAT yang akan dilaksanakan pada tanggal 10 Juli 2026.', '2026-06-20', 'Pengurus Koperasi'),
('a2', 'Pembagian Sisa Hasil Usaha (SHU) V1.0', 'Pemberitahuan pencairan dana SHU tahun buku 2025 dapat diambil melalui aplikasi Kopdes Pay mulai tanggal 25 Juni 2026.', '2026-06-18', 'Bendahara Koperasi');

INSERT INTO public.votings (id, title, description, start_date, end_date)
VALUES ('v1', 'Persetujuan Rencana Anggaran Belanja (RAB) 2026', 'Pemilihan suara elektronik persetujuan anggaran pengembangan program Koperasi Desa Digital 2026.', '2026-06-10', '2026-06-30');

INSERT INTO public.voting_options (id, voting_id, text, votes)
VALUES 
('opt1', 'v1', 'Setuju', 840),
('opt2', 'v1', 'Tidak Setuju', 120),
('opt3', 'v1', 'Golput', 10);

INSERT INTO public.voting_members (voting_id, member_id)
VALUES ('v1', '1205 2024 0001');

INSERT INTO public.delphi_experts (member_id, expertise_area, status)
VALUES 
('1205 2024 0001', 'Pertanian Kopi', 'active'),
('1205 2026 0002', 'Perdagangan Komoditas', 'active'),
('ADM-KOPDES-001', 'Kebijakan Koperasi', 'active');

INSERT INTO public.investment_projects (id, title, description, target_amount, raised_amount, duration_months, estimated_roi, image, status)
VALUES 
('inv-1', 'Ekspansi Perkebunan Kopi Arabika Gayo', 'Pendanaan perluasan lahan perkebunan kopi arabika di tanah Gayo.', 150000000, 95000000, 12, 15.5, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=400', 'funding'),
('inv-2', 'Pengadaan Mesin Giling Padi Modern Cianjur', 'Penyediaan mesin rice milling modern di sentra beras Cianjur.', 200000000, 180000000, 8, 12.0, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400', 'funding');

INSERT INTO public.investments (id, project_id, member_id, amount, status, created_at)
VALUES ('invest-1', 'inv-1', '1205 2024 0001', 15000000, 'active', '2026-06-22T09:00:00Z');

-- Note: Because Supabase doesn't easily compute SHA256 hashes inside INSERT statements natively without plpgsql functions,
-- the Blockchain Genesis block is usually inserted through the backend upon first initialization, 
-- or we can just provide a dummy genesis block here.
INSERT INTO public.blockchain (index, timestamp, data, previous_hash, hash)
VALUES (0, NOW(), '{"type": "GENESIS", "message": "Genesis Block - Kopdes AI Blockchain Ledger Initialized"}', '0000000000000000000000000000000000000000000000000000000000000000', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');

CREATE TABLE public.delphi_anp_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id TEXT NOT NULL,
    member_name TEXT NOT NULL,
    institution TEXT,
    comparisons JSONB NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
