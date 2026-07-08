import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AddToCartOptions, OrderItem, Product } from "../types/menu";
import { getOrderItemTotalCents } from "../utils/currency";

type CartStore = {
  addItem: (product: Product, options: AddToCartOptions) => void;
  claimStore: (storeSlug: string) => boolean;
  clear: () => void;
  decrementItem: (id: string) => void;
  incrementItem: (id: string) => void;
  items: OrderItem[];
  removeItem: (id: string) => void;
  storeSlug: string | null;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      addItem: (product, options) => {
        const instructions = options.instructions.trim();
        const id = [product.id, instructions].join("::");

        set((state) => {
          const existingItem = state.items.find((item) => item.id === id);

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === id
                  ? { ...item, quantity: item.quantity + options.quantity }
                  : item,
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                id,
                instructions,
                name: product.name,
                productId: product.id,
                quantity: options.quantity,
                unitPriceCents: product.priceCents,
              },
            ],
          };
        });
      },
      // The cart belongs to a single store: entering another store's menu
      // drops the previous items (their productIds would not exist there).
      // Returns whether items were discarded so the UI can tell the user.
      claimStore: (storeSlug) => {
        const state = get();

        if (state.storeSlug === storeSlug) {
          return false;
        }

        const hadItems = state.items.length > 0;

        set({ items: [], storeSlug });

        return hadItems;
      },
      clear: () => set({ items: [] }),
      decrementItem: (id) => {
        set((state) => ({
          items: state.items.flatMap((item) => {
            if (item.id !== id) {
              return [item];
            }

            if (item.quantity === 1) {
              return [];
            }

            return [{ ...item, quantity: item.quantity - 1 }];
          }),
        }));
      },
      incrementItem: (id) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
          ),
        }));
      },
      items: [],
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },
      storeSlug: null,
    }),
    {
      name: "fast-burguer-cart",
      partialize: (state) => ({
        items: state.items,
        storeSlug: state.storeSlug,
      }),
    },
  ),
);

export const selectCartCount = (state: CartStore) =>
  state.items.reduce((total, item) => total + item.quantity, 0);

export const selectCartTotalCents = (state: CartStore) =>
  state.items.reduce(
    (total, item) => total + getOrderItemTotalCents(item),
    0,
  );
