# Bhumitra CFE — implementation progress

Last updated: 2026-05-13

## Added (this iteration — 2026-05-13)

### Expanded product tile overlay (Frontend)

- **Clicking a product tile** now opens an expanded overlay centered on the page with a translucent backdrop (click outside or press Escape to close).
- **Image carousel** inside the expanded tile: left/right arrow buttons navigate between images (arrows only shown when 2+ images exist), with dot indicators.
- **Expanded tile layout:** Image carousel → Price → Description → purchase contact note (*For purchase, please contact us on WhatsApp/Instagram*).
- **Placeholder contact info:** WhatsApp number and Instagram handle are placeholder text (`[mobile number]` / `[instagram handle]`) — admin should update in `ProductCatalog.js`.
- **UI Polish:** Widened the expanded product tile to `70vw` and updated image `object-fit` to `contain` so the entire image is comfortably visible without cropping. Fixed ESLint `img-redundant-alt` warning.

### Multi-image products (Full stack)

- **Database:** New `product_images` table (`003_product_images.sql` migration) with FK to `products` (ON DELETE CASCADE), `sort_order` for ordering. Existing single `image` values are automatically migrated on first run.
- **Backend API:**
  - `GET /products` now returns an `images` array (from `product_images`) on each product.
  - `POST /products` and `PUT /products/:id` accept an `images` array in addition to `image`; images are synced to `product_images`.
  - New routes: `POST /products/:id/images` (add single image), `DELETE /products/:productId/images/:imageId` (remove single image).
- **Admin Dashboard:**
  - Product form now supports multiple image uploads (file picker accepts multiple files).
  - "Add image by URL" input with Add button (or Enter key).
  - Thumbnail preview grid of all added images with individual remove (×) buttons.
  - Admin product cards show image count badge when > 1 image.

---

## Added (previous iteration — 2026-04-08)

### Frontend (`client/`)

- React app (Create React App, React 19) with Bootstrap 5 grid and custom minimal styling.
- **Theme:** Cream light mode with muted green accents; dark mode uses a very dark green base with cream-toned text and soft green highlights (see `src/themes.js`).
- **UI polish:** Placeholder text colors tuned for light/dark mode on `Register` and `Admin` forms.
- **Pages / routes (path-based):** Home (about + carousel + team + contact), Register, Products, Blog, Admin (`/admin`), User list (`/list` — not linked in nav; share URL only).
- **Admin nav:** Added an admin-only `List` tab in the top navigation.
- **Components:** `AboutContact`, `ImageCarousel`, `TeamMembers`, `register`, `ProductCatalog` (image zoom modal), `Blog` (magazine layout), `AdminDashboard` (blogs + products CRUD, embedded user table), `listUsers`.
- **API:** Central `REACT_APP_API_URL` in `src/api.js` for all requests.
- **Admin auth:** Password is **not** stored in the client bundle. User signs in via modal; server returns a short-lived signed token stored in `sessionStorage`; protected API calls send `Authorization: Bearer …`. Session check via `GET /admin/session`.
- **Public assets:** Carousel, product, and team images under `public/`.
- **Dev environment:** Fixed `react-scripts` dependency so `npm start` runs successfully.

### Backend (`server/`)

- Express 5 API aligned with `SUMMARY.md`: register, users (admin), products, blogs, `GET /test-db`.
- **Admin protection:** `POST /admin/login`, `GET /admin/session`; mutating user/product/blog routes require valid Bearer token (`auth.js`).
- **Environment:** `ADMIN_PASSWORD`, optional `ADMIN_SESSION_SECRET`, `CORS_ORIGIN` (comma-separated), optional `DB_SSL` for managed Postgres.
- **Migrations:** Versioned SQL in `server/migrations/` applied by `migrate.js` (tracks `schema_migrations`). `npm start` runs migrations before the server. Safe for empty hosted databases (uses `IF NOT EXISTS` where appropriate).
- **Seed:** `002_seed_demo_data.sql` inserts demo products and blogs only when tables are still empty (first deploy).

### Documentation

- `setup.md` — local setup, environment variables, database migrations, and hosting notes (Vercel + Render + Supabase-style).
- `progress.md` — this file.
- Added GitHub Actions keepalive workflow at `.github/workflows/keepalive.yml` to ping backend health endpoint every 10 minutes.

---

## To add / backlog

- **Security:** Rate limiting on `/admin/login` and `/register`; optional CAPTCHA; move to proper JWT refresh or HTTP-only cookies.
- **Media:** Cloud storage (S3, Supabase Storage) instead of base64 in Postgres; image size limits and cleanup on delete.
- **Blog multi-image:** Add a `blog_images` table (similar to `product_images`) so blogs can have multiple images with a carousel.
- **DB:** Optional indexes-only migration for heavy tables; backup automation documented per host.
- **Product:** Search, pagination for long lists, blog comments, email notifications on registration.
- **DevOps:** Dockerfile, CI (lint + build), health check used by orchestrators beyond `/test-db`.

---

## Quick links (development)

| Area        | URL / command        |
|------------|----------------------|
| Frontend   | `http://localhost:3000` (after `cd client && npm start`) |
| API        | `http://localhost:5000` (after `cd server && npm start`) |
| DB check   | `GET http://localhost:5000/test-db` |
