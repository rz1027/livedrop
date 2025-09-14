
import { Router } from 'express';
import { query } from '../db.js';
import { redis, decrementScript } from '../redis.js';
import { v4 as uuidv4 } from 'uuid';

const r = Router();

r.post('/', async (req, res) => {
  const key = (req.headers['idempotency-key'] || '').toString();
  if (!key) return res.status(400).json({ error: 'Missing Idempotency-Key header' });

  const { user_id, drop_id, product_id, qty, amount_cents } = req.body || {};
  if (!user_id || !drop_id || !product_id || !qty || amount_cents == null) return res.status(400).json({ error: 'Missing fields' });

  const existing = await query('SELECT * FROM orders WHERE user_id=$1 AND idempotency_key=$2', [user_id, key]);
  if (existing.rows.length) {
    return res.json({ order: existing.rows[0], idempotent: true });
  }

  const stockKey = `stock:${drop_id}`;
  const idemKey = `idem:${user_id}:${key}`;
  const result: any = await (redis as any).eval(decrementScript, 2, stockKey, idemKey, String(qty), String(600));
  if (result[0] === 0) {
    return res.status(409).json({ error: 'Sold out or insufficient stock', remaining: result[1] });
  }

  const id = uuidv4();
  const status = 'confirmed';
  await query('INSERT INTO orders(id, user_id, drop_id, product_id, qty, amount_cents, status, idempotency_key) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
    [id, user_id, drop_id, product_id, qty, amount_cents, status, key]);

  const remaining = Number(result[1]);
  if (remaining === 0) {
    await query('UPDATE drops SET status=$1 WHERE id=$2', ['sold_out', drop_id]);
  }

  res.status(201).json({ order: { id, user_id, drop_id, product_id, qty, amount_cents, status }, remaining });
});

r.get('/:id', async (req, res) => {
  const { id } = req.params as any;
  const row = await query('SELECT * FROM orders WHERE id=$1', [id]);
  if (!row.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(row.rows[0]);
});

export default r;
