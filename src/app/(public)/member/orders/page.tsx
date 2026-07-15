import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Menunggu Pembayaran", color: "bg-yellow-100 text-yellow-700" },
  PAID: { label: "Pembayaran Diterima", color: "bg-blue-100 text-blue-700" },
  PROCESSING: { label: "Diproses", color: "bg-purple-100 text-purple-700" },
  SHIPPED: { label: "Dikirim", color: "bg-indigo-100 text-indigo-700" },
  DELIVERED: { label: "Diterima", color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Dibatalkan", color: "bg-red-100 text-red-700" },
};

export default async function MemberOrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/member/orders");

  const [user, orders] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, phone: true, createdAt: true },
    }),
    prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: { select: { productName: true, quantity: true, price: true, image: true } },
      },
    }),
  ]);

  return (
    <div className="min-h-screen bg-brand-cream py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-brand-gold flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {user?.name?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div>
                <h1 className="font-bold text-xl text-brand-brown">{user?.name}</h1>
                <p className="text-sm text-brand-beige">{user?.email}</p>
                {user?.phone && <p className="text-sm text-brand-beige">{user.phone}</p>}
              </div>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="text-xs text-brand-beige hover:text-red-500 transition-colors px-3 py-1.5 border border-brand-beige/40 rounded-lg"
              >
                Keluar
              </button>
            </form>
          </div>
        </div>

        {/* Orders Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg text-brand-brown">
            Riwayat Pesanan{" "}
            {orders.length > 0 && (
              <span className="text-brand-beige font-normal text-sm">({orders.length})</span>
            )}
          </h2>
          <Link href="/toko" className="text-sm text-brand-gold hover:underline">
            Belanja Lagi
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <p className="text-brand-beige mb-2">Belum ada pesanan</p>
            <p className="text-sm text-brand-beige mb-6">Mulai belanja produk Bee &amp; Flower Brand</p>
            <Link
              href="/toko"
              className="inline-block px-6 py-2.5 bg-brand-gold text-white rounded-lg font-semibold text-sm hover:bg-brand-brown transition-colors"
            >
              Ke Toko
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = STATUS_CONFIG[order.status] ?? {
                label: order.status,
                color: "bg-gray-100 text-gray-700",
              };
              return (
                <Link
                  key={order.id}
                  href={`/toko/pesanan/${order.id}`}
                  className="block bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="font-bold text-brand-brown">#{order.orderNumber}</p>
                      <p className="text-xs text-brand-beige mt-0.5">
                        {order.createdAt.toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  <div className="flex items-start gap-3 mb-3">
                    {order.items[0]?.image && (
                      <img
                        src={order.items[0].image}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-brand-cream"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      {order.items.slice(0, 2).map((item, i) => (
                        <p key={i} className="text-sm text-brand-brown truncate">
                          {item.productName}{" "}
                          <span className="text-brand-beige">×{item.quantity}</span>
                        </p>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-xs text-brand-beige">
                          +{order.items.length - 2} produk lainnya
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-brand-beige/20">
                    <span className="text-xs text-brand-beige">
                      {order.paymentMethod === "XENDIT" ? "Bayar Online" : "Transfer Bank"}
                    </span>
                    <span className="font-bold text-brand-gold">
                      {formatPrice(Number(order.total))}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
