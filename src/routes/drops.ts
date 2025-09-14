
import { Router } from 'express';
import { query } from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import { paginateParams } from '../pagination.js';
import { redis } from '../redis.js';

const r = Router();

r.post('/', async (req, res) => {
  const { product_id, creator_id, start_time, end_time, initial_stock, low_stock_threshold } = req.body || {};
  if (!product_id || !creator_id || !start_time || !end_time || initial_stock == null) return res.status(400).json({ error: 'missing fields' });
  const id = uuidv4();
  await query('INSERT INTO drops(id, product_id, creator_id, start_time, end_time, initial_stock, low_stock_threshold, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', [id, product_id, creator_id, start_time, end_time, initial_stock, low_stock_threshold || 5, 'scheduled']);
  await redis.set(`stock:${id}`, Number(initial_stock));
  const row = await query('SELECT * FROM drops WHERE id=$1', [id]);
  res.json(row.rows[0]);
});

r.get('/', async (req, res) => {
  const { page, limit, status } = req.query as any;
  const { limit: l, offset } = paginateParams(Number(page), Number(limit));
  const params: any[] = [];
  let where = '';
  if (status) { where = 'WHERE status=$1'; params.push(status); }
  const data = await query(`SELECT * FROM drops ${where} ORDER BY start_time DESC LIMIT ${l} OFFSET ${offset}`, params);
  res.json({ results: data.rows });
});

r.get('/:id/stock', async (req, res) => {
  const { id } = req.params as any;
  const s = await redis.get(`stock:${id}`);
  res.json({ stock: Number(s || 0) });
});

export default r;
