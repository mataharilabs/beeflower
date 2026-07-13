import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { CheckCircle, Clock, XCircle } from "lucide-react";

const STATUS_INFO: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  PENDING: { label: "Menunggu Pembayaran", icon: <Clock className="w-12 h-12" />, color: "text-yellow-500" },
  PAID: { label: "Pembayaran Diterima", icon: <CheckCircle className="w-12 h-12" />, color: "text-green-500" },
  PROCESSING: { label: "Sedang Diproses", icon: <Clock className="w-12 h-12" />, color: "text-blue-500" },
  SHIPPED: { label: "Sedang Dikirim", icon: <CheckCircle className="w-12 h-12" />, color: "text-cyan-500" },
  DELIVERED: { label: "Pesanan Diterima", icon: <CheckCircle className="w-12 h-12" />, color: "text-green-600" },
  CANCELLED: { label: "Pesanan Dibatalkan", icon: <XCircle className="w-12 h-12" />, color: "text-red-500" },
};

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { id } = await params;
  const { status: queryStatus } = await searchParams;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) notFound();

  const statusInfo = STATUS_INFO[order.status] ?? STATUS_INFO.PENDING;

  return (
    <div className="min-h-screen bg-brand-cream py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center mb-6">
          <div className={`flex justify-center mb-4 ${statusInfo.color}`}>
            {statusInfo.icon}
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">{statusInfo.label}</h1>
          <p className="text-sm text-gray-500">
            No. Pesanan: <strong className="font-mono">{order.orderNumber}</strong>
          </p>
          {queryStatus === "success" && (
            <p className="text-sm text-green-600 mt-2 bg-green-50 rounded-lg px-3 py-2">
              Terima kasih! Pesanan Anda berhasil dibuat.
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Detail Pesanan</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-6 py-3">
                {item.image && (
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                  <p className="text-xs text-gray-400">×{item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {formatPrice(Number(item.price) * item.quantity)}
                </p>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 bg-gray-50 flex justify-between items-center font-bold text-gray-900">
            <span>Total</span>
            <span>{formatPrice(Number(order.total))}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">Informasi Pengiriman</h2>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>{order.customerName}</strong></p>
            <p>{order.customerPhone}</p>
            <p>{order.address}, {order.city}, {order.province} {order.postalCode}</p>
          </div>
        </div>

        <div className="text-center">
          <Link href="/toko" className="inline-block px-6 py-2.5 bg-brand-gold text-white rounded-xl font-semibold hover:bg-brand-brown transition-colors">
            Lanjut Belanja
          </Link>
        </div>
      </div>
    </div>
  );
}
