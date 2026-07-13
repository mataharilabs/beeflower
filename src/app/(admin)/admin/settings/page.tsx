import { prisma } from "@/lib/prisma";
import { SettingsClient } from "@/components/admin/SettingsClient";

export default async function SettingsPage() {
  const [settings, paymentSettings, bankAccounts] = await Promise.all([
    prisma.siteSettings.upsert({
      where: { id: "singleton" },
      update: {},
      create: { id: "singleton", updatedAt: new Date() },
    }),
    prisma.paymentSettings.upsert({
      where: { id: "singleton" },
      update: {},
      create: { id: "singleton", updatedAt: new Date() },
    }),
    prisma.bankAccount.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <SettingsClient
      settings={settings}
      paymentSettings={paymentSettings}
      bankAccounts={bankAccounts}
    />
  );
}
