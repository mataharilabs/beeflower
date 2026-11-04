import Link from "next/link";
import { Suspense } from "react";
import { Prisma, OrderStatus, PaymentMethod } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DeleteOrderButton } from "@/components/admin/DeleteOrderButton";
import { OrderFilters } from "@/components/admin/OrderFilters";

const PAGE_SIZE = 20;

const STATUS_TABS = [
  { value: "",                     label: "Semua" },
  { value: "PENDING",              label: "Menunggu Pembayaran" },
  { value: "PAYMENT_CONFIRMATION", label: "Konfirmasi Pembayaran" },
  { value: "PAID",                 label: "Dibayar" },
  { value: "PROCESSING",           label: "Diproses" },
  { value: "SHIPPED",              label: "Dikirim" },
  { value: "DELIVERED",            label: "Diterima" },
  { value: "CANCELLED",            label: "Dibatalkan" },
] as const;

const statusLabel: Record<string, { label: string; color: string }> = {
  PENDING:              { label: "Menunggu",              color: "bg-yellow-50 text-yellow-700" },
  PAYMENT_CONFIRMATION: { label: "Konfirmasi Pembayaran", color: "bg-orange-50 text-orange-700" },
  PAID:                 { label: "Dibayar",               color: "bg-blue-50 text-blue-700" },
  PROCESSING:           { label: "Diproses",              color: "bg-purple-50 text-purple-700" },
  SHIPPED:              { label: "Dikirim",               color: "bg-cyan-50 text-cyan-700" },
  DELIVERED:            { label: "Diterima",              color: "bg-green-50 text-green-700" },
  CANCELLED:            { label: "Dibatalkan",            color: "bg-red-50 text-red-700" },
};

const paymentLabel: Record<string, string> = {
  XENDIT:          "Xendit Online",
  MANUAL_TRANSFER: "Transfer Bank",
  QRIS:            "QRIS",
};

function getPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  if (current > 3) pages.push("…");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
  if (current < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; payment?: string; page?: string }>;
}) {
  const { search = "", status = "", payment = "", page = "1" } = await searchParams;
  const trimmedSearch = search.trim();
  const pageNum = Math.max(1, parseInt(page) || 1);
  const skip = (pageNum - 1) * PAGE_SIZE;

  const where: Prisma.OrderWhereInput = {};

  if (trimmedSearch) {
    where.OR = [
      { customerName: { contains: trimmedSearch, mode: "insensitive" } },
      { orderNumber:  { contains: trimmedSearch, mode: "insensitive" } },
    ];
  }

  if (status && Object.values(OrderStatus).includes(status as OrderStatus)) {
    where.status = status as OrderStatus;
  }

  if (payment && Object.values(PaymentMethod).includes(payment as PaymentMethod)) {
    where.paymentMethod = payment as PaymentMethod;
  }

  const statusKeys: OrderStatus[] = [
    OrderStatus.PENDING,
    OrderStatus.PAYMENT_CONFIRMATION,
    OrderStatus.PAID,
    OrderStatus.PROCESSING,
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED,
  ];

  // Run main data queries first, then status counts separately to avoid
  // Neon HTTP adapter enum serialization issues when batching too many queries
  const [orders, filteredCount] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      include: { items: { select: { quantity: true, image: true, productName: true } } },
    }),
    prisma.order.count({ where }),
  ]);

  const perStatusCounts = await Promise.all(
    statusKeys.map((s) => prisma.order.count({ where: { status: s } }))
  );

  const totalPages = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE));
  const safePage = Math.min(pageNum, totalPages);
  const from = filteredCount === 0 ? 0 : skip + 1;
  const to = Math.min(skip + PAGE_SIZE, filteredCount);
  const pageNumbers = getPageNumbers(safePage, totalPages);

  const countByStatus: Record<string, number> = Object.fromEntries(
    statusKeys.map((k, i) => [k, perStatusCounts[i]])
  );
  const totalCount = perStatusCounts.reduce((sum, c) => sum + c, 0);

  const buildHref = (overrides: Record<string, string | undefined>) => {
    const base = {
      status:  status  || undefined,
      search:  trimmedSearch || undefined,
      payment: payment || undefined,
    };
    const merged = { ...base, ...overrides };
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    const qs = params.toString();
    return `/admin/orders${qs ? `?${qs}` : ""}`;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">Total {totalCount} pesanan</p>
        </div>
      </div>

      {/* Status tab bar */}
      <div className="flex flex-wrap gap-2 mb-4">
        {STATUS_TABS.map((tab) => {
          const count = tab.value ? (countByStatus[tab.value] ?? 0) : totalCount;
          const isActive = status === tab.value;
          return (
            <Link
              key={tab.value}
              href={buildHref({ status: tab.value || undefined, page: undefined })}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full border transition-colors whitespace-nowrap ${
                isActive
                  ? "border-brand-gold bg-brand-gold/10 text-brand-gold"
                  : "border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 bg-white"
              }`}
            >
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-normal ${
                isActive ? "bg-brand-gold/20 text-brand-gold" : "bg-gray-100 text-gray-500"
              }`}>
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Search + payment filter + result count */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <Suspense fallback={null}>
          <OrderFilters initialSearch={trimmedSearch} initialPayment={payment} />
        </Suspense>
        {filteredCount > 0 && (
          <p className="text-xs text-gray-400 whitespace-nowrap shrink-0">
            {trimmedSearch
              ? `${filteredCount} hasil untuk "${trimmedSearch}"`
              : `${from}–${to} dari ${filteredCount}`}
          </p>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3 font-medium">No. Pesanan</th>
              <th className="text-left px-4 py-3 font-medium">Pelanggan</th>
              <th className="text-left px-4 py-3 font-medium">Produk</th>
              <th className="text-left px-4 py-3 font-medium">Total</th>
              <th className="text-left px-4 py-3 font-medium">Pembayaran</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Tanggal</th>
              <th className="text-left px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                  {trimmedSearch || status || payment
                    ? "Tidak ada pesanan yang sesuai filter"
                    : "Belum ada pesanan"}
                </td>
              </tr>
            )}
            {orders.map((order) => {
              const s = statusLabel[order.status] ?? { label: order.status, color: "bg-gray-50 text-gray-700" };
              return (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-mono text-xs text-brand-gold hover:text-brand-brown font-medium transition-colors"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{order.customerName}</p>
                    <p className="text-gray-400 text-xs">{order.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {order.items.slice(0, 3).map((item, i) =>
                        item.image ? (
                          <img
                            key={i}
                            src={item.image}
                            alt={item.productName}
                            title={item.productName}
                            className="w-8 h-8 rounded-md object-cover border border-gray-100 shrink-0"
                          />
                        ) : null
                      )}
                      {order.items.length > 3 && (
                        <span className="text-xs text-gray-400">+{order.items.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {formatPrice(Number(order.total))}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {order.paymentMethod ? (paymentLabel[order.paymentMethod] ?? order.paymentMethod) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
                      {s.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(order.createdAt).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-brand-gold hover:text-brand-brown text-xs font-medium transition-colors"
                      >
                        Detail
                      </Link>
                      <DeleteOrderButton orderId={order.id} orderNumber={order.orderNumber} />
                    </div>
                  </td>
                </tr>
              );
            })}
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
                <Link
                  key={p}
                  href={buildHref({ page: p === 1 ? undefined : String(p) })}
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
