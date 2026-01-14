import pkg from "pg";
const { Pool } = pkg;

const DATABASE_URL =
  "postgresql://neondb_owner:npg_FYkQ9IVKL1iU@ep-shiny-sunset-ahhda79v-pooler.c-3.us-east-1.aws.neon.tech/neondb";

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool
  .connect()
  .then(() => {
    console.log("✅ Connected to PostgreSQL database");
  })
  .catch((err) => {
    console.error("❌ PostgreSQL connection error:", err.message);
    process.exit(1);
  });

export default pool;
