import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { ProofUploadSection } from "@/components/shop/ProofUploadSection";
import { XenditPaymentModal } from "@/components/shop/XenditPaymentModal";
import { auth } from "@/lib/auth";
import { MemberSidebar } from "@/components/member/MemberSidebar";

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

  const [session, order] = await Promise.all([
    auth(),
    prisma.order.findUnique({
      where: { id },
      include: { items: true },
    }),
  ]);

  if (!order) notFound();

  const statusInfo = STATUS_INFO[order.status] ?? STATUS_INFO.PENDING;

  const needsProof =
    order.paymentMethod === "MANUAL_TRANSFER" || order.paymentMethod === "QRIS";
  const showProofUpload = needsProof && order.status === "PENDING";

  const [bankAccounts, existingProof] = showProofUpload
    ? await Promise.all([
        prisma.bankAccount.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
        prisma.paymentProof.findUnique({ where: { orderId: id } }),
      ])
    : [[], null];

  const qrisImageUrl =
    order.paymentMethod === "QRIS" && order.status === "PENDING"
      ? await prisma.paymentSettings
          .findUnique({ where: { id: "singleton" }, select: { qrisImageUrl: true } })
          .then((s) => s?.qrisImageUrl ?? null)
          .catch(() => null)
      : null;

  return (
    <div className="min-h-screen bg-brand-cream py-12 px-4">
      <div className={session ? "max-w-5xl mx-auto flex gap-6 items-start" : "max-w-lg mx-auto"}>
        {session && (
          <MemberSidebar userName={session.user?.name} userEmail={session.user?.email} />
        )}
        <div className={session ? "flex-1 min-w-0" : "w-full"}>
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

        {order.paymentMethod === "XENDIT" && order.status === "PENDING" && order.xenditPaymentUrl && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
            <h2 className="font-semibold text-gray-900 mb-2">Selesaikan Pembayaran</h2>
            <p className="text-sm text-gray-500 mb-4">
              Pesanan ini menunggu pembayaran. Klik tombol di bawah untuk melanjutkan.
            </p>
            <XenditPaymentModal
              paymentUrl={order.xenditPaymentUrl}
              orderId={order.id}
              autoOpen={false}
            />
          </div>
        )}

        {order.paymentMethod === "QRIS" && order.status === "PENDING" && qrisImageUrl && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-4 text-center">
            <h2 className="font-semibold text-gray-900 mb-2">Scan QR untuk Bayar</h2>
            <p className="text-sm text-gray-500 mb-4">
              Scan dengan e-wallet atau mobile banking, lalu upload bukti pembayaran di bawah.
            </p>
            <img
              src={qrisImageUrl}
              alt="QRIS"
              className="max-w-[220px] w-full mx-auto rounded-xl border border-gray-200"
            />
          </div>
        )}

        {needsProof && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
            <h2 className="font-semibold text-gray-900 mb-4">
              {order.status === "PENDING"
                ? order.paymentMethod === "QRIS"
                  ? "Upload Bukti Pembayaran QRIS"
                  : "Upload Bukti Transfer"
                : "Bukti Pembayaran"}
            </h2>
            {order.status === "PENDING" ? (
              <ProofUploadSection
                orderId={id}
                bankAccounts={
                  order.paymentMethod === "QRIS"
                    ? []
                    : (bankAccounts as { id: string; bankName: string; accountHolder: string; accountNumber: string; logoUrl: string | null }[])
                }
                hasExistingProof={!!existingProof}
              />
            ) : (
              <p className="text-sm text-gray-500">Pembayaran sudah dikonfirmasi.</p>
            )}
          </div>
        )}

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
                  <p className="text-xs text-gray-400">
                    ×{item.quantity}{item.weight != null ? ` · ${item.weight} gr` : ""}
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {formatPrice(Number(item.price) * item.quantity)}
                </p>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 bg-gray-50 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrice(order.items.reduce((s, i) => s + Number(i.price) * i.quantity, 0))}</span>
            </div>
            {Number(order.shippingCost) > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Ongkos Kirim{order.shippingService ? ` (${order.shippingService})` : ""}</span>
                <span>{formatPrice(Number(order.shippingCost))}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>{formatPrice(Number(order.total))}</span>
            </div>
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

        <div className="flex gap-3">
          <Link
            href="/member/orders"
            className="flex-1 text-center px-4 py-2.5 border border-brand-beige text-brand-brown rounded-xl text-sm font-semibold hover:bg-brand-cream transition-colors"
          >
            Pesanan Saya
          </Link>
          <Link
            href="/toko"
            className="flex-1 text-center px-4 py-2.5 bg-brand-gold text-white rounded-xl text-sm font-semibold hover:bg-brand-brown transition-colors"
          >
            Lanjut Belanja
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
}
