# Bhumitra CFE

**Bhumitra Citizens For Environment** — community site for eco-friendly products, blog content, and registrations, with a password-protected admin area.

- **Specification:** [SUMMARY.md](./SUMMARY.md)
- **Setup & hosting:** [setup.md](./setup.md)
- **Progress / roadmap:** [progress.md](./progress.md)

## Quick start

```bash
# Terminal 1 — API (runs DB migrations first)
cd server
cp .env.example .env   # edit DB_* and ADMIN_PASSWORD
npm install && npm start

# Terminal 2 — UI
cd client
cp .env.example .env   # set REACT_APP_API_URL if not using default localhost:5000
npm install && npm start
```

Admin routes: `/admin` and `/list` (not shown in the main nav). Use the password set as `ADMIN_PASSWORD` on the server.
