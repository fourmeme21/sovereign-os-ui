// src/screens/OnboardingScreen.tsx
// Session 12 — Onboarding akışı: master plan girişi + /api/project/create bağlantısı

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../junior/hooks/useAuth";

// ── Tipler ──────────────────────────────────────────────────────────
interface CreateProjectResponse {
  id: string;
  gen_status: "pending" | "completed" | "partial_success" | "failed";
}

// ── Sabitler ────────────────────────────────────────────────────────
// VITE_ENGINE_URL — apiClient.ts ile aynı pattern (VITE_API_URL kaldırıldı)
const API_BASE = import.meta.env.VITE_ENGINE_URL ?? "";

const T = {
  bg:           "#0F0F0F",
  bgSurface:    "#1A1A1A",
  bgElevated:   "#222222",
  border:       "#2A2A2A",
  accent:       "#7C3AED",
  accentLight:  "#9061F9",
  textPrimary:  "#EDEDEC",
  textSecond:   "#A8A8A3",
  textTertiary: "#555550",
  danger:       "#EF4444",
  success:      "#22C55E",
} as const;

// ── Step göstergesi ─────────────────────────────────────────────────
function StepDot({ active, done }: { active: boolean; done: boolean }) {
  return (
    <div style={{
      width: 8, height: 8, borderRadius: "50%",
      background: done ? T.success : active ? T.accent : T.border,
      transition: "background .3s",
    }} />
  );
}

