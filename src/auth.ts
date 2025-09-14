
import jwt from 'jsonwebtoken';
import { CONFIG } from './config.js';
import { Request, Response, NextFunction } from 'express';

export function sign(userId: string) {
  return jwt.sign({ sub: userId }, CONFIG.JWT_SECRET, { expiresIn: '7d' });
}

export function auth(req: Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  if (!h) return res.status(401).json({ error: 'Missing Authorization' });
  const token = h.replace(/^Bearer\s+/, '');
  try {
    const payload = jwt.verify(token, CONFIG.JWT_SECRET) as any;
    (req as any).userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
