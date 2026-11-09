import Link from "next/link";
import { Suspense } from "react";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { ArticleSearch } from "@/components/admin/ArticleSearch";
import { DeleteArticleButton } from "@/components/admin/DeleteArticleButton";

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  PUBLISHED: { label: "Published", color: "bg-green-50 text-green-700" },
  DRAFT:     { label: "Draft",     color: "bg-gray-100 text-gray-600" },
  TRASH:     { label: "Trash",     color: "bg-red-50 text-red-600" },
};

const TABS = [
  { value: "",          label: "Semua" },
  { value: "PUBLISHED", label: "Published" },
  { value: "DRAFT",     label: "Draft" },
  { value: "TRASH",     label: "Sampah" },
];

export default async function AdminArtikelPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  const { search = "", status = "" } = await searchParams;
  const trimmedSearch = search.trim();

  const where: Prisma.ArticleWhereInput = {};
  if (trimmedSearch) {
    where.title = { contains: trimmedSearch, mode: "insensitive" };
  }
  if (status && ["PUBLISHED", "DRAFT", "TRASH"].includes(status)) {
    where.status = status as "PUBLISHED" | "DRAFT" | "TRASH";
  } else {
    // Default: exclude trash from "all"
    where.status = { not: "TRASH" };
  }

  const [articles, counts] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { category: { select: { name: true } } },
    }),
    prisma.article.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
  ]);

  const countMap: Record<string, number> = {};
  for (const c of counts) countMap[c.status] = c._count.id;
  const totalNonTrash = (countMap["PUBLISHED"] ?? 0) + (countMap["DRAFT"] ?? 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Artikel</h1>
          <p className="text-sm text-gray-500 mt-0.5">{totalNonTrash} artikel</p>
        </div>
        <Link
          href="/admin/artikel/new"
          className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-white rounded-lg text-sm font-semibold hover:bg-brand-brown transition-colors"
        >
          <Plus className="w-4 h-4" /> Artikel Baru
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 border-b border-gray-200">
        {TABS.map((tab) => {
          const count =
            tab.value === ""
              ? totalNonTrash
              : (countMap[tab.value] ?? 0);
          const isActive = status === tab.value;
          const href = tab.value
            ? `/admin/artikel?status=${tab.value}${trimmedSearch ? `&search=${trimmedSearch}` : ""}`
            : `/admin/artikel${trimmedSearch ? `?search=${trimmedSearch}` : ""}`;
          return (
            <Link
              key={tab.value}
              href={href}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                isActive
                  ? "border-brand-gold text-brand-gold"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}{" "}
              <span className={`text-xs ${isActive ? "text-brand-gold" : "text-gray-400"}`}>
                ({count})
              </span>
            </Link>
          );
        })}
      </div>

      {/* Search */}
      <div className="mb-4">
        <Suspense fallback={null}>
          <ArticleSearch initialSearch={trimmedSearch} />
        </Suspense>
      </div>

      {trimmedSearch && (
        <p className="text-xs text-gray-400 mb-3">{articles.length} hasil untuk &quot;{trimmedSearch}&quot;</p>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3 font-medium">Artikel</th>
              <th className="text-left px-4 py-3 font-medium">Kategori</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Dibuat</th>
              <th className="text-left px-4 py-3 font-medium">Diupdate</th>
              <th className="text-left px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {articles.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                  {trimmedSearch ? "Tidak ada artikel yang sesuai" : "Belum ada artikel"}
                </td>
              </tr>
            )}
            {articles.map((article) => {
              const s = STATUS_LABEL[article.status] ?? { label: article.status, color: "bg-gray-100 text-gray-600" };
              return (
                <tr key={article.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {article.coverImage && (
                        <img
                          src={article.coverImage}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover shrink-0 border border-gray-100"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate max-w-xs">{article.title}</p>
                        <p className="text-xs text-gray-400 font-mono">/blog/{article.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {article.category?.name ?? <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
                      {s.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    <p>{new Date(article.createdAt).toLocaleDateString("id-ID")}</p>
                    {article.createdBy && <p className="text-gray-400">oleh {article.createdBy}</p>}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    <p>{new Date(article.updatedAt).toLocaleDateString("id-ID")}</p>
                    {article.updatedBy && <p className="text-gray-400">oleh {article.updatedBy}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/artikel/${article.id}/edit`}
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-brand-gold transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <DeleteArticleButton
                        articleId={article.id}
                        articleTitle={article.title}
                        isTrash={article.status === "TRASH"}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
