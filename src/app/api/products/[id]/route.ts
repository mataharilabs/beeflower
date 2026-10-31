import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();

  if (body.sku !== undefined && !body.sku?.trim()) {
    return NextResponse.json({ error: "SKU Produk wajib diisi" }, { status: 400 });
  }

  try {
    const product = await prisma.product.update({ where: { id }, data: body });
    revalidatePath("/");
    revalidatePath("/toko", "page");
    revalidatePath(`/toko/${product.slug}`, "page");
    return NextResponse.json(product);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "SKU sudah digunakan produk lain" }, { status: 409 });
    }
    throw e;
  }
}

// PATCH — aksi spesifik: archive, unarchive, restore
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { action } = await req.json();

  const dataMap: Record<string, Prisma.ProductUpdateInput> = {
    archive:   { isArchived: true,  isActive: true  },
    unarchive: { isArchived: false, isActive: true  },
    restore:   { isActive: true,    isArchived: false },
  };

  if (!dataMap[action]) {
    return NextResponse.json({ error: "Aksi tidak valid" }, { status: 400 });
  }

  const product = await prisma.product.update({ where: { id }, data: dataMap[action] });
  revalidatePath("/");
  revalidatePath("/toko", "page");
  revalidatePath(`/toko/${product.slug}`, "page");
  return NextResponse.json({ success: true });
}

// DELETE — soft delete (default) atau permanent delete (?permanent=true)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const permanent = new URL(req.url).searchParams.get("permanent") === "true";

  if (permanent) {
    await prisma.product.delete({ where: { id } });
  } else {
    // Soft delete — pindah ke Trash
    await prisma.product.update({ where: { id }, data: { isActive: false, isArchived: false } });
  }

  revalidatePath("/");
  revalidatePath("/toko", "page");
  return NextResponse.json({ success: true });
}
