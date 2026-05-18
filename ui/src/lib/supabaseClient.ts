import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = "https://gicmzsybkrzxeavdjkxc.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpY216c3lia3J6eGVhdmRqa3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NDI1MjksImV4cCI6MjA5NDIxODUyOX0.xu-CRxEh1DGJCJfte4zaHhjE71bpo5XZUCqhfHKupV0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
