import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, Eye, MousePointerClick } from "lucide-react";
import { PopupDeleteButton } from "@/components/admin/PopupDeleteButton";
import { PopupToggleActive } from "@/components/admin/PopupToggleActive";

function computePopupStatus(popup: {
  isActive: boolean;
  startAt: Date | null;
  endAt: Date | null;
}): { label: string; color: string } {
  const now = new Date();
  if (!popup.isActive) return { label: "Tidak Aktif", color: "bg-gray-100 text-gray-500" };
  if (popup.endAt && popup.endAt < now) return { label: "Berakhir", color: "bg-gray-100 text-gray-500" };
  if (popup.startAt && popup.startAt > now) return { label: "Belum Mulai", color: "bg-yellow-100 text-yellow-700" };
  return { label: "Aktif", color: "bg-green-100 text-green-700" };
}

export default async function PopupsPage() {
  const popups = await prisma.popupAd.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Popup Ads</h1>
        <Link
          href="/admin/popups/new"
          className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-white rounded-lg text-sm font-semibold hover:bg-brand-brown transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Popup
        </Link>
      </div>

      {popups.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-gray-400 text-sm">Belum ada popup. Buat popup pertama Anda.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Judul</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Ukuran</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Statistik</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {popups.map((popup) => {
                const status = computePopupStatus(popup);
                const conversionRate = popup.viewCount > 0
                  ? ((popup.clickCount / popup.viewCount) * 100).toFixed(1)
                  : "0.0";

                return (
                  <tr key={popup.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{popup.title}</p>
                      {popup.description && (
                        <p className="text-xs text-gray-400 truncate max-w-[200px]">{popup.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {popup.width}×{popup.height ?? "auto"} px
                      {popup.delaySeconds > 0 && (
                        <span className="block text-gray-400">Delay: {popup.delaySeconds}s</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Eye className="w-3.5 h-3.5" />
                          {popup.viewCount.toLocaleString("id-ID")}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <MousePointerClick className="w-3.5 h-3.5" />
                          {popup.clickCount.toLocaleString("id-ID")}
                        </span>
                        <span className="text-xs text-brand-gold font-medium">{conversionRate}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/popups/${popup.id}`} className="text-brand-gold hover:text-brand-brown text-xs font-medium">
                          Edit
                        </Link>
                        <PopupToggleActive popupId={popup.id} isActive={popup.isActive} />
                        <PopupDeleteButton popupId={popup.id} popupTitle={popup.title} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
