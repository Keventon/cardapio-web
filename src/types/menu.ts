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
  category: ProductCategory;
  name: string;
  description: string;
  fullDescription: string;
  price: string;
  rating: string;
  badgeColor: string;
  badgeIcon: IconComponent;
  imageUrl: string;
  detailImageUrl: string;
  gallery: string[];
  extras: ProductExtra[];
};

export type OrderItem = {
  quantity: number;
  name: string;
  price: string;
};

export type ProductExtra = {
  name: string;
  price: string;
};
