import type { Metadata } from "next";

import { StoreFooter } from "@/components/store/store-footer";
import { StoreHeader } from "@/components/store/store-header";

export const metadata: Metadata = {
  title: "Sacola",
  description: "Revise sua seleção e solicite atendimento pelo WhatsApp.",
  alternates: { canonical: "/carrinho" },
  robots: { index: false, follow: true },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="store-shell">
      <StoreHeader />
      {children}
      <StoreFooter />
    </div>
  );
}

