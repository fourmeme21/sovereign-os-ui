// src/junior/components/JuniorNav.jsx
import { NavLink } from "react-router-dom";
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
  { code: "en", flag: "🇬🇧", label: "EN" },
  { code: "tr", flag: "🇹🇷", label: "TR" },
  { code: "ja", flag: "🇯🇵", label: "JA" },
  { code: "de", flag: "🇩🇪", label: "DE" },
];

export default function JuniorNav() {
  const { t } = useTranslation("common");
  const [current, setCurrent] = useState(i18n.language?.slice(0, 2) ?? "en");

  const changeLang = (code) => {
    i18n.changeLanguage(code);
    setCurrent(code);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>

      {/* ── Ana Nav ── */}
      <div className="junior-nav">
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

      {/* ── Dil Şeridi ── */}
      <div style={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: 4,
        padding: "4px 12px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: "rgba(0,0,0,0.2)",
      }}>
        {LANGUAGES.map((lang) => {
          const isActive = current === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => changeLang(lang.code)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 8px",
                borderRadius: 10,
                border: isActive
                  ? "1px solid rgba(45,212,191,0.35)"
                  : "1px solid transparent",
                background: isActive
                  ? "rgba(45,212,191,0.08)"
                  : "transparent",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: isActive ? 700 : 400,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.06em",
                color: isActive ? "#2DD4BF" : "rgba(255,255,255,0.3)",
                transition: "all .15s",
              }}
            >
              <span style={{ fontSize: 13 }}>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
