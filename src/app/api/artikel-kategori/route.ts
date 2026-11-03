import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { nanoid } from "nanoid";

function toSlug(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Nama kategori wajib diisi" }, { status: 400 });
  }

  const slug = toSlug(name);
  const existing = await prisma.articleCategory.findUnique({ where: { slug } });
  if (existing) return NextResponse.json(existing);

  const category = await prisma.articleCategory.create({
    data: { id: nanoid(), name: name.trim(), slug },
  });

  return NextResponse.json(category, { status: 201 });
}
