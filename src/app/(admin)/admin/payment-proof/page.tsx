import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { PaymentProofActions } from "@/components/admin/PaymentProofActions";

export default async function PaymentProofPage() {
  const proofs = await prisma.paymentProof.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      order: {
        select: {
          orderNumber: true,
          customerName: true,
          customerEmail: true,
          total: true,
        },
      },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bukti Transfer</h1>
        <p className="text-sm text-gray-400">
          {proofs.filter((p) => p.status === "PENDING").length} menunggu review
        </p>
      </div>

      <div className="space-y-4">
        {proofs.length === 0 && (
          <div className="bg-white rounded-xl p-10 text-center text-gray-400 border border-gray-100 shadow-sm">
            Belum ada bukti transfer
          </div>
        )}
        {proofs.map((proof) => (
          <div key={proof.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-5">
            <a href={proof.imageUrl} target="_blank" rel="noopener noreferrer" className="shrink-0">
              <img
                src={proof.imageUrl}
                alt="Bukti Transfer"
                className="w-24 h-24 object-cover rounded-lg border border-gray-200"
              />
            </a>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{proof.order.customerName}</p>
                  <p className="text-sm text-gray-500">{proof.order.customerEmail}</p>
                  <p className="text-xs font-mono text-gray-400 mt-1">#{proof.order.orderNumber}</p>
                </div>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                  proof.status === "VERIFIED" ? "bg-green-50 text-green-700" :
                  proof.status === "REJECTED" ? "bg-red-50 text-red-700" :
                  "bg-yellow-50 text-yellow-700"
                }`}>
                  {proof.status === "VERIFIED" ? "Terverifikasi" :
                   proof.status === "REJECTED" ? "Ditolak" : "Menunggu Review"}
                </span>
              </div>
              <p className="text-brand-gold font-bold mt-2">
                {formatPrice(Number(proof.order.total))}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Dikirim: {new Date(proof.createdAt).toLocaleString("id-ID")}
              </p>
              {proof.status === "PENDING" && (
                <PaymentProofActions proofId={proof.id} orderId={proof.orderId} />
              )}
              {proof.reviewNotes && (
                <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded px-2 py-1">
                  Catatan: {proof.reviewNotes}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
