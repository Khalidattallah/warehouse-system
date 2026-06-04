import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const menuItems = [
  {
    path: "/dashboard",
    label: "لوحة التحكم",
    icon: "📊",
    roles: ["admin", "warehouse_keeper", "accountant"],
  },
  {
    path: "/items",
    label: "إدارة الأصناف",
    icon: "📦",
    roles: ["admin", "warehouse_keeper"],
  },
  { path: "/suppliers", label: "الموردون", icon: "🏢", roles: ["admin"] },
  {
    path: "/orders",
    label: "الطلبات",
    icon: "📋",
    roles: ["admin", "warehouse_keeper", "accountant"],
  },
  {
    path: "/customers",
    label: "العملاء",
    icon: "👥",
    roles: ["admin", "accountant"],
  },
  {
    path: "/reports",
    label: "التقارير",
    icon: "📈",
    roles: ["admin", "accountant"],
  },
  { path: "/store", label: "المتجر", icon: "🛒", roles: ["admin", "customer"] },
  { path: "/users", label: "المستخدمون", icon: "⚙️", roles: ["admin"] },
];

const roleNames = {
  admin: "مدير النظام",
  warehouse_keeper: "أمين المخزن",
  accountant: "محاسب",
  customer: "عميل",
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const visibleItems = menuItems.filter((item) =>
    item.roles.includes(user?.role),
  );

  const handleNavClick = () => {
    // أغلق السايدبار على الجوال عند الضغط على أي رابط
    if (window.innerWidth < 768) setOpen(false);
  };

  return (
    <>
      {/* زر فتح السايدبار على الجوال */}
      <button
        onClick={() => setOpen(!open)}
        style={styles.menuBtn}
        aria-label="فتح القائمة"
      >
        {open ? "✕" : "☰"}
      </button>

      {/* خلفية داكنة عند فتح السايدبار على الجوال */}
      {open && <div style={styles.overlay} onClick={() => setOpen(false)} />}

      {/* السايدبار */}
      <div
        className={`sidebar-container ${open ? "open" : ""}`}
        style={{
          ...styles.sidebar,
          transform: open
            ? "translateX(0)"
            : window.innerWidth < 768
              ? "translateX(100%)"
              : "translateX(0)",
        }}
      >
        {/* الشعار */}
        <div style={styles.logo}>
          <div style={styles.logoIcon}>🏭</div>
          <div>
            <div style={styles.logoTitle}>نظام المخازن</div>
            <div style={styles.logoSub}>إدارة إلكترونية</div>
          </div>
          {/* زر إغلاق داخل السايدبار على الجوال */}
          <button
            onClick={() => setOpen(false)}
            style={styles.closeBtn}
            aria-label="إغلاق القائمة"
          >
            ✕
          </button>
        </div>

        {/* بيانات المستخدم */}
        <div style={styles.userBox}>
          <div style={styles.avatar}>{user?.full_name?.charAt(0)}</div>
          <div>
            <div style={styles.userName}>{user?.full_name}</div>
            <div style={styles.userRole}>{roleNames[user?.role]}</div>
          </div>
        </div>

        {/* القائمة */}
        <nav style={styles.nav}>
          {visibleItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              style={({ isActive }) => ({
                ...styles.navItem,
                background: isActive ? "#e8f5f0" : "transparent",
                color: isActive ? "#1D9E75" : "#6b7280",
                borderRight: isActive
                  ? "3px solid #1D9E75"
                  : "3px solid transparent",
                fontWeight: isActive ? "600" : "400",
              })}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* تسجيل الخروج */}
        <div style={styles.logoutBox}>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            🚪 تسجيل الخروج
          </button>
        </div>
      </div>
    </>
  );
}

const styles = {
  menuBtn: {
    display: "none",
    position: "fixed",
    top: "12px",
    right: "12px",
    zIndex: 1001,
    width: "42px",
    height: "42px",
    borderRadius: "10px",
    background: "#1D9E75",
    color: "#fff",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    // يظهر فقط على الجوال — نتحكم فيه بـ CSS
    "@media (max-width: 768px)": {
      display: "flex",
    },
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    zIndex: 999,
    display: "none",
  },
  sidebar: {
    width: "230px",
    minHeight: "100vh",
    background: "#fff",
    borderLeft: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    transition: "transform .3s ease",
    zIndex: 1000,
  },
  logo: {
    padding: "1.25rem 1rem",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logoIcon: {
    width: "40px",
    height: "40px",
    background: "linear-gradient(135deg,#1D9E75,#0d6e50)",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    flexShrink: 0,
  },
  logoTitle: { fontWeight: "700", fontSize: "14px", color: "#1a1a1a" },
  logoSub: { fontSize: "11px", color: "#888", marginTop: "1px" },
  closeBtn: {
    display: "none",
    marginRight: "auto",
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "#888",
    padding: "4px",
  },
  userBox: {
    padding: "1rem",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#f9fafb",
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "linear-gradient(135deg,#1D9E75,#0d6e50)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "15px",
    fontWeight: "700",
    flexShrink: 0,
  },
  userName: { fontSize: "13px", fontWeight: "600", color: "#1a1a1a" },
  userRole: { fontSize: "11px", color: "#1D9E75", marginTop: "1px" },
  nav: {
    flex: 1,
    padding: "8px 0",
    overflowY: "auto",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "11px 16px",
    fontSize: "13px",
    textDecoration: "none",
    transition: "all .15s",
  },
  navIcon: { fontSize: "17px", flexShrink: 0 },
  logoutBox: {
    padding: "1rem",
    borderTop: "1px solid #e5e7eb",
  },
  logoutBtn: {
    width: "100%",
    padding: "9px",
    background: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
  },
};
