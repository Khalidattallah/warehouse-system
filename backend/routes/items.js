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
    console.error("GET /items:", err.message);
    res.status(500).json({
      success: false,
      message: "خطأ في جلب الأصناف",
      error: err.message,
    });
  }
});

// POST /api/items/upload — رفع صورة فقط
router.post(
  "/upload",
  verifyToken,
  requireRole("admin", "warehouse_keeper"),
  upload.single("image"),
  (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "لا توجد صورة" });
      }
      const imageUrl = req.file.path || req.file.secure_url;
      console.log("✅ صورة رُفعت:", imageUrl);
      res.json({ success: true, image_url: imageUrl });
    } catch (err) {
      console.error("upload error:", err.message);
      res.status(500).json({
        success: false,
        message: "خطأ في رفع الصورة",
        error: err.message,
      });
    }
  },
);

// POST /api/items — إضافة صنف (بدون صورة — الصورة ترفع منفصلة)
router.post(
  "/",
  verifyToken,
  requireRole("admin", "warehouse_keeper"),
  async (req, res) => {
    try {
      console.log("POST /items body:", req.body);
      const {
        item_code,
        item_name,
        category,
        quantity,
        price,
        min_quantity,
        image_url,
      } = req.body;

      if (!item_code || !item_name || !price) {
        return res
          .status(400)
          .json({ success: false, message: "الكود والاسم والسعر مطلوبة" });
      }

      const [result] = await db.query(
        "INSERT INTO items (item_code, item_name, category, quantity, price, min_quantity, image_url) VALUES (?,?,?,?,?,?,?)",
        [
          item_code.trim(),
          item_name.trim(),
          category || "أخرى",
          Number(quantity) || 0,
          Number(price),
          Number(min_quantity) || 5,
          image_url || null,
        ],
      );

      res.status(201).json({
        success: true,
        message: "تم إضافة الصنف",
        id: result.insertId,
      });
    } catch (err) {
      console.error("POST /items:", err.message);
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

// PUT /api/items/:id — تعديل صنف (بدون صورة)
router.put(
  "/:id",
  verifyToken,
  requireRole("admin", "warehouse_keeper"),
  async (req, res) => {
    try {
      console.log("PUT /items/:id body:", req.body);
      const { item_name, category, quantity, price, min_quantity, image_url } =
        req.body;

      if (!item_name || !price) {
        return res
          .status(400)
          .json({ success: false, message: "الاسم والسعر مطلوبان" });
      }

      await db.query(
        "UPDATE items SET item_name=?, category=?, quantity=?, price=?, min_quantity=?, image_url=? WHERE id=?",
        [
          item_name.trim(),
          category || "أخرى",
          Number(quantity) || 0,
          Number(price),
          Number(min_quantity) || 5,
          image_url || null,
          req.params.id,
        ],
      );

      res.json({ success: true, message: "تم تحديث الصنف" });
    } catch (err) {
      console.error("PUT /items:", err.message);
      res
        .status(500)
        .json({ success: false, message: "خطأ في الخادم", error: err.message });
    }
  },
);

// DELETE /api/items/:id
router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    console.log("DELETE /items/:id =", req.params.id);

    await db.query("DELETE FROM items WHERE id = ?", [req.params.id]);

    res.json({ success: true, message: "تم حذف الصنف" });
  } catch (err) {
    console.error("❌ DELETE items:", err.message);
    res.status(500).json({
      success: false,
      message: "لا يمكن حذف الصنف — قد يكون مرتبطاً بطلبات",
      error: err.message,
    });
  }
});

module.exports = router;
