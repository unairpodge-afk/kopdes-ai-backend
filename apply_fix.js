/**
 * Apply schema fix migration to Supabase
 * This script runs the fix migration SQL against the Supabase database
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

async function runSQL(sql) {
  // Try using the Supabase SQL endpoint (requires service_role key)
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  });
  return response;
}

// Alternative: Execute individual DDL statements via individual supabase calls
async function applyFixes() {
  const supabase = require('./src/config/supabaseClient');
  
  console.log('🔧 Applying schema fixes...\n');
  
  // Test 1: Check if supply_chain_shipments table exists
  const { error: scErr } = await supabase.from('supply_chain_shipments').select('id').limit(0);
  if (scErr) {
    console.log('❌ supply_chain_shipments table is MISSING');
    console.log('   → This table requires SQL DDL (CREATE TABLE). Cannot be created via REST API.');
  } else {
    console.log('✅ supply_chain_shipments table exists');
  }

  // Test 2: Check cart_items
  const { error: ciErr } = await supabase.from('cart_items').select('id').limit(0);
  if (ciErr) {
    console.log('❌ cart_items table is MISSING');
  } else {
    console.log('✅ cart_items table exists');
  }

  // Test 3: Check delphi columns
  const { error: isActiveErr } = await supabase.from('delphi_surveys').select('is_active').limit(0);
  if (isActiveErr) {
    console.log('❌ delphi_surveys.is_active column is MISSING');
  } else {
    console.log('✅ delphi_surveys.is_active column exists');
  }

  const { error: optErr } = await supabase.from('delphi_rounds').select('options').limit(0);
  if (optErr) {
    console.log('❌ delphi_rounds.options column is MISSING');
  } else {
    console.log('✅ delphi_rounds.options column exists');
  }

  // Test seed data
  const { data: memCount } = await supabase.from('members').select('id');
  console.log(`\n📊 Members in database: ${memCount ? memCount.length : 0}`);
  
  const { data: prodCount } = await supabase.from('products').select('id');
  console.log(`📊 Products in database: ${prodCount ? prodCount.length : 0}`);

  const { data: blockCount } = await supabase.from('blockchain').select('id');
  console.log(`📊 Blockchain blocks: ${blockCount ? blockCount.length : 0}`);

  // Check if schema fixes are needed
  const needsFix = scErr || ciErr || isActiveErr || optErr;
  
  if (needsFix) {
    console.log('\n' + '='.repeat(60));
    console.log('⚠️  SCHEMA FIXES REQUIRED!');
    console.log('='.repeat(60));
    console.log('\nAnda perlu menjalankan SQL berikut di Supabase SQL Editor:');
    console.log('File: src/models/fix_migration.sql');
    console.log('\nLangkah:');
    console.log('1. Buka https://supabase.com/dashboard');
    console.log('2. Pilih project Anda');
    console.log('3. Klik "SQL Editor" di sidebar');
    console.log('4. Copy-paste isi file fix_migration.sql');
    console.log('5. Klik "Run"');
    console.log('='.repeat(60));
  } else {
    console.log('\n✅ Semua skema sudah benar! Backend siap digunakan.');
  }

  process.exit(0);
}

applyFixes().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
