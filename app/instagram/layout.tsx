import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Links oficiais",
  description: "Acesse as coleções e o perfil oficial da Helena Joias.",
  alternates: {
    canonical: "/instagram",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function InstagramLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
