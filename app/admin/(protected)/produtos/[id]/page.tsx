import { notFound } from "next/navigation";

import { ProductForm } from "@/components/admin/product-form";
import { adminImageUrls } from "@/lib/admin/product-images";
import { requireAdminRole } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { HELENA_STORE_ID, type ProductStatus } from "@/types/commerce";
import {
  removeProductImageAction,
  setPrimaryImageAction,
  updateImageOrderAction,
  uploadProductImageAction,
} from "./image-actions";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  await requireAdminRole(["admin", "editor"], `/admin/produtos/${id}`);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const query = await searchParams;
  const supabase = await createSupabaseServerClient();
  const [{ data: product }, { data: categories }, { data: images }] = await Promise.all([
    supabase
      .from("products")
      .select("id,category_id,compare_at_price,description,featured,name,new_arrival,price,short_description,sku,slug,sort_order,status")
      .eq("id", id)
      .eq("store_id", HELENA_STORE_ID)
      .maybeSingle(),
    supabase.from("categories").select("id,name").eq("store_id", HELENA_STORE_ID).eq("active", true).order("sort_order"),
    supabase
      .from("product_images")
      .select("id,storage_path,alt_text,sort_order,is_primary,width,height")
      .eq("product_id", id)
      .eq("store_id", HELENA_STORE_ID)
      .order("sort_order"),
  ]);
  if (!product) notFound();
  const urls = await adminImageUrls((images ?? []).map((image) => image.storage_path));

  return (
    <main className="admin-page">
      <header className="admin-page-heading"><div><p>Editar produto</p><h1>{product.name}</h1></div></header>
      {query.ok ? <p className="admin-success" role="status">Alteração concluída.</p> : null}
      {query.erro ? <p className="admin-error" role="alert">A ação não pôde ser concluída. Confira os dados e o estado de publicação.</p> : null}
      <ProductForm
        categories={categories ?? []}
        product={{ ...product, status: product.status as ProductStatus }}
      />
      <section className="admin-panel" style={{ marginTop: 30, padding: 24 }}>
        <p className="admin-section-kicker">Mídia</p>
        <h2>Imagens da peça</h2>
        <form action={uploadProductImageAction} className="admin-upload-form">
          <input type="hidden" name="productId" value={product.id} />
          <label>
            Arquivo
            <input name="image" type="file" accept="image/webp,.webp" required />
          </label>
          <label>
            Texto alternativo
            <input name="altText" maxLength={240} placeholder={`Detalhe de ${product.name}`} required />
          </label>
          <button type="submit">Enviar imagem</button>
        </form>
        <p className="admin-help">WebP já otimizado, entre 320 e 2400 px por lado, até 8 MB. O servidor valida assinatura, extensão, dimensões e loja de destino.</p>
        {(images ?? []).length ? (
          <div className="admin-image-grid">
            {(images ?? []).map((image) => (
              <article className="admin-image-card" key={image.id}>
                {urls.get(image.storage_path) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={urls.get(image.storage_path)} alt={image.alt_text} width={image.width ?? 400} height={image.height ?? 500} />
                ) : <div className="admin-empty">Prévia indisponível</div>}
                <div>
                  <strong>{image.is_primary ? "Imagem principal" : image.alt_text}</strong>
                  <form action={updateImageOrderAction}>
                    <input type="hidden" name="productId" value={product.id} />
                    <input type="hidden" name="imageId" value={image.id} />
                    <label className="admin-field">Ordem<input name="sortOrder" type="number" min="0" max="999" defaultValue={image.sort_order} /></label>
                    <button type="submit">Atualizar ordem</button>
                  </form>
                  {!image.is_primary ? (
                    <form action={setPrimaryImageAction}>
                      <input type="hidden" name="productId" value={product.id} />
                      <input type="hidden" name="imageId" value={image.id} />
                      <button type="submit">Usar como principal</button>
                    </form>
                  ) : null}
                  <form action={removeProductImageAction}>
                    <input type="hidden" name="productId" value={product.id} />
                    <input type="hidden" name="imageId" value={image.id} />
                    <button type="submit">Remover imagem</button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        ) : <div className="admin-empty"><p>Nenhuma imagem enviada. Produtos só podem ser publicados após receber uma imagem principal válida.</p></div>}
      </section>
    </main>
  );
}
