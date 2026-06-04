import Sidebar from "./Sidebar";
import Notifications from "./Notifications";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children, title }) {
  const { user } = useAuth();
  const showNotifications = user?.role !== "customer";

  return (
    <div style={styles.wrap}>
      {/* CSS للجوال */}
      <style>{`
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .menu-btn { display: flex !important; }
          .sidebar-mobile { position: fixed !important; top: 0; right: 0; height: 100vh; box-shadow: -4px 0 20px rgba(0,0,0,0.15); }
          .sidebar-mobile .close-btn { display: flex !important; }
          .overlay-mobile { display: block !important; }
          .main-content { margin-right: 0 !important; }
          .topbar-title { padding-right: 60px; }
        }
        @media (min-width: 769px) {
          .menu-btn { display: none !important; }
          .overlay-mobile { display: none !important; }
        }
      `}</style>

      <Sidebar />

      <div style={styles.main} className="main-content">
        {/* شريط العنوان */}
        <div style={styles.topbar}>
          <div className="topbar-title">
            <h1 style={styles.pageTitle}>{title}</h1>
            <p style={styles.pageDate}>
              {new Date().toLocaleDateString("ar-SA", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          {showNotifications && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Notifications />
            </div>
          )}
        </div>

        {/* المحتوى */}
        <div style={styles.content}>{children}</div>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    display: "flex",
    minHeight: "100vh",
    direction: "rtl",
    background: "#f5f7fa",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minWidth: 0,
  },
  topbar: {
    padding: "1rem 1.5rem",
    background: "#fff",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pageTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: 0,
  },
  pageDate: {
    fontSize: "12px",
    color: "#888",
    marginTop: "2px",
  },
  content: {
    flex: 1,
    padding: "1.5rem",
    overflowY: "auto",
  },
};
