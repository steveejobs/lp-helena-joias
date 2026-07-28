import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { HELENA_STORE_ID } from "@/types/commerce";
import { getSupabasePublicEnv } from "./env";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { publishableKey, url } = getSupabasePublicEnv();

  return createServerClient(url, publishableKey, {
    global: {
      headers: {
        "x-store-id": HELENA_STORE_ID,
      },
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, options, value } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot persist cookies; the auth proxy does it.
        }
      },
    },
  });
}
