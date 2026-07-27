import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getSupabasePublicEnv, hasSupabaseEnv } from "./env";

export async function updateAdminSession(request: NextRequest) {
  if (!hasSupabaseEnv()) return NextResponse.next({ request });
  let response = NextResponse.next({ request });
  const { publishableKey, url } = getSupabasePublicEnv();
  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, options, value } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });
  await supabase.auth.getClaims();
  return response;
}

