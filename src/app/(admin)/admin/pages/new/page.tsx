import { redirect } from "next/navigation";

// Tambah halaman sekarang lewat modal di /admin/pages
export default function NewPagePage() {
  redirect("/admin/pages");
}
