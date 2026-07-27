import { updateStoreSettingsAction } from "./actions";
import { requireAdminRole } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { HELENA_STORE_ID } from "@/types/commerce";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminRole(["admin"], "/admin/configuracoes");
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: store, error } = await supabase
    .from("stores")
    .select("name,instagram_url,whatsapp_number,whatsapp_default_message,show_prices")
    .eq("id", HELENA_STORE_ID)
    .single();
  if (error) throw new Error("Não foi possível carregar as configurações.");

  return (
    <main className="admin-page">
      <header className="admin-page-heading"><div><p>Loja</p><h1>Configurações</h1></div></header>
      {params.ok ? <p className="admin-success" role="status">Configurações atualizadas.</p> : null}
      {params.erro ? <p className="admin-error" role="alert">Não foi possível salvar. Verifique o telefone e tente novamente.</p> : null}
      <form action={updateStoreSettingsAction} className="admin-product-form">
        <section className="admin-panel">
          <h2>Atendimento</h2>
          <div className="admin-fields">
            <label className="admin-field">
              WhatsApp internacional
              <input
                name="whatsappNumber"
                inputMode="tel"
                defaultValue={store.whatsapp_number ?? ""}
                placeholder="Ex.: 5511999999999"
              />
            </label>
            <label className="admin-field">
              Mensagem padrão
              <textarea
                name="defaultMessage"
                maxLength={1200}
                rows={7}
                defaultValue={store.whatsapp_default_message ?? ""}
                placeholder="Complemento opcional para o atendimento."
              />
            </label>
            <label className="admin-field">
              Instagram oficial
              <input name="instagramUrl" type="url" maxLength={500} defaultValue={store.instagram_url ?? ""} />
            </label>
          </div>
        </section>
        <aside>
          <section className="admin-panel">
            <h2>Exibição</h2>
            <label className="admin-check">
              <input name="showPrices" type="checkbox" defaultChecked={store.show_prices} />
              Exibir preços cadastrados
            </label>
            <p className="admin-help">Ao desativar, todos os produtos passam a convidar para consulta, sem apagar nenhum valor.</p>
          </section>
          <button className="admin-button" type="submit">Salvar configurações</button>
        </aside>
      </form>
    </main>
  );
}
