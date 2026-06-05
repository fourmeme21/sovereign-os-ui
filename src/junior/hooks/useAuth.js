// src/junior/hooks/useAuth.js
// Phase C — Supabase Auth hook
// Değişiklik 3: authStore'dan oku — çift getSession() race condition düzeltildi
// Session 10: resetPassword eklendi + açılış session kaydı (çoklu açılım koruması)
// Kullanım: const { user, session, loading, connectionError, signIn, signInWithOtp, signOut, resetPassword } = useAuth()

import { useAuthStore } from "../../stores/authStore";
import { supabase }     from "../../lib/supabaseClient";

// ─── PLATFORM TESPİTİ ────────────────────────────────────────
// Tauri'de window.__TAURI__ mevcuttur.
const getPlatform = () =>
  typeof window !== "undefined" && window.__TAURI__ ? "tauri" : "web";

// ─── IP ALMA ─────────────────────────────────────────────────
// Tauri'de Rust tarafından alınabilir; web'de public IP servisi.
// Başarısız olursa null — session yine yazılır, IP boş kalır.
const getPublicIp = async () => {
  try {
    const res = await fetch("https://api.ipify.org?format=json", { signal: AbortSignal.timeout(3000) });
    const { ip } = await res.json();
    return ip ?? null;
  } catch {
    return null;
  }
};

// ─── SESSION KAYDI ───────────────────────────────────────────
// Seçenek B: son açılan kazanır.
//   1. Kullanıcının tüm aktif sessionlarını kapat
//   2. Yeni session yaz
// Eski cihazda sonraki API çağrısında Supabase RLS 401 döner → otomatik logout.
export const registerSession = async (userId) => {
  try {
    const platform   = getPlatform();
    const ip         = await getPublicIp();
    const user_agent = navigator?.userAgent ?? null;

    // Eski aktif sessionları kapat (Seçenek B)
    await supabase
      .from("user_sessions")
      .update({ is_active: false, closed_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("is_active", true);

    // Yeni session yaz
    await supabase
      .from("user_sessions")
      .insert({ user_id: userId, platform, ip, user_agent });

  } catch (err) {
    // Session kaydı başarısız → giriş engellenmez, sadece log
    console.warn("[useAuth] Session kaydı başarısız:", err.message);
  }
};

export function useAuth() {
  const user    = useAuthStore((s) => s.user);
  const token   = useAuthStore((s) => s.token);
  const loading = useAuthStore((s) => s.isLoading);

  const connectionError = !loading && !user && false;
  const session = token ? { access_token: token } : null;

  // ─── ŞIFRE İLE GİRİŞ ───────────────────────────────────────
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // Giriş başarılı → session kaydet
    if (data?.user?.id) {
      await registerSession(data.user.id);
    }
    return data;
  };

  // ─── MAGIC LINK ─────────────────────────────────────────────
  const signInWithOtp = async (email) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/junior/chat`,
      },
    });
    if (error) throw error;
    // OTP: session kaydı magic link callback'te yapılır (authStore onAuthStateChange)
  };

  // ─── ŞİFREMİ UNUTTUM ────────────────────────────────────────
  // Supabase şifre sıfırlama maili gönderir.
  // Kullanıcı linke tıklayınca /reset-password rotasına yönlendirilir.
  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/sifre-sifirla`,
    });
    if (error) throw error;
  };

  const signOut = useAuthStore((s) => s.signOut);

  return {
    user,
    session,
    loading,
    connectionError,
    signIn,
    signInWithOtp,
    signOut,
    resetPassword,
  };
}
