import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";

const categories = ["الكل", "بورسلين", "رخام", "حوائط", "أرضيات", "أخرى"];

export default function Items() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("الكل");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const [itemCode, setItemCode] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemCat, setItemCat] = useState("بورسلين");
  const [itemQty, setItemQty] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemMinQty, setItemMinQty] = useState("5");
  const [itemImgUrl, setItemImgUrl] = useState("");

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category !== "الكل") params.category = category;
      if (search) params.search = search;
      const res = await api.get("/items", { params });
      setItems(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [category, search]);

  const openAdd = () => {
    setEditItem(null);
    setItemCode("");
    setItemName("");
    setItemCat("بورسلين");
    setItemQty("");
    setItemPrice("");
    setItemMinQty("5");
    setItemImgUrl("");
    setImagePreview("");
    setImageFile(null);
    setError("");
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setItemCode(item.item_code);
    setItemName(item.item_name);
    setItemCat(item.category);
    setItemQty(String(item.quantity));
    setItemPrice(String(item.price));
    setItemMinQty(String(item.min_quantity));
    setItemImgUrl(item.image_url || "");
    setImagePreview(item.image_url || "");
    setImageFile(null);
    setError("");
    setShowModal(true);
  };

  const handleImageChange = (file) => {
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!itemCode.trim()) {
      setError("كود الصنف مطلوب");
      return;
    }
    if (!itemName.trim()) {
      setError("اسم الصنف مطلوب");
      return;
    }
    if (!itemPrice) {
      setError("السعر مطلوب");
      return;
    }

    setSaving(true);
    setError("");

    try {
      // نستخدم FormData لإرسال الصورة مع البيانات
      const formData = new FormData();
      formData.append("item_code", itemCode.trim());
      formData.append("item_name", itemName.trim());
      formData.append("category", itemCat);
      formData.append("quantity", itemQty || "0");
      formData.append("price", itemPrice);
      formData.append("min_quantity", itemMinQty || "5");

      // أضف الصورة إذا اختار المستخدم صورة جديدة
      if (imageFile) {
        formData.append("image", imageFile);
      } else if (itemImgUrl) {
        formData.append("image_url", itemImgUrl);
      }

      if (editItem) {
        await api.put(`/items/${editItem.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/items", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setShowModal(false);
      fetchItems();
    } catch (err) {
      console.error(err.response?.data);
      setError(err.response?.data?.message || "خطأ في الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من الحذف؟")) return;
    try {
      await api.delete(`/items/${id}`);
      fetchItems();
    } catch (err) {
      alert("لا يمكن حذف هذا الصنف");
    }
  };

  return (
    <Layout title="إدارة الأصناف">
      <div style={styles.toolbar}>
        <input
          type="text"
          placeholder="🔍 ابحث باسم الصنف أو الكود..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
        <div style={styles.cats}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                ...styles.catBtn,
                background: category === cat ? "#1D9E75" : "#fff",
                color: category === cat ? "#fff" : "#555",
                border:
                  category === cat
                    ? "1.5px solid #1D9E75"
                    : "1.5px solid #e0e0e0",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
        <button onClick={openAdd} style={styles.addBtn}>
          + إضافة صنف
        </button>
      </div>

      <div style={styles.tableCard}>
        {loading ? (
          <div style={styles.center}>جاري التحميل...</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>الصورة</th>
                <th style={styles.th}>الكود</th>
                <th style={styles.th}>اسم الصنف</th>
                <th style={styles.th}>الفئة</th>
                <th style={styles.th}>الكمية</th>
                <th style={styles.th}>السعر</th>
                <th style={styles.th}>الحالة</th>
                <th style={styles.th}>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const isLow = item.quantity <= item.min_quantity;
                return (
                  <tr key={item.id} style={styles.tr}>
                    <td style={styles.td}>
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.item_name}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 6,
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 6,
                            background: "#f5f7fa",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 20,
                          }}
                        >
                          🪨
                        </div>
                      )}
                    </td>
                    <td
                      style={{
                        ...styles.td,
                        fontFamily: "monospace",
                        color: "#1D9E75",
                      }}
                    >
                      {item.item_code}
                    </td>
                    <td style={{ ...styles.td, fontWeight: 500 }}>
                      {item.item_name}
                    </td>
                    <td style={styles.td}>
                      <span style={styles.catBadge}>{item.category}</span>
                    </td>
                    <td
                      style={{
                        ...styles.td,
                        fontWeight: 600,
                        color: isLow ? "#ef4444" : "#1a1a1a",
                      }}
                    >
                      {item.quantity}
                    </td>
                    <td style={{ ...styles.td, fontWeight: 600 }}>
                      {Number(item.price).toLocaleString()} ج.س
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          background: isLow ? "#fef2f2" : "#e8f5f0",
                          color: isLow ? "#ef4444" : "#1D9E75",
                          padding: "3px 10px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                      >
                        {isLow ? "⚠️ نقص" : "✅ متوفر"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        <button
                          onClick={() => openEdit(item)}
                          style={styles.editBtn}
                        >
                          ✏️ تعديل
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          style={styles.deleteBtn}
                        >
                          🗑️ حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {!loading && items.length === 0 && (
          <div style={styles.center}>لا توجد أصناف</div>
        )}
      </div>

      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editItem ? "تعديل الصنف" : "إضافة صنف جديد"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={styles.closeBtn}
              >
                ✕
              </button>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.formGrid}>
              <div>
                <label style={styles.label}>كود الصنف *</label>
                <input
                  style={styles.input}
                  value={itemCode}
                  onChange={(e) => setItemCode(e.target.value)}
                  placeholder="مثال: ITM004"
                  disabled={!!editItem}
                />
              </div>
              <div>
                <label style={styles.label}>اسم الصنف *</label>
                <input
                  style={styles.input}
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="مثال: بورسلين 60×60"
                />
              </div>
              <div>
                <label style={styles.label}>الفئة</label>
                <select
                  style={styles.input}
                  value={itemCat}
                  onChange={(e) => setItemCat(e.target.value)}
                >
                  {categories.slice(1).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={styles.label}>الكمية</label>
                <input
                  style={styles.input}
                  type="number"
                  min="0"
                  value={itemQty}
                  onChange={(e) => setItemQty(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <label style={styles.label}>السعر (ج.س) *</label>
                <input
                  style={styles.input}
                  type="number"
                  min="0"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <label style={styles.label}>الحد الأدنى للتنبيه</label>
                <input
                  style={styles.input}
                  type="number"
                  min="0"
                  value={itemMinQty}
                  onChange={(e) => setItemMinQty(e.target.value)}
                  placeholder="5"
                />
              </div>

              {/* رفع الصورة */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={styles.label}>صورة الصنف</label>
                <div
                  style={styles.uploadArea}
                  onClick={() => document.getElementById("imgInput").click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = "#1D9E75";
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e0e0e0";
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = "#e0e0e0";
                    handleImageChange(e.dataTransfer.files[0]);
                  }}
                >
                  {imagePreview ? (
                    <div>
                      <img
                        src={imagePreview}
                        alt="معاينة"
                        style={{
                          maxHeight: 140,
                          maxWidth: "100%",
                          borderRadius: 8,
                          objectFit: "cover",
                        }}
                      />
                      <div
                        style={{ fontSize: 12, color: "#888", marginTop: 6 }}
                      >
                        اضغط لتغيير الصورة
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: 36, marginBottom: 8 }}>📸</div>
                      <div style={{ fontSize: 13, color: "#888" }}>
                        اضغط لاختيار صورة أو اسحبها هنا
                      </div>
                      <div
                        style={{ fontSize: 11, color: "#bbb", marginTop: 4 }}
                      >
                        JPG, PNG, WebP — حجم أقصى 5MB
                      </div>
                    </div>
                  )}
                </div>
                <input
                  id="imgInput"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => handleImageChange(e.target.files[0])}
                />
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button
                onClick={() => setShowModal(false)}
                style={styles.cancelBtn}
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ ...styles.saveBtn, opacity: saving ? 0.7 : 1 }}
              >
                {saving
                  ? "جاري الحفظ..."
                  : editItem
                    ? "حفظ التعديلات"
                    : "إضافة الصنف"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

const styles = {
  toolbar: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    marginBottom: "1rem",
    flexWrap: "wrap",
  },
  searchInput: {
    padding: "9px 14px",
    border: "1.5px solid #e0e0e0",
    borderRadius: 8,
    fontSize: 13,
    width: 220,
    outline: "none",
    direction: "rtl",
  },
  cats: { display: "flex", gap: 6, flex: 1, flexWrap: "wrap" },
  catBtn: {
    padding: "7px 14px",
    borderRadius: 20,
    fontSize: 12,
    cursor: "pointer",
    fontWeight: 500,
    transition: "all .15s",
  },
  addBtn: {
    padding: "9px 18px",
    background: "linear-gradient(135deg,#1D9E75,#0d6e50)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  tableCard: {
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { borderBottom: "2px solid #e5e7eb", background: "#f9fafb" },
  th: {
    padding: 12,
    textAlign: "right",
    fontSize: 12,
    color: "#888",
    fontWeight: 600,
  },
  tr: { borderBottom: "1px solid #f3f4f6" },
  td: { padding: 12, textAlign: "right", fontSize: 13, color: "#1a1a1a" },
  catBadge: {
    background: "#e8f5f0",
    color: "#1D9E75",
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 500,
  },
  actions: { display: "flex", gap: 6 },
  editBtn: {
    padding: "5px 10px",
    background: "#eff6ff",
    color: "#3b82f6",
    border: "1px solid #bfdbfe",
    borderRadius: 6,
    fontSize: 12,
    cursor: "pointer",
  },
  deleteBtn: {
    padding: "5px 10px",
    background: "#fef2f2",
    color: "#ef4444",
    border: "1px solid #fecaca",
    borderRadius: 6,
    fontSize: 12,
    cursor: "pointer",
  },
  center: { textAlign: "center", padding: "3rem", color: "#888" },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "1rem",
  },
  modal: {
    background: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 560,
    direction: "rtl",
    overflow: "hidden",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalHeader: {
    padding: "1.25rem 1.5rem",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    background: "#fff",
    zIndex: 1,
  },
  modalTitle: { fontSize: 17, fontWeight: 700, color: "#1a1a1a", margin: 0 },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: 18,
    cursor: "pointer",
    color: "#888",
  },
  error: {
    margin: "1rem 1.5rem 0",
    background: "#fef2f2",
    color: "#dc2626",
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 13,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
    padding: "1.5rem",
  },
  label: {
    display: "block",
    fontSize: 13,
    color: "#555",
    marginBottom: 5,
    fontWeight: 500,
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1.5px solid #e0e0e0",
    borderRadius: 8,
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
    direction: "rtl",
    background: "#fafafa",
  },
  uploadArea: {
    border: "2px dashed #e0e0e0",
    borderRadius: 10,
    padding: "1rem",
    textAlign: "center",
    cursor: "pointer",
    background: "#fafafa",
    transition: "border .2s",
    minHeight: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalFooter: {
    padding: "1rem 1.5rem",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    gap: 10,
    justifyContent: "flex-end",
    position: "sticky",
    bottom: 0,
    background: "#fff",
  },
  cancelBtn: {
    padding: "9px 20px",
    background: "#f3f4f6",
    color: "#555",
    border: "none",
    borderRadius: 8,
    fontSize: 13,
    cursor: "pointer",
  },
  saveBtn: {
    padding: "9px 24px",
    background: "linear-gradient(135deg,#1D9E75,#0d6e50)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
};
