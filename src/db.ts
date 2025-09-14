
import pg from 'pg';
import { CONFIG } from './config.js';

const { Pool } = pg;
export const pool = new Pool({ connectionString: CONFIG.DATABASE_URL });

export async function query(text: string, params?: any[]) {
  const res = await pool.query(text, params);
  return res;
}
