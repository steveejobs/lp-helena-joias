import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getSupabasePublicEnv, getSupabaseSecretKey } from "./env";

export function createSupabaseAdminClient() {
  const { url } = getSupabasePublicEnv();

  return createClient(url, getSupabaseSecretKey(), {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

