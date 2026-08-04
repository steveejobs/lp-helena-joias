import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { siteName } from "@/app/seo";
import { store, storeLocationUrl } from "@/lib/brand/copy";
import { blogPosts, getBlogJsonLd, getBlogPost } from "../posts";

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      type: "article",
      siteName,
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      images: [
        {
          url: post.image,
          width: 1170,
          height: 1560,
          alt: post.imageAlt,
        },
      ],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="blog-post-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getBlogJsonLd(post)).replace(/</g, "\\u003c"),
        }}
      />
      <nav className="article-nav" aria-label="Navegação do artigo">
        <Link href="/">Helena Joias</Link>
        <Link href="/blog">Blog</Link>
      </nav>

      <article className="article-shell">
        <header className="article-hero">
          <div>
            <p>{post.tags.join(" · ")}</p>
            <h1>{post.title}</h1>
            <span>{post.readingTime} de leitura</span>
          </div>
          <Image src={post.image} alt={post.imageAlt} width={1170} height={1560} sizes="(max-width: 860px) 100vw, 38vw" priority />
        </header>

        <div className="article-content">
          <p className="article-intro">{post.intro}</p>
          {post.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>
      </article>

      <aside className="article-visit" aria-label="Informações da loja">
        <div>
          <p>Visite a Helena Joias</p>
          <h2>Loja física em Araguaína, TO.</h2>
        </div>
        <address>
          {store.streetAddress}
          <br />
          {store.neighborhood} · {store.city}-{store.state}
          <br />
          CEP {store.postalCode}
        </address>
        <a href={storeLocationUrl} target="_blank" rel="noreferrer">Traçar rota</a>
      </aside>
    </main>
  );
}
