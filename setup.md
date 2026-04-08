# Bhumitra CFE — setup and hosting

This project is a **React** frontend (`client/`) and **Node/Express** backend (`server/`) using **PostgreSQL**. This guide covers local development, environment variables, database migrations (important for hosted databases), and a typical production layout.

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+
- **PostgreSQL** 12+ (local install, Docker, or a managed provider such as Supabase, Neon, or Railway Postgres)

---

## 1. Clone and install

```bash
cd bhumitracfe
cd server && npm install
cd ../client && npm install
```

---

## 2. Database

### Option A — local PostgreSQL

1. Create a database (name can be `details` or any name you set in `DB_NAME`):

   ```bash
   psql -U postgres -c "CREATE DATABASE details;"
   ```

2. Configure `server/.env` (copy from `server/.env.example`).

3. Run migrations (also runs automatically on `npm start` in `server/`):

   ```bash
   cd server
   npm run migrate
   ```

Tables are created from `server/migrations/001_initial_schema.sql`. Demo rows are added by `002_seed_demo_data.sql` **only** when the tables are still empty.

### Option B — Supabase / managed Postgres

1. Create a project and open the SQL editor if you prefer to run files manually — **or** rely on the app’s migration runner (recommended so local and production stay in sync).

2. Connection settings usually look like:

   - **Host:** `db.<project-ref>.supabase.co` (or the host shown in the dashboard)
   - **Port:** `5432`
   - **Database:** often `postgres`
   - **User / password:** from project settings
   - **SSL:** set in `server/.env`:

     ```
     DB_SSL=true
     DB_SSL_REJECT_UNAUTHORIZED=false
     ```

3. Set the same variables in your **hosting provider’s** environment for the API service.

### Why migrations matter when hosting

- You typically **do not** run `CREATE DATABASE` on a managed instance; you connect to the provided database.
- Numbered files in `server/migrations/` are applied **once** each (tracked in table `schema_migrations`), so redeploys do not duplicate work.
- Adding a new file `003_something.sql` in the future will apply only that file on the next deploy.

---

## 3. Server environment (`server/.env`)

Copy `server/.env.example` to `server/.env` and set:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | **Recommended** for managed Postgres: a full connection string (often from a pooler). If set, it overrides `DB_*`. |
| `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_NAME` | Postgres connection |
| `DB_SSL`, `DB_SSL_REJECT_UNAUTHORIZED` | SSL to cloud Postgres (see above) |
| `PORT` | API port (default `5000` locally; many hosts set `PORT` automatically) |
| `ADMIN_PASSWORD` | Admin login password (required). **Set a strong value in production.** |
| `ADMIN_SESSION_SECRET` | Optional; signs admin tokens (defaults to `ADMIN_PASSWORD` if unset — prefer a long random string in production) |
| `CORS_ORIGIN` | Comma-separated list of allowed frontend origins, e.g. `https://your-app.vercel.app,http://localhost:3000` |

Start the API:

```bash
cd server
npm start
```

This runs `migrate.js` then `index.js`. Check `GET http://localhost:5000/test-db`.

---

## 4. Client environment (`client/.env`)

Copy `client/.env.example` to `client/.env`:

```
REACT_APP_API_URL=http://localhost:5000
```

For production, set `REACT_APP_API_URL` to your **public API URL** (HTTPS), e.g. `https://your-api.onrender.com` **without** a trailing slash.

Start the dev server:

```bash
cd client
npm start
```

Production build:

```bash
cd client
npm run build
```

Static output is in `client/build/`.

---

## 5. Admin access

- **Dashboard:** open `/admin` on the frontend (not linked in the navigation).
- **User table only:** `/list` (same admin password).
- Password is checked on the server (`ADMIN_PASSWORD`); the client receives a **token** after login, not the password itself.

---

## 6. Typical hosted setup (example)

This is one common pattern; adapt names to your provider.

1. **Database:** Supabase (or Neon, Railway Postgres, etc.) — run migrations via your API deploy (`npm start` already migrates), or run `npm run migrate` once from a secure environment using the same `DB_*` vars.

2. **Backend:** Render, Railway, or Fly.io — Node app with root `server/`, start command `npm start`, working directory `server/`, env vars as in section 3. Set `CORS_ORIGIN` to your frontend URL.

3. **Frontend:** Vercel or Netlify — connect the repo, set project root to `client/`, build command `npm run build`, publish directory `build`. Add environment variable `REACT_APP_API_URL` to the deployed API URL and trigger a new build.

4. **Smoke test:** Load the site, submit the registration form, open `/admin`, verify products/blogs load from the hosted API.

---

## 7. Troubleshooting

| Issue | What to check |
|--------|----------------|
| CORS errors in the browser | `CORS_ORIGIN` includes your exact frontend origin (scheme + host, no path). |
| `401 Unauthorized` on admin actions | Token expired (24h) or `ADMIN_SESSION_SECRET`/`ADMIN_PASSWORD` changed — sign in again. |
| Migration errors | Logs from `npm run migrate`; fix SQL and ensure DB user can create tables. |
| Client shows empty products/blogs | API URL wrong; or DB empty and seed migration not applied — check `schema_migrations` and run migrate manually. |

---

## 8. Repository layout

```
bhumitracfe/
├── client/          # React app
├── server/          # Express API + migrations
├── SUMMARY.md       # Product specification
├── setup.md         # This file
└── progress.md      # What shipped vs planned
```
