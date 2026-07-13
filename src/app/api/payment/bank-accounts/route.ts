import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const accounts = await prisma.bankAccount.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(accounts);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const account = await prisma.bankAccount.create({
    data: {
      bankName: body.bankName,
      accountHolder: body.accountHolder,
      accountNumber: body.accountNumber,
      logoUrl: body.logoUrl || null,
    },
  });
  return NextResponse.json(account, { status: 201 });
}
