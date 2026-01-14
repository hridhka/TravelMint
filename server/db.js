import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool
  .connect()
  .then(() => console.log("✅ DB connected"))
  .catch((err) => {
    console.error("❌ DB error:", err);
    process.exit(1);
  });

export default pool;
