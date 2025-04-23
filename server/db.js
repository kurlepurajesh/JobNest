const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.NODE_ENV === "production"
    ? process.env.DATABASE_URL
    : `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  ssl: process.env.NODE_ENV === "production" 
    ? { rejectUnauthorized: false }
    : false
});

module.exports = pool;
