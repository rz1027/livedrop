
import { Router } from 'express';
import { query } from '../db.js';
import { paginateParams } from '../pagination.js';
import { v4 as uuidv4 } from 'uuid';

const r = Router();

r.post('/', async (req, res) => {
  const { handle, display_name } = req.body || {};
  if (!handle) return res.status(400).json({ error: 'handle required' });
  const id = uuidv4();
  await query('INSERT INTO creators(id, handle, display_name) VALUES ($1,$2,$3) ON CONFLICT (handle) DO NOTHING', [id, handle, display_name || null]);
  const row = await query('SELECT * FROM creators WHERE handle=$1', [handle]);
  res.json(row.rows[0]);
});

r.get('/:creatorId/followers', async (req, res) => {
  const { creatorId } = req.params as any;
  const { page, limit } = req.query as any;
  const { limit: l, offset } = paginateParams(Number(page), Number(limit));
  const data = await query('SELECT u.* FROM follows f JOIN users u ON f.user_id=u.id WHERE f.creator_id=$1 ORDER BY u.created_at DESC LIMIT $2 OFFSET $3', [creatorId, l, offset]);
  res.json({ results: data.rows });
});

export default r;
