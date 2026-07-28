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
  const { data: membership, error } = await supabase
    .from("store_memberships")
    .select("role,active,store_id")
    .eq("user_id", user.id)
    .eq("store_id", HELENA_STORE_ID)
    .eq("active", true)
    .maybeSingle();
  if (error || !membership) return null;

  const metadataName = typeof user.user_metadata?.name === "string"
    ? user.user_metadata.name.trim()
    : "";

  return {
    email: user.email,
    name: metadataName || user.email,
    role: membership.role,
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
