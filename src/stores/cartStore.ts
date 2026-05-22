import { create } from "zustand";
import type { AddToCartOptions, OrderItem, Product } from "../types/menu";
import { getOrderItemTotalCents } from "../utils/currency";

type CartStore = {
  addItem: (product: Product, options: AddToCartOptions) => void;
  clear: () => void;
  decrementItem: (id: string) => void;
  incrementItem: (id: string) => void;
  items: OrderItem[];
  removeItem: (id: string) => void;
};

export const useCartStore = create<CartStore>((set) => ({
  addItem: (product, options) => {
    const instructions = options.instructions.trim();
    const extras = [...options.extras].sort((first, second) =>
      first.name.localeCompare(second.name),
    );
    const id = [
      product.id,
      extras.map((extra) => extra.name).join("|"),
      instructions,
    ].join("::");

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
            extras,
            id,
            instructions,
            name: product.name,
            quantity: options.quantity,
            unitPriceCents: product.priceCents,
          },
        ],
      };
    });
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
}));

export const selectCartCount = (state: CartStore) =>
  state.items.reduce((total, item) => total + item.quantity, 0);

export const selectCartTotalCents = (state: CartStore) =>
  state.items.reduce(
    (total, item) => total + getOrderItemTotalCents(item),
    0,
  );
