"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Check, X, Loader2 } from "lucide-react";

interface Props {
  productId: string;
  stock: number;
}

export function QuickStockEdit({ productId, stock }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(stock));
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const colorClass =
    stock > 10 ? "text-green-600" : stock > 0 ? "text-orange-600" : "text-red-600";

  const startEdit = () => {
    setValue(String(stock));
    setEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  };

  const cancel = () => {
    setEditing(false);
    setValue(String(stock));
  };

  const save = async () => {
    const newStock = parseInt(value, 10);
    if (isNaN(newStock) || newStock < 0) { cancel(); return; }
    if (newStock === stock) { setEditing(false); return; }

    setSaving(true);
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });
      if (res.ok) {
        setEditing(false);
        router.refresh();
      } else {
        cancel();
      }
    } catch {
      cancel();
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") save();
    if (e.key === "Escape") cancel();
  };

  if (saving) {
    return (
      <div className="flex items-center gap-1.5">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          ref={inputRef}
          type="number"
          min="0"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={save}
          className="w-16 px-1.5 py-0.5 text-sm font-medium text-center border border-brand-gold rounded focus:outline-none"
        />
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={save}
          className="text-green-600 hover:text-green-700"
          title="Simpan"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={cancel}
          className="text-gray-400 hover:text-gray-600"
          title="Batal"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 group">
      <span className={`text-sm font-medium ${colorClass}`}>{stock}</span>
      <button
        onClick={startEdit}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-brand-gold"
        title="Edit stok"
      >
        <Pencil className="w-3 h-3" />
      </button>
    </div>
  );
}
