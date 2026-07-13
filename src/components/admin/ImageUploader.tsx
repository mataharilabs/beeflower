"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}

export function ImageUploader({ value, onChange, folder = "beeflower" }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const { url } = await res.json();
      onChange(url);
    } catch (err) {
      console.error(err);
      alert("Gagal upload gambar. Pastikan Cloudinary sudah dikonfigurasi.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {value ? (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 group">
          <Image src={value} alt="Preview" fill className="object-cover" />
          <button
            onClick={() => onChange("")}
            className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed border-gray-200 rounded-lg py-8 flex flex-col items-center gap-2 hover:border-brand-gold/50 hover:bg-brand-cream/30 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
          ) : (
            <Upload className="w-8 h-8 text-gray-400" />
          )}
          <span className="text-sm text-gray-500">
            {uploading ? "Mengupload..." : "Klik untuk upload gambar"}
          </span>
          <span className="text-xs text-gray-400">JPG, PNG, WebP (max 5MB)</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
      />

      {/* Or enter URL manually */}
      <div className="mt-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Atau masukkan URL gambar..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-500 focus:outline-none focus:border-brand-gold"
        />
      </div>
    </div>
  );
}
