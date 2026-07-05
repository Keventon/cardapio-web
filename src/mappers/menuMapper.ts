import {
  BackpackIcon,
  Cross2Icon,
  HeartIcon,
} from "@radix-ui/react-icons";
import { BurgerIcon } from "../components/icons/BurgerIcon";
import { ComboIcon } from "../components/icons/ComboIcon";
import { DrinkIcon } from "../components/icons/DrinkIcon";
import { MilkshakeIcon } from "../components/icons/MilkshakeIcon";
import type { ApiStoreMenu } from "../types/api";
import type { IconComponent, MenuCategory, Product } from "../types/menu";

const categoryIcons: IconComponent[] = [
  BurgerIcon,
  ComboIcon,
  BackpackIcon,
  DrinkIcon,
  MilkshakeIcon,
  HeartIcon,
];

export function mapStoreMenuToClientMenu(menu: ApiStoreMenu) {
  const categories: MenuCategory[] = [
    { id: "all", label: "Destaques", icon: Cross2Icon },
    ...menu.categories.map((category, index) => ({
      id: category.id,
      label: category.name,
      icon: categoryIcons[index % categoryIcons.length],
    })),
  ];
  const products: Product[] = menu.categories.flatMap((category, index) => {
    const CategoryIcon = categoryIcons[index % categoryIcons.length];

    return category.products.map((product) => ({
      badgeColor: "bg-white text-amber-500",
      badgeIcon: CategoryIcon,
      category: category.id,
      description: product.description ?? "Item do cardápio.",
      detailImageUrl: product.imageUrl ?? "",
      fullDescription: product.description ?? "Item do cardápio.",
      gallery: product.imageUrl ? [product.imageUrl] : [],
      id: product.id,
      imageUrl: product.imageUrl ?? "",
      name: product.name,
      priceCents: product.price,
      rating: "4.8",
    }));
  });

  return {
    categories,
    products,
    store: {
      id: menu.id,
      logoUrl: menu.logoUrl,
      name: menu.name,
      slug: menu.slug,
    },
  };
}
