// src/lib/apiClient.ts
import { supabase } from "./supabase";

const ENGINE_URL = import.meta.env.VITE_ENGINE_URL as string;

if (!ENGINE_URL) {
  console.error("[apiClient] VITE_ENGINE_URL tanımlı değil");
}

interface ApiCallOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>;
}

export async function apiCall<T = unknown>(
  path: string,
  options: ApiCallOptions = {}
): Promise<T> {
  // Her çağrıda güncel session al — supabase auto-refresh yapar
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }

  const res = await fetch(`${ENGINE_URL}${path}`, {
    ...options,
    headers,
  });

  // --- Global hata işleme ---

  if (res.status === 429) {
    // Quota aşıldı → fiyatlandırma sayfasına yönlendir
    window.location.href = "/app/fiyatlandirma?reason=quota_exceeded";
    throw new Error("quota_exceeded");
  }

  if (res.status === 403) {
    let feature = "unknown";
    try {
      const body = await res.clone().json();
      feature = body.feature ?? "unknown";
    } catch {
      /* json parse başarısız — feature unknown kalır */
    }
    throw new Error(`feature_locked:${feature}`);
  }

  if (res.status === 401) {
    // Token süresi dolmuş — login'e yönlendir
    window.location.href = "/giris?reason=session_expired";
    throw new Error("session_expired");
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[${res.status}] ${text}`);
  }

  return res.json() as Promise<T>;
}
