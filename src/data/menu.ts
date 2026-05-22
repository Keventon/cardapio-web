import {
  BackpackIcon,
  Cross2Icon,
  HeartIcon,
} from "@radix-ui/react-icons";
import { BurgerIcon } from "../components/icons/BurgerIcon";
import { ComboIcon } from "../components/icons/ComboIcon";
import { DrinkIcon } from "../components/icons/DrinkIcon";
import { MilkshakeIcon } from "../components/icons/MilkshakeIcon";
import type { IconComponent, MenuCategory, OrderItem, Product, ProductCategory } from "../types/menu";

const categoryDetails: Record<ProductCategory, { icon: IconComponent; label: string }> = {
  burgers: { icon: BurgerIcon, label: "Hambúrgueres" },
  combos: { icon: ComboIcon, label: "Combos" },
  sides: { icon: BackpackIcon, label: "Acompanhamentos" },
  drinks: { icon: DrinkIcon, label: "Bebidas" },
  milkshakes: { icon: MilkshakeIcon, label: "Milkshakes" },
  desserts: { icon: HeartIcon, label: "Sobremesas" },
};

const categoryOrder: ProductCategory[] = [
  "burgers",
  "combos",
  "sides",
  "drinks",
  "milkshakes",
  "desserts",
];

export const products: Product[] = [
  {
    category: "burgers",
    name: "Smash Clássico",
    description: "Blend bovino prensado, cheddar, picles e molho especial...",
    fullDescription:
      "Hambúrguer smash com blend bovino prensado na chapa, cheddar cremoso, picles crocante, cebola roxa e molho especial da casa no pão brioche tostado.",
    price: "R$ 28,90",
    rating: "4.9",
    badgeColor: "bg-white text-amber-500",
    badgeIcon: BurgerIcon,
    imageUrl:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=720&q=85",
    detailImageUrl:
      "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1100&q=90",
    gallery: [
      "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=360&q=85",
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=360&q=85",
      "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=360&q=85",
    ],
    extras: [
      { name: "Cheddar extra", price: "+R$ 4,00" },
      { name: "Bacon crocante", price: "+R$ 5,00" },
      { name: "Carne extra", price: "+R$ 9,00" },
    ],
  },
  {
    category: "burgers",
    name: "Bacon Crispy",
    description: "Burger alto, bacon em tiras, cebola crispy e barbecue...",
    fullDescription:
      "Hambúrguer artesanal com blend alto, queijo cheddar, bacon em tiras, cebola crispy e barbecue defumado no pão brioche.",
    price: "R$ 34,90",
    rating: "4.8",
    badgeColor: "bg-red-500 text-white",
    badgeIcon: BurgerIcon,
    imageUrl:
      "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=720&q=85",
    detailImageUrl:
      "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=1100&q=90",
    gallery: [
      "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=360&q=85",
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=360&q=85",
      "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=360&q=85",
    ],
    extras: [
      { name: "Bacon extra", price: "+R$ 6,00" },
      { name: "Onion rings no burger", price: "+R$ 5,00" },
      { name: "Molho barbecue extra", price: "+R$ 2,50" },
    ],
  },
  {
    category: "burgers",
    name: "Chicken Ranch",
    description: "Frango crocante, queijo prato, alface e molho ranch...",
    fullDescription:
      "Sanduíche de frango empanado crocante com queijo prato, alface fresca, tomate e molho ranch no pão macio.",
    price: "R$ 29,90",
    rating: "4.7",
    badgeColor: "bg-emerald-600 text-white",
    badgeIcon: BurgerIcon,
    imageUrl:
      "https://images.unsplash.com/photo-1606755962773-d324e2dabd2e?auto=format&fit=crop&w=720&q=85",
    detailImageUrl:
      "https://images.unsplash.com/photo-1606755962773-d324e2dabd2e?auto=format&fit=crop&w=1100&q=90",
    gallery: [
      "https://images.unsplash.com/photo-1606755962773-d324e2dabd2e?auto=format&fit=crop&w=360&q=85",
      "https://images.unsplash.com/photo-1615297928064-24977384d0da?auto=format&fit=crop&w=360&q=85",
      "https://images.unsplash.com/photo-1585238342028-4bbc8a2f03bc?auto=format&fit=crop&w=360&q=85",
    ],
    extras: [
      { name: "Queijo extra", price: "+R$ 4,00" },
      { name: "Molho ranch extra", price: "+R$ 2,50" },
      { name: "Jalapeño", price: "+R$ 3,00" },
    ],
  },
  {
    category: "combos",
    name: "Combo Smash",
    description: "Smash Clássico, batata frita crocante e refrigerante lata...",
    fullDescription:
      "Combo com Smash Clássico, porção individual de batata frita crocante e refrigerante lata gelado.",
    price: "R$ 42,90",
    rating: "4.9",
    badgeColor: "bg-white text-amber-500",
    badgeIcon: ComboIcon,
    imageUrl:
      "https://images.unsplash.com/photo-1610614819513-58e34989848b?auto=format&fit=crop&w=720&q=85",
    detailImageUrl:
      "https://images.unsplash.com/photo-1610614819513-58e34989848b?auto=format&fit=crop&w=1100&q=90",
    gallery: [
      "https://images.unsplash.com/photo-1610614819513-58e34989848b?auto=format&fit=crop&w=360&q=85",
      "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=360&q=85",
      "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=360&q=85",
    ],
    extras: [
      { name: "Batata grande", price: "+R$ 6,00" },
      { name: "Trocar por milkshake", price: "+R$ 9,00" },
      { name: "Molho da casa", price: "+R$ 2,50" },
    ],
  },
  {
    category: "combos",
    name: "Combo Bacon Crispy",
    description: "Bacon Crispy, batata canoa e bebida à escolha...",
    fullDescription:
      "Combo com Bacon Crispy, batata canoa temperada e bebida à escolha para uma refeição completa.",
    price: "R$ 49,90",
    rating: "4.8",
    badgeColor: "bg-red-500 text-white",
    badgeIcon: ComboIcon,
    imageUrl:
      "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=720&q=85",
    detailImageUrl:
      "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=1100&q=90",
    gallery: [
      "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=360&q=85",
      "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=360&q=85",
      "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=360&q=85",
    ],
    extras: [
      { name: "Bacon extra", price: "+R$ 6,00" },
      { name: "Bebida 600ml", price: "+R$ 5,00" },
      { name: "Cheddar na batata", price: "+R$ 7,00" },
    ],
  },
  {
    category: "sides",
    name: "Batata Frita",
    description: "Batata sequinha, sal na medida e molho da casa...",
    fullDescription:
      "Porção de batata frita crocante, finalizada com sal fino e acompanhada de molho especial da casa.",
    price: "R$ 16,90",
    rating: "4.7",
    badgeColor: "bg-white text-amber-500",
    badgeIcon: BackpackIcon,
    imageUrl:
      "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=720&q=85",
    detailImageUrl:
      "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=1100&q=90",
    gallery: [
      "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=360&q=85",
      "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=360&q=85",
      "https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=360&q=85",
    ],
    extras: [
      { name: "Cheddar cremoso", price: "+R$ 6,00" },
      { name: "Bacon picado", price: "+R$ 6,00" },
      { name: "Molho extra", price: "+R$ 2,50" },
    ],
  },
  {
    category: "drinks",
    name: "Refrigerante Lata",
    description: "Lata 350ml bem gelada nos sabores disponíveis...",
    fullDescription:
      "Refrigerante lata 350ml gelado. Escolha entre cola, guaraná, limão ou laranja conforme disponibilidade.",
    price: "R$ 7,90",
    rating: "4.6",
    badgeColor: "bg-emerald-600 text-white",
    badgeIcon: DrinkIcon,
    imageUrl:
      "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=720&q=85",
    detailImageUrl:
      "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=1100&q=90",
    gallery: [
      "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=360&q=85",
      "https://images.unsplash.com/photo-1581006852262-e4307cf6283a?auto=format&fit=crop&w=360&q=85",
      "https://images.unsplash.com/photo-1527960471264-932f39eb5846?auto=format&fit=crop&w=360&q=85",
    ],
    extras: [
      { name: "Copo com gelo", price: "+R$ 1,00" },
      { name: "Limão", price: "+R$ 1,00" },
      { name: "Trocar por 600ml", price: "+R$ 5,00" },
    ],
  },
  {
    category: "drinks",
    name: "Suco Natural",
    description: "Suco natural de laranja, limão ou abacaxi com hortelã...",
    fullDescription:
      "Suco natural preparado na hora, disponível em laranja, limão ou abacaxi com hortelã.",
    price: "R$ 11,90",
    rating: "4.8",
    badgeColor: "bg-emerald-600 text-white",
    badgeIcon: DrinkIcon,
    imageUrl:
      "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=720&q=85",
    detailImageUrl:
      "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=1100&q=90",
    gallery: [
      "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=360&q=85",
      "https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?auto=format&fit=crop&w=360&q=85",
      "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=360&q=85",
    ],
    extras: [
      { name: "Sem açúcar", price: "+R$ 0,00" },
      { name: "Gengibre", price: "+R$ 1,50" },
      { name: "Copo grande", price: "+R$ 3,00" },
    ],
  },
  {
    category: "milkshakes",
    name: "Milkshake Chocolate",
    description: "Milkshake cremoso de chocolate com chantilly...",
    fullDescription:
      "Milkshake cremoso de chocolate batido com sorvete, calda e finalizado com chantilly.",
    price: "R$ 18,90",
    rating: "4.9",
    badgeColor: "bg-white text-amber-500",
    badgeIcon: MilkshakeIcon,
    imageUrl:
      "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=720&q=85",
    detailImageUrl:
      "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=1100&q=90",
    gallery: [
      "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=360&q=85",
      "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=360&q=85",
      "https://images.unsplash.com/photo-1590080875852-ba44f83ff2db?auto=format&fit=crop&w=360&q=85",
    ],
    extras: [
      { name: "Calda extra", price: "+R$ 2,50" },
      { name: "Ovomaltine", price: "+R$ 4,00" },
      { name: "Chantilly extra", price: "+R$ 3,00" },
    ],
  },
];

export const categories: MenuCategory[] = [
  { id: "all", label: "Todos os Itens", icon: Cross2Icon },
  ...categoryOrder
    .filter((category) => products.some((product) => product.category === category))
    .map((category) => ({
      id: category,
      label: categoryDetails[category].label,
      icon: categoryDetails[category].icon,
    })),
];

export const orderItems: OrderItem[] = [
  { quantity: 1, name: "Smash Clássico", price: "R$ 28,90" },
  { quantity: 1, name: "Combo Bacon Crispy", price: "R$ 49,90" },
  { quantity: 2, name: "Refrigerante Lata", price: "R$ 15,80" },
];

export const orderTotal = "R$ 94,60";
