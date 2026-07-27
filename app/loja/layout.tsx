import type { Metadata } from "next";

import { StoreFooter } from "@/components/store/store-footer";
import { StoreHeader } from "@/components/store/store-header";

export const metadata: Metadata = {
  title: "Loja",
  description: "Explore a curadoria de joias Helena por categoria, novidade e destaque.",
  alternates: { canonical: "/loja" },
  openGraph: {
    title: "Loja Helena Joias",
    description: "Uma curadoria de peças escolhidas para acompanhar a sua forma de brilhar.",
    url: "/loja",
    images: ["/media/gallery-2-2.jpg"],
  },
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="store-shell">
      <StoreHeader />
      {children}
      <StoreFooter />
    </div>
  );
}

