require("dotenv").config();
const { Pool } = require("pg");

const ssl =
  process.env.DB_SSL === "true"
    ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" }
    : false;

function normalizeDatabaseUrl(url) {
  if (!url || typeof url !== "string") return url;

  // In URLs, `#` starts a fragment. If the DB password contains `#`,
  // it must be percent-encoded; otherwise `pg` can throw "Invalid URL".
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

const connectionString = process.env.DATABASE_URL;
const normalizedConnectionString = normalizeDatabaseUrl(connectionString);

const pool = new Pool(
  normalizedConnectionString
    ? {
        connectionString: normalizedConnectionString,
        ssl,
        max: parseInt(process.env.DB_POOL_MAX || "10", 10),
      }
    : {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || "5432", 10),
        database: process.env.DB_NAME,
        max: parseInt(process.env.DB_POOL_MAX || "10", 10),
        ssl,
      }
);

module.exports = pool;
