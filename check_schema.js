require('dotenv').config();
const s = require('./src/config/supabaseClient');

(async () => {
  // Test inserting into delphi_surveys with is_active to check column
  const { data: ds, error: dse } = await s.from('delphi_surveys').select('*').limit(1);
  console.log('delphi_surveys:', JSON.stringify(ds), dse ? dse.message : 'OK');

  const { data: dr, error: dre } = await s.from('delphi_rounds').select('*').limit(1);
  console.log('delphi_rounds:', JSON.stringify(dr), dre ? dre.message : 'OK');

  const { data: mem, error: me } = await s.from('members').select('*').limit(1);
  console.log('members:', JSON.stringify(mem), me ? me.message : 'OK');

  const { data: ord, error: oe } = await s.from('orders').select('*').limit(1);
  console.log('orders:', JSON.stringify(ord), oe ? oe.message : 'OK');

  // Test is_active column
  const { error: e1 } = await s.from('delphi_surveys').select('is_active').limit(0);
  console.log('delphi_surveys.is_active:', e1 ? 'MISSING - ' + e1.message : 'EXISTS');

  // Test options column on rounds
  const { error: e2 } = await s.from('delphi_rounds').select('options').limit(0);
  console.log('delphi_rounds.options:', e2 ? 'MISSING - ' + e2.message : 'EXISTS');

  // Test summary column on rounds
  const { error: e3 } = await s.from('delphi_rounds').select('summary_from_previous_round').limit(0);
  console.log('delphi_rounds.summary_from_previous_round:', e3 ? 'MISSING - ' + e3.message : 'EXISTS');

  // Test created_at on members
  const { error: e4 } = await s.from('members').select('created_at').limit(0);
  console.log('members.created_at:', e4 ? 'MISSING - ' + e4.message : 'EXISTS');

  // Test cart_items table
  const { error: e5 } = await s.from('cart_items').select('*').limit(0);
  console.log('cart_items table:', e5 ? 'MISSING - ' + e5.message : 'EXISTS');

  // Test orders columns
  const { error: e6 } = await s.from('orders').select('id').limit(0);
  console.log('orders.id:', e6 ? 'MISSING - ' + e6.message : 'EXISTS');

  const { error: e7 } = await s.from('orders').select('member_id').limit(0);
  console.log('orders.member_id:', e7 ? 'MISSING - ' + e7.message : 'EXISTS');

  // Test supply_chain_shipments table
  const { error: e8 } = await s.from('supply_chain_shipments').select('*').limit(0);
  console.log('supply_chain_shipments table:', e8 ? 'MISSING - ' + e8.message : 'EXISTS');

  process.exit(0);
})();
