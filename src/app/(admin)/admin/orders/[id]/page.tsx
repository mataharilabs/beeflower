import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";

const statusLabel: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Menunggu Pembayaran", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  PAID: { label: "Sudah Dibayar", color: "bg-blue-50 text-blue-700 border-blue-200" },
  PROCESSING: { label: "Sedang Diproses", color: "bg-purple-50 text-purple-700 border-purple-200" },
  SHIPPED: { label: "Dikirim", color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  DELIVERED: { label: "Diterima", color: "bg-green-50 text-green-700 border-green-200" },
  CANCELLED: { label: "Dibatalkan", color: "bg-red-50 text-red-700 border-red-200" },
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      paymentProof: true,
    },
  });

  if (!order) notFound();

  const status = statusLabel[order.status] ?? { label: order.status, color: "bg-gray-50 text-gray-700 border-gray-200" };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/orders" className="text-sm text-gray-400 hover:text-gray-600">
          ← Kembali
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
      </div>

      <div className="grid gap-5">
        {/* Status */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-1">Status Pesanan</p>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${status.color}`}>
                {status.label}
              </span>
            </div>
            <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-3">Informasi Pelanggan</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Nama</p>
              <p className="text-gray-900">{order.customerName}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Email</p>
              <p className="text-gray-900">{order.customerEmail}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Telepon</p>
              <p className="text-gray-900">{order.customerPhone}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Metode Pembayaran</p>
              <p className="text-gray-900">
                {order.paymentMethod === "XENDIT" ? "Xendit Online" : "Transfer Bank Manual"}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-400 text-xs mb-0.5">Alamat Pengiriman</p>
              <p className="text-gray-900">
                {order.address}, {order.city}, {order.province} {order.postalCode}
              </p>
            </div>
            {order.notes && (
              <div className="col-span-2">
                <p className="text-gray-400 text-xs mb-0.5">Catatan</p>
                <p className="text-gray-900">{order.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Item Pesanan</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                {item.image && (
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                  <p className="text-xs text-gray-400">{formatPrice(Number(item.price))} × {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 shrink-0">
                  {formatPrice(Number(item.price) * item.quantity)}
                </p>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrice(Number(order.subtotal))}</span>
            </div>
            {Number(order.shippingCost) > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Ongkos Kirim</span>
                <span>{formatPrice(Number(order.shippingCost))}</span>
              </div>
            )}
            {Number(order.discount) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Diskon</span>
                <span>-{formatPrice(Number(order.discount))}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-900 pt-1.5 border-t border-gray-200">
              <span>Total</span>
              <span>{formatPrice(Number(order.total))}</span>
            </div>
          </div>
        </div>

        {/* Payment Proof */}
        {order.paymentProof && (
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-3">Bukti Transfer</h2>
            <div className="flex items-start gap-4">
              <a href={order.paymentProof.imageUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={order.paymentProof.imageUrl}
                  alt="Bukti Transfer"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                />
              </a>
              <div className="text-sm space-y-1">
                <p className="text-gray-400 text-xs">Status</p>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                  order.paymentProof.status === "VERIFIED" ? "bg-green-50 text-green-700" :
                  order.paymentProof.status === "REJECTED" ? "bg-red-50 text-red-700" :
                  "bg-yellow-50 text-yellow-700"
                }`}>
                  {order.paymentProof.status === "VERIFIED" ? "Terverifikasi" :
                   order.paymentProof.status === "REJECTED" ? "Ditolak" : "Menunggu Review"}
                </span>
                {order.paymentProof.notes && (
                  <p className="text-gray-600 mt-2">{order.paymentProof.notes}</p>
                )}
                <p className="text-gray-400 text-xs mt-2">
                  Dikirim: {new Date(order.paymentProof.createdAt).toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="text-xs text-gray-400 text-right space-y-1">
          <p>Dibuat: {new Date(order.createdAt).toLocaleString("id-ID")}</p>
          {order.paidAt && <p>Dibayar: {new Date(order.paidAt).toLocaleString("id-ID")}</p>}
        </div>
      </div>
    </div>
  );
}
