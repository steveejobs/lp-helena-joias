import "server-only";

import { headers } from "next/headers";

import {
  HELENA_STORE_ID,
  HELENA_STORE_SLUG,
  type StoreContext,
} from "@/types/commerce";

const KNOWN_STORES: Record<string, StoreContext> = {
  [HELENA_STORE_SLUG]: {
    id: HELENA_STORE_ID,
    slug: HELENA_STORE_SLUG,
  },
};

function configuredDomainMap(): Record<string, string> {
  const raw = process.env.STORE_DOMAIN_MAP?.trim();
  if (!raw) return {};

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

    return Object.fromEntries(
      Object.entries(parsed).filter(
        (entry): entry is [string, string] =>
          typeof entry[1] === "string" && Boolean(KNOWN_STORES[entry[1]]),
      ),
    );
  } catch {
    return {};
  }
}

function contextForSlug(slug: string | undefined): StoreContext | null {
  if (!slug) return null;
  return KNOWN_STORES[slug] ?? null;
}

export async function resolveStoreContext(): Promise<StoreContext> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const hostname = host?.split(":")[0]?.toLowerCase();
  const domainSlug = hostname ? configuredDomainMap()[hostname] : undefined;

  return (
    contextForSlug(domainSlug) ??
    contextForSlug(process.env.NEXT_PUBLIC_STORE_SLUG?.trim()) ??
    KNOWN_STORES[HELENA_STORE_SLUG]
  );
}

export function helenaStoreContext(): StoreContext {
  return KNOWN_STORES[HELENA_STORE_SLUG];
}

export function assertHelenaStore(context: StoreContext) {
  if (
    context.id !== HELENA_STORE_ID ||
    context.slug !== HELENA_STORE_SLUG
  ) {
    throw new Error("Contexto de loja não autorizado para esta aplicação.");
  }
}

