"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { checked, textValue } from "@/lib/admin/validation";
import { requireAdminRole } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp/order-message";
import { HELENA_STORE_ID } from "@/types/commerce";

export async function updateStoreSettingsAction(formData: FormData) {
  await requireAdminRole(["admin"], "/admin/configuracoes");
  const rawWhatsapp = textValue(formData, "whatsappNumber", { max: 30, optional: true });
  const whatsappNumber = rawWhatsapp ? normalizeWhatsAppNumber(rawWhatsapp) : null;
  if (rawWhatsapp && !whatsappNumber) redirect("/admin/configuracoes?erro=telefone");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("stores")
    .update({
      instagram_url: textValue(formData, "instagramUrl", { max: 500, optional: true }),
      show_prices: checked(formData, "showPrices"),
      whatsapp_default_message: textValue(formData, "defaultMessage", { max: 1200, optional: true }),
      whatsapp_number: whatsappNumber,
    })
    .eq("id", HELENA_STORE_ID);
  if (error) redirect("/admin/configuracoes?erro=salvar");
  revalidatePath("/", "layout");
  redirect("/admin/configuracoes?ok=salvo");
}
