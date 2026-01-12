import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "travel_user",
  password: process.env.DB_PASSWORD,
  database: "travel_tracker",
  port: 3306,
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
    return;
  }
  console.log("✅ MySQL connected successfully");
});

export default db;
