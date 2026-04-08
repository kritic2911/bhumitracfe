-- Core tables for Bhumitra CFE (safe to run on empty or existing DB; idempotent via IF NOT EXISTS)

CREATE TABLE IF NOT EXISTS deet (
    reg_id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    mobile_no VARCHAR(200) NOT NULL,
    feedback TEXT,
    purchase VARCHAR(500) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_deet_email ON deet (email);

CREATE TABLE IF NOT EXISTS products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    price VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    image TEXT
);

CREATE TABLE IF NOT EXISTS blogs (
    blog_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT,
    image TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON blogs (created_at DESC);
