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

  const body = await req.json();
  const { title, slug, excerpt, content, coverImage, status, categoryId, metaTitle, metaDescription } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Judul wajib diisi" }, { status: 400 });
  }

  const finalSlug = slug?.trim() || toSlug(title);

  const existing = await prisma.article.findUnique({ where: { slug: finalSlug } });
  if (existing) {
    return NextResponse.json({ error: "Slug sudah digunakan, gunakan slug lain" }, { status: 400 });
  }

  const article = await prisma.article.create({
    data: {
      id: nanoid(),
      title: title.trim(),
      slug: finalSlug,
      excerpt: excerpt?.trim() || null,
      content: content || "",
      coverImage: coverImage || null,
      status: status || "DRAFT",
      categoryId: categoryId || null,
      metaTitle: metaTitle?.trim() || null,
      metaDescription: metaDescription?.trim() || null,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
    },
  });

  return NextResponse.json(article, { status: 201 });
}
