import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { ProductFilters } from "@/components/admin/ProductFilters";
import { ProductActions } from "@/components/admin/ProductActions";
import { ProductImagePreview, ProductImagePlaceholder } from "@/components/admin/ProductImagePreview";

const PAGE_SIZE = 20;

type Tab = "all" | "archive" | "trash";

function getPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  if (current > 3) pages.push("…");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
  if (current < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}

const TAB_WHERE = {
  all:     { isActive: true,  isArchived: false },
  archive: { isArchived: true },
  trash:   { isActive: false, isArchived: false },
} satisfies Record<Tab, object>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; tab?: string; sort?: string }>;
}) {
  const { page = "1", search = "", tab: rawTab = "all", sort = "createdAt" } = await searchParams;
  const tab = (["all", "archive", "trash"].includes(rawTab) ? rawTab : "all") as Tab;
  const pageNum = Math.max(1, parseInt(page) || 1);
  const skip = (pageNum - 1) * PAGE_SIZE;
  const trimmedSearch = search.trim();
  const orderBy = sort === "updatedAt" ? { updatedAt: "desc" as const } : { createdAt: "desc" as const };

  const searchFilter = trimmedSearch
    ? {
        OR: [
          { name: { contains: trimmedSearch, mode: "insensitive" as const } },
          { sku:  { contains: trimmedSearch, mode: "insensitive" as const } },
        ],
      }
    : {};

  const where = trimmedSearch
    ? { AND: [TAB_WHERE[tab], searchFilter] }
    : TAB_WHERE[tab];

  const [products, total, allCount, archiveCount, trashCount] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      include: { category: { select: { name: true } } },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
    prisma.product.count({ where: TAB_WHERE.all }),
    prisma.product.count({ where: TAB_WHERE.archive }),
    prisma.product.count({ where: TAB_WHERE.trash }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(pageNum, totalPages);
  const from = total === 0 ? 0 : skip + 1;
  const to = Math.min(skip + PAGE_SIZE, total);
  const pageNumbers = getPageNumbers(safePage, totalPages);

  const buildHref = (overrides: Record<string, string | undefined>) => {
    const base = { tab: tab === "all" ? undefined : tab, search: trimmedSearch || undefined, sort: sort === "createdAt" ? undefined : sort };
    const merged = { ...base, ...overrides };
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    const qs = params.toString();
    return `/admin/products${qs ? `?${qs}` : ""}`;
  };

  const tabCounts = { all: allCount, archive: archiveCount, trash: trashCount };
  const tabLabels: Record<Tab, string> = { all: "Semua", archive: "Archive", trash: "Trash" };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">Total {allCount} produk aktif</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-white rounded-lg text-sm font-medium hover:bg-brand-brown transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Produk
        </Link>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-4 border-b border-gray-100">
        {(["all", "archive", "trash"] as Tab[]).map((t) => (
          <Link
            key={t}
            href={buildHref({ tab: t === "all" ? undefined : t, page: undefined })}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t
                ? "border-brand-gold text-brand-gold"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tabLabels[t]}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-normal ${
              tab === t ? "bg-brand-gold/10 text-brand-gold" : "bg-gray-100 text-gray-500"
            }`}>
              {tabCounts[t]}
            </span>
          </Link>
        ))}
      </div>

      {/* Search + sort + info */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <Suspense fallback={null}>
          <ProductFilters initialSearch={trimmedSearch} initialSort={sort} />
        </Suspense>
        {total > 0 && (
          <p className="text-xs text-gray-400 whitespace-nowrap shrink-0">
            {trimmedSearch
              ? `${total} hasil untuk "${trimmedSearch}"`
              : `${from}–${to} dari ${total}`}
          </p>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium w-16"></th>
              <th className="text-left px-4 py-3 font-medium">Produk</th>
              <th className="text-left px-4 py-3 font-medium">Kategori</th>
              <th className="text-left px-4 py-3 font-medium">Harga</th>
              <th className="text-left px-4 py-3 font-medium">Stok</th>
              {tab !== "trash" && <th className="text-left px-4 py-3 font-medium">Status</th>}
              <th className="text-left px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.length === 0 && (
              <tr>
                <td colSpan={tab !== "trash" ? 8 : 7} className="px-4 py-10 text-center text-gray-400">
                  {trimmedSearch
                    ? `Tidak ada produk untuk "${trimmedSearch}"`
                    : tab === "archive" ? "Tidak ada produk di Archive"
                    : tab === "trash" ? "Tidak ada produk di Trash"
                    : "Belum ada produk"}
                </td>
              </tr>
            )}
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3">
                  <span className="font-mono text-xs text-gray-500">{product.sku ?? "—"}</span>
                </td>
                <td className="px-2 py-2">
                  {product.images[0]
                    ? <ProductImagePreview src={product.images[0]} name={product.name} />
                    : <ProductImagePlaceholder />}
                </td>
                <td className="px-4 py-3">
                  <div>
                    <Link href={`/admin/products/${product.id}`} className="font-medium text-gray-900 hover:text-brand-gold transition-colors">
                      {product.name}
                    </Link>
                    <p className="text-gray-400 text-xs">{product.slug}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {product.category?.name ?? "—"}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {formatPrice(Number(product.price))}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-medium ${
                    product.stock > 10 ? "text-green-600" :
                    product.stock > 0  ? "text-orange-500" : "text-red-500"
                  }`}>{product.stock}</span>
                </td>
                {tab !== "trash" && (
                  <td className="px-4 py-3">
                    {tab === "archive" ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                        Archive
                      </span>
                    ) : (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        product.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {product.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    )}
                  </td>
                )}
                <td className="px-4 py-3">
                  <ProductActions
                    id={product.id}
                    name={product.name}
                    sku={product.sku}
                    tab={tab}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-gray-500">Halaman {safePage} dari {totalPages}</p>
          <div className="flex items-center gap-1">
            {safePage > 1 ? (
              <Link href={buildHref({ page: String(safePage - 1) })} className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </Link>
            ) : (
              <span className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-100 rounded-lg text-gray-300 cursor-not-allowed">
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </span>
            )}
            {pageNumbers.map((p, i) =>
              p === "…" ? (
                <span key={`e${i}`} className="px-2 py-1.5 text-xs text-gray-400">…</span>
              ) : (
                <Link key={p} href={buildHref({ page: p === 1 ? undefined : String(p) })}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    p === safePage ? "bg-brand-gold text-white font-medium" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </Link>
              )
            )}
            {safePage < totalPages ? (
              <Link href={buildHref({ page: String(safePage + 1) })} className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
                Next <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <span className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-100 rounded-lg text-gray-300 cursor-not-allowed">
                Next <ChevronRight className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
