import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PromotionForm } from "@/components/admin/PromotionForm";

export default async function EditPromotionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [promotion, categories] = await Promise.all([
    prisma.promotion.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!promotion) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Promosi</h1>
      <PromotionForm
        promotion={{
          ...promotion,
          discountMode: promotion.discountMode as "PERCENTAGE" | "FIXED" | null,
          getDiscountMode: promotion.getDiscountMode as "PERCENTAGE" | "FIXED" | null,
        }}
        categories={categories}
      />
    </div>
  );
}
