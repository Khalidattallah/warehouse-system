
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