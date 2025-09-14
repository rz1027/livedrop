
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  handle TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS creators (
  id UUID PRIMARY KEY,
  handle TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS follows (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES creators(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, creator_id)
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY,
  creator_id UUID REFERENCES creators(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price_cents INT NOT NULL CHECK (price_cents >= 0),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS drops (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES creators(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  initial_stock INT NOT NULL CHECK (initial_stock >= 0),
  low_stock_threshold INT DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  drop_id UUID REFERENCES drops(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  qty INT NOT NULL CHECK (qty > 0),
  amount_cents INT NOT NULL CHECK (amount_cents >= 0),
  status TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (idempotency_key, user_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_creator ON follows (creator_id, user_id);
CREATE INDEX IF NOT EXISTS idx_follows_user ON follows (user_id, creator_id);
CREATE INDEX IF NOT EXISTS idx_products_creator ON products (creator_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_drops_times ON drops (start_time DESC, end_time DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders (user_id, created_at DESC);
