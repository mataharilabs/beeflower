import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Plus, ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { QuickStockEdit } from "@/components/admin/QuickStockEdit";
import { ProductFilters } from "@/components/admin/ProductFilters";

const PAGE_SIZE = 20;

function getPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  if (current > 3) pages.push("…");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
  if (current < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const { page = "1", search = "" } = await searchParams;
  const pageNum = Math.max(1, parseInt(page) || 1);
  const skip = (pageNum - 1) * PAGE_SIZE;
  const trimmedSearch = search.trim();

  const where = trimmedSearch
    ? { name: { contains: trimmedSearch, mode: "insensitive" as const } }
    : {};

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { category: { select: { name: true } } },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(pageNum, totalPages);
  const from = total === 0 ? 0 : skip + 1;
  const to = Math.min(skip + PAGE_SIZE, total);

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (trimmedSearch) params.set("search", trimmedSearch);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/admin/products${qs ? `?${qs}` : ""}`;
  };

  const pageNumbers = getPageNumbers(safePage, totalPages);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">Total {total} produk</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-white rounded-lg text-sm font-medium hover:bg-brand-brown transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Produk
        </Link>
      </div>

      {/* Search + info row */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <Suspense fallback={null}>
          <ProductFilters initialSearch={trimmedSearch} />
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
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                  {trimmedSearch ? `Tidak ada produk untuk "${trimmedSearch}"` : "Belum ada produk"}
                </td>
              </tr>
            )}
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3">
                  <span className="font-mono text-xs text-gray-500">{product.sku ?? "—"}</span>
                </td>
                <td className="px-2 py-2">
                  {product.images[0] ? (
                    <div className="relative w-10 h-10 rounded-md overflow-hidden bg-gray-100 shrink-0">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center shrink-0">
                      <ImageOff className="w-4 h-4 text-gray-300" />
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
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
                  <QuickStockEdit productId={product.id} stock={product.stock} />
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      product.isActive
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {product.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-brand-gold hover:text-brand-brown text-xs font-medium"
                    >
                      Edit
                    </Link>
                    <DeleteProductButton id={product.id} name={product.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-gray-500">
            Halaman {safePage} dari {totalPages}
          </p>
          <div className="flex items-center gap-1">
            {safePage > 1 ? (
              <Link
                href={buildHref(safePage - 1)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Prev
              </Link>
            ) : (
              <span className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-100 rounded-lg text-gray-300 cursor-not-allowed">
                <ChevronLeft className="w-3.5 h-3.5" />
                Prev
              </span>
            )}

            {pageNumbers.map((p, i) =>
              p === "…" ? (
                <span key={`ellipsis-${i}`} className="px-2 py-1.5 text-xs text-gray-400">
                  …
                </span>
              ) : (
                <Link
                  key={p}
                  href={buildHref(p)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    p === safePage
                      ? "bg-brand-gold text-white font-medium"
                      : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </Link>
              )
            )}

            {safePage < totalPages ? (
              <Link
                href={buildHref(safePage + 1)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <span className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-100 rounded-lg text-gray-300 cursor-not-allowed">
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
