-- Seed demo rows only when tables are empty (first deploy / fresh hosted DB)

INSERT INTO products (name, price, description, image)
SELECT 'Bhumizyme, the Bio-Enzyme Cleaner',
       '₹199/L',
       'Bhumizyme is a multipurpose floor, tile, toilet, etc cleaner made from 100% natural products. Bhumizyme is completely safe on hands and safe for kids and pets.',
       '/products/bhumizyme.jpg'
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);

INSERT INTO products (name, price, description, image)
SELECT 'UpCycled Cloth Bags',
       '₹49-69',
       'Reusable cotton bags made of upcycled clothes to help reduce plastic pollution.',
       '/products/cloth_bags.jpg'
WHERE (SELECT COUNT(*) FROM products) = 1;

INSERT INTO products (name, price, description, image)
SELECT 'Bio-Enzyme activator',
       '₹249',
       'Activator with a bhumizyme preparation PDF to help you prepare your own bioenzyme at your home.',
       '/products/activator.jpg'
WHERE (SELECT COUNT(*) FROM products) = 2;

INSERT INTO blogs (title, excerpt, image, content, created_at)
SELECT 'Bhumizyme for cleaner homes',
       'Eco-friendly enzyme cleaner for floor, tile, and toilet surfaces.',
       '/carousel/community.jpg',
       'Bhumizyme is made from natural ingredients and provides a safe, effective cleaning experience without harsh chemicals. Share the recipe, benefits, and practical use cases here.',
       '2026-04-04T00:00:00Z'::timestamptz
WHERE NOT EXISTS (SELECT 1 FROM blogs LIMIT 1);

INSERT INTO blogs (title, excerpt, image, content, created_at)
SELECT 'Upcycled cloth bags to reduce plastic',
       'Reusing cloth materials to make stylish bags that replace single-use plastic.',
       '/carousel/products.jpg',
       'Cloth bags are durable, washable, and perfect for shopping. This post can include tips on maintaining upcycled bags and the environmental impact of reusing fabrics.',
       '2026-04-02T00:00:00Z'::timestamptz
WHERE (SELECT COUNT(*) FROM blogs) = 1;

INSERT INTO blogs (title, excerpt, image, content, created_at)
SELECT 'Community events and impact',
       'How local environmental work is bringing people together for change.',
       '/carousel/event.jpg',
       'Community action is at the heart of lasting sustainability. Write about workshops, clean-up drives, and collaborations that make a difference.',
       '2026-03-28T00:00:00Z'::timestamptz
WHERE (SELECT COUNT(*) FROM blogs) = 2;
