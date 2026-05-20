// src/junior/hooks/useAuth.js
// Phase C — Supabase Auth hook
// Değişiklik: signInWithOtp eklendi (Magic Link — şifresiz giriş)
// Değişiklik 2: 15sn timeout + connectionError state
// Kullanım: const { user, session, loading, connectionError, signIn, signInWithOtp, signOut } = useAuth()

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export function useAuth() {
  const [user,            setUser]            = useState(null);
  const [session,         setSession]         = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setConnectionError(true);
      setLoading(false);
    }, 15000);

    supabase.auth.getSession().then(({ data, error }) => {
      clearTimeout(timeout);
      if (error) {
        setConnectionError(true);
      } else {
        setSession(data.session);
        setUser(data.session?.user ?? null);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setConnectionError(false);
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

  return { user, session, loading, connectionError, signIn, signInWithOtp, signOut };
}
