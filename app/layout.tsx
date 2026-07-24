import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { siteDescription, siteName, siteUrl } from "./seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Helena Joias | Loja de joias e acessórios",
    template: "%s | Helena Joias",
  },
  description: siteDescription,
  applicationName: siteName,
  category: "joias",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName,
    title: "Helena Joias | Loja de joias e acessórios",
    description: siteDescription,
    images: [
      {
        url: "/media/gallery-2-2.jpg",
        width: 1170,
        height: 1560,
        alt: "Seleção de colares, brincos e anéis da Helena Joias",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Helena Joias | Loja de joias e acessórios",
    description: siteDescription,
    images: ["/media/gallery-2-2.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
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
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: siteName,
        url: siteUrl,
        description: siteDescription,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/media/logo-transparent.png`,
          width: 828,
          height: 828,
        },
        image: `${siteUrl}/media/gallery-2-2.jpg`,
        sameAs: ["https://www.instagram.com/helenaajoias/"],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: siteName,
        description: siteDescription,
        inLanguage: "pt-BR",
        publisher: {
          "@id": `${siteUrl}/#organization`,
        },
      },
    ],
  };

  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
        {children}
      </body>
    </html>
  );
}
