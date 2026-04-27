import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (import.meta.env.DEV) {
  console.log("Supabase env carregado pelo Vite:", {
    VITE_SUPABASE_URL: supabaseUrl,
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? `${supabaseAnonKey.slice(0, 8)}...` : undefined,
  });
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Variaveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY sao obrigatorias no arquivo .env da raiz do projeto.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey);
