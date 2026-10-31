import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const original = await prisma.product.findUnique({ where: { id } });
  if (!original) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Buat slug & SKU unik dengan suffix timestamp jika sudah ada
  const ts = Date.now().toString().slice(-5);
  let slug = `copy-${original.slug}`;
  let sku = original.sku ? `Copy-${original.sku}` : null;

  const [existingSlug, existingSku] = await Promise.all([
    prisma.product.findFirst({ where: { slug } }),
    sku ? prisma.product.findFirst({ where: { sku } }) : null,
  ]);
  if (existingSlug) slug = `copy-${original.slug}-${ts}`;
  if (existingSku)  sku  = `Copy-${original.sku}-${ts}`;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _, createdAt, updatedAt, ...rest } = original;

  const duplicate = await prisma.product.create({
    data: {
      ...rest,
      name:       `Copy-${original.name}`,
      slug,
      sku,
      isActive:   false,
      isArchived: false,
    },
  });

  revalidatePath("/admin/products");
  return NextResponse.json(duplicate, { status: 201 });
}
