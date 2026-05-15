// src/junior/hooks/useEngineStatus.js
import { useState, useEffect } from "react";

const ENGINE_URL = import.meta.env.VITE_ENGINE_URL;
const POLL_INTERVAL = 30_000; // 30 saniyede bir kontrol

export function useEngineStatus() {
  const [online, setOnline] = useState(true); // optimistik başla

  const check = async () => {
    try {
      const res = await fetch(`${ENGINE_URL}/health`, { signal: AbortSignal.timeout(5000) });
      setOnline(res.ok);
    } catch {
      setOnline(false);
    }
  };

  useEffect(() => {
    check(); // ilk yüklemede hemen kontrol et
    const interval = setInterval(check, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return online;
}
