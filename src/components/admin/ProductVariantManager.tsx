"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Plus, X, Loader2, Upload } from "lucide-react";
import type { VariantGroup, ProductVariant } from "@/types/variant";

export type { VariantGroup, ProductVariant };

const genId = () => Math.random().toString(36).slice(2, 8);

function combinationLabel(combination: Record<string, string>) {
  return Object.values(combination).join(" / ");
}

function combinationKey(combination: Record<string, string>) {
  return Object.entries(combination)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join("|");
}

function buildCombinations(groups: VariantGroup[]): Record<string, string>[] {
  const active = groups.filter(
    (g) => g.name.trim() && g.options.some((o) => o.trim())
  );
  if (!active.length) return [];
  return active.reduce<Record<string, string>[]>((acc, group) => {
    const opts = group.options.filter((o) => o.trim());
    if (!acc.length) return opts.map((opt) => ({ [group.name]: opt }));
    return acc.flatMap((combo) =>
      opts.map((opt) => ({ ...combo, [group.name]: opt }))
    );
  }, []);
}

function syncVariants(
  groups: VariantGroup[],
  existing: ProductVariant[]
): ProductVariant[] {
  const combos = buildCombinations(groups);
  const map = new Map(existing.map((v) => [combinationKey(v.combination), v]));
  return combos.map((combination) => {
    const found = map.get(combinationKey(combination));
    return found
      ? { ...found, combination }
      : { id: genId(), combination, price: 0, stock: 0, weight: null, imageUrl: null };
  });
}

