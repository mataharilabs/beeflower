import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { OrderSuccessContent } from "./OrderSuccessContent";

interface BankAccount {
  id: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  logoUrl: string | null;
}

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; orderNumber?: string; method?: string }>;
}) {
  const { method } = await searchParams;

  let bankAccounts: BankAccount[] = [];
  let qrisImageUrl: string | null = null;

  if (method === "transfer") {
    bankAccounts = await prisma.bankAccount.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      select: { id: true, bankName: true, accountHolder: true, accountNumber: true, logoUrl: true },
    });
  } else if (method === "qris") {
    const paySettings = await prisma.paymentSettings
      .findUnique({ where: { id: "singleton" } })
      .catch(() => null);
    qrisImageUrl = paySettings?.qrisImageUrl ?? null;
  }

  return (
    <Suspense>
      <OrderSuccessContent bankAccounts={bankAccounts} qrisImageUrl={qrisImageUrl} />
    </Suspense>
  );
}
