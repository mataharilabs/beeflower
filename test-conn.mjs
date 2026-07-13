import { Pool } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL;
console.log('NODE version:', process.version);
console.log('WebSocket available:', typeof WebSocket !== 'undefined');
console.log('DATABASE_URL:', url ? url.substring(0, 40) + '...' : 'UNDEFINED');

const pool = new Pool({ connectionString: url });

try {
  const result = await pool.query('SELECT 1 as test');
  console.log('✅ Connection OK:', result.rows);
} catch(e) {
  console.error('❌ Full error:', JSON.stringify(e, Object.getOwnPropertyNames(e)));
  console.error('❌ type:', e?.type, '| target readyState:', e?.target?.readyState);
} finally {
  await pool.end();
}
