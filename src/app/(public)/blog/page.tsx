import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Search } from "lucide-react";

export const metadata = {
  title: "Blog",
  description: "Artikel dan informasi terbaru dari Bee & Flower Brand",
};

function formatDate(date: Date) {
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string }>;
}) {
  const { q = "", cat = "" } = await searchParams;

  const [articles, categories] = await Promise.all([
    prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        ...(q.trim() && { title: { contains: q.trim(), mode: "insensitive" } }),
        ...(cat && { category: { slug: cat } }),
      },
      orderBy: { publishedAt: "desc" },
      include: { category: { select: { name: true, slug: true } } },
    }),
    prisma.articleCategory.findMany({
      orderBy: { name: "asc" },
      where: { articles: { some: { status: "PUBLISHED" } } },
    }),
  ]);

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Hero */}
      <div className="bg-brand-brown py-16 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Blog</h1>
        <p className="text-brand-beige text-sm max-w-md mx-auto">
          Artikel, tips, dan inspirasi dari Bee &amp; Flower Brand
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {/* Search */}
          <form method="get" action="/blog" className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Cari artikel..."
              className="w-full pl-9 pr-3 py-2 border border-brand-beige/40 rounded-lg text-sm bg-white focus:outline-none focus:border-brand-gold"
            />
            {cat && <input type="hidden" name="cat" value={cat} />}
          </form>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/blog${q ? `?q=${q}` : ""}`}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                !cat
                  ? "bg-brand-gold text-white"
                  : "bg-white border border-brand-beige/40 text-brand-brown hover:border-brand-gold"
              }`}
            >
              Semua
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/blog?cat=${c.slug}${q ? `&q=${q}` : ""}`}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  cat === c.slug
                    ? "bg-brand-gold text-white"
                    : "bg-white border border-brand-beige/40 text-brand-brown hover:border-brand-gold"
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Article grid */}
        {articles.length === 0 ? (
          <div className="text-center py-20 text-brand-beige">
            {q || cat ? "Tidak ada artikel yang sesuai" : "Belum ada artikel yang dipublish"}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/blog/${article.slug}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {article.coverImage ? (
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-44 object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-44 bg-brand-cream flex items-center justify-center text-brand-beige/50 text-4xl">
                    ✿
                  </div>
                )}
                <div className="p-5">
                  {article.category && (
                    <span className="text-xs font-semibold text-brand-gold uppercase tracking-wider">
                      {article.category.name}
                    </span>
                  )}
                  <h2 className="font-bold text-brand-brown mt-1 mb-2 line-clamp-2 group-hover:text-brand-gold transition-colors">
                    {article.title}
                  </h2>
                  {article.excerpt && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">{article.excerpt}</p>
                  )}
                  <p className="text-xs text-brand-beige">
                    {formatDate(article.publishedAt ?? article.createdAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
