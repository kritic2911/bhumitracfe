require("dotenv").config();
const { Pool } = require("pg");

const ssl =
  process.env.DB_SSL === "true"
    ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" }
    : false;

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432", 10),
  database: process.env.DB_NAME,
  max: parseInt(process.env.DB_POOL_MAX || "10", 10),
  ssl,
});

module.exports = pool;
