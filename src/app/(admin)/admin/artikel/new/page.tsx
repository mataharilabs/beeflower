import { prisma } from "@/lib/prisma";
import { ArticleForm } from "@/components/admin/ArticleForm";

export default async function NewArtikelPage() {
  const categories = await prisma.articleCategory.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Artikel Baru</h1>
      <ArticleForm categories={categories} />
    </div>
  );
}
