// src/junior/hooks/useAuth.js
// Phase C — Supabase Auth hook
// Değişiklik: signInWithOtp eklendi (Magic Link — şifresiz giriş)
// Değişiklik 2: 5sn timeout + connectionError state
// Değişiklik 3: connectionError reset düzeltmesi + loading tek noktada yönetiliyor
// Kullanım: const { user, session, loading, connectionError, signIn, signInWithOtp, signOut } = useAuth()

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export function useAuth() {
  const [user,            setUser]            = useState(null);
  const [session,         setSession]         = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    // 5 saniye içinde cevap gelmezse connection error göster
    const timeout = setTimeout(() => {
      setConnectionError(true);
      setLoading(false);
    }, 5000);

    supabase.auth.getSession().then(({ data, error }) => {
      clearTimeout(timeout); // Timeout'u iptal et — cevap geldi

      if (error) {
        setConnectionError(true);
      } else {
        setConnectionError(false); // DÜZELTME: timeout sonrası geç gelen cevap hata ekranını temizler
        setSession(data.session);
        setUser(data.session?.user ?? null);
      }
      setLoading(false);
    });

    // Magic link ve oturum değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setConnectionError(false);
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false); // DÜZELTME: loading'i burada da kapat
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

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

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, session, loading, connectionError, signIn, signInWithOtp, signOut };
}
