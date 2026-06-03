const express = require("express");
const router = express.Router();
const db = require("../db/db");
const upload = require("../middleware/upload");
const { verifyToken, requireRole } = require("../middleware/auth");

// GET /api/items
router.get("/", verifyToken, async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = "SELECT * FROM items WHERE 1=1";
    const params = [];

    if (category && category !== "الكل") {
      query += " AND category = ?";
      params.push(category);
    }
    if (search) {
      query += " AND (item_name LIKE ? OR item_code LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }
    query += " ORDER BY created_at DESC";

    const [rows] = await db.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("❌ items GET:", err.message);
    res.status(500).json({
      success: false,
      message: "خطأ في جلب الأصناف",
      error: err.message,
    });
  }
});

// POST /api/items — إضافة صنف مع صورة اختيارية
router.post(
  "/",
  verifyToken,
  requireRole("admin", "warehouse_keeper"),
  upload.single("image"),
  async (req, res) => {
    try {
      console.log("=== إضافة صنف ===");
      console.log("body:", req.body);
      console.log("file:", req.file);

      const { item_code, item_name, category, quantity, price, min_quantity } =
        req.body;

      if (!item_code || !item_name || !price) {
        return res
          .status(400)
          .json({ success: false, message: "الكود والاسم والسعر مطلوبة" });
      }

      // رابط الصورة من Cloudinary أو null
      const image_url = req.file ? req.file.path : req.body.image_url || null;

      const [result] = await db.query(
        "INSERT INTO items (item_code, item_name, category, quantity, price, min_quantity, image_url) VALUES (?,?,?,?,?,?,?)",
        [
          item_code,
          item_name,
          category || "أخرى",
          Number(quantity) || 0,
          Number(price),
          Number(min_quantity) || 5,
          image_url,
        ],
      );

      res.status(201).json({
        success: true,
        message: "تم إضافة الصنف بنجاح",
        id: result.insertId,
      });
    } catch (err) {
      console.error("❌ items POST:", err.message);
      if (err.code === "ER_DUP_ENTRY") {
        return res
          .status(400)
          .json({ success: false, message: "كود الصنف موجود مسبقاً" });
      }
      res
        .status(500)
        .json({ success: false, message: "خطأ في الخادم", error: err.message });
    }
  },
);

// PUT /api/items/:id — تعديل صنف مع صورة اختيارية
router.put(
  "/:id",
  verifyToken,
  requireRole("admin", "warehouse_keeper"),
  upload.single("image"),
  async (req, res) => {
    try {
      console.log("=== PUT /items/:id ===");
      console.log("id:", req.params.id);
      console.log("body:", req.body);
      console.log("file:", req.file ? "✅ صورة موجودة" : "❌ لا صورة");

      const { item_name, category, quantity, price, min_quantity, image_url } =
        req.body;

      if (!item_name || !price) {
        return res
          .status(400)
          .json({ success: false, message: "الاسم والسعر مطلوبان" });
      }

      const finalImageUrl = req.file ? req.file.path : image_url || null;

      console.log("finalImageUrl:", finalImageUrl);

      const [result] = await db.query(
        "UPDATE items SET item_name=?, category=?, quantity=?, price=?, min_quantity=?, image_url=? WHERE id=?",
        [
          item_name,
          category || "أخرى",
          Number(quantity) || 0,
          Number(price),
          Number(min_quantity) || 5,
          finalImageUrl,
          req.params.id,
        ],
      );

      console.log("result:", result);
      res.json({ success: true, message: "تم تحديث الصنف بنجاح" });
    } catch (err) {
      console.error("❌ PUT /items error:", err.message);
      console.error("❌ stack:", err.stack);
      res.status(500).json({
        success: false,
        message: "خطأ في الخادم",
        error: err.message,
      });
    }
  },
);

// DELETE /api/items/:id
router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    await db.query("DELETE FROM items WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "تم حذف الصنف" });
  } catch (err) {
    res.status(500).json({ success: false, message: "لا يمكن حذف الصنف" });
  }
});

module.exports = router;
