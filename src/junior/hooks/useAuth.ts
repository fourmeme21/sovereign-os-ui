// src/junior/hooks/useAuth.ts
// Amaç:    Supabase auth işlemlerini useAuthStore üzerinden expose eder
// Bağlı:   src/stores/authStore.ts, src/lib/supabaseClient.ts
// Karar:   Session 10 — resetPassword + session kaydı (çoklu açılım koruması)
// Karar:   Session 13 — emailRedirectTo /auth/callback olarak düzeltildi (iPhone magic link fix)
// Dokunma: authStore.ts setSession / signOut değişirse burası da güncellenir

import { useAuthStore } from "../../stores/authStore";
import { supabase }     from "../../lib/supabaseClient";

const getPlatform = () =>
  typeof window !== "undefined" && (window as any).__TAURI__ ? "tauri" : "web";

const getPublicIp = async (): Promise<string | null> => {
  try {
    const res = await fetch("https://api.ipify.org?format=json", {
      signal: AbortSignal.timeout(3000),
    });
    const { ip } = await res.json();
    return ip ?? null;
  } catch {
    return null;
  }
};

export const registerSession = async (userId: string): Promise<void> => {
  try {
    const platform   = getPlatform();
    const ip         = await getPublicIp();
    const user_agent = navigator?.userAgent ?? null;

    await supabase
      .from("user_sessions")
      .update({ is_active: false, closed_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("is_active", true);

    await supabase
      .from("user_sessions")
      .insert({ user_id: userId, platform, ip, user_agent });
  } catch (err: any) {
    console.warn("[useAuth] Session kaydı başarısız:", err.message);
  }
};

export function useAuth() {
  const user    = useAuthStore((s) => s.user);
  const token   = useAuthStore((s) => s.token);
  const loading = useAuthStore((s) => s.isLoading);

  const connectionError = !loading && !user && false;
  const session = token ? { access_token: token } : null;

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data?.user?.id) await registerSession(data.user.id);
    return data;
  };

  const signInWithOtp = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`, // ← DÜZELTİLDİ
      },
    });
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/sifre-sifirla`,
    });
    if (error) throw error;
  };

  const signOut = useAuthStore((s) => s.signOut);

  return { user, session, loading, connectionError, signIn, signInWithOtp, signOut, resetPassword };
}
