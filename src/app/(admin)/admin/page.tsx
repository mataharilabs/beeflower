import { prisma } from "@/lib/prisma";
import {
  Package,
  ShoppingCart,
  Users,
  MessageSquare,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default async function AdminDashboard() {
  const [
    totalOrders,
    pendingOrders,
    totalRevenue,
    totalProducts,
    totalUsers,
    newMessages,
    pendingProofs,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.aggregate({
      where: { status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] } },
      _sum: { total: true },
    }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.contactMessage.count({ where: { isRead: false } }),
    prisma.paymentProof.count({ where: { status: "PENDING" } }),
  ]);

  const stats = [
    {
      label: "Total Pesanan",
      value: totalOrders.toString(),
      sub: `${pendingOrders} menunggu konfirmasi`,
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Total Pendapatan",
      value: formatPrice(Number(totalRevenue._sum.total ?? 0)),
      sub: "dari pesanan terbayar",
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Produk Aktif",
      value: totalProducts.toString(),
      sub: "produk tersedia",
      icon: Package,
      color: "text-brand-gold",
      bg: "bg-brand-cream",
    },
    {
      label: "Total Pengguna",
      value: totalUsers.toString(),
      sub: "customer terdaftar",
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Pesan Baru",
      value: newMessages.toString(),
      sub: "belum dibaca",
      icon: MessageSquare,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "Bukti Transfer",
      value: pendingProofs.toString(),
      sub: "menunggu verifikasi",
      icon: CreditCard,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
