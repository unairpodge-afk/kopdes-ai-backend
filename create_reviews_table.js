/**
 * Create product_reviews table using SQL RPC or direct fetch
 */
require('dotenv').config();
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

async function createTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS public.product_reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
        member_id TEXT REFERENCES public.members(id) ON DELETE SET NULL,
        member_name TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow all for service role" ON public.product_reviews;
    CREATE POLICY "Allow all for service role" ON public.product_reviews FOR ALL USING (true) WITH CHECK (true);

    -- Also insert some dummy review data for testing
    INSERT INTO public.product_reviews (product_id, member_id, member_name, rating, comment)
    VALUES 
      ('p1', '1205 2024 0001', 'Budi Santoso', 5, 'Berasnya wangi banget dan pulen saat dimasak. Recomended!'),
      ('p1', '1205 2026 0002', 'Dewi Lestari', 4, 'Beras premium kualitas bagus, respon penjual cepat.'),
      ('p2', '1205 2024 0001', 'Budi Santoso', 5, 'Kopi Gayo mantap! Aromanya harum khas arabika asli.'),
      ('p3', '1205 2026 0002', 'Dewi Lestari', 5, 'Madu murni berkhasiat, badan jadi lebih segar setelah minum ini.')
    ON CONFLICT DO NOTHING;
  `;

  console.log("Executing SQL migration for product_reviews...");
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ query: query })
    });

    if (response.ok) {
      console.log('✅ Migration Successful!');
    } else {
      const text = await response.text();
      console.log('❌ Migration Failed:', text);
    }
  } catch (err) {
    console.log('❌ Error executing SQL migration:', err.message);
  }
}

createTable();
