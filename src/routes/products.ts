
import { Router } from 'express';
import { query } from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import { paginateParams } from '../pagination.js';

const r = Router();

r.post('/', async (req, res) => {
  const { creator_id, title, description, price_cents } = req.body || {};
  if (!creator_id || !title || price_cents == null) return res.status(400).json({ error: 'creator_id, title, price_cents required' });
  const id = uuidv4();
  await query('INSERT INTO products(id, creator_id, title, description, price_cents) VALUES ($1,$2,$3,$4,$5)', [id, creator_id, title, description || null, price_cents]);
  const row = await query('SELECT * FROM products WHERE id=$1', [id]);
  res.json(row.rows[0]);
});

r.get('/', async (req, res) => {
  const { page, limit, creator_id } = req.query as any;
  const { limit: l, offset } = paginateParams(Number(page), Number(limit));
  const params: any[] = [];
  let where = '';
  if (creator_id) { where = 'WHERE creator_id=$1'; params.push(creator_id); }
  const data = await query(`SELECT * FROM products ${where} ORDER BY created_at DESC LIMIT ${l} OFFSET ${offset}`, params);
  res.json({ results: data.rows });
});

export default r;
