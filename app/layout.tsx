import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Helena Joias | Um novo conceito em joias",
  description: "Conheça a Helena Joias: uma experiência de beleza, brilho e exclusividade para descobrir, combinar e escolher novas formas de presença.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/media/logo-background.jpg",
    shortcut: "/media/logo-background.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
