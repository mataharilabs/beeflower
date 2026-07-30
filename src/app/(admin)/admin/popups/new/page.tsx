import Link from "next/link";
import { PopupForm } from "@/components/admin/PopupForm";

export default function NewPopupPage() {
  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/popups" className="text-sm text-gray-400 hover:text-gray-600">
          ← Kembali
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Tambah Popup Baru</h1>
      </div>
      <PopupForm />
    </div>
  );
}
