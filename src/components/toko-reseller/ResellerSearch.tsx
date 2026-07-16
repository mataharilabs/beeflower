"use client";

import { useState, useMemo } from "react";
import { Search, MapPin, Phone, ChevronDown, ChevronUp, MessageCircle } from "lucide-react";

type Store = {
  id: string;
  name: string;
  logoUrl: string | null;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  tiktok: string | null;
  shopee: string | null;
  tokopedia: string | null;
  province: string;
  city: string;
};

function getWhatsAppLink(store: Store) {
  const wa = store.whatsapp || store.phone;
  if (!wa) return null;
  const cleaned = wa.replace(/\D/g, "");
  const normalized = cleaned.startsWith("0") ? "62" + cleaned.slice(1) : cleaned;
  return `https://wa.me/${normalized}`;
}

function StoreCard({ store }: { store: Store }) {
  const initials = store.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const waLink = getWhatsAppLink(store);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        {store.logoUrl ? (
          <img
            src={store.logoUrl}
            alt={store.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-brand-gold/20 flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-brand-gold/10 border-2 border-brand-gold/20 flex items-center justify-center flex-shrink-0">
            <span className="text-brand-gold font-bold text-sm">{initials}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-brand-brown truncate">{store.name}</h3>
            <span title="Reseller Terverifikasi">
              <svg className="w-4 h-4 text-green-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </span>
          </div>
          <p className="text-xs text-brand-beige">{store.city}</p>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1.5 mb-4">
        {store.address && (
          <div className="flex items-start gap-2 text-xs text-gray-600">
            <MapPin className="w-3.5 h-3.5 text-brand-gold mt-0.5 flex-shrink-0" />
            <span className="leading-relaxed">{store.address}</span>
          </div>
        )}
        {store.phone && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Phone className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
            <span>{store.phone}</span>
          </div>
        )}
      </div>

      {/* Social icons */}
      {(store.instagram || store.tiktok || store.shopee || store.tokopedia) && (
        <div className="flex items-center gap-2 mb-4">
          {store.instagram && (
            <a
              href={`https://instagram.com/${store.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 rounded-full bg-pink-50 flex items-center justify-center hover:bg-pink-100 transition-colors"
              title="Instagram"
            >
              <svg className="w-3.5 h-3.5 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
          )}
          {store.tiktok && (
            <a
              href={`https://tiktok.com/@${store.tiktok}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              title="TikTok"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.79a4.85 4.85 0 01-1.01-.1z"/>
              </svg>
            </a>
          )}
          {store.shopee && (
            <a
              href={`https://shopee.co.id/${store.shopee}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 rounded-full bg-orange-50 flex items-center justify-center hover:bg-orange-100 transition-colors overflow-hidden"
              title="Shopee"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://zonalogo.com/assets/logo-shopee.webp?asset=1002" alt="Shopee" className="w-4 h-4 object-contain rounded" loading="lazy" />
            </a>
          )}
          {store.tokopedia && (
            <a
              href={`https://tokopedia.com/${store.tokopedia}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center hover:bg-green-100 transition-colors"
              title="Tokopedia"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 192 192" fill="none">
                <path fill="#03AC0E" fillRule="evenodd" d="M96 28c-9.504 0-17.78 5.307-22.008 13.127C82.736 42.123 88.89 44 96 47.332c7.11-3.332 13.264-5.209 22.008-6.205C113.781 33.31 105.506 28 96 28Zm0-12c-15.973 0-29.568 10.117-34.754 24.28C52.932 40 42.462 40 28.53 40H28a6 6 0 0 0-6 6v124a6 6 0 0 0 6 6h92c27.614 0 50-22.386 50-50V46a6 6 0 0 0-6-6h-.531c-13.931 0-24.401 0-32.715.28C125.566 26.113 111.97 16 96 16ZM34 52.001V164h86c20.987 0 38-17.013 38-38V52.001c-18.502.009-29.622.098-37.872.966-8.692.915-13.999 2.677-21.445 6.4a6 6 0 0 1-5.366 0c-7.446-3.723-12.753-5.485-21.445-6.4-8.25-.868-19.37-.957-37.872-.966ZM50 96c0-9.941 8.059-18 18-18s18 8.059 18 18-8.059 18-18 18-18-8.059-18-18Zm18-30c-16.569 0-30 13.431-30 30 0 16.569 13.431 30 30 30 1.126 0 2.238-.062 3.332-.183l20.425 20.426a6 6 0 0 0 8.486 0l20.425-20.426c1.094.121 2.206.183 3.332.183 16.569 0 30-13.431 30-30 0-16.569-13.431-30-30-30-12.764 0-23.666 7.971-28 19.207C91.666 73.971 80.764 66 68 66Zm40.082 55.433A30.1 30.1 0 0 1 96 106.793a30.101 30.101 0 0 1-12.082 14.64L96 133.515l12.082-12.082ZM124 78c-9.941 0-18 8.059-18 18s8.059 18 18 18 18-8.059 18-18-8.059-18-18-18ZM76 96a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm48 8a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" clipRule="evenodd"/>
              </svg>
            </a>
          )}
        </div>
      )}

      {/* CTA */}
      {waLink && (
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          KLIK UNTUK PESAN
        </a>
      )}
    </div>
  );
}

type ProvinceGroup = {
  province: string;
  cities: {
    city: string;
    stores: Store[];
  }[];
  totalStores: number;
};

function groupStores(stores: Store[]): ProvinceGroup[] {
  const map = new Map<string, Map<string, Store[]>>();
  for (const store of stores) {
    if (!map.has(store.province)) map.set(store.province, new Map());
    const cityMap = map.get(store.province)!;
    if (!cityMap.has(store.city)) cityMap.set(store.city, []);
    cityMap.get(store.city)!.push(store);
  }
  return Array.from(map.entries()).map(([province, cityMap]) => ({
    province,
    cities: Array.from(cityMap.entries()).map(([city, stores]) => ({ city, stores })),
    totalStores: Array.from(cityMap.values()).reduce((s, arr) => s + arr.length, 0),
  }));
}

export function ResellerSearch({ stores }: { stores: Store[] }) {
  const [query, setQuery] = useState("");
  const [openProvinces, setOpenProvinces] = useState<Set<string>>(new Set());
  const [openCities, setOpenCities] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    if (!query.trim()) return groupStores(stores);
    const q = query.toLowerCase();
    const matchingStores = stores.filter(
      (s) =>
        s.province.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q)
    );
    return groupStores(matchingStores);
  }, [stores, query]);

  // Auto-expand when searching
  const expandedProvinces = useMemo(() => {
    if (query.trim()) {
      return new Set(filtered.map((g) => g.province));
    }
    return openProvinces;
  }, [query, filtered, openProvinces]);

  const expandedCities = useMemo(() => {
    if (query.trim()) {
      const all = new Set<string>();
      filtered.forEach((g) => g.cities.forEach((c) => all.add(`${g.province}::${c.city}`)));
      return all;
    }
    return openCities;
  }, [query, filtered, openCities]);

  function toggleProvince(province: string) {
    if (query.trim()) return;
    setOpenProvinces((prev) => {
      const next = new Set(prev);
      if (next.has(province)) next.delete(province);
      else next.add(province);
      return next;
    });
  }

  function toggleCity(key: string) {
    if (query.trim()) return;
    setOpenCities((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div>
      {/* Search */}
      <div className="relative max-w-xl mx-auto mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari provinsi, kota, atau nama toko..."
          className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-2xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 bg-white"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>

      {/* Count */}
      <p className="text-sm text-gray-500 mb-4">
        {query
          ? `${stores.filter((s) => s.province.toLowerCase().includes(query.toLowerCase()) || s.city.toLowerCase().includes(query.toLowerCase()) || s.name.toLowerCase().includes(query.toLowerCase())).length} toko ditemukan`
          : `${stores.length} toko reseller di ${filtered.length} provinsi`}
      </p>

      {/* Accordion */}
      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>Tidak ada toko yang cocok dengan pencarian &quot;{query}&quot;</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((group) => {
          const isProvinceOpen = expandedProvinces.has(group.province);
          return (
            <div key={group.province} className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
              {/* Province header */}
              <button
                onClick={() => toggleProvince(group.province)}
                className="w-full flex items-center justify-between px-5 py-4 bg-brand-brown text-white hover:bg-brand-brown/90 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-brand-gold flex-shrink-0" />
                  <span className="font-bold tracking-wide uppercase text-sm">{group.province}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-brand-gold/20 text-brand-gold px-2 py-0.5 rounded-full font-medium">
                    {group.totalStores} toko
                  </span>
                  {isProvinceOpen ? (
                    <ChevronUp className="w-4 h-4 text-brand-beige" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-brand-beige" />
                  )}
                </div>
              </button>

              {/* Cities */}
              {isProvinceOpen && (
                <div className="bg-gray-50">
                  {group.cities.map((cityGroup) => {
                    const cityKey = `${group.province}::${cityGroup.city}`;
                    const isCityOpen = expandedCities.has(cityKey);
                    return (
                      <div key={cityKey} className="border-t border-gray-100">
                        {/* City header */}
                        <button
                          onClick={() => toggleCity(cityKey)}
                          className="w-full flex items-center justify-between px-5 py-3.5 bg-brand-gold/5 hover:bg-brand-gold/10 transition-colors text-left"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-gold flex-shrink-0" />
                            <span className="font-semibold text-brand-brown text-sm">{cityGroup.city}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-brand-beige">{cityGroup.stores.length} toko</span>
                            {isCityOpen ? (
                              <ChevronUp className="w-3.5 h-3.5 text-brand-beige" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-brand-beige" />
                            )}
                          </div>
                        </button>

                        {/* Stores grid */}
                        {isCityOpen && (
                          <div className="px-4 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {cityGroup.stores.map((store) => (
                              <StoreCard key={store.id} store={store} />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
