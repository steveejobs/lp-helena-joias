"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getSupabasePublicEnv } from "./env";

export function createSupabaseBrowserClient() {
  const { publishableKey, url } = getSupabasePublicEnv();
  return createBrowserClient(url, publishableKey);
}

