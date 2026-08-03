import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  instagramUrl,
  siteDescription,
  siteName,
  siteTitle,
  siteUrl,
  store,
  storeLocationUrl,
} from "./seo";

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
    default: siteTitle,
    template: "%s | Helena Joias",
  },
  description: siteDescription,
  applicationName: siteName,
  category: "Joalheria",
  creator: siteName,
  publisher: siteName,
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
    languages: {
      "pt-BR": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName,
    title: siteTitle,
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
    title: siteTitle,
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
  verification:
    process.env.GOOGLE_SITE_VERIFICATION || process.env.BING_SITE_VERIFICATION
      ? {
          google: process.env.GOOGLE_SITE_VERIFICATION,
          other: process.env.BING_SITE_VERIFICATION
            ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION }
            : undefined,
        }
      : undefined,
  icons: {
    icon: "/media/favicon.png",
    shortcut: "/media/favicon.png",
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
        "@type": "JewelryStore",
        "@id": `${siteUrl}/#organization`,
        name: siteName,
        legalName: store.legalName,
        url: siteUrl,
        description: siteDescription,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/media/logo-transparent.png`,
          width: 828,
          height: 828,
        },
        image: [
          `${siteUrl}/media/gallery-2-2.jpg`,
          `${siteUrl}/media/gallery-1-4.jpg`,
          `${siteUrl}/media/gallery-3-3.jpg`,
        ],
        telephone: store.telephone,
        address: {
          "@type": "PostalAddress",
          streetAddress: store.streetAddress,
          addressLocality: store.city,
          addressRegion: store.state,
          postalCode: store.postalCode,
          addressCountry: store.country,
        },
        areaServed: [
          {
            "@type": "City",
            name: `${store.city}, Tocantins`,
          },
          {
            "@type": "AdministrativeArea",
            name: "Tocantins",
          },
        ],
        hasMap: storeLocationUrl,
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            opens: "08:00",
            closes: "18:00",
          },
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: "Saturday",
            opens: "08:00",
            closes: "12:00",
          },
        ],
        sameAs: [instagramUrl],
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
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/#webpage`,
        url: siteUrl,
        name: siteTitle,
        description: siteDescription,
        inLanguage: "pt-BR",
        isPartOf: {
          "@id": `${siteUrl}/#website`,
        },
        about: {
          "@id": `${siteUrl}/#organization`,
        },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: `${siteUrl}/media/gallery-2-2.jpg`,
          width: 1170,
          height: 1560,
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
