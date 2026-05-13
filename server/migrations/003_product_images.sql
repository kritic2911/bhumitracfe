-- Add a product_images table for multiple images per product.
-- Migrate existing single-image data from products.image into this table.

CREATE TABLE IF NOT EXISTS product_images (
    image_id    SERIAL PRIMARY KEY,
    product_id  INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    image       TEXT NOT NULL,
    sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images (product_id, sort_order);

-- Migrate existing single images into product_images (only if product_images is still empty)
INSERT INTO product_images (product_id, image, sort_order)
SELECT product_id, image, 0
FROM products
WHERE image IS NOT NULL
  AND image <> ''
  AND NOT EXISTS (SELECT 1 FROM product_images LIMIT 1);
