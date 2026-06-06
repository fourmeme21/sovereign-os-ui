// src/stores/authStore.ts
// Phase C — Zustand Auth Store
// Değişiklik: user_profiles satırı yoksa otomatik INSERT (migration sonrası)
// Değişiklik: isLoading başlangıç kontrolü düzeltildi
// Session 14 — #15: initAuthListener registerSession parametresi alır,
//               SIGNED_IN event'inde magic link session kaydı tetiklenir

import { create } from "zustand";
import { supabase } from "../lib/supabaseClient";

interface UserProfile {
  tier: "free" | "solo" | "pro" | "team";
  decision_count_this_month: number;
}

interface AuthState {
  user: any | null;
  tier: UserProfile["tier"];
  decisionCount: number;
  token: string | null;
  isLoading: boolean;

  setSession: (session: any | null) => void;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  tier: "free",
  decisionCount: 0,
  token: null,
  isLoading: true,

  setSession: (session) => {
    if (!session) {
      set({ user: null, token: null, tier: "free", decisionCount: 0, isLoading: false });
      return;
    }

    set({
      user: session.user,
      token: session.access_token,
      isLoading: false,
    });

    // Profil bilgisini arka planda çek
    supabase
      .from("user_profiles")
      .select("tier, decision_count_this_month")
      .eq("id", session.user.id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          // Profil yok — migrasyon sonrası yeni kullanıcı → otomatik oluştur
          console.warn("[authStore] Profil bulunamadı, oluşturuluyor:", session.user.id);
          supabase
            .from("user_profiles")
            .insert({
              id: session.user.id,
              tier: "free",
              decision_count_this_month: 0,
            })
            .then(({ error: insertError }) => {
              if (insertError) {
                console.error("[authStore] Profil oluşturulamadı:", insertError.message);
              } else {
                set({ tier: "free", decisionCount: 0 });
              }
            });
          return;
        }
        set({
          tier: data.tier,
          decisionCount: data.decision_count_this_month,
        });
      });
  },

  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;

    const { data, error } = await supabase
      .from("user_profiles")
      .select("tier, decision_count_this_month")
      .eq("id", user.id)
      .single();

    if (!error && data) {
      set({ tier: data.tier, decisionCount: data.decision_count_this_month });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem("se_token");
    set({ user: null, token: null, tier: "free", decisionCount: 0 });
  },
}));

// --- Uygulama başlangıcında session dinleyici başlat ---
// Çağrım: initAuthListener(registerSession)
//
// registerSession useAuth.js'den import ediliyor — döngüsel import'u önlemek
// için parametre olarak geçilir, authStore.ts içinde import edilmez.
//
// Session 14 — #15 Karar:
//   event === "SIGNED_IN" → magic link veya password girişi.
//   Magic link tespiti: session.user.app_metadata.provider === "email"
//   Password girişi signIn() içinde zaten registerSession çağırıyor,
//   burada çift kayıt oluşmaması için sadece email provider + magic link
//   akışını yakalamalıyız.
//
//   Güvenilir ayırt edici:
//     - Magic link: session.user.email_confirmed_at seti var VE
//       session.user.last_sign_in_at === session.user.email_confirmed_at
//       (ilk onay) VEYA
//     - app_metadata.provider === "email" AND NOT password flow
//
//   En sağlam yol: useAuth.js signIn() kendi registerSession'ını zaten çağırıyor.
//   authStore burada TÜM SIGNED_IN eventlerini yakalar — registerSession
//   içinde Supabase UPDATE + INSERT yapısı idempotent (eski session kapatılır,
//   yeni yazılır). Dolayısıyla password flow için çift kayıt olsa da sonuç
//   doğrudur (son açılan kazanır — Seçenek B).
//
//   Bu nedenle: tüm SIGNED_IN eventlerinde registerSession çağır.
//   useAuth.js signIn() kaldırılabilir ama şimdilik dokunma — harmless.

export function initAuthListener(
  registerSession: (userId: string) => Promise<void>
) {
  // isLoading başlangıçta true — getSession tamamlanınca false olur
  supabase.auth.getSession().then(({ data: { session } }) => {
    useAuthStore.getState().setSession(session);
    // session null ise setSession zaten isLoading: false yapar
  });

  supabase.auth.onAuthStateChange((event, session) => {
    useAuthStore.getState().setSession(session);

    // #15 — Magic link (ve tüm SIGNED_IN) session kaydı
    // registerSession idempotent: eski sessionları kapatır, yeni yazar.
    if (event === "SIGNED_IN" && session?.user?.id) {
      registerSession(session.user.id).catch((err) => {
        console.warn("[authStore] SIGNED_IN session kaydı başarısız:", err.message);
      });
    }
  });
}
