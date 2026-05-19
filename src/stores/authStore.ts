// src/stores/authStore.ts
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
        if (error) {
          console.warn("[authStore] Profil çekilemedi:", error.message);
          return;
        }
        if (data) {
          set({
            tier: data.tier,
            decisionCount: data.decision_count_this_month,
          });
        }
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
    // se_token temizliği (Phase C.7 gereği)
    sessionStorage.removeItem("se_token");
    set({ user: null, token: null, tier: "free", decisionCount: 0 });
  },
}));

// --- Uygulama başlangıcında session dinleyici başlat ---
// Bu fonksiyonu main.tsx / App.tsx içinde bir kez çağır
export function initAuthListener() {
  supabase.auth.getSession().then(({ data: { session } }) => {
    useAuthStore.getState().setSession(session);
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.getState().setSession(session);
  });
}
