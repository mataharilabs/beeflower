"use client";

import { useEffect, useRef } from "react";

type StorePin = {
  id: string;
  name: string;
  city: string;
  province: string;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  latitude: number;
  longitude: number;
};

function buildWaLink(store: StorePin): string | null {
  const wa = store.whatsapp || store.phone;
  if (!wa) return null;
  const cleaned = wa.replace(/\D/g, "");
  const normalized = cleaned.startsWith("0") ? "62" + cleaned.slice(1) : cleaned;
  return `https://wa.me/${normalized}`;
}

export function ResellerMap({ stores }: { stores: StorePin[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<{ remove(): void } | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Inject Leaflet CSS via CDN
    if (!document.querySelector('link[href*="leaflet@1.9.4"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    import("leaflet").then((L) => {
      if (!containerRef.current || mapRef.current) return;

      // Fix default icon resolution in Next.js bundler
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as Record<string, any>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current!).setView([-2.5, 118], 5);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      for (const store of stores) {
        const waLink = buildWaLink(store);
        const popup = `
          <div style="min-width:180px;max-width:220px;font-family:system-ui,sans-serif;padding:2px">
            <div style="font-size:13px;font-weight:700;color:#3A2D1D;margin-bottom:2px">${store.name}</div>
            <div style="font-size:11px;color:#9B8C7D">${store.city}, ${store.province}</div>
            ${store.address ? `<div style="font-size:11px;color:#555;margin-top:4px;line-height:1.5">${store.address}</div>` : ""}
            ${waLink ? `<a href="${waLink}" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin-top:8px;background:#16a34a;color:white;padding:5px 12px;border-radius:6px;font-size:11px;font-weight:600;text-decoration:none">Chat WhatsApp</a>` : ""}
          </div>
        `;
        L.marker([store.latitude, store.longitude]).addTo(map).bindPopup(popup, { maxWidth: 240 });
      }

      mapRef.current = map;
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      className="w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm"
      style={{ height: "520px" }}
    />
  );
}
