// src/screens/Login.tsx
// Session 10: "Şifremi unuttum" akışı eklendi — resetPassword (Supabase)
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../junior/hooks/useAuth";

type Mode = "password" | "otp" | "reset";

export default function LoginScreen() {
  const navigate = useNavigate();
  const { signIn, signInWithOtp, resetPassword } = useAuth();

  const [mode,      setMode]      = useState<Mode>("password");
  const [email,     setEmail]     = useState("");
  const [pass,      setPass]      = useState("");
  const [otpSent,   setOtpSent]   = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [loading,   setLoading]   = useState(false);

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    setOtpSent(false);
    setResetSent(false);
  };

  // ── Şifre ile giriş ─────────────────────────────────────────
  const handlePassword = async () => {
    if (!email || !pass) return;
    setLoading(true); setError(null);
    try {
      await signIn(email, pass);
      navigate("/onboarding");
    } catch (e: any) {
      setError(e.message ?? "Giriş başarısız");
    } finally {
      setLoading(false);
    }
  };

  // ── Magic link ───────────────────────────────────────────────
  const handleOtp = async () => {
    if (!email) return;
    setLoading(true); setError(null);
    try {
      await signInWithOtp(email);
      setOtpSent(true);
    } catch (e: any) {
      setError(e.message ?? "Link gönderilemedi");
    } finally {
      setLoading(false);
    }
  };

  // ── Şifremi unuttum ──────────────────────────────────────────
  const handleReset = async () => {
    if (!email) return;
    setLoading(true); setError(null);
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (e: any) {
      setError(e.message ?? "Sıfırlama maili gönderilemedi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0F0F0F",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', system-ui, sans-serif", padding: 16,
    }}>
      <div style={{
        width: "100%", maxWidth: 360,
        background: "#1A1A1A", border: "1px solid #2A2A2A",
        borderRadius: 16, padding: "36px 28px",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, margin: "0 auto 14px",
            background: "linear-gradient(135deg,#7C3AED,#9061F9)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, color: "#fff", fontWeight: 800,
          }}>S</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#EDEDEC" }}>
            {mode === "reset" ? "Şifre Sıfırla" : "Giriş Yap"}
          </div>
          <div style={{
            fontSize: 11, color: "#555550", marginTop: 4,
            fontFamily: "'JetBrains Mono', monospace",
          }}>sovereign-engine · auth</div>
        </div>

        {/* Mode toggle — reset modunda gizle */}
        {mode !== "reset" && (
          <div style={{
            display: "flex", background: "#0F0F0F",
            border: "1px solid #2A2A2A", borderRadius: 8, padding: 3, marginBottom: 20,
          }}>
            {(["password", "otp"] as const).map(m => (
              <button key={m} onClick={() => switchMode(m)}
                style={{
                  flex: 1, padding: "7px 0", borderRadius: 6, border: "none", cursor: "pointer",
                  background: mode === m ? "#7C3AED" : "transparent",
                  color: mode === m ? "#fff" : "#555550",
                  fontSize: 11, fontWeight: 600,
                  fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".04em",
                  transition: "all .15s",
                }}>
                {m === "password" ? "Şifre" : "Magic Link"}
              </button>
            ))}
          </div>
        )}

        {/* ── MAGIC LINK GÖNDERILDI ── */}
        {otpSent && (
          <div style={{
            padding: "14px", borderRadius: 10, textAlign: "center",
            background: "#7C3AED18", border: "1px solid #7C3AED40",
          }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>📬</div>
            <div style={{ fontSize: 13, color: "#EDEDEC", fontWeight: 600 }}>Link gönderildi</div>
            <div style={{ fontSize: 11, color: "#777770", marginTop: 4 }}>{email}</div>
            <button onClick={() => setOtpSent(false)} style={{
              marginTop: 12, background: "transparent", border: "none",
              color: "#7C3AED", fontSize: 11, cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace",
            }}>← Geri</button>
          </div>
        )}

        {/* ── SIFIRLAMA MAILI GÖNDERILDI ── */}
        {resetSent && (
          <div style={{
            padding: "14px", borderRadius: 10, textAlign: "center",
            background: "#7C3AED18", border: "1px solid #7C3AED40",
          }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>✉️</div>
            <div style={{ fontSize: 13, color: "#EDEDEC", fontWeight: 600 }}>Sıfırlama linki gönderildi</div>
            <div style={{ fontSize: 11, color: "#777770", marginTop: 4 }}>{email}</div>
            <div style={{ fontSize: 11, color: "#555550", marginTop: 8, lineHeight: 1.5 }}>
              Maildeki linke tıkla, yeni şifreni belirle.
            </div>
            <button onClick={() => { setResetSent(false); switchMode("password"); }} style={{
              marginTop: 12, background: "transparent", border: "none",
              color: "#7C3AED", fontSize: 11, cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace",
            }}>← Girişe dön</button>
          </div>
        )}

        {/* ── FORM ── */}
        {!otpSent && !resetSent && (
          <>
            <input
              type="email" placeholder="E-posta" value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => {
                if (e.key !== "Enter") return;
                if (mode === "password") handlePassword();
                else if (mode === "otp") handleOtp();
                else handleReset();
              }}
              style={inputStyle}
            />

            {mode === "password" && (
              <input
                type="password" placeholder="Şifre" value={pass}
                onChange={e => setPass(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handlePassword()}
                style={{ ...inputStyle, marginTop: 8 }}
              />
            )}

            {/* Şifremi unuttum linki — sadece şifre modunda */}
            {mode === "password" && (
              <div style={{ textAlign: "right", marginTop: 6 }}>
                <button onClick={() => switchMode("reset")} style={{
                  background: "transparent", border: "none",
                  color: "#555550", fontSize: 11, cursor: "pointer",
                  fontFamily: "'JetBrains Mono', monospace",
                  textDecoration: "underline",
                }}>
                  Şifremi unuttum
                </button>
              </div>
            )}

            {/* Şifre sıfırlama modunda açıklama */}
            {mode === "reset" && (
              <div style={{
                marginTop: 8, marginBottom: 4,
                fontSize: 11, color: "#777770", lineHeight: 1.5,
              }}>
                E-posta adresini gir, şifre sıfırlama linki gönderelim.
              </div>
            )}

            {error && (
              <div style={{
                marginTop: 10, padding: "8px 12px", borderRadius: 8,
                background: "#EF444418", border: "1px solid #EF444440",
                fontSize: 11, color: "#EF4444", fontFamily: "'JetBrains Mono', monospace",
              }}>{error}</div>
            )}

            <button
              onClick={
                mode === "password" ? handlePassword
                : mode === "otp"    ? handleOtp
                : handleReset
              }
              disabled={
                loading || !email ||
                (mode === "password" && !pass)
              }
              style={{
                ...btnStyle,
                background: (
                  !loading && email &&
                  (mode !== "password" || pass)
                ) ? "linear-gradient(135deg,#7C3AED,#9061F9)" : "#2A2A2A",
                color: (
                  !loading && email &&
                  (mode !== "password" || pass)
                ) ? "#fff" : "#555550",
                cursor: (!loading && email) ? "pointer" : "not-allowed",
                marginTop: 14,
              }}
            >
              {loading ? "Yükleniyor..."
                : mode === "password" ? "Giriş →"
                : mode === "otp"      ? "Link Gönder →"
                : "Sıfırlama Linki Gönder →"}
            </button>

            {/* Reset modunda geri butonu */}
            {mode === "reset" && (
              <button onClick={() => switchMode("password")} style={{
                width: "100%", marginTop: 10,
                background: "transparent", border: "none",
                color: "#555550", fontSize: 11, cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                ← Girişe dön
              </button>
            )}
          </>
        )}

        {mode !== "reset" && !otpSent && (
          <div style={{
            marginTop: 20, textAlign: "center",
            fontSize: 12, color: "#555550",
          }}>
            Hesabın yok mu?{" "}
            <Link to="/kayit" style={{ color: "#7C3AED", textDecoration: "none", fontWeight: 600 }}>
              Kayıt ol
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#0F0F0F",
  border: "1px solid #2A2A2A", borderRadius: 8,
  padding: "11px 14px", color: "#EDEDEC",
  fontSize: 14, fontFamily: "inherit", outline: "none",
  caretColor: "#7C3AED", boxSizing: "border-box",
};

const btnStyle: React.CSSProperties = {
  width: "100%", padding: "12px",
  borderRadius: 8, border: "none",
  fontSize: 13, fontWeight: 700,
  fontFamily: "inherit", transition: "all .15s",
};
