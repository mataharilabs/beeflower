"use client";

import { X, ShoppingBag, Minus, Plus, Trash2, Tag, Truck, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { useEffect, useState } from "react";
import type { ActivePromotion } from "@/lib/promotions";

export function CartDrawer() {
  const {
    items,
    selectedIds,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    toggleSelectId,
    setSelectedIds,
    removeSelectedItems,
    selectedTotalPrice,
  } = useCartStore();

  const [promotions, setPromotions] = useState<ActivePromotion[]>([]);
  const [loadedPromos, setLoadedPromos] = useState(false);

  // Initialize selection to all items (handles persisted cart with no selectedIds)
  useEffect(() => {
    if (items.length > 0 && selectedIds.length === 0) {
      setSelectedIds(items.map((i) => i.id));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch promotions once when cart opens
  useEffect(() => {
    if (isOpen && !loadedPromos) {
      fetch("/api/promotions/active")
        .then((r) => r.json())
        .then((data: ActivePromotion[]) => {
          setPromotions(data);
          setLoadedPromos(true);
        })
        .catch(() => setLoadedPromos(true));
    }
  }, [isOpen, loadedPromos]);

  const subtotal = selectedTotalPrice();
  const isAllSelected = items.length > 0 && items.every((i) => selectedIds.includes(i.id));
  const selectedCount = items.filter((i) => selectedIds.includes(i.id)).length;

  const handleToggleAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((i) => i.id));
    }
  };

  const handleDeleteSelected = () => {
    const toDelete = items.filter((i) => selectedIds.includes(i.id)).map((i) => i.id);
    removeSelectedItems(toDelete);
  };

  // Relevant promo banners: ORDER_DISCOUNT and FREE_SHIPPING
  const orderDiscountPromos = promotions.filter((p) => p.type === "ORDER_DISCOUNT");
  const freeShipPromos = promotions.filter((p) => p.type === "FREE_SHIPPING");

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-brand-beige/30">
            <div className="flex items-center gap-3">
              {items.length > 0 && (
                <button
                  onClick={handleToggleAll}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    isAllSelected
                      ? "bg-brand-gold border-brand-gold"
                      : "border-gray-300 hover:border-brand-gold"
                  }`}
                  title={isAllSelected ? "Batal pilih semua" : "Pilih semua"}
                >
                  {isAllSelected && <Check className="w-3 h-3 text-white" />}
                </button>
              )}
              <h2 className="font-bold text-lg text-brand-brown">Keranjang Belanja</h2>
            </div>
            <div className="flex items-center gap-2">
              {selectedCount > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-2 py-1 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Hapus ({selectedCount})
                </button>
              )}
              <button
                onClick={closeCart}
                className="p-2 rounded-full hover:bg-brand-cream transition-colors text-brand-brown"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-brand-beige">
                <ShoppingBag className="w-16 h-16" />
                <p className="text-center font-medium text-brand-brown">
                  Keranjang masih kosong
                </p>
                <Link
                  href="/toko"
                  onClick={closeCart}
                  className="text-sm text-brand-gold hover:underline"
                >
                  Mulai belanja
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`flex gap-3 pb-3 border-b border-brand-beige/20 last:border-0 transition-opacity ${
                        !isSelected ? "opacity-50" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleSelectId(item.id)}
                        className={`w-5 h-5 mt-1 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-brand-gold border-brand-gold"
                            : "border-gray-300 hover:border-brand-gold"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </button>

                      {/* Image */}
                      <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-brand-cream">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-xs font-bold text-brand-gold/30">B&F</span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/toko/${item.slug}`}
                          onClick={closeCart}
                          className="font-medium text-sm text-brand-brown truncate block hover:text-brand-gold transition-colors"
                        >
                          {item.name}
                        </Link>
                        <p className="text-brand-gold font-semibold text-sm mt-0.5">
                          {formatPrice(item.price)}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1 border border-brand-beige/50 rounded-md">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 hover:text-brand-gold transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm w-6 text-center font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                              className="p-1 hover:text-brand-gold transition-colors disabled:opacity-40"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1 text-brand-beige hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="px-5 py-4 border-t border-brand-beige/30 bg-brand-cream/30 space-y-3">
              {/* Promo banners */}
              {(orderDiscountPromos.length > 0 || freeShipPromos.length > 0) && (
                <div className="space-y-1.5">
                  {orderDiscountPromos.map((p) => {
                    const met = p.minimumPurchase == null || subtotal >= p.minimumPurchase;
                    const shortage = p.minimumPurchase != null ? p.minimumPurchase - subtotal : 0;
                    return (
                      <div
                        key={p.id}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${
                          met
                            ? "bg-orange-50 border border-orange-200 text-orange-700"
                            : "bg-gray-50 border border-gray-200 text-gray-500"
                        }`}
                      >
                        <Tag className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>
                          {met ? (
                            <>
                              <strong>{p.name}</strong>:{" "}
                              {p.discountMode === "PERCENTAGE"
                                ? `Hemat ${p.discountValue}%`
                                : `Hemat ${formatPrice(p.discountValue ?? 0)}`}{" "}
                              ✓
                            </>
                          ) : (
                            <>
                              Tambah {formatPrice(shortage)} lagi untuk{" "}
                              <strong>{p.name}</strong> (
                              {p.discountMode === "PERCENTAGE"
                                ? `hemat ${p.discountValue}%`
                                : `hemat ${formatPrice(p.discountValue ?? 0)}`}
                              )
                            </>
                          )}
                        </span>
                      </div>
                    );
                  })}
                  {freeShipPromos.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700"
                    >
                      <Truck className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>
                        <strong>{p.name}:</strong> Gratis ongkir
                        {p.minimumPurchase ? ` min. ${formatPrice(p.minimumPurchase)}` : ""}
                        {p.applicableCities.length > 0
                          ? ` (${p.applicableCities.join(", ")})`
                          : ""}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Selection info + total */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {selectedCount} dari {items.length} item dipilih
                </span>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Total terpilih</p>
                  <p className="font-bold text-lg text-brand-gold">{formatPrice(subtotal)}</p>
                </div>
              </div>

              <Link
                href="/checkout"
                onClick={closeCart}
                className={`block w-full text-center py-3 font-semibold rounded tracking-wide transition-colors ${
                  selectedCount === 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none"
                    : "bg-brand-gold text-white hover:bg-brand-brown"
                }`}
              >
                CHECKOUT{selectedCount > 0 ? ` (${selectedCount})` : ""}
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
