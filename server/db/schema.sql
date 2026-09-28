-- InventoryIQ database schema
-- Run this once against your PostgreSQL database:
--   psql -U postgres -d inventoryiq -f db/schema.sql

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO categories (name) VALUES
  ('Electronics'), ('Groceries'), ('Apparel'), ('Stationery'), ('Furniture')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  sku VARCHAR(50) UNIQUE NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  reorder_level INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  change_type VARCHAR(10) NOT NULL CHECK (change_type IN ('in', 'out')),
  quantity INTEGER NOT NULL,
  note VARCHAR(200),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_movements_product ON stock_movements(product_id);

-- Sample data
INSERT INTO products (name, sku, category_id, quantity, unit_price, reorder_level)
VALUES
  ('Wireless Mouse', 'ELEC-001', 1, 45, 599.00, 15),
  ('USB-C Cable', 'ELEC-002', 1, 8, 199.00, 20),
  ('Notebook A5', 'STAT-001', 4, 120, 45.00, 30),
  ('Office Chair', 'FURN-001', 5, 5, 4999.00, 5)
ON CONFLICT (sku) DO NOTHING;
