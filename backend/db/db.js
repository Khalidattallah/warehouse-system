const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool(process.env.DATABASE_URL);

pool
  .getConnection()
  .then((conn) => {
    console.log("✅ تم الاتصال بقاعدة البيانات بنجاح");
    conn.release();
  })
  .catch((err) => {
    console.error("❌ فشل الاتصال:", err.message);
  });

module.exports = pool;
