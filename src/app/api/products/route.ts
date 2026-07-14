import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  const category = searchParams.get("category");
  const sort = searchParams.get("sort") || "createdAt";
  const order = searchParams.get("order") || "desc";
  const search = searchParams.get("search");
  const featured = searchParams.get("featured");
  const bestseller = searchParams.get("bestseller");
  const take = parseInt(searchParams.get("take") || "20");
  const skip = parseInt(searchParams.get("skip") || "0");

  const where: Record<string, unknown> = isAdmin ? {} : { isActive: true };
  if (category) where.categoryId = category;
  if (featured === "true") where.isFeatured = true;
  if (bestseller === "true") where.isBestSeller = true;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { [sort]: order },
      take,
      skip,
      include: { category: { select: { name: true, slug: true } } },
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({ products, total });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const product = await prisma.product.create({ data: body });
  revalidatePath("/");
  revalidatePath("/toko", "page");
  return NextResponse.json(product, { status: 201 });
}
