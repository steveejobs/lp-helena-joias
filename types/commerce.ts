export const HELENA_STORE_ID = "22222222-2222-4222-8222-222222222222";
export const HELENA_STORE_SLUG = "helena-joias";

export type StoreContext = Readonly<{
  id: string;
  slug: string;
}>;

export type Store = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  instagramUrl: string | null;
  whatsappNumber: string | null;
  whatsappDefaultMessage: string | null;
  currency: string;
  locale: string;
  showPrices: boolean;
  active: boolean;
};

export type CategoryIconKey =
  | "necklaces"
  | "earrings"
  | "bracelets"
  | "rings"
  | "sets";

export type Category = {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  description: string | null;
  iconKey: CategoryIconKey;
  coverImageUrl: string | null;
  sortOrder: number;
  active: boolean;
};

export type ProductStatus = "draft" | "active" | "sold_out" | "archived";

export type ProductImage = {
  id: string;
  storeId: string;
  productId: string;
  url: string | null;
  altText: string;
  sortOrder: number;
  isPrimary: boolean;
  width: number | null;
  height: number | null;
};

export type Product = {
  id: string;
  storeId: string;
  categoryId: string | null;
  category: Pick<Category, "id" | "name" | "slug"> | null;
  name: string;
  slug: string;
  sku: string | null;
  shortDescription: string | null;
  description: string | null;
  price: number | null;
  compareAtPrice: number | null;
  status: ProductStatus;
  featured: boolean;
  newArrival: boolean;
  sortOrder: number;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
};

export type CatalogFilters = {
  category?: string;
  availability?: "available" | "sold_out";
  featured?: boolean;
  maxPrice?: number;
  minPrice?: number;
  newArrival?: boolean;
  query?: string;
};

