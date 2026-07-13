"use client";

import { X, ShoppingBag, Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice } =
    useCartStore();

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
            <h2 className="font-bold text-lg text-brand-brown">Keranjang Belanja</h2>
            <button
              onClick={closeCart}
              className="p-2 rounded-full hover:bg-brand-cream transition-colors text-brand-brown"
            >
              <X className="w-5 h-5" />
            </button>
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
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 pb-4 border-b border-brand-beige/20 last:border-0"
                  >
                    <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-brand-cream">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-brand-brown truncate">
                        {item.name}
                      </p>
                      <p className="text-brand-gold font-semibold text-sm mt-1">
                        {formatPrice(item.price)}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 border border-brand-beige/50 rounded-md">
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
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="px-6 py-5 border-t border-brand-beige/30 bg-brand-cream/30">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-brand-brown">Total</span>
                <span className="font-bold text-xl text-brand-gold">
                  {formatPrice(totalPrice())}
                </span>
              </div>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="block w-full text-center py-3 bg-brand-gold text-white font-semibold rounded tracking-wide hover:bg-brand-brown transition-colors"
              >
                CHECKOUT
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
