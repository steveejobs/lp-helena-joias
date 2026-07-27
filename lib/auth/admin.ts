import "server-only";

import { redirect } from "next/navigation";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { HELENA_STORE_ID } from "@/types/commerce";

export type AdminSession = {
  email: string;
  name: string;
  role: "admin" | "editor" | "attendant";
  userId: string;
};

function authorizedEmails() {
  return new Set(
    (process.env.HELENA_ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export async function getAdminSession(): Promise<AdminSession | null> {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createSupabaseServerClient();
  const { data: userResult, error: userError } = await supabase.auth.getUser();
  const user = userResult.user;
  if (userError || !user?.email) return null;

  const allowlist = authorizedEmails();
  if (allowlist.size && !allowlist.has(user.email.toLowerCase())) return null;
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id,name,role,active,store_id")
    .eq("id", user.id)
    .eq("store_id", HELENA_STORE_ID)
    .eq("active", true)
    .maybeSingle();
  if (error || !profile) return null;

  return {
    email: user.email,
    name: profile.name?.trim() || user.email,
    role: profile.role,
    userId: user.id,
  };
}

export async function requireAdminSession(returnTo = "/admin") {
  const session = await getAdminSession();
  if (session) return session;
  redirect(`/admin/login?retorno=${encodeURIComponent(returnTo)}`);
}

export async function requireAdminRole(
  roles: AdminSession["role"][],
  returnTo = "/admin",
) {
  const session = await requireAdminSession(returnTo);
  if (!roles.includes(session.role)) redirect("/admin?erro=permissao");
  return session;
}

