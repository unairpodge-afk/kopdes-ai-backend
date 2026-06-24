/**
 * Run SQL migration against Supabase using the SQL API
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

async function runSqlStatements() {
  const sqlFile = fs.readFileSync(
    path.join(__dirname, 'src', 'models', 'fix_migration.sql'),
    'utf8'
  );

  // Split by semicolons but be careful with strings
  const statements = sqlFile
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`Found ${statements.length} SQL statements to execute.\n`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i] + ';';
    const preview = stmt.substring(0, 80).replace(/\n/g, ' ');
    process.stdout.write(`[${i + 1}/${statements.length}] ${preview}... `);

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ query: stmt })
      });

      if (response.ok) {
        console.log('✅');
      } else {
        const text = await response.text();
        console.log('❌', text.substring(0, 100));
      }
    } catch (err) {
      console.log('❌ Network error:', err.message);
    }
  }
}

runSqlStatements().catch(console.error);
