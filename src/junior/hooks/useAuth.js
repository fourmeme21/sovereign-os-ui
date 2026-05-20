// src/junior/hooks/useAuth.js
// Phase C — Supabase Auth hook
// Değişiklik: signInWithOtp eklendi (Magic Link — şifresiz giriş)
// Değişiklik 2: 5sn timeout + connectionError state
// Değişiklik 3: Modül-seviyesi cache — her sayfada tekrar getSession() çağrılmaz

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

// Modül cache — tüm useAuth() çağrıları bunu paylaşır
// undefined = henüz sorgulanmadı, null = sorgulandı, session yok
let _cachedSession = undefined;
let _listeners     = new Set();

function notifyAll(session) {
  _cachedSession = session;
  _listeners.forEach((fn) => fn(session));
}

// Uygulama başında bir kez Supabase'i dinle
let _initialized = false;
function ensureInit() {
  if (_initialized) return;
  _initialized = true;

  supabase.auth.getSession().then(({ data, error }) => {
    if (!error) notifyAll(data.session ?? null);
    else        notifyAll(null);
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    notifyAll(session ?? null);
  });
}

export function useAuth() {
  ensureInit(); // İlk çağrıda başlatır, sonrakiler no-op

  // Cache varsa hemen kullan — loading gösterme
  const [session,         setSession]         = useState(() => _cachedSession ?? null);
  const [user,            setUser]            = useState(() => _cachedSession?.user ?? null);
  const [loading,         setLoading]         = useState(_cachedSession === undefined);
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    // Cache zaten doluysa loading gerek yok
    if (_cachedSession !== undefined) {
      setLoading(false);
      return;
    }

    // 5 saniye timeout — Supabase cevap vermezse
    const timeout = setTimeout(() => {
      setConnectionError(true);
      setLoading(false);
    }, 5000);

    // Cache dolduğunda bu bileşeni güncelle
    const handler = (newSession) => {
      clearTimeout(timeout);
      setConnectionError(false);
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    };

    _listeners.add(handler);
    return () => {
      clearTimeout(timeout);
      _listeners.delete(handler);
    };
  }, []);

  // Auth state değişikliklerini dinle (login/logout/magic link)
  useEffect(() => {
    const handler = (newSession) => {
      setConnectionError(false);
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    };
    _listeners.add(handler);
    return () => _listeners.delete(handler);
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
    notifyAll(null);
  };

  return { user, session, loading, connectionError, signIn, signInWithOtp, signOut };
}
