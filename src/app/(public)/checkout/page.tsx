"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { XenditPaymentModal } from "@/components/shop/XenditPaymentModal";

interface PaymentConfig {
  xenditEnabled: boolean;
  manualTransferEnabled: boolean;
  qrisEnabled: boolean;
  qrisImageUrl: string | null;
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

interface RegionItem { id: number; name: string }

interface ShippingOption {
  id: string;
  courier: string;
  service: string;
  label: string;
  price: number;
  etd: string;
  type: "kiriminaja" | "flat";
}

type Step = "form" | "payment";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [paymentUrl, setPaymentUrl] = useState("");
  const [createdOrderId, setCreatedOrderId] = useState("");
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({ xenditEnabled: false, manualTransferEnabled: true, qrisEnabled: false, qrisImageUrl: null });
  const [isNewUser, setIsNewUser] = useState(false);
  const [newAccountInfo, setNewAccountInfo] = useState<{ email: string; password: string } | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<LoggedInUser | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    customerName: "", customerEmail: "", customerPhone: "",
    address: "", city: "", province: "", postalCode: "",
    notes: "", paymentMethod: "" as "XENDIT" | "MANUAL_TRANSFER" | "QRIS" | "",
  });

  const [activeProvider, setActiveProvider] = useState<"kiriminaja" | "rajaongkir" | null>(null);

  // Region cascading state
  const [provinces, setProvinces] = useState<RegionItem[]>([]);
  const [cities, setCities] = useState<RegionItem[]>([]);
  const [districts, setDistricts] = useState<RegionItem[]>([]);
  const [subdistricts, setSubdistricts] = useState<RegionItem[]>([]);

  const [provinsiId, setProvinsiId] = useState<number | null>(null);
  const [kabupatenId, setKabupatenId] = useState<number | null>(null);
  const [kecamatanId, setKecamatanId] = useState<number | null>(null);
  const [kelurahanId, setKelurahanId] = useState<number | null>(null);
  const [kecamatanName, setKecamatanName] = useState("");
  const [kelurahanName, setKelurahanName] = useState("");

  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [loadingRates, setLoadingRates] = useState(false);
  const [ratesError, setRatesError] = useState(false);
  const [productWeights, setProductWeights] = useState<Map<string, number | null>>(new Map());
  const [weightError, setWeightError] = useState(false);
  const [ratesOrigin, setRatesOrigin] = useState<string | null>(null);

  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingSubdistricts, setLoadingSubdistricts] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    couponId: string; code: string; title: string;
    discount: number; discountType: "SHIPPING" | "PRODUCT";
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  useEffect(() => {
    const init = async () => {
      const [config, profile, shippingConfig] = await Promise.all([
        fetch("/api/payment/settings").then((r) => r.json()).catch(() => ({ xenditEnabled: false, manualTransferEnabled: true })),
        fetch("/api/member/profile").then((r) => r.json()).catch(() => null),
        fetch("/api/shipping/settings").then((r) => r.json()).catch(() => null),
      ]);

      setPaymentConfig(config);
      if (config.xenditEnabled) setForm((f) => ({ ...f, paymentMethod: "XENDIT" }));
      else if (config.manualTransferEnabled) setForm((f) => ({ ...f, paymentMethod: "MANUAL_TRANSFER" }));
      else if (config.qrisEnabled) setForm((f) => ({ ...f, paymentMethod: "QRIS" }));

      if (profile?.email) {
        setLoggedInUser(profile);
        setForm((f) => ({
          ...f,
          customerName: profile.name ?? "",
          customerEmail: profile.email ?? "",
          customerPhone: profile.phone ?? "",
          address: profile.address ?? "",
          postalCode: profile.postalCode ?? "",
        }));
      }

      const provider: "kiriminaja" | "rajaongkir" | null =
        shippingConfig?.kiriminajaEnabled ? "kiriminaja" :
        shippingConfig?.rajaongkirEnabled ? "rajaongkir" : null;
      setActiveProvider(provider);

      if (provider) {
        const url = provider === "kiriminaja" ? "/api/kiriminaja/provinces" : "/api/rajaongkir/provinces";
        const provincesData = await fetch(url).then((r) => r.json()).catch(() => ({ data: [] }));
        setProvinces(provincesData.data ?? []);
        checkProductWeights();
      } else {
        fetchRates({});
      }
    };
    init();
  }, []);

  const applyWeightsFromResponse = (data: { productWeights?: { productId: string; weight: number | null }[]; weightError?: boolean; storeOrigin?: string | null }) => {
    if (data.productWeights) {
      setProductWeights(new Map(data.productWeights.map((pw) => [pw.productId, pw.weight])));
    }
    if (data.weightError) setWeightError(true);
    if (data.storeOrigin) setRatesOrigin(data.storeOrigin);
  };

  const checkProductWeights = async () => {
    try {
      const res = await fetch("/api/shipping/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map((i) => ({ productId: i.id, quantity: i.quantity })) }),
      });
      const data = await res.json();
      applyWeightsFromResponse(data);
    } catch {}
  };

  const fetchRates = async (params: Record<string, unknown>) => {
    setLoadingRates(true);
    setRatesError(false);
    setShippingOptions([]);
    setSelectedShipping(null);
    try {
      const res = await fetch("/api/shipping/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map((i) => ({ productId: i.id, quantity: i.quantity })), ...params }),
      });
      const data = await res.json();
      applyWeightsFromResponse(data);
      setShippingOptions(data.options ?? []);
      if ((data.options ?? []).length === 0 && !data.weightError) setRatesError(true);
    } catch {
      setRatesError(true);
    } finally {
      setLoadingRates(false);
    }
  };

  const handleProvinceChange = async (id: number, name: string) => {
    setProvinsiId(id);
    setForm((f) => ({ ...f, province: name, city: "" }));
    setKabupatenId(null); setKecamatanId(null); setKelurahanId(null);
    setKecamatanName(""); setKelurahanName("");
    setCities([]); setDistricts([]); setSubdistricts([]);
    setShippingOptions([]); setSelectedShipping(null);
    if (!id) return;
    setLoadingCities(true);
    const url = activeProvider === "rajaongkir"
      ? `/api/rajaongkir/cities?province_id=${id}`
      : `/api/kiriminaja/cities?provinsi_id=${id}`;
    const d = await fetch(url).then((r) => r.json()).catch(() => ({ data: [] }));
    setCities(d.data ?? []);
    setLoadingCities(false);
  };

  const handleCityChange = async (id: number, name: string) => {
    setKabupatenId(id);
    setForm((f) => ({ ...f, city: name }));
    setKecamatanId(null); setKelurahanId(null);
    setKecamatanName(""); setKelurahanName("");
    setDistricts([]); setSubdistricts([]);
    setShippingOptions([]); setSelectedShipping(null);
    if (!id) return;
    setLoadingDistricts(true);
    const url = activeProvider === "rajaongkir"
      ? `/api/rajaongkir/districts?city_id=${id}`
      : `/api/kiriminaja/districts?kabupaten_id=${id}`;
    const d = await fetch(url).then((r) => r.json()).catch(() => ({ data: [] }));
    setDistricts(d.data ?? []);
    setLoadingDistricts(false);
  };

  const handleDistrictChange = async (id: number, name: string) => {
    setKecamatanId(id);
    setKecamatanName(name);
    setKelurahanId(null); setKelurahanName("");
    setSubdistricts([]);
    setShippingOptions([]); setSelectedShipping(null);
    if (!id) return;
    if (activeProvider === "rajaongkir") {
      // RajaOngkir: rates calculated at district level
      await fetchRates({ districtId: id });
    } else {
      // KiriminAja: load subdistricts, rates calculated after subdistrict
      setLoadingSubdistricts(true);
      const d = await fetch(`/api/kiriminaja/subdistricts?kecamatan_id=${id}`).then((r) => r.json()).catch(() => ({ data: [] }));
      setSubdistricts(d.data ?? []);
      setLoadingSubdistricts(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
          city: form.city || undefined,
          subtotal: totalPrice(),
          shippingCost: selectedShipping?.price ?? 0,
        }),
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon(data);
        setCouponCode("");
      } else {
        setCouponError(data.error ?? "Kode kupon tidak valid");
      }
    } catch {
      setCouponError("Gagal memvalidasi kupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSubdistrictChange = async (id: number, name: string) => {
    setKelurahanId(id);
    setKelurahanName(name);
    if (!id || !kabupatenId) return;
    if (activeProvider === "rajaongkir") {
      // RajaOngkir: subdistrict is optional, rates already calculated at district level
      return;
    }
    await fetchRates({ kabupatenId, kelurahanId: id });
  };

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
          district: kecamatanName || undefined,
          subdistrict: kelurahanName || undefined,
          shippingCost: selectedShipping?.price ?? 0,
          shippingMethod: selectedShipping?.type ?? "free",
          shippingService: selectedShipping?.label ?? undefined,
          shippingCourier: selectedShipping?.courier ?? undefined,
          couponCode: appliedCoupon?.code ?? undefined,
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
      setCreatedOrderId(data.orderId ?? "");

      if (form.paymentMethod === "XENDIT" && data.paymentUrl) {
        setPaymentUrl(data.paymentUrl);
        setStep("payment");
      } else {
        if (newUser && data.autoLoginEmail && data.autoLoginPassword) {
          try {
            sessionStorage.setItem(
              "newAccount",
              JSON.stringify({ email: data.autoLoginEmail, password: data.autoLoginPassword })
            );
          } catch {}
        }
        const method = form.paymentMethod === "QRIS" ? "qris" : "transfer";
        router.push(
          `/order-success?orderId=${data.orderId}&orderNumber=${encodeURIComponent(data.orderNumber)}&method=${method}`
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

          <div className="flex flex-col items-center gap-2">
            <XenditPaymentModal
              paymentUrl={paymentUrl}
              orderId={createdOrderId}
              autoOpen={true}
            />
            <p className="text-xs text-gray-400 text-center mt-1">
              Pembayaran diproses langsung di halaman ini
            </p>
          </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provinsi</label>
                  {activeProvider ? (
                    <select
                      value={provinsiId ?? ""}
                      onChange={(e) => {
                        const id = Number(e.target.value);
                        const name = provinces.find((p) => p.id === id)?.name ?? "";
                        handleProvinceChange(id, name);
                      }}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold bg-white"
                    >
                      <option value="">-- Pilih Provinsi --</option>
                      {provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  ) : (
                    <input
                      value={form.province}
                      onChange={(e) => setForm({ ...form, province: e.target.value })}
                      required
                      placeholder="Nama provinsi"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kota / Kabupaten</label>
                  {activeProvider ? (
                    <select
                      value={kabupatenId ?? ""}
                      onChange={(e) => {
                        const id = Number(e.target.value);
                        const name = cities.find((c) => c.id === id)?.name ?? "";
                        handleCityChange(id, name);
                      }}
                      required
                      disabled={!provinsiId || loadingCities}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold bg-white disabled:bg-gray-50 disabled:text-gray-400"
                    >
                      <option value="">{loadingCities ? "Memuat..." : provinsiId ? "-- Pilih Kota/Kabupaten --" : "Pilih provinsi dahulu"}</option>
                      {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  ) : (
                    <input
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      required
                      placeholder="Nama kota/kabupaten"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kecamatan</label>
                  {activeProvider ? (
                    <select
                      value={kecamatanId ?? ""}
                      onChange={(e) => {
                        const id = Number(e.target.value);
                        const name = districts.find((d) => d.id === id)?.name ?? "";
                        handleDistrictChange(id, name);
                      }}
                      required
                      disabled={!kabupatenId || loadingDistricts}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold bg-white disabled:bg-gray-50 disabled:text-gray-400"
                    >
                      <option value="">{loadingDistricts ? "Memuat..." : kabupatenId ? "-- Pilih Kecamatan --" : "Pilih kota dahulu"}</option>
                      {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  ) : (
                    <input
                      value={kecamatanName}
                      onChange={(e) => setKecamatanName(e.target.value)}
                      placeholder="Nama kecamatan (opsional)"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold"
                    />
                  )}
                </div>
                {activeProvider === "kiriminaja" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kelurahan</label>
                  <select
                    value={kelurahanId ?? ""}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      const name = subdistricts.find((s) => s.id === id)?.name ?? "";
                      handleSubdistrictChange(id, name);
                    }}
                    required
                    disabled={!kecamatanId || loadingSubdistricts}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold bg-white disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    <option value="">{loadingSubdistricts ? "Memuat..." : kecamatanId ? "-- Pilih Kelurahan --" : "Pilih kecamatan dahulu"}</option>
                    {subdistricts.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                )}
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

            {/* Weight Error */}
            {weightError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                Salah satu product tidak memiliki berat, Ongkir tidak bisa di hitung, hubungi Admin
              </div>
            )}

            {/* Shipping Options */}
            {(shippingOptions.length > 0 || loadingRates) && (
              <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
                <h2 className="font-semibold text-gray-900">Ongkos Kirim</h2>
                {ratesOrigin && form.city && (
                  <p className="text-xs text-gray-400">
                    Pengiriman dari <strong className="text-gray-600">{ratesOrigin}</strong>
                    {" ke "}
                    <strong className="text-gray-600">{form.city}</strong>
                  </p>
                )}
                {loadingRates && (
                  <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menghitung ongkos kirim...
                  </div>
                )}
                {!loadingRates && ratesError && shippingOptions.length === 0 && (
                  <p className="text-sm text-red-500">Ongkos kirim tidak tersedia untuk lokasi ini. Hubungi admin.</p>
                )}
                {!loadingRates && shippingOptions.map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${selectedShipping?.id === opt.id ? "border-brand-gold bg-brand-cream" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <input type="radio" name="shipping" value={opt.id} checked={selectedShipping?.id === opt.id}
                      onChange={() => setSelectedShipping(opt)} className="sr-only" />
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${selectedShipping?.id === opt.id ? "border-brand-gold" : "border-gray-300"} flex items-center justify-center`}>
                      {selectedShipping?.id === opt.id && <div className="w-2 h-2 bg-brand-gold rounded-full" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{opt.label}</p>
                      {opt.etd !== "-" && <p className="text-xs text-gray-400">{opt.etd}</p>}
                    </div>
                    <p className="text-sm font-bold text-brand-gold">{opt.price > 0 ? formatPrice(opt.price) : "Gratis"}</p>
                  </label>
                ))}
              </div>
            )}

            {/* Coupon */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-3">Kode Kupon</h2>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-green-700">{appliedCoupon.code}</p>
                    <p className="text-xs text-green-600">
                      {appliedCoupon.title} — hemat {formatPrice(appliedCoupon.discount)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAppliedCoupon(null)}
                    className="text-gray-400 hover:text-gray-600 ml-4"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Masukkan kode kupon"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-4 py-2 bg-brand-gold text-white rounded-lg text-sm font-medium hover:bg-brand-brown disabled:opacity-50 transition-colors flex items-center gap-1"
                    >
                      {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Terapkan"}
                    </button>
                  </div>
                  {couponError && <p className="text-sm text-red-500 mt-2">{couponError}</p>}
                </>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
              <h2 className="font-semibold text-gray-900">Metode Pembayaran</h2>
              {!paymentConfig.xenditEnabled && !paymentConfig.manualTransferEnabled && !paymentConfig.qrisEnabled && (
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
              {paymentConfig.qrisEnabled && (
                <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${form.paymentMethod === "QRIS" ? "border-brand-gold bg-brand-cream" : "border-gray-200"}`}>
                  <input type="radio" name="payment" value="QRIS" checked={form.paymentMethod === "QRIS"}
                    onChange={() => setForm({ ...form, paymentMethod: "QRIS" })} className="sr-only" />
                  <div className={`w-4 h-4 rounded-full border-2 ${form.paymentMethod === "QRIS" ? "border-brand-gold" : "border-gray-300"} flex items-center justify-center`}>
                    {form.paymentMethod === "QRIS" && <div className="w-2 h-2 bg-brand-gold rounded-full" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">QRIS</p>
                    <p className="text-xs text-gray-400">Scan QR code dengan e-wallet atau mobile banking</p>
                  </div>
                  {paymentConfig.qrisImageUrl && (
                    <img src={paymentConfig.qrisImageUrl} alt="QRIS" className="w-12 h-12 object-contain rounded" />
                  )}
                </label>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !form.paymentMethod || weightError || (shippingOptions.length > 0 && !selectedShipping)}
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
                {items.map((item) => {
                  const itemWeight = productWeights.get(item.id);
                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      {item.image && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-400">
                          ×{item.quantity}{itemWeight != null ? ` · ${itemWeight} gr` : ""}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 shrink-0">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-gray-100 pt-3 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(totalPrice())}</span>
                </div>
                {selectedShipping && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Ongkos Kirim</span>
                    <span>{selectedShipping.price > 0 ? formatPrice(selectedShipping.price) : "Gratis"}</span>
                  </div>
                )}
                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Diskon ({appliedCoupon.code})</span>
                    <span>-{formatPrice(appliedCoupon.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-gray-900 pt-1 border-t border-gray-100">
                  <span>Total</span>
                  <span>{formatPrice(totalPrice() + (selectedShipping?.price ?? 0) - (appliedCoupon?.discount ?? 0))}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