function Toggle({
  checked,
  onToggle,
}: {
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
        checked ? "bg-brand-gold" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function VariantImageCell({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "beeflower/products");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      onChange(url);
    } catch {
      alert("Gagal upload gambar");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      {value ? (
        <div className="relative w-10 h-10 rounded overflow-hidden border border-gray-200 group flex-shrink-0 cursor-pointer">
          <Image src={value} alt="" fill className="object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-10 h-10 border-2 border-dashed border-gray-200 rounded flex items-center justify-center hover:border-brand-gold/50 transition-colors disabled:opacity-50 flex-shrink-0"
        >
          {uploading ? (
            <Loader2 className="w-3 h-3 text-brand-gold animate-spin" />
          ) : (
            <Upload className="w-3 h-3 text-gray-400" />
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleUpload(f);
        }}
      />
    </div>
  );
}

interface Props {
  variantsEnabled: boolean;
  variantWeightPerVariant: boolean;
  variantGroups: VariantGroup[];
  variants: ProductVariant[];
  onChange: (
    updates: Partial<{
      variantsEnabled: boolean;
      variantWeightPerVariant: boolean;
      variantGroups: VariantGroup[];
      variants: ProductVariant[];
    }>
  ) => void;
}

export function ProductVariantManager({
  variantsEnabled,
  variantWeightPerVariant,
  variantGroups,
  variants,
  onChange,
}: Props) {
  const [optionInputs, setOptionInputs] = useState<Record<string, string>>({});
  const [newGroupName, setNewGroupName] = useState("");
  const [showAddGroup, setShowAddGroup] = useState(false);

  const setGroups = (groups: VariantGroup[]) => {
    onChange({ variantGroups: groups, variants: syncVariants(groups, variants) });
  };

  const addGroup = () => {
    const name = newGroupName.trim();
    if (!name) return;
    setGroups([...variantGroups, { id: genId(), name, options: [] }]);
    setNewGroupName("");
    setShowAddGroup(false);
  };

  const removeGroup = (groupId: string) => {
    setGroups(variantGroups.filter((g) => g.id !== groupId));
  };

  const addOption = (groupId: string) => {
    const val = (optionInputs[groupId] ?? "").trim();
    if (!val) return;
    setGroups(
      variantGroups.map((g) => {
        if (g.id !== groupId) return g;
        if (g.options.includes(val)) return g;
        return { ...g, options: [...g.options, val] };
      })
    );
    setOptionInputs((p) => ({ ...p, [groupId]: "" }));
  };

  const removeOption = (groupId: string, opt: string) => {
    setGroups(
      variantGroups.map((g) =>
        g.id === groupId ? { ...g, options: g.options.filter((o) => o !== opt) } : g
      )
    );
  };

  const updateVariant = (id: string, updates: Partial<ProductVariant>) => {
    onChange({ variants: variants.map((v) => (v.id === id ? { ...v, ...updates } : v)) });
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
      {/* Header toggle */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-semibold text-gray-900">Variant Produk</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Aktifkan jika produk punya pilihan seperti warna, ukuran, dll.
          </p>
        </div>
        <Toggle
          checked={variantsEnabled}
          onToggle={() => onChange({ variantsEnabled: !variantsEnabled })}
        />
      </div>

      {variantsEnabled && (
        <div className="mt-5 space-y-5">
          {/* Weight per variant */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Berat berbeda antar variant?</p>
              <p className="text-xs text-gray-400">
                Jika ya, atur berat per variant di tabel bawah. Jika tidak, pakai berat produk utama.
              </p>
            </div>
            <Toggle
              checked={variantWeightPerVariant}
              onToggle={() => onChange({ variantWeightPerVariant: !variantWeightPerVariant })}
            />
          </div>

          {/* Groups */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Kelompok Variant</p>

            {variantGroups.map((group) => (
              <div key={group.id} className="border border-gray-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800">{group.name}</span>
                  <button
                    type="button"
                    onClick={() => removeGroup(group.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 items-center">
                  {group.options.map((opt) => (
                    <span
                      key={opt}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-brand-cream text-brand-brown text-xs rounded-full font-medium"
                    >
                      {opt}
                      <button
                        type="button"
                        onClick={() => removeOption(group.id, opt)}
                        className="hover:text-red-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <div className="flex items-center gap-1">
                    <input
                      value={optionInputs[group.id] ?? ""}
                      onChange={(e) =>
                        setOptionInputs((p) => ({ ...p, [group.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addOption(group.id);
                        }
                      }}
                      placeholder="Tambah opsi..."
                      className="text-xs px-2 py-1 border border-gray-200 rounded focus:outline-none focus:border-brand-gold w-28"
                    />
                    <button
                      type="button"
                      onClick={() => addOption(group.id)}
                      className="text-brand-gold hover:text-brand-brown transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {showAddGroup ? (
              <div className="flex items-center gap-2">
                <input
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addGroup();
                    }
                    if (e.key === "Escape") {
                      setShowAddGroup(false);
                      setNewGroupName("");
                    }
                  }}
                  autoFocus
                  placeholder="Nama kelompok, mis: Warna atau Ukuran"
                  className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold flex-1"
                />
                <button
                  type="button"
                  onClick={addGroup}
                  className="px-3 py-1.5 bg-brand-gold text-white text-xs rounded-lg hover:bg-brand-brown transition-colors"
                >
                  Tambah
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddGroup(false);
                    setNewGroupName("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddGroup(true)}
                className="flex items-center gap-1.5 text-sm text-brand-gold hover:text-brand-brown font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Tambah Kelompok
              </button>
            )}
          </div>

          {/* Variants table */}
          {variants.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Daftar Variant{" "}
                <span className="text-gray-400 font-normal">({variants.length} kombinasi)</span>
              </p>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-3 py-2 text-xs font-medium text-gray-600 whitespace-nowrap">
                          Variant
                        </th>
                        <th className="text-left px-3 py-2 text-xs font-medium text-gray-600 whitespace-nowrap">
                          Harga (Rp)
                        </th>
                        <th className="text-left px-3 py-2 text-xs font-medium text-gray-600 whitespace-nowrap">
                          Stok
                        </th>
                        {variantWeightPerVariant && (
                          <th className="text-left px-3 py-2 text-xs font-medium text-gray-600 whitespace-nowrap">
                            Berat (gr)
                          </th>
                        )}
                        <th className="text-left px-3 py-2 text-xs font-medium text-gray-600 whitespace-nowrap">
                          Gambar
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {variants.map((v) => (
                        <tr key={v.id} className="hover:bg-gray-50/50">
                          <td className="px-3 py-2.5">
                            <span className="text-xs font-semibold text-gray-800 whitespace-nowrap">
                              {combinationLabel(v.combination)}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <input
                              type="number"
                              value={v.price || ""}
                              onChange={(e) =>
                                updateVariant(v.id, {
                                  price: parseFloat(e.target.value) || 0,
                                })
                              }
                              min="0"
                              placeholder="0"
                              className="w-28 px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:border-brand-gold"
                            />
                          </td>
                          <td className="px-3 py-2.5">
                            <input
                              type="number"
                              value={v.stock || ""}
                              onChange={(e) =>
                                updateVariant(v.id, {
                                  stock: parseInt(e.target.value) || 0,
                                })
                              }
                              min="0"
                              placeholder="0"
                              className="w-16 px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:border-brand-gold"
                            />
                          </td>
                          {variantWeightPerVariant && (
                            <td className="px-3 py-2.5">
                              <input
                                type="number"
                                value={v.weight ?? ""}
                                onChange={(e) =>
                                  updateVariant(v.id, {
                                    weight: e.target.value ? parseInt(e.target.value) : null,
                                  })
                                }
                                min="0"
                                placeholder="gram"
                                className="w-20 px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:border-brand-gold"
                              />
                            </td>
                          )}
                          <td className="px-3 py-2.5">
                            <VariantImageCell
                              value={v.imageUrl}
                              onChange={(url) => updateVariant(v.id, { imageUrl: url })}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {variantGroups.length > 0 && variants.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4 bg-gray-50 rounded-lg">
              Tambahkan opsi pada kelompok variant untuk menghasilkan kombinasi
            </p>
          )}

          {variantGroups.length === 0 && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-4 py-3">
              Mulai dengan menambahkan kelompok variant, contoh: &quot;Warna&quot; dengan opsi &quot;Merah&quot;, &quot;Biru&quot;, dsb.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
