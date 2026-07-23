import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Helena Joias | Links oficiais",
  description: "Acesse as coleções e o perfil oficial da Helena Joias.",
};

export default function InstagramLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
