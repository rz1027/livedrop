
import Redis from 'ioredis';
import { CONFIG } from './config.js';
import { readFileSync } from 'fs';
import path from 'path';

export const redis = new Redis(CONFIG.REDIS_URL);
const luaPath = path.resolve('src/lua/decrement.lua');
export const decrementScript = readFileSync(luaPath, 'utf8');
