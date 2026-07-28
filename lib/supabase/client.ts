"use client";

import { createBrowserClient } from "@supabase/ssr";

import { HELENA_STORE_ID } from "@/types/commerce";
import { getSupabasePublicEnv } from "./env";

export function createSupabaseBrowserClient() {
  const { publishableKey, url } = getSupabasePublicEnv();
  return createBrowserClient(url, publishableKey, {
    global: {
      headers: {
        "x-store-id": HELENA_STORE_ID,
      },
    },
  });
}
