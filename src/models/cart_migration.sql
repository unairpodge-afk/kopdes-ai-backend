/**
 * Migration: Add cart_items table and marketplace columns for permanent cart storage
 * Run this SQL in Supabase Dashboard > SQL Editor to enable persistent shopping cart
 */

-- ============================================
-- STEP 1: Add marketplace columns to products
-- ============================================
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS kop_id TEXT DEFAULT 'kop-001';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_flash_sale BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS original_price NUMERIC;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS discount INTEGER DEFAULT 0;

-- ============================================
-- STEP 2: Create cart_items table
-- ============================================
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (member_id, product_id)
);

-- Add foreign key constraints
ALTER TABLE public.cart_items
    ADD CONSTRAINT fk_cart_items_member
    FOREIGN KEY (member_id)
    REFERENCES public.members(id)
    ON DELETE CASCADE;

ALTER TABLE public.cart_items
    ADD CONSTRAINT fk_cart_items_product
    FOREIGN KEY (product_id)
    REFERENCES public.products(id)
    ON DELETE CASCADE;

-- ============================================
-- STEP 3: Insert marketplace products
-- ============================================
INSERT INTO public.products (id, name, category, price, unit, stock, image, description, kop_id, is_flash_sale, original_price, discount)
VALUES
    ('p01', 'Beras Premium Merah', 'Pangan', 18500, 'kg', 120, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80', 'Beras merah organik varietas lokal kaya serat & antioksidan', 'kop-001', true, 22000, 16),
    ('p02', 'Kopi Robusta Blitar', 'Minuman', 45000, '250g', 80, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&q=80', 'Kopi robusta single-origin petik merah, proses natural', 'kop-001', false, NULL, 0),
    ('p03', 'Gula Aren Cair', 'Bumbu', 28000, '500ml', 55, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', 'Gula aren murni tanpa tambahan dari pohon aren hutan', 'kop-001', false, NULL, 0),
    ('p04', 'Tempe Kedelai Lokal', 'Pangan', 6500, 'papan', 200, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80', 'Tempe segar dari kedelai lokal non-GMO, pengrajin tradisional', 'kop-001', true, 8000, 19),
    ('p05', 'Susu Sapi Segar', 'Minuman', 12000, 'liter', 60, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80', 'Susu murni segar dari peternakan sapi perah Talun', 'kop-002', true, 15000, 20),
    ('p06', 'Keju Mozarella Desa', 'Pangan', 65000, '250g', 30, 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&q=80', 'Mozarella artisan dari susu sapi segar berkualitas tinggi', 'kop-002', false, NULL, 0),
    ('p07', 'Yoghurt Plain Organik', 'Minuman', 22000, '250ml', 45, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80', 'Yoghurt probiotik alami tanpa pengawet & pewarna buatan', 'kop-002', false, NULL, 0),
    ('p08', 'Sayur Kangkung Organik', 'Sayuran', 5000, 'ikat', 150, 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80', 'Kangkung segar panen pagi, bebas pestisida', 'kop-003', false, NULL, 0),
    ('p09', 'Cabe Rawit Merah', 'Bumbu', 35000, 'kg', 40, 'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=400&q=80', 'Cabai rawit merah segar panenan hari ini, pedas alami', 'kop-003', true, 45000, 22),
    ('p10', 'Tomat Cherry Lokal', 'Sayuran', 18000, '500g', 70, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80', 'Tomat cherry manis dipetik matang dari kebun lereng gunung', 'kop-003', false, NULL, 0)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    unit = EXCLUDED.unit,
    stock = EXCLUDED.stock,
    image = EXCLUDED.image,
    description = EXCLUDED.description,
    kop_id = EXCLUDED.kop_id,
    is_flash_sale = EXCLUDED.is_flash_sale,
    original_price = EXCLUDED.original_price,
    discount = EXCLUDED.discount;
