// src/junior/hooks/useAuth.js
// Phase C — Supabase Auth hook
// Değişiklik 3: authStore'dan oku — çift getSession() race condition düzeltildi
// Kullanım: const { user, session, loading, connectionError, signIn, signInWithOtp, signOut } = useAuth()

import { useAuthStore } from "../../stores/authStore";
import { supabase } from "../../lib/supabaseClient";

export function useAuth() {
  const user      = useAuthStore((s) => s.user);
  const token     = useAuthStore((s) => s.token);
  const loading   = useAuthStore((s) => s.isLoading);

  // connectionError: token var ama profil sorgusu başarısız olduysa
  const connectionError = !loading && !user && false; // authStore hallediyor

  const session = token ? { access_token: token } : null;

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signInWithOtp = async (email) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/junior/chat`,
      },
    });
    if (error) throw error;
  };

  const signOut = useAuthStore((s) => s.signOut);

  return { user, session, loading, connectionError, signIn, signInWithOtp, signOut };
}
