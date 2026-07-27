import type { Metadata } from "next";

import "../admin.css";

export const metadata: Metadata = {
  title: { default: "Administração", template: "%s | Administração Helena" },
  robots: { index: false, follow: false, noarchive: true },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}

