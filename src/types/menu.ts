import type { ComponentType } from "react";

export type IconComponent = ComponentType<{ className?: string }>;

export type MenuCategory = {
  id: ProductCategory | "all";
  label: string;
  icon: IconComponent;
  active?: boolean;
};

export type ProductCategory =
  | "burgers"
  | "combos"
  | "sides"
  | "drinks"
  | "milkshakes"
  | "desserts";

export type Product = {
  id: string;
  category: ProductCategory;
  name: string;
  description: string;
  fullDescription: string;
  priceCents: number;
  rating: string;
  badgeColor: string;
  badgeIcon: IconComponent;
  imageUrl: string;
  detailImageUrl: string;
  gallery: string[];
  extras: ProductExtra[];
};

export type OrderItem = {
  id: string;
  quantity: number;
  name: string;
  unitPriceCents: number;
  extras: ProductExtra[];
  instructions: string;
};

export type ProductExtra = {
  name: string;
  priceCents: number;
};

export type AddToCartOptions = {
  extras: ProductExtra[];
  instructions: string;
  quantity: number;
};
