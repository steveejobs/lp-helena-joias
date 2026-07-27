/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { CategoryIcon } from "@/components/store/category-icons";
import { trackAnalyticsEvent } from "@/lib/analytics/client";
import type { CategoryIconKey } from "@/types/commerce";

type PreviewData = {
  categories: Array<{ iconKey: CategoryIconKey; id: string; name: string; slug: string }>;
  products: Array<{
    categoryId: string | null;
    categoryName: string;
    image: { altText: string; height: number | null; url: string | null; width: number | null } | null;
    name: string;
    price: number | null;
    slug: string;
  }>;
  store: { currency: string; locale: string };
};

const fallback = [
  { alt: "Camadas de colares e joias Helena", label: "Colares", src: "/media/gallery-1-2.jpg" },
  { alt: "Brinco em composição Helena", label: "Brincos", src: "/media/gallery-1-4.jpg" },
  { alt: "Anéis e pulseiras Helena em detalhe", label: "Anéis", src: "/media/gallery-1-3.jpg" },
];

const fallbackCategories: PreviewData["categories"] = [
  { iconKey: "necklaces", id: "necklaces", name: "Colares", slug: "colares" },
  { iconKey: "earrings", id: "earrings", name: "Brincos", slug: "brincos" },
  { iconKey: "bracelets", id: "bracelets", name: "Pulseiras", slug: "pulseiras" },
  { iconKey: "rings", id: "rings", name: "Anéis", slug: "aneis" },
  { iconKey: "sets", id: "sets", name: "Conjuntos", slug: "conjuntos" },
];

export function HomeStorePreview() {
  const [data, setData] = useState<PreviewData | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/catalog-preview", { signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((result) => {
        if (result) setData(result as PreviewData);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  const products = data?.products ?? [];
  const categories = data?.categories.length ? data.categories : fallbackCategories;
  const format = (price: number) =>
    new Intl.NumberFormat(data?.store.locale ?? "pt-BR", {
      currency: data?.store.currency ?? "BRL",
      style: "currency",
    }).format(price);

  return (
    <section className="home-store-preview" id="loja-online" aria-labelledby="home-store-title" data-reveal="section">
      <header className="home-store-heading">
        <div>
          <p><span /> A curadoria agora online</p>
          <h2 id="home-store-title">Escolha de perto.<br /><em>Mesmo estando longe.</em></h2>
        </div>
        <div>
          <p>Uma seleção Helena para explorar com calma, guardar na sacola e conferir diretamente pelo WhatsApp.</p>
          <Link href="/loja">Explorar todas as peças <span aria-hidden="true">→</span></Link>
        </div>
      </header>

      <div className="home-store-stage">
        {(products.length ? products.slice(0, 3) : fallback).map((item, index) => {
          const product = "slug" in item ? item : null;
          const editorial = "src" in item ? item : fallback[index];
          const src = product?.image?.url ?? editorial?.src ?? "/media/gallery-2-2.jpg";
          const alt = product?.image?.altText ?? editorial?.alt ?? product?.name ?? "";
          const label = product?.categoryName ?? editorial?.label ?? "Helena Joias";
          return (
            <Link
              className={`home-store-piece home-store-piece-${index + 1}`}
              href={product ? `/produto/${product.slug}` : `/loja/${label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`}
              key={product?.slug ?? label}
              onClick={() => product && void trackAnalyticsEvent({
                categoryId: product.categoryId,
                eventName: "product_clicked",
                metadata: { source: "home_preview" },
              })}
            >
              <span className="home-store-image">
                <img src={src} alt={alt} width={product?.image?.width ?? 900} height={product?.image?.height ?? 1200} loading={index ? "lazy" : "eager"} />
              </span>
              <span className="home-store-piece-copy">
                <small>{label}</small>
                <strong>{product?.name ?? `Descobrir ${label.toLowerCase()}`}</strong>
                <b>{product ? (product.price == null ? "Consultar disponibilidade" : format(product.price)) : "Ver seleção"} <i aria-hidden="true">↗</i></b>
              </span>
            </Link>
          );
        })}
        <aside className="home-store-note">
          <span>Curadoria<br />Helena</span>
          <p>Fotografia real.<br />Escolha sem pressa.<br />Atendimento humano.</p>
        </aside>
      </div>

      <nav className="home-category-line" aria-label="Explorar categorias da loja">
        {categories.map((category) => (
          <Link
            href={`/loja/${category.slug}`}
            key={category.id}
            onClick={() => {
              if (/^[0-9a-f-]{36}$/i.test(category.id)) {
                void trackAnalyticsEvent({ categoryId: category.id, eventName: "category_clicked", metadata: { source: "home_preview" } });
              }
            }}
          >
            <CategoryIcon iconKey={category.iconKey} label="" />
            <span>{category.name}</span>
          </Link>
        ))}
      </nav>
    </section>
  );
}
