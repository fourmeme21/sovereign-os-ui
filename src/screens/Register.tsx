// src/screens/Register.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuthStore } from "../stores/authStore";

export default function RegisterScreen() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  const [email,    setEmail]    = useState("");
  const [pass,     setPass]     = useState("");
  const [pass2,    setPass2]    = useState("");
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(false);

  const valid = email && pass && pass === pass2 && pass.length >= 6;

  const handleRegister = async () => {
    if (!valid) return;
    if (pass !== pass2) { setError("Şifreler eşleşmiyor"); return; }

    setLoading(true); setError(null);
    try {
      const { data, error: err } = await supabase.auth.signUp({ email, password: pass });
      if (err) throw err;

      if (data.session) {
        // E-posta doğrulama kapalıysa direkt session gelir
        setSession(data.session);
        navigate("/junior/chat");
      } else {
        // Doğrulama e-postası gönderildi
        setDone(true);
      }
    } catch (e: any) {
      setError(e.message ?? "Kayıt başarısız");
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
          <div style={{ fontSize: 15, fontWeight: 700, color: "#EDEDEC" }}>Hesap Oluştur</div>
          <div style={{
            fontSize: 11, color: "#555550", marginTop: 4,
            fontFamily: "'JetBrains Mono', monospace",
          }}>sovereign-engine · kayıt</div>
        </div>

        {done ? (
          <div style={{
            padding: "14px", borderRadius: 10, textAlign: "center",
            background: "#7C3AED18", border: "1px solid #7C3AED40",
          }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>📬</div>
            <div style={{ fontSize: 13, color: "#EDEDEC", fontWeight: 600 }}>
              Doğrulama e-postası gönderildi
            </div>
            <div style={{ fontSize: 11, color: "#777770", marginTop: 4 }}>{email}</div>
            <div style={{ fontSize: 11, color: "#555550", marginTop: 8 }}>
              Linke tıkladıktan sonra giriş yapabilirsin.
            </div>
            <Link to="/giris" style={{
              display: "block", marginTop: 14,
              color: "#7C3AED", fontSize: 12, textDecoration: "none", fontWeight: 600,
            }}>Giriş sayfasına git →</Link>
          </div>
        ) : (
          <>
            <input
              type="email" placeholder="E-posta" value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
            />
            <input
              type="password" placeholder="Şifre (min. 6 karakter)" value={pass}
              onChange={e => setPass(e.target.value)}
              style={{ ...inputStyle, marginTop: 8 }}
            />
            <input
              type="password" placeholder="Şifre tekrar" value={pass2}
              onChange={e => setPass2(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleRegister()}
              style={{ ...inputStyle, marginTop: 8 }}
            />

            {pass && pass2 && pass !== pass2 && (
              <div style={{ marginTop: 6, fontSize: 11, color: "#EF4444", fontFamily: "'JetBrains Mono',monospace" }}>
                Şifreler eşleşmiyor
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
              onClick={handleRegister}
              disabled={loading || !valid}
              style={{
                ...btnStyle,
                background: (!loading && valid)
                  ? "linear-gradient(135deg,#7C3AED,#9061F9)" : "#2A2A2A",
                color: (!loading && valid) ? "#fff" : "#555550",
                cursor: (!loading && valid) ? "pointer" : "not-allowed",
                marginTop: 14,
              }}
            >
              {loading ? "Kaydediliyor..." : "Kayıt Ol →"}
            </button>
          </>
        )}

        {!done && (
          <div style={{
            marginTop: 20, textAlign: "center",
            fontSize: 12, color: "#555550",
          }}>
            Zaten hesabın var mı?{" "}
            <Link to="/giris" style={{ color: "#7C3AED", textDecoration: "none", fontWeight: 600 }}>
              Giriş yap
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
