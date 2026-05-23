// src/junior/components/JuniorNav.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import i18n from "../../i18n/index";
import "./ekranlar.css";

const NAV_ITEMS = [
  { to: "/junior/gecmis", key: "history", icon: "📋" },
  { to: "/junior/hafiza", key: "memory",  icon: "🧠" },
  { to: "/junior/chat",   key: "chat",    icon: "💬" },
  { to: "/junior/baglan", key: "connect", icon: "🔗" },
];

const LANGUAGES = [
  { code: "en", flag: "🇬🇧" },
  { code: "tr", flag: "🇹🇷" },
  { code: "ja", flag: "🇯🇵" },
  { code: "de", flag: "🇩🇪" },
];

export default function JuniorNav() {
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const [current, setCurrent] = useState(i18n.language?.slice(0, 2) ?? "en");

  const changeLang = (code) => {
    i18n.changeLanguage(code);
    setCurrent(code);
  };

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

      {/* ── Dil Seçici ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        padding: "3px 4px",
        marginLeft: "auto",
        flexShrink: 0,
      }}>
        {LANGUAGES.map((lang) => {
          const isActive = current === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => changeLang(lang.code)}
              title={lang.code.toUpperCase()}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 28,
                height: 28,
                borderRadius: 16,
                border: "none",
                background: isActive
                  ? "rgba(45,212,191,0.15)"
                  : "transparent",
                boxShadow: isActive
                  ? "inset 0 0 0 1px rgba(45,212,191,0.4)"
                  : "none",
                cursor: "pointer",
                fontSize: 16,
                lineHeight: 1,
                opacity: isActive ? 1 : 0.45,
                transition: "all .15s",
                padding: 0,
              }}
            >
              {lang.flag}
            </button>
          );
        })}
      </div>
    </div>
  );
}
