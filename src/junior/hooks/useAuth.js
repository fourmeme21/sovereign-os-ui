// src/junior/hooks/useAuth.js
// Phase C — Supabase Auth hook
// Kullanım: const { user, session, loading, signIn, signOut } = useAuth()

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export function useAuth() {
  const [user,    setUser]    = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mevcut session'ı al
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // Auth state değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, session, loading, signIn, signOut };
}
