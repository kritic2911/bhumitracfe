const { Client } = require("pg");

const ssl =
  process.env.DB_SSL === "true"
    ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" }
    : false;

function normalizeDatabaseUrl(url) {
  if (!url || typeof url !== "string") return url;

  const m = url.match(/^([a-zA-Z]+:\/\/[^:]+:)([^@]+)(@.*)$/);
  if (!m) return url;
  const prefix = m[1];
  const password = m[2];
  const suffix = m[3];

  if (password.includes("#") || password.includes(" ")) {
    return prefix + encodeURIComponent(password) + suffix;
  }
  return url;
}

function getClientConfig() {
  const connectionString = normalizeDatabaseUrl(process.env.DATABASE_URL);
  if (connectionString) {
    return { connectionString, ssl };
  }
  return {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432", 10),
    database: process.env.DB_NAME,
    ssl,
  };
}

module.exports = async (req, res) => {
  const client = new Client(getClientConfig());

  try {
    await client.connect();
    const result = await client.query("SELECT NOW() AS now");
    res.status(200).json({
      ok: true,
      timestamp: result.rows[0].now,
    });
  } catch (err) {
    console.error("Keepalive DB error:", err.message);
    res.status(500).json({
      ok: false,
      error: err.message,
    });
  } finally {
    await client.end().catch(() => {});
  }
};
