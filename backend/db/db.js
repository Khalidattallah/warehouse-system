const mysql = require("mysql2/promise");
require("dotenv").config();

let poolConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  charset: "utf8mb4",
};

// SSL مطلوب في الإنتاج مع Railway
if (process.env.NODE_ENV === "production") {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = mysql.createPool(poolConfig);

pool
  .getConnection()
  .then((conn) => {
    console.log("✅ تم الاتصال بقاعدة البيانات بنجاح");
    conn.release();
  })
  .catch((err) => {
    console.error("❌ فشل الاتصال:", err.message);
    console.error("❌ تفاصيل:", err);
  });

module.exports = pool;
