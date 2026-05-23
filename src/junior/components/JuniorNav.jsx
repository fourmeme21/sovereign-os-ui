// src/junior/components/JuniorNav.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./ekranlar.css";

const NAV_ITEMS = [
  { to: "/junior/gecmis", key: "history", icon: "📋" },
  { to: "/junior/hafiza", key: "memory",  icon: "🧠" },
  { to: "/junior/chat",   key: "chat",    icon: "💬" },
  { to: "/junior/baglan", key: "connect", icon: "🔗" },
];

export default function JuniorNav() {
  const navigate = useNavigate();
  const { t } = useTranslation("common");

  return (
    <div className="junior-nav">
      <button className="junior-back" onClick={() => navigate("/")}>
        ← {t("nav.home")}
      </button>
      <div className="junior-nav-items">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `junior-nav-item${isActive ? " junior-nav-active" : ""}`
            }
          >
            <span className="junior-nav-icon">{item.icon}</span>
            <span className="junior-nav-label">{t(`nav.${item.key}`)}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
