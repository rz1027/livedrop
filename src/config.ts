
import 'dotenv/config';

export const CONFIG = {
  PORT: Number(process.env.PORT || 4000),
  DATABASE_URL: process.env.DATABASE_URL || 'postgres://livedrop:livedrop@localhost:5432/livedrop',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  JWT_SECRET: process.env.JWT_SECRET || 'devsecret'
};
