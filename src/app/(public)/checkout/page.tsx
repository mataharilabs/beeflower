"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface PaymentConfig {
  xenditEnabled: boolean;
  manualTransferEnabled: boolean;
}

interface LoggedInUser {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
}

type Step = "form" | "payment";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [paymentUrl, setPaymentUrl] = useState("");
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({ xenditEnabled: false, manualTransferEnabled: true });
  const [isNewUser, setIsNewUser] = useState(false);
  const [newAccountInfo, setNewAccountInfo] = useState<{ email: string; password: string } | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<LoggedInUser | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    customerName: "", customerEmail: "", customerPhone: "",
    address: "", city: "", province: "", postalCode: "",
    notes: "", paymentMethod: "" as "XENDIT" | "MANUAL_TRANSFER" | "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/payment/settings").then((r) => r.json()).catch(() => ({ xenditEnabled: false, manualTransferEnabled: true })),
      fetch("/api/member/profile").then((r) => r.json()).catch(() => null),
    ]).then(([config, profile]) => {
      setPaymentConfig(config);
      if (config.xenditEnabled) setForm((f) => ({ ...f, paymentMethod: "XENDIT" }));
      else if (config.manualTransferEnabled) setForm((f) => ({ ...f, paymentMethod: "MANUAL_TRANSFER" }));

      if (profile?.email) {
        setLoggedInUser(profile);
        setForm((f) => ({
          ...f,
          customerName: profile.name ?? "",
          customerEmail: profile.email ?? "",
          customerPhone: profile.phone ?? "",
          address: profile.address ?? "",
          city: profile.city ?? "",
          province: profile.province ?? "",
          postalCode: profile.postalCode ?? "",
        }));
      }
    });
  }, []);

  useEffect(() => {
    if (items.length === 0 && step === "form" && !submitted) {
      router.replace("/toko");
    }
  }, [items, step, router, submitted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.paymentMethod) return;
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "Gagal checkout");
        return;
      }

      const newUser = data.isNewUser ?? false;
      setIsNewUser(newUser);

      if (newUser && data.autoLoginEmail && data.autoLoginPassword) {
        setNewAccountInfo({ email: data.autoLoginEmail, password: data.autoLoginPassword });
        await signIn("credentials", {
          email: data.autoLoginEmail,
          password: data.autoLoginPassword,
          redirect: false,
        }).catch(() => {});
      }

      setSubmitted(true);
      clearCart();
      setOrderNumber(data.orderNumber);

      if (form.paymentMethod === "XENDIT" && data.paymentUrl) {
        setPaymentUrl(data.paymentUrl);
        setStep("payment");
      } else {
        // MANUAL_TRANSFER: pass new account info via sessionStorage then redirect
        if (newUser && data.autoLoginEmail && data.autoLoginPassword) {
          try {
            sessionStorage.setItem(
              "newAccount",
              JSON.stringify({ email: data.autoLoginEmail, password: data.autoLoginPassword })
            );
          } catch {}
        }
        router.push(
          `/order-success?orderId=${data.orderId}&orderNumber=${encodeURIComponent(data.orderNumber)}&method=transfer`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (step === "payment") {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-sm">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Pesanan Berhasil Dibuat</h2>
            <p className="text-sm text-gray-500">
              No. Pesanan: <strong className="font-mono">{orderNumber}</strong>
            </p>
          </div>

          {isNewUser && newAccountInfo && (
            <div className="mb-6 p-4 bg-brand-cream rounded-xl">
              <p className="text-sm font-semibold text-brand-brown mb-2">Akun Anda Berhasil Dibuat</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500">Email</span>
                  <span className="text-brand-brown font-medium break-all">{newAccountInfo.email}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500">Password</span>
                  <span className="font-mono font-bold text-brand-brown tracking-widest">{newAccountInfo.password}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">Informasi juga dikirim ke email Anda.</p>
            </div>
          )}

          <a
            href={paymentUrl}
            className="block w-full text-center py-3 bg-brand-gold text-white rounded-xl font-semibold hover:bg-brand-brown transition-colors mb-3"
          >
            Bayar Sekarang via Xendit
          </a>
          <p className="text-xs text-gray-400 text-center">Anda akan diarahkan ke halaman pembayaran Xendit</p>
        </div>
      </div>
    );
  }

  // Step: form
  return (
    <div className="min-h-screen bg-brand-cream py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-brand-brown mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Informasi Pengiriman</h2>
                {loggedInUser && (
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    Data terisi otomatis
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                  <input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.customerEmail}
                    onChange={(e) => !loggedInUser && setForm({ ...form, customerEmail: e.target.value })}
                    readOnly={!!loggedInUser}
                    required
                    className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold ${loggedInUser ? "bg-gray-50 text-gray-500 cursor-default" : ""}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No. HP</label>
                  <input value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                    required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
                  <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                    required rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kota</label>
                  <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                    required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provinsi</label>
                  <input value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })}
                    required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kode Pos</label>
                  <input value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                    required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (opsional)</label>
                  <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold" />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
              <h2 className="font-semibold text-gray-900">Metode Pembayaran</h2>
              {!paymentConfig.xenditEnabled && !paymentConfig.manualTransferEnabled && (
                <p className="text-sm text-red-500">Tidak ada metode pembayaran aktif. Hubungi admin.</p>
              )}
              {paymentConfig.xenditEnabled && (
                <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${form.paymentMethod === "XENDIT" ? "border-brand-gold bg-brand-cream" : "border-gray-200"}`}>
                  <input type="radio" name="payment" value="XENDIT" checked={form.paymentMethod === "XENDIT"}
                    onChange={() => setForm({ ...form, paymentMethod: "XENDIT" })} className="sr-only" />
                  <div className={`w-4 h-4 rounded-full border-2 ${form.paymentMethod === "XENDIT" ? "border-brand-gold" : "border-gray-300"} flex items-center justify-center`}>
                    {form.paymentMethod === "XENDIT" && <div className="w-2 h-2 bg-brand-gold rounded-full" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Bayar Online (Xendit)</p>
                    <p className="text-xs text-gray-400">QRIS, Virtual Account, Kartu Kredit, dll</p>
                  </div>
                </label>
              )}
              {paymentConfig.manualTransferEnabled && (
                <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${form.paymentMethod === "MANUAL_TRANSFER" ? "border-brand-gold bg-brand-cream" : "border-gray-200"}`}>
                  <input type="radio" name="payment" value="MANUAL_TRANSFER" checked={form.paymentMethod === "MANUAL_TRANSFER"}
                    onChange={() => setForm({ ...form, paymentMethod: "MANUAL_TRANSFER" })} className="sr-only" />
                  <div className={`w-4 h-4 rounded-full border-2 ${form.paymentMethod === "MANUAL_TRANSFER" ? "border-brand-gold" : "border-gray-300"} flex items-center justify-center`}>
                    {form.paymentMethod === "MANUAL_TRANSFER" && <div className="w-2 h-2 bg-brand-gold rounded-full" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Transfer Bank Manual</p>
                    <p className="text-xs text-gray-400">Transfer ke rekening kami dan upload bukti</p>
                  </div>
                </label>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !form.paymentMethod}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-gold text-white rounded-xl font-bold text-base hover:bg-brand-brown transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              Pesan Sekarang
            </button>
          </form>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-4">
              <h2 className="font-semibold text-gray-900 mb-4">Ringkasan Pesanan</h2>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    {item.image && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">×{item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3">
                <div className="flex justify-between text-base font-bold text-gray-900">
                  <span>Total</span>
                  <span>{formatPrice(totalPrice())}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
