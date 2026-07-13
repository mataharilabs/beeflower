import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

const statusLabel: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Menunggu", color: "bg-yellow-50 text-yellow-700" },
  PAID: { label: "Dibayar", color: "bg-blue-50 text-blue-700" },
  PROCESSING: { label: "Diproses", color: "bg-purple-50 text-purple-700" },
  SHIPPED: { label: "Dikirim", color: "bg-cyan-50 text-cyan-700" },
  DELIVERED: { label: "Diterima", color: "bg-green-50 text-green-700" },
  CANCELLED: { label: "Dibatalkan", color: "bg-red-50 text-red-700" },
};

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: { select: { quantity: true } },
    },
    take: 50,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
      </div>

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
                  Belum ada pesanan
                </td>
              </tr>
            )}
            {orders.map((order) => {
              const status = statusLabel[order.status] ?? { label: order.status, color: "bg-gray-50 text-gray-700" };
              return (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">
                    {order.orderNumber}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{order.customerName}</p>
                    <p className="text-gray-400 text-xs">{order.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {formatPrice(Number(order.total))}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {order.paymentMethod === "XENDIT" ? "Xendit" : "Transfer Bank"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(order.createdAt).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-brand-gold hover:text-brand-brown text-xs font-medium"
                    >
                      Detail
                    </Link>
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
