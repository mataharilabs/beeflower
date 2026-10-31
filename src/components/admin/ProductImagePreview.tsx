"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, ImageOff } from "lucide-react";

interface Props {
  src: string;
  name: string;
}

export function ProductImagePreview({ src, name }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0 ring-1 ring-gray-200 hover:ring-brand-gold hover:scale-105 transition-all cursor-zoom-in"
        title="Lihat gambar"
      >
        <Image src={src} alt={name} fill className="object-cover" sizes="56px" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl overflow-hidden max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-700 truncate pr-4">{name}</p>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Image */}
            <div className="relative w-full aspect-square bg-gray-50">
              <Image src={src} alt={name} fill className="object-contain p-4" sizes="512px" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function ProductImagePlaceholder() {
  return (
    <div className="w-14 h-14 rounded-lg bg-gray-100 ring-1 ring-gray-200 flex items-center justify-center shrink-0">
      <ImageOff className="w-5 h-5 text-gray-300" />
    </div>
  );
}
