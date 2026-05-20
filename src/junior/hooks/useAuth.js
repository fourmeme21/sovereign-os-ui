// src/junior/hooks/useAuth.js
// Phase C — Supabase Auth hook
// Değişiklik: signInWithOtp eklendi (Magic Link — şifresiz giriş)
// Değişiklik 2: 15sn timeout + connectionError state
// Değişiklik 3: hata mesajı ekrana yansıtıldı (debug)
// Kullanım: const { user, session, loading, connectionError, errorMessage, signIn, signInWithOtp, signOut } = useAuth()

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export function useAuth() {
  const [user,            setUser]            = useState(null);
  const [session,         setSession]         = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [errorMessage,    setErrorMessage]    = useState(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setErrorMessage("getSession() 15 saniye içinde yanıt vermedi (timeout)");
      setConnectionError(true);
      setLoading(false);
    }, 15000);

    supabase.auth.getSession().then(({ data, error }) => {
      clearTimeout(timeout);
      if (error) {
        setErrorMessage(`${error.message} (status: ${error.status ?? "?"})`);
        setConnectionError(true);
      } else {
        setSession(data.session);
        setUser(data.session?.user ?? null);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setConnectionError(false);
      setErrorMessage(null);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
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

  return { user, session, loading, connectionError, errorMessage, signIn, signInWithOtp, signOut };
}
