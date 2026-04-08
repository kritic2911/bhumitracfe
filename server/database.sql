-- Legacy single-file schema (for manual psql setup). Prefer migrations in /migrations for hosted deploys.

CREATE TABLE IF NOT EXISTS deet(
    reg_id SERIAL PRIMARY KEY,
    name varchar(200) NOT NULL,
    email varchar(200) NOT NULL,
    mobile_no varchar(200) NOT NULL,
    feedback text,
    purchase varchar(500) NOT NULL
);

CREATE TABLE IF NOT EXISTS products(
    product_id SERIAL PRIMARY KEY,
    name varchar(200) NOT NULL,
    price varchar(100) NOT NULL,
    description text NOT NULL,
    image text
);

CREATE TABLE IF NOT EXISTS blogs(
    blog_id SERIAL PRIMARY KEY,
    title varchar(255) NOT NULL,
    excerpt text,
    image text,
    content text NOT NULL,
    created_at timestamptz DEFAULT now()
);
