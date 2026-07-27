type SupabasePublicEnv = {
  publishableKey: string;
  url: string;
};

function required(value: string | undefined, name: string) {
  if (!value?.trim()) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}.`);
  }
  return value.trim();
}

export function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() &&
      process.env.SUPABASE_SECRET_KEY?.trim(),
  );
}

export function getSupabasePublicEnv(): SupabasePublicEnv {
  const rawUrl = required(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    "NEXT_PUBLIC_SUPABASE_URL",
  );
  const publishableKey = required(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  );

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL possui formato inválido.");
  }

  const local = parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost";
  if (parsed.protocol !== "https:" && !(local && parsed.protocol === "http:")) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL deve usar HTTPS fora do ambiente local.");
  }
  if (
    !publishableKey.startsWith("sb_publishable_") &&
    !(publishableKey.startsWith("eyJ") && publishableKey.split(".").length === 3)
  ) {
    throw new Error("A chave pública do Supabase possui formato inválido.");
  }

  return { publishableKey, url: parsed.origin };
}

export function getSupabaseSecretKey() {
  const value = required(process.env.SUPABASE_SECRET_KEY, "SUPABASE_SECRET_KEY");
  if (!value.startsWith("sb_secret_") && !value.startsWith("eyJ")) {
    throw new Error("SUPABASE_SECRET_KEY possui formato inválido.");
  }
  return value;
}

