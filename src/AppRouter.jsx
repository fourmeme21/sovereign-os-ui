// src/AppRouter.jsx
// Phase C — /junior rotalarına auth guard eklendi
// Phase D — fiyatlandirma + odeme-basarili + ayarlar rotaları eklendi

import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage          from "./screens/LandingPage";
import WaitlistAdmin        from "./screens/WaitlistAdmin";
import LegalScreen          from "./screens/LegalScreen";
import PricingScreen        from "./screens/PricingScreen";
import { SettingsScreen }   from "./screens/SettingsScreen";
import PaymentSuccessScreen from "./screens/PaymentSuccessScreen";
import JuniorLayout         from "./junior/components/JuniorLayout";
import KararGecmisi         from "./junior/screens/KararGecmisi";
import ProjHafizasi         from "./junior/screens/ProjHafizasi";
import Baglan               from "./junior/screens/Baglan";
import ChatScreen           from "./junior/screens/ChatScreen";
import { useAuth }          from "./junior/hooks/useAuth";

const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASSWORD ?? "sovereign";

// -- ADMIN GATE (değişmedi) ----------------------------------------
function AdminGate({ children }) {
  const [input, setInput] = useState("");
  const [ok,    setOk]    = useState(false);
  const [shake, setShake] = useState(false);

  const check = () => {
    if (input === ADMIN_PASS) {
      setOk(true);
    } else {
      setShake(true);
      setInput("");
      setTimeout(() => setShake(false), 500);
    }
  };

  if (ok) return children;

  return (
    <div style={{
      minHeight: "100vh", background: "#0F0F0F",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter',system-ui,sans-serif",
    }}>
      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          15%{transform:translateX(-8px)}
          30%{transform:translateX(8px)}
          45%{transform:translateX(-6px)}
          60%{transform:translateX(6px)}
          75%{transform:translateX(-3px)}
          90%{transform:translateX(3px)}
        }
      `}</style>
      <div style={{
        width: 320, padding: "36px 28px",
        background: "#1A1A1A", border: "1px solid #2A2A2A",
        borderRadius: 14, textAlign: "center",
        animation: shake ? "shake .5s ease" : "none",
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, margin: "0 auto 20px",
          background: "linear-gradient(135deg,#7C3AED,#9061F9)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, color: "#fff", fontWeight: 800,
        }}>S</div>

        <div style={{ fontSize: 16, fontWeight: 700, color: "#EDEDEC", marginBottom: 6 }}>
          Admin Girişi
        </div>
        <div style={{ fontSize: 12, color: "#555550", marginBottom: 24, fontFamily: "'JetBrains Mono',monospace" }}>
          sovereign-engine · waitlist
        </div>

        <input
          type="password"
          placeholder="Şifre"
          value={input}
          autoFocus
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && check()}
          style={{
            width: "100%", background: "#0F0F0F",
            border: "1px solid #2A2A2A", borderRadius: 8,
            padding: "11px 14px", color: "#EDEDEC",
            fontSize: 14, fontFamily: "inherit", outline: "none",
            marginBottom: 12, caretColor: "#7C3AED",
          }}
        />

        <button
          onClick={check}
          disabled={!input}
          style={{
            width: "100%", padding: "11px",
            borderRadius: 8, border: "none",
            background: input ? "#7C3AED" : "#2A2A2A",
            color: input ? "#fff" : "#555550",
            fontSize: 13, fontWeight: 700,
            cursor: input ? "pointer" : "not-allowed",
            fontFamily: "inherit", transition: "all .15s",
          }}
        >
          Giriş →
        </button>
      </div>
    </div>
  );
}

// -- AUTH GUARD — /junior rotaları için -------------------------
function AuthGuard({ children }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{
      minHeight: "100vh", background: "#0F0F0F",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <span style={{ fontSize: 12, color: "#555550", fontFamily: "'JetBrains Mono',monospace" }}>
        Yükleniyor...
      </span>
    </div>
  );

  if (!user) return <Navigate to="/junior/chat" replace />;

  return children;
}

// -- ROUTER -------------------------------------------------------
export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/legal/:type" element={<LegalScreen />} />

      <Route
        path="/admin/waitlist"
        element={
          <AdminGate>
            <WaitlistAdmin />
          </AdminGate>
        }
      />

      <Route path="/junior" element={<JuniorLayout />}>
        <Route path="chat" element={<ChatScreen />} />

        <Route index element={
          <AuthGuard><KararGecmisi /></AuthGuard>
        } />
        <Route path="gecmis" element={
          <AuthGuard><KararGecmisi /></AuthGuard>
        } />
        <Route path="hafiza" element={
          <AuthGuard><ProjHafizasi /></AuthGuard>
        } />
        <Route path="baglan" element={
          <AuthGuard><Baglan /></AuthGuard>
        } />
        <Route path="fiyatlandirma" element={<PricingScreen />} />
        <Route path="odeme-basarili" element={
          <AuthGuard><PaymentSuccessScreen /></AuthGuard>
        } />
        <Route path="ayarlar" element={
          <AuthGuard>
            <SettingsScreen lang="tr" onLangChange={() => {}} onClear={() => {}} />
          </AuthGuard>
        } />
      </Route>
    </Routes>
  );
}
