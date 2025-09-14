
import { Router } from 'express';
import { query } from '../db.js';
import { paginateParams } from '../pagination.js';
import { v4 as uuidv4 } from 'uuid';
import { sign } from '../auth.js';

const r = Router();

r.post('/auth/dev', async (req, res) => {
  const { handle } = req.body || {};
  if (!handle) return res.status(400).json({ error: 'handle required' });
  const id = uuidv4();
  await query('INSERT INTO users(id, handle) VALUES ($1,$2) ON CONFLICT (handle) DO NOTHING', [id, handle]);
  const row = await query('SELECT id FROM users WHERE handle=$1', [handle]);
  const userId = (row.rows[0] as any).id;
  res.json({ token: sign(userId), userId });
});

r.post('/:userId/follow/:creatorId', async (req, res) => {
  const { userId, creatorId } = req.params as any;
  await query('INSERT INTO follows(user_id, creator_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [userId, creatorId]);
  res.json({ ok: true });
});

r.delete('/:userId/follow/:creatorId', async (req, res) => {
  const { userId, creatorId } = req.params as any;
  await query('DELETE FROM follows WHERE user_id=$1 AND creator_id=$2', [userId, creatorId]);
  res.json({ ok: true });
});

r.get('/:userId/following', async (req, res) => {
  const { userId } = req.params as any;
  const { page, limit } = req.query as any;
  const { limit: l, offset } = paginateParams(Number(page), Number(limit));
  const data = await query('SELECT c.* FROM follows f JOIN creators c ON f.creator_id=c.id WHERE f.user_id=$1 ORDER BY c.created_at DESC LIMIT $2 OFFSET $3', [userId, l, offset]);
  res.json({ results: data.rows });
});

export default r;
