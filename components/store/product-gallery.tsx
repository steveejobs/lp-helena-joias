"use client";

import Image from "next/image";
import { useState } from "react";

import type { ProductImage } from "@/types/commerce";

export function ProductGallery({
  images,
  productName,
}: {
  images: ProductImage[];
  productName: string;
}) {
  const [activeId, setActiveId] = useState(images[0]?.id);
  const [expanded, setExpanded] = useState(false);
  const active = images.find((image) => image.id === activeId) ?? images[0];

  if (!active?.url) {
    return (
      <div className="product-gallery product-gallery-empty">
        <span>Imagem em preparação</span>
      </div>
    );
  }

  return (
    <div className={`product-gallery${images.length > 1 ? "" : " product-gallery-single"}`}>
      <button
        className="product-main-image"
        type="button"
        onClick={() => setExpanded(true)}
        aria-label={`Ampliar imagem de ${productName}`}
      >
        <Image
          src={active.url}
          alt={active.altText}
          width={active.width ?? 1000}
          height={active.height ?? 1200}
          sizes="(max-width: 800px) 100vw, 58vw"
          preload
          quality={90}
        />
        <span>Ampliar</span>
      </button>
      {images.length > 1 ? (
        <div className="product-thumbnails" aria-label="Outras imagens">
          {images.map((image, index) => (
            <button
              className={image.id === active.id ? "is-active" : undefined}
              type="button"
              onClick={() => setActiveId(image.id)}
              aria-label={`Ver imagem ${index + 1}`}
              aria-pressed={image.id === active.id}
              key={image.id}
            >
              {image.url ? (
                <Image src={image.url} alt="" width={120} height={144} sizes="72px" quality={90} />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
      {expanded ? (
        <div className="product-lightbox" role="dialog" aria-modal="true" aria-label={`Imagem ampliada de ${productName}`}>
          <button type="button" onClick={() => setExpanded(false)} aria-label="Fechar imagem">Fechar ×</button>
          <Image
            src={active.url}
            alt={active.altText}
            width={active.width ?? 1200}
            height={active.height ?? 1400}
            sizes="95vw"
            quality={90}
          />
        </div>
      ) : null}
    </div>
  );
}
