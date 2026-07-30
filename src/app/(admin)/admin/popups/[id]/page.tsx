import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Eye, MousePointerClick, TrendingUp } from "lucide-react";
import { PopupForm } from "@/components/admin/PopupForm";

function computePopupStatus(popup: { isActive: boolean; startAt: Date | null; endAt: Date | null }) {
  const now = new Date();
  if (!popup.isActive) return { label: "Tidak Aktif", color: "bg-gray-100 text-gray-600" };
  if (popup.endAt && popup.endAt < now) return { label: "Berakhir", color: "bg-gray-100 text-gray-500" };
  if (popup.startAt && popup.startAt > now) return { label: "Belum Mulai", color: "bg-yellow-100 text-yellow-700" };
  return { label: "Aktif", color: "bg-green-100 text-green-700" };
}

export default async function PopupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const popup = await prisma.popupAd.findUnique({ where: { id } });
  if (!popup) notFound();

  const status = computePopupStatus(popup);
  const conversionRate = popup.viewCount > 0
    ? ((popup.clickCount / popup.viewCount) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/popups" className="text-sm text-gray-400 hover:text-gray-600">
          ← Kembali
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Popup</h1>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm mb-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="flex items-center gap-1.5 text-gray-500 mb-1 justify-center">
                <Eye className="w-4 h-4" />
                <span className="text-xs font-medium">Views</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{popup.viewCount.toLocaleString("id-ID")}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1.5 text-gray-500 mb-1 justify-center">
                <MousePointerClick className="w-4 h-4" />
                <span className="text-xs font-medium">Klik</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{popup.clickCount.toLocaleString("id-ID")}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1.5 text-brand-gold mb-1 justify-center">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium">Konversi</span>
              </div>
              <p className="text-2xl font-bold text-brand-gold">{conversionRate}%</p>
            </div>
          </div>
          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
            {status.label}
          </span>
        </div>
      </div>

      <PopupForm popup={popup} />
    </div>
  );
}
