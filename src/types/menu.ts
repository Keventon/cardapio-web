import type { ComponentType } from "react";

export type IconComponent = ComponentType<{ className?: string }>;

export type MenuCategory = {
  id: ProductCategory | "all";
  label: string;
  icon: IconComponent;
  active?: boolean;
};

export type ProductCategory = string;

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
};

export type OrderItem = {
  id: string;
  productId: string;
  quantity: number;
  name: string;
  unitPriceCents: number;
  instructions: string;
};

export type AddToCartOptions = {
  instructions: string;
  quantity: number;
};
