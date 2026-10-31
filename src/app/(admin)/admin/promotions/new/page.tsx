import { prisma } from "@/lib/prisma";
import { PromotionForm } from "@/components/admin/PromotionForm";

export default async function NewPromotionPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tambah Promosi Baru</h1>
      <PromotionForm categories={categories} />
    </div>
  );
}
