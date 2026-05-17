import { NavLink, useNavigate } from "react-router-dom";
import "./ekranlar.css";

const NAV_ITEMS = [
  { to: "/junior/gecmis", label: "Geçmiş", icon: "📋" },
  { to: "/junior/hafiza", label: "Hafıza",  icon: "🧠" },
  { to: "/junior/chat",   label: "Chat",    icon: "💬" },
  { to: "/junior/baglan", label: "Bağlan",  icon: "🔗" },
];

export default function JuniorNav() {
  const navigate = useNavigate();

  return (
    <div className="junior-nav">
      <button className="junior-back" onClick={() => navigate("/")}>
        ← Ana Ekran
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
            <span className="junior-nav-label">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
