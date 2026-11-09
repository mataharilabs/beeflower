import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article) return {};
  return {
    title: article.metaTitle ?? article.title,
    description: article.metaDescription ?? article.excerpt ?? undefined,
    openGraph: article.coverImage ? { images: [article.coverImage] } : undefined,
  };
}

function formatDate(date: Date) {
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: { category: { select: { name: true, slug: true } } },
  });

  if (!article) notFound();

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Cover */}
      {article.coverImage && (
        <div className="w-full h-64 md:h-96 overflow-hidden">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-brand-beige mb-6">
          <Link href="/blog" className="hover:text-brand-gold transition-colors">Blog</Link>
          {article.category && (
            <>
              <span>/</span>
              <Link
                href={`/blog?cat=${article.category.slug}`}
                className="hover:text-brand-gold transition-colors"
              >
                {article.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-brand-brown truncate">{article.title}</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          {article.category && (
            <Link
              href={`/blog?cat=${article.category.slug}`}
              className="text-xs font-semibold text-brand-gold uppercase tracking-wider hover:text-brand-brown transition-colors"
            >
              {article.category.name}
            </Link>
          )}
          <h1 className="text-2xl md:text-3xl font-bold text-brand-brown mt-2 mb-3">
            {article.title}
          </h1>
          <p className="text-sm text-brand-beige">
            {formatDate(article.publishedAt ?? article.createdAt)}
            {article.createdBy && (
              <span> · Ditulis oleh <span className="font-medium text-brand-brown">{article.createdBy}</span></span>
            )}
          </p>
          {article.excerpt && (
            <p className="mt-4 text-brand-beige border-l-4 border-brand-gold pl-4">
              {article.excerpt}
            </p>
          )}
        </div>

        {/* Content */}
        <div
          className="prose prose-headings:text-brand-brown prose-a:text-brand-gold prose-strong:text-brand-brown max-w-none bg-white rounded-2xl p-6 md:p-8 shadow-sm"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Back */}
        <div className="mt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-brand-gold hover:text-brand-brown transition-colors font-medium"
          >
            ← Kembali ke Blog
          </Link>
        </div>
      </div>
    </div>
  );
}
