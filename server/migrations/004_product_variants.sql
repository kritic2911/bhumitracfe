-- Migration 004: product_variants table
-- Each row is one size/quantity option for a product (e.g. "1 L", "5 L", "10 L")

CREATE TABLE IF NOT EXISTS product_variants (
  variant_id  SERIAL PRIMARY KEY,
  product_id  INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  label       VARCHAR(100) NOT NULL,   -- display name, e.g. "1 L"
  price       VARCHAR(100),            -- optional price override for this size
  image       TEXT,                    -- packaging image (URL or base64 data URI)
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id
  ON product_variants (product_id, sort_order);
