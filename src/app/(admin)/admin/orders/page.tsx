import Link from "next/link";
import { Suspense } from "react";
import { Prisma, OrderStatus, PaymentMethod } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { DeleteOrderButton } from "@/components/admin/DeleteOrderButton";
import { OrderFilters } from "@/components/admin/OrderFilters";

const statusLabel: Record<string, { label: string; color: string }> = {
  PENDING:    { label: "Menunggu",  color: "bg-yellow-50 text-yellow-700" },
  PAID:       { label: "Dibayar",   color: "bg-blue-50 text-blue-700" },
  PROCESSING: { label: "Diproses",  color: "bg-purple-50 text-purple-700" },
  SHIPPED:    { label: "Dikirim",   color: "bg-cyan-50 text-cyan-700" },
  DELIVERED:  { label: "Diterima",  color: "bg-green-50 text-green-700" },
  CANCELLED:  { label: "Dibatalkan",color: "bg-red-50 text-red-700" },
};

const paymentLabel: Record<string, string> = {
  XENDIT:          "Xendit Online",
  MANUAL_TRANSFER: "Transfer Bank",
  QRIS:            "QRIS",
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; payment?: string }>;
}) {
  const { search = "", status = "", payment = "" } = await searchParams;
  const trimmedSearch = search.trim();

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

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { items: { select: { quantity: true } } },
    }),
    prisma.order.count(),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">Total {total} pesanan</p>
        </div>
      </div>

      <Suspense fallback={null}>
        <OrderFilters
          initialSearch={trimmedSearch}
          initialStatus={status}
          initialPayment={payment}
        />
      </Suspense>

      {(trimmedSearch || status || payment) && (
        <p className="text-xs text-gray-400 mb-3">
          {orders.length} hasil
          {trimmedSearch && ` untuk "${trimmedSearch}"`}
          {status && ` · ${statusLabel[status]?.label ?? status}`}
          {payment && ` · ${paymentLabel[payment] ?? payment}`}
        </p>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3 font-medium">No. Pesanan</th>
              <th className="text-left px-4 py-3 font-medium">Pelanggan</th>
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
                <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
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
    </div>
  );
}
