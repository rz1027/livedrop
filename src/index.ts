
import express from 'express';
import cors from 'cors';
import { CONFIG } from './config.js';
import users from './routes/users.js';
import creators from './routes/creators.js';
import products from './routes/products.js';
import drops from './routes/drops.js';
import orders from './routes/orders.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/users', users);
app.use('/creators', creators);
app.use('/products', products);
app.use('/drops', drops);
app.use('/orders', orders);

app.listen(CONFIG.PORT, () => {
  console.log(`API listening on :${CONFIG.PORT}`);
});