// ── Ana ekran ───────────────────────────────────────────────────────
export default function OnboardingScreen() {
  const navigate           = useNavigate();
  const { user, session }  = useAuth() as { user: any; session: any };

  const [step, setStep]           = useState<1 | 2 | 3>(1);
  const [projectName, setProjectName] = useState("");
  const [masterPlan, setMasterPlan]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);

  // ── Validation ──────────────────────────────────────────────────
  const step1Valid = projectName.trim().length >= 2;
  const step2Valid = masterPlan.trim().length >= 50;

  // ── API çağrısı ─────────────────────────────────────────────────
  async function createProject() {
    if (!step2Valid) return;
    setLoading(true);
    setError(null);

    try {
      const token = session?.access_token;
      const res = await fetch(`${API_BASE}/api/project/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          project_name: projectName.trim(),
          master_plan: masterPlan.trim(),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `Sunucu hatası: ${res.status}`);
      }

      const data: CreateProjectResponse = await res.json();
      setProjectId(data.id);
      setStep(3);
    } catch (err: any) {
      setError(err.message ?? "Beklenmedik hata");
    } finally {
      setLoading(false);
    }
  }

  // ── Tamamlandı → yönlendir ──────────────────────────────────────
  function goToApp() {
    navigate("/junior", { replace: true });
  }

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      background: T.bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
      fontFamily: "'Inter',system-ui,sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: 520 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: `linear-gradient(135deg, ${T.accent}, ${T.accentLight})`,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, color: "#fff", fontWeight: 800,
            fontFamily: "'Syne',sans-serif",
            boxShadow: `0 4px 20px ${T.accent}30`,
            marginBottom: 12,
          }}>S</div>
          <div style={{
            fontSize: 20, fontWeight: 800, color: T.textPrimary,
            fontFamily: "'Syne',sans-serif", letterSpacing: "-0.03em",
          }}>
            sovereign<span style={{ color: T.accent }}>.</span>os
          </div>
          <div style={{
            fontSize: 11, color: T.textTertiary,
            fontFamily: "'JetBrains Mono',monospace", marginTop: 4,
          }}>
            Projenizi kuralım
          </div>
        </div>

        {/* Step indikatör */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "center", gap: 8, marginBottom: 28,
        }}>
          <StepDot active={step === 1} done={step > 1} />
          <div style={{ width: 24, height: 1, background: step > 1 ? T.success : T.border }} />
          <StepDot active={step === 2} done={step > 2} />
          <div style={{ width: 24, height: 1, background: step > 2 ? T.success : T.border }} />
          <StepDot active={step === 3} done={false} />
        </div>

        {/* Kart */}
        <div style={{
          background: T.bgSurface,
          border: `1px solid ${T.border}`,
          borderRadius: 14,
          padding: "28px 24px",
        }}>

          {/* ── STEP 1: Proje adı ── */}
          {step === 1 && (
            <>
              <Label>Proje adı</Label>
              <input
                autoFocus
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && step1Valid && setStep(2)}
                placeholder="örn. E-ticaret platformu, SaaS dashboard..."
                maxLength={80}
                style={inputStyle}
              />
              <Hint>Kısa ve tanımlayıcı olsun. Sonradan değiştirilebilir.</Hint>

              <PrimaryButton disabled={!step1Valid} onClick={() => setStep(2)}>
                Devam →
              </PrimaryButton>
            </>
          )}

          {/* ── STEP 2: Master plan ── */}
          {step === 2 && (
            <>
              <BackButton onClick={() => setStep(1)} />
              <Label>Master plan</Label>
              <SubLabel>
                Projenizi serbest formatta anlatın. Ne inşa ediyorsunuz,
                hangi kararlar alınacak, kimler kullanacak? Ne kadar detaylı
                olursa adapter o kadar güçlü olur.
              </SubLabel>
              <textarea
                autoFocus
                value={masterPlan}
                onChange={e => setMasterPlan(e.target.value)}
                placeholder={MASTER_PLAN_PLACEHOLDER}
                rows={10}
                style={{ ...inputStyle, resize: "vertical", minHeight: 200 }}
              />
              <div style={{
                display: "flex", justifyContent: "space-between",
                marginTop: 6, marginBottom: 16,
              }}>
                <Hint>
                  {masterPlan.length < 50
                    ? `En az ${50 - masterPlan.length} karakter daha`
                    : "✓ Hazır"}
                </Hint>
                <Hint>{masterPlan.length} karakter</Hint>
              </div>

              {error && (
                <div style={{
                  padding: "10px 14px", marginBottom: 16,
                  borderRadius: 8, background: `${T.danger}14`,
                  border: `1px solid ${T.danger}40`,
                  fontSize: 12, color: T.danger,
                  fontFamily: "'JetBrains Mono',monospace",
                }}>
                  ⚠ {error}
                </div>
              )}

              <PrimaryButton
                disabled={!step2Valid || loading}
                onClick={createProject}
              >
                {loading ? "Proje kuruluyor…" : "Projeyi Oluştur"}
              </PrimaryButton>
            </>
          )}

          {/* ── STEP 3: Tamamlandı ── */}
          {step === 3 && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>🚀</div>
              <div style={{
                fontSize: 17, fontWeight: 700,
                color: T.textPrimary, marginBottom: 8,
              }}>
                Proje oluşturuldu!
              </div>
              <div style={{
                fontSize: 13, color: T.textSecond,
                lineHeight: 1.6, marginBottom: 8,
              }}>
                Adapter arka planda üretiliyor. Bu birkaç dakika sürebilir.
                Hazır olduğunda chat ekranında bildirim alırsınız.
              </div>
              {projectId && (
                <div style={{
                  fontSize: 10, color: T.textTertiary,
                  fontFamily: "'JetBrains Mono',monospace",
                  marginBottom: 24,
                }}>
                  ID: {projectId}
                </div>
              )}
              <PrimaryButton onClick={goToApp}>
                Uygulamaya Geç →
              </PrimaryButton>
            </div>
          )}

        </div>

        {/* Alt link — atla */}
        {step !== 3 && (
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button
              onClick={goToApp}
              style={{
                background: "transparent", border: "none",
                color: T.textTertiary, cursor: "pointer",
                fontSize: 12, fontFamily: "'JetBrains Mono',monospace",
              }}
            >
              Şimdi değil, atla →
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Küçük bileşenler ────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 9, fontWeight: 700, letterSpacing: ".14em",
      color: "#555550", fontFamily: "'JetBrains Mono',monospace",
      marginBottom: 10, textTransform: "uppercase",
    }}>
      {children}
    </div>
  );
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 12, color: "#A8A8A3", lineHeight: 1.6, marginBottom: 14 }}>
      {children}
    </div>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, color: "#555550", fontFamily: "'JetBrains Mono',monospace" }}>
      {children}
    </div>
  );
}

function PrimaryButton({
  children, onClick, disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%", height: 46, marginTop: 8,
        borderRadius: 10, border: "none",
        background: disabled
          ? "#222222"
          : "linear-gradient(135deg, #7C3AED, #9061F9)",
        color: disabled ? "#555550" : "#fff",
        fontSize: 14, fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "'Inter',system-ui,sans-serif",
        transition: "opacity .15s",
        boxShadow: disabled ? "none" : "0 4px 20px #7C3AED28",
      }}
    >
      {children}
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "transparent", border: "none",
        color: "#555550", cursor: "pointer", fontSize: 12,
        fontFamily: "'JetBrains Mono',monospace",
        padding: 0, marginBottom: 16,
        display: "flex", alignItems: "center", gap: 4,
      }}
    >
      ← Geri
    </button>
  );
}

// ── Stil sabitleri ──────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#0F0F0F",
  border: "1px solid #2A2A2A",
  borderRadius: 8,
  padding: "12px 14px",
  color: "#EDEDEC",
  fontSize: 14,
  fontFamily: "'Inter',system-ui,sans-serif",
  outline: "none",
  caretColor: "#7C3AED",
  lineHeight: 1.6,
  marginBottom: 4,
  boxSizing: "border-box",
};

const MASTER_PLAN_PLACEHOLDER = `Örnek:
E-ticaret müdürü için karar destek sistemi.
— Ürün fiyatlandırma kararları (maliyet + rekabet analizi)
— Kampanya onayları (bütçe > 10.000₺ → insan onayı)
— Tedarikçi değişikliği (risk skoru hesaplanır)
— Stok kritik eşiği (otomatik sipariş tetiklenir)

Kullanıcı: 3 kişilik operasyon ekibi
Altyapı: Supabase + Railway`;
