import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { siteDescription, siteName, siteUrl } from "@/app/seo";
import { blogPosts } from "./posts";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Conteúdos da Helena Joias sobre joias, semijoias, presentes e atendimento em Araguaína, Tocantins.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    type: "website",
    url: "/blog",
    siteName,
    title: "Blog | Helena Joias",
    description:
      "Guias locais da Helena Joias para escolher joias e semijoias em Araguaína.",
  },
};

export default function BlogPage() {
  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Blog Helena Joias",
    description: siteDescription,
    url: `${siteUrl}/blog`,
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
    },
    blogPost: blogPosts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: `${siteUrl}/blog/${post.slug}`,
      datePublished: post.date,
    })),
  };

  return (
    <main className="blog-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <header className="blog-hero">
        <Link className="blog-brand" href="/" aria-label="Voltar para a página inicial da Helena Joias">
          <Image src="/media/logo-transparent.png" alt="" width="828" height="828" sizes="44px" priority />
          <span>Helena <small>Joias</small></span>
        </Link>
        <p>Blog Helena Joias</p>
        <h1>Guias para escolher joias e semijoias em Araguaína.</h1>
      </header>

      <section className="blog-list" aria-label="Artigos">
        {blogPosts.map((post) => (
          <article className="blog-card" key={post.slug}>
            <Link href={`/blog/${post.slug}`} aria-label={`Ler ${post.title}`}>
              <Image src={post.image} alt={post.imageAlt} width={1170} height={1560} sizes="(max-width: 760px) 100vw, 33vw" />
              <div>
                <span>{post.readingTime}</span>
                <h2>{post.title}</h2>
                <p>{post.description}</p>
                <small>Ler artigo</small>
              </div>
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
