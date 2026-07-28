"use server";

import { redirect } from "next/navigation";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { HELENA_STORE_ID } from "@/types/commerce";

function safeReturnTo(value: FormDataEntryValue | null) {
  const path = typeof value === "string" ? value : "";
  return path.startsWith("/admin") && !path.startsWith("//") ? path : "/admin";
}

export async function loginAction(formData: FormData) {
  if (!hasSupabaseEnv()) redirect("/admin/login?erro=config");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const returnTo = safeReturnTo(formData.get("returnTo"));
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) {
    redirect("/admin/login?erro=credenciais");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) redirect("/admin/login?erro=credenciais");
  const { data: membership } = await supabase
    .from("store_memberships")
    .select("active,store_id")
    .eq("user_id", data.user.id)
    .eq("store_id", HELENA_STORE_ID)
    .maybeSingle();
  if (!membership?.active) {
    await supabase.auth.signOut();
    redirect("/admin/login?erro=acesso");
  }
  redirect(returnTo);
}

export async function logoutAction() {
  if (hasSupabaseEnv()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}
