"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  quantity: number;
  stock: number;
}

interface CartStore {
  items: CartItem[];
  selectedIds: string[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  toggleSelectId: (id: string) => void;
  setSelectedIds: (ids: string[]) => void;
  removeSelectedItems: (ids: string[]) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  selectedItems: () => CartItem[];
  selectedTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      selectedIds: [],
      isOpen: false,

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: Math.min(i.quantity + 1, item.stock) }
                  : i
              ),
              isOpen: true,
            };
          }
          return {
            items: [...state.items, { ...item, quantity: 1 }],
            selectedIds: state.selectedIds.includes(item.id)
              ? state.selectedIds
              : [...state.selectedIds, item.id],
            isOpen: true,
          };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
          selectedIds: state.selectedIds.filter((sid) => sid !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity: Math.min(quantity, i.stock) } : i
          ),
        }));
      },

      toggleSelectId: (id) => {
        set((state) => ({
          selectedIds: state.selectedIds.includes(id)
            ? state.selectedIds.filter((sid) => sid !== id)
            : [...state.selectedIds, id],
        }));
      },

      setSelectedIds: (ids) => set({ selectedIds: ids }),

      removeSelectedItems: (ids) => {
        set((state) => ({
          items: state.items.filter((i) => !ids.includes(i.id)),
          selectedIds: state.selectedIds.filter((sid) => !ids.includes(sid)),
        }));
      },

      clearCart: () => set({ items: [], selectedIds: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      selectedItems: () => {
        const state = get();
        return state.items.filter((i) => state.selectedIds.includes(i.id));
      },

      selectedTotalPrice: () => {
        const state = get();
        return state.items
          .filter((i) => state.selectedIds.includes(i.id))
          .reduce((sum, i) => sum + i.price * i.quantity, 0);
      },
    }),
    { name: "beeflower-cart" }
  )
);
