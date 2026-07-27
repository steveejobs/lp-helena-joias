import { notFound } from "next/navigation";

import { publishProductAction } from "@/app/admin/(protected)/produtos/actions";
import { ProductForm } from "@/components/admin/product-form";
import { ProductImageUploader } from "@/components/admin/product-image-uploader";
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
  const imageCount = images?.length ?? 0;

  return (
    <main className="admin-page">
      <header className="admin-page-heading"><div><p>Editar produto</p><h1>{product.name}</h1></div></header>
      <ol className="admin-stepper admin-edit-stepper" aria-label="Progresso do cadastro">
        <li className="is-complete"><span>✓</span><div><strong>Informações</strong><small>Salvas</small></div></li>
        <li className={imageCount ? "is-complete" : ""} aria-current={imageCount ? undefined : "step"}>
          <span>{imageCount ? "✓" : "2"}</span>
          <div><strong>Fotos</strong><small>{imageCount ? `${imageCount} adicionada(s)` : "Adicione ao menos uma"}</small></div>
        </li>
        <li className={product.status === "active" ? "is-complete" : ""} aria-current={imageCount && product.status === "draft" ? "step" : undefined}>
          <span>{product.status === "active" ? "✓" : "3"}</span>
          <div><strong>Publicar</strong><small>{product.status === "active" ? "Produto no ar" : "Quando estiver pronto"}</small></div>
        </li>
      </ol>
      {query.ok ? <p className="admin-success" role="status">Alteração concluída.</p> : null}
      {query.erro ? <p className="admin-error" role="alert">A ação não pôde ser concluída. Confira os dados e o estado de publicação.</p> : null}
      <ProductForm
        categories={categories ?? []}
        product={{ ...product, status: product.status as ProductStatus }}
      />
      <section className="admin-panel admin-product-media">
        <p className="admin-section-kicker">Passo 2 · Fotos</p>
        <h2>Imagens da peça</h2>
        <ProductImageUploader action={uploadProductImageAction} productId={product.id} productName={product.name} />
        <p className="admin-help">JPEG, PNG e WebP são convertidos e redimensionados no seu dispositivo. O servidor ainda valida tipo real, dimensões, tamanho e loja de destino.</p>
        {imageCount ? (
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
        ) : <div className="admin-empty"><p>Nenhuma imagem enviada. O produto só poderá ser publicado após receber uma imagem principal válida.</p></div>}
      </section>
      {product.status === "draft" && imageCount ? (
        <section className="admin-publish-callout">
          <div>
            <p className="admin-section-kicker">Passo 3 de 3</p>
            <h2>Pronto para aparecer na loja?</h2>
            <p>Revise as informações e publique. Você poderá editar ou marcar como indisponível depois.</p>
          </div>
          <form action={publishProductAction}>
            <input type="hidden" name="id" value={product.id} />
            <button type="submit">Publicar produto</button>
          </form>
        </section>
      ) : null}
    </main>
  );
}
