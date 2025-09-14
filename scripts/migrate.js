import 'dotenv/config';
import { readFileSync, readdirSync } from 'fs';
import path from 'path';
import pg from 'pg';

const { Client } = pg;
const dir = path.resolve('migrations');

async function run(direction) {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  await client.query(`CREATE TABLE IF NOT EXISTS _migrations (name text primary key, run_at timestamptz default now())`);
  const files = readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
  for (const f of files) {
    const name = f;
    const applied = await client.query('SELECT 1 FROM _migrations WHERE name=$1', [name]);
    if (applied.rowCount && direction === 'up') continue;
    if (direction === 'down') continue;
    const sql = readFileSync(path.join(dir, f), 'utf8');
    console.log('Applying migration', f);
    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query('INSERT INTO _migrations(name) VALUES($1)', [name]);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      console.error('Migration failed', e);
      process.exit(1);
    }
  }
  await client.end();
}

const dirArg = process.argv[2] || 'up';
run(dirArg).then(() => {
  console.log('Migrations complete.');
  process.exit(0);
});
