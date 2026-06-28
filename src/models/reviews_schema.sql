-- SQL Migration for Product Reviews Table
-- Copy and paste this into the Supabase SQL Editor:
-- https://supabase.com/dashboard

CREATE TABLE IF NOT EXISTS public.product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    member_id TEXT REFERENCES public.members(id) ON DELETE SET NULL,
    member_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS and add policy
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for service role" ON public.product_reviews;
CREATE POLICY "Allow all for service role" ON public.product_reviews FOR ALL USING (true) WITH CHECK (true);

-- Insert dummy review data
INSERT INTO public.product_reviews (product_id, member_id, member_name, rating, comment)
VALUES 
  ('p1', '1205 2024 0001', 'Budi Santoso', 5, 'Berasnya wangi banget dan pulen saat dimasak. Recomended!'),
  ('p1', '1205 2026 0002', 'Dewi Lestari', 4, 'Beras premium kualitas bagus, respon penjual cepat.'),
  ('p2', '1205 2024 0001', 'Budi Santoso', 5, 'Kopi Gayo mantap! Aromanya harum khas arabika asli.'),
  ('p3', '1205 2026 0002', 'Dewi Lestari', 5, 'Madu murni berkhasiat, badan jadi lebih segar setelah minum ini.')
ON CONFLICT DO NOTHING;
