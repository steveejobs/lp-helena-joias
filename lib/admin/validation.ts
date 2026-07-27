export function textValue(
  formData: FormData,
  name: string,
  options: { max: number; min?: number; optional: true },
): string | null;
export function textValue(
  formData: FormData,
  name: string,
  options: { max: number; min?: number; optional?: false },
): string;
export function textValue(
  formData: FormData,
  name: string,
  options: { max: number; min?: number; optional?: boolean },
) {
  const value = String(formData.get(name) ?? "").trim();
  if (!value && options.optional) return null;
  if (value.length < (options.min ?? 1) || value.length > options.max) {
    throw new Error(`Campo inválido: ${name}.`);
  }
  return value;
}

export function slugValue(value: string) {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("Slug inválido.");
  }
  return slug;
}

export function optionalMoney(formData: FormData, name: string) {
  const raw = String(formData.get(name) ?? "").trim().replace(",", ".");
  if (!raw) return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0 || value > 9999999999) {
    throw new Error(`Valor inválido: ${name}.`);
  }
  return Math.round(value * 100) / 100;
}

export function integerValue(
  formData: FormData,
  name: string,
  options: { max?: number; min?: number } = {},
) {
  const value = Number(formData.get(name));
  const min = options.min ?? 0;
  const max = options.max ?? 100000;
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`Ordem inválida: ${name}.`);
  }
  return value;
}

export function checked(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

export function uuidValue(formData: FormData, name: string, optional: true): string | null;
export function uuidValue(formData: FormData, name: string, optional?: false): string;
export function uuidValue(formData: FormData, name: string, optional = false) {
  const value = String(formData.get(name) ?? "").trim();
  if (!value && optional) return null;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    throw new Error(`Identificador inválido: ${name}.`);
  }
  return value;
}
