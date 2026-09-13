require("dotenv").config();
const fs = require("fs");
const path = require("path");
const pool = require("./db");

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ DEFAULT now()
    );
  `);
}

async function run() {
  const dir = path.join(__dirname, "migrations");
  if (!fs.existsSync(dir)) {
    console.log("No migrations folder; skipping.");
    return;
  }
  await ensureMigrationsTable();
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const client = await pool.connect();
  try {
    for (const file of files) {
      const applied = await client.query("SELECT 1 FROM schema_migrations WHERE filename = $1", [file]);
      if (applied.rows.length) {
        console.log(`Migration skip (already applied): ${file}`);
        continue;
      }
      const sql = fs.readFileSync(path.join(dir, file), "utf8");
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [file]);
        await client.query("COMMIT");
        console.log(`Migration applied: ${file}`);
      } catch (e) {
        await client.query("ROLLBACK");
        throw e;
      }
    }
    console.log("Database migrations complete.");
  } finally {
    client.release();
  }
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.warn("⚠️  Migration could not run (DB may be unreachable). Server will start anyway.");
    console.warn("   Error:", err && err.message ? err.message : String(err));
    // Exit 0 so the server process still starts — DB routes will fail per-request instead.
    process.exit(0);
  });

