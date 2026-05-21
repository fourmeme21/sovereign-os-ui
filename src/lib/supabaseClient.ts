// src/lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  as string;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON) {
  console.error("[supabaseClient] VITE_SUPABASE_URL veya VITE_SUPABASE_ANON_KEY eksik");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
