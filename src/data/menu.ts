import {
  BackpackIcon,
  Cross2Icon,
  HeartIcon,
} from "@radix-ui/react-icons";
import { BurgerIcon } from "../components/icons/BurgerIcon";
import { ComboIcon } from "../components/icons/ComboIcon";
import { DrinkIcon } from "../components/icons/DrinkIcon";
import { MilkshakeIcon } from "../components/icons/MilkshakeIcon";
import type { IconComponent, MenuCategory, Product, ProductCategory } from "../types/menu";

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
    id: "smash-classico",
    category: "burgers",
    name: "Smash Clássico",
    description: "Blend bovino prensado, cheddar, picles e molho especial...",
    fullDescription:
      "Hambúrguer smash com blend bovino prensado na chapa, cheddar cremoso, picles crocante, cebola roxa e molho especial da casa no pão brioche tostado.",
    priceCents: 2890,
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
      { name: "Cheddar extra", priceCents: 400 },
      { name: "Bacon crocante", priceCents: 500 },
      { name: "Carne extra", priceCents: 900 },
    ],
  },
  {
    id: "bacon-crispy",
    category: "burgers",
    name: "Bacon Crispy",
    description: "Burger alto, bacon em tiras, cebola crispy e barbecue...",
    fullDescription:
      "Hambúrguer artesanal com blend alto, queijo cheddar, bacon em tiras, cebola crispy e barbecue defumado no pão brioche.",
    priceCents: 3490,
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
      { name: "Bacon extra", priceCents: 600 },
      { name: "Onion rings no burger", priceCents: 500 },
      { name: "Molho barbecue extra", priceCents: 250 },
    ],
  },
  {
    id: "chicken-ranch",
    category: "burgers",
    name: "Chicken Ranch",
    description: "Frango crocante, queijo prato, alface e molho ranch...",
    fullDescription:
      "Sanduíche de frango empanado crocante com queijo prato, alface fresca, tomate e molho ranch no pão macio.",
    priceCents: 2990,
    rating: "4.7",
    badgeColor: "bg-emerald-600 text-white",
    badgeIcon: BurgerIcon,
    imageUrl: "/images/menu/chicken-ranch.svg",
    detailImageUrl: "/images/menu/chicken-ranch.svg?detail",
    gallery: [
      "/images/menu/chicken-ranch.svg?thumb=1",
      "/images/menu/chicken-ranch.svg?thumb=2",
      "/images/menu/chicken-ranch.svg?thumb=3",
    ],
    extras: [
      { name: "Queijo extra", priceCents: 400 },
      { name: "Molho ranch extra", priceCents: 250 },
      { name: "Jalapeño", priceCents: 300 },
    ],
  },
  {
    id: "combo-smash",
    category: "combos",
    name: "Combo Smash",
    description: "Smash Clássico, batata frita crocante e refrigerante lata...",
    fullDescription:
      "Combo com Smash Clássico, porção individual de batata frita crocante e refrigerante lata gelado.",
    priceCents: 4290,
    rating: "4.9",
    badgeColor: "bg-white text-amber-500",
    badgeIcon: ComboIcon,
    imageUrl:
      "https://images.unsplash.com/photo-1639031663657-277906a254bb?auto=format&fit=crop&w=720&q=85",
    detailImageUrl:
      "https://images.unsplash.com/photo-1639031663657-277906a254bb?auto=format&fit=crop&w=1100&q=90",
    gallery: [
      "https://images.unsplash.com/photo-1639031663657-277906a254bb?auto=format&fit=crop&w=360&q=85",
      "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=360&q=85",
      "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?auto=format&fit=crop&w=360&q=85",
    ],
    extras: [
      { name: "Batata grande", priceCents: 600 },
      { name: "Trocar por milkshake", priceCents: 900 },
      { name: "Molho da casa", priceCents: 250 },
    ],
  },
  {
    id: "combo-bacon-crispy",
    category: "combos",
    name: "Combo Bacon Crispy",
    description: "Bacon Crispy, batata canoa e bebida à escolha...",
    fullDescription:
      "Combo com Bacon Crispy, batata canoa temperada e bebida à escolha para uma refeição completa.",
    priceCents: 4990,
    rating: "4.8",
    badgeColor: "bg-red-500 text-white",
    badgeIcon: ComboIcon,
    imageUrl:
      "https://images.unsplash.com/photo-1651307428485-e477347326cd?auto=format&fit=crop&w=720&q=85",
    detailImageUrl:
      "https://images.unsplash.com/photo-1651307428485-e477347326cd?auto=format&fit=crop&w=1100&q=90",
    gallery: [
      "https://images.unsplash.com/photo-1651307428485-e477347326cd?auto=format&fit=crop&w=360&q=85",
      "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=360&q=85",
      "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?auto=format&fit=crop&w=360&q=85",
    ],
    extras: [
      { name: "Bacon extra", priceCents: 600 },
      { name: "Bebida 600ml", priceCents: 500 },
      { name: "Cheddar na batata", priceCents: 700 },
    ],
  },
  {
    id: "batata-frita",
    category: "sides",
    name: "Batata Frita",
    description: "Batata sequinha, sal na medida e molho da casa...",
    fullDescription:
      "Porção de batata frita crocante, finalizada com sal fino e acompanhada de molho especial da casa.",
    priceCents: 1690,
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
      { name: "Cheddar cremoso", priceCents: 600 },
      { name: "Bacon picado", priceCents: 600 },
      { name: "Molho extra", priceCents: 250 },
    ],
  },
  {
    id: "batata-com-cheddar",
    category: "sides",
    name: "Batata com Cheddar",
    description: "Batata frita crocante com cheddar cremoso e bacon...",
    fullDescription:
      "Porção de batata frita crocante coberta com cheddar cremoso e bacon picado, servida com molho especial da casa.",
    priceCents: 2490,
    rating: "4.8",
    badgeColor: "bg-white text-amber-500",
    badgeIcon: BackpackIcon,
    imageUrl:
      "https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=720&q=85",
    detailImageUrl:
      "https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=1100&q=90",
    gallery: [
      "https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=360&q=85",
      "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=360&q=85",
      "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=360&q=85",
    ],
    extras: [
      { name: "Cheddar extra", priceCents: 600 },
      { name: "Bacon extra", priceCents: 600 },
      { name: "Molho barbecue", priceCents: 250 },
    ],
  },
  {
    id: "refrigerante-lata",
    category: "drinks",
    name: "Refrigerante Lata",
    description: "Lata 350ml bem gelada nos sabores disponíveis...",
    fullDescription:
      "Refrigerante lata 350ml gelado. Escolha entre cola, guaraná, limão ou laranja conforme disponibilidade.",
    priceCents: 790,
    rating: "4.6",
    badgeColor: "bg-emerald-600 text-white",
    badgeIcon: DrinkIcon,
    imageUrl:
      "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?auto=format&fit=crop&w=720&q=85",
    detailImageUrl:
      "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?auto=format&fit=crop&w=1100&q=90",
    gallery: [
      "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?auto=format&fit=crop&w=360&q=85",
      "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?auto=format&fit=crop&w=420&q=85",
      "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?auto=format&fit=crop&w=480&q=85",
    ],
    extras: [
      { name: "Copo com gelo", priceCents: 100 },
      { name: "Limão", priceCents: 100 },
      { name: "Trocar por 600ml", priceCents: 500 },
    ],
  },
  {
    id: "guarana-antarctica-lata",
    category: "drinks",
    name: "Guaraná Antarctica Lata",
    description: "Guaraná Antarctica lata 350ml bem gelado...",
    fullDescription:
      "Guaraná Antarctica em lata 350ml, servido bem gelado para acompanhar seu lanche.",
    priceCents: 790,
    rating: "4.7",
    badgeColor: "bg-emerald-600 text-white",
    badgeIcon: DrinkIcon,
    imageUrl: "/images/menu/guarana-antarctica-lata.svg",
    detailImageUrl: "/images/menu/guarana-antarctica-lata.svg?detail",
    gallery: [
      "/images/menu/guarana-antarctica-lata.svg?thumb=1",
      "/images/menu/guarana-antarctica-lata.svg?thumb=2",
      "/images/menu/guarana-antarctica-lata.svg?thumb=3",
    ],
    extras: [
      { name: "Copo com gelo", priceCents: 100 },
      { name: "Limão", priceCents: 100 },
      { name: "Trocar por 600ml", priceCents: 500 },
    ],
  },
  {
    id: "pepsi-lata",
    category: "drinks",
    name: "Pepsi Lata",
    description: "Pepsi lata 350ml gelada e pronta para acompanhar...",
    fullDescription:
      "Pepsi em lata 350ml, gelada e ideal para acompanhar hambúrgueres, combos e porções.",
    priceCents: 790,
    rating: "4.6",
    badgeColor: "bg-emerald-600 text-white",
    badgeIcon: DrinkIcon,
    imageUrl: "/images/menu/pepsi-lata.svg",
    detailImageUrl: "/images/menu/pepsi-lata.svg?detail",
    gallery: [
      "/images/menu/pepsi-lata.svg?thumb=1",
      "/images/menu/pepsi-lata.svg?thumb=2",
      "/images/menu/pepsi-lata.svg?thumb=3",
    ],
    extras: [
      { name: "Copo com gelo", priceCents: 100 },
      { name: "Limão", priceCents: 100 },
      { name: "Trocar por 600ml", priceCents: 500 },
    ],
  },
  {
    id: "refrigerante-2l",
    category: "drinks",
    name: "Refrigerante 2L",
    description: "Garrafa 2L gelada para dividir com a mesa...",
    fullDescription:
      "Refrigerante garrafa 2L gelado, disponível nos sabores cola, guaraná, limão ou laranja conforme disponibilidade.",
    priceCents: 1490,
    rating: "4.7",
    badgeColor: "bg-emerald-600 text-white",
    badgeIcon: DrinkIcon,
    imageUrl: "/images/menu/refrigerante-2l.svg",
    detailImageUrl: "/images/menu/refrigerante-2l.svg?detail",
    gallery: [
      "/images/menu/refrigerante-2l.svg?thumb=1",
      "/images/menu/refrigerante-2l.svg?thumb=2",
      "/images/menu/refrigerante-2l.svg?thumb=3",
    ],
    extras: [
      { name: "Copo com gelo", priceCents: 100 },
      { name: "Limão", priceCents: 100 },
      { name: "Garrafa extra", priceCents: 1490 },
    ],
  },
  {
    id: "suco-natural",
    category: "drinks",
    name: "Suco Natural",
    description: "Suco natural de laranja, limão ou abacaxi com hortelã...",
    fullDescription:
      "Suco natural preparado na hora, disponível em laranja, limão ou abacaxi com hortelã.",
    priceCents: 1190,
    rating: "4.8",
    badgeColor: "bg-emerald-600 text-white",
    badgeIcon: DrinkIcon,
    imageUrl:
      "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=720&q=85",
    detailImageUrl:
      "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=1100&q=90",
    gallery: [
      "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=360&q=85",
      "https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?auto=format&fit=crop&w=360&q=85",
      "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=360&q=85",
    ],
    extras: [
      { name: "Sem açúcar", priceCents: 0 },
      { name: "Gengibre", priceCents: 150 },
      { name: "Copo grande", priceCents: 300 },
    ],
  },
  {
    id: "suco-laranja",
    category: "drinks",
    name: "Suco de Laranja",
    description: "Suco de laranja natural preparado na hora...",
    fullDescription:
      "Suco de laranja natural preparado na hora, servido gelado e com opção de açúcar à parte.",
    priceCents: 1190,
    rating: "4.8",
    badgeColor: "bg-emerald-600 text-white",
    badgeIcon: DrinkIcon,
    imageUrl:
      "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=720&q=85",
    detailImageUrl:
      "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=1100&q=90",
    gallery: [
      "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=360&q=85",
      "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=360&q=85",
      "https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?auto=format&fit=crop&w=360&q=85",
    ],
    extras: [
      { name: "Sem açúcar", priceCents: 0 },
      { name: "Gengibre", priceCents: 150 },
      { name: "Copo grande", priceCents: 300 },
    ],
  },
  {
    id: "suco-abacaxi-hortela",
    category: "drinks",
    name: "Suco de Abacaxi com Hortelã",
    description: "Abacaxi batido com hortelã fresca e gelo...",
    fullDescription:
      "Suco natural de abacaxi batido com hortelã fresca, servido gelado e preparado na hora.",
    priceCents: 1290,
    rating: "4.8",
    badgeColor: "bg-emerald-600 text-white",
    badgeIcon: DrinkIcon,
    imageUrl:
      "https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?auto=format&fit=crop&w=720&q=85",
    detailImageUrl:
      "https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?auto=format&fit=crop&w=1100&q=90",
    gallery: [
      "https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?auto=format&fit=crop&w=360&q=85",
      "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=360&q=85",
      "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=360&q=85",
    ],
    extras: [
      { name: "Sem açúcar", priceCents: 0 },
      { name: "Hortelã extra", priceCents: 150 },
      { name: "Copo grande", priceCents: 300 },
    ],
  },
  {
    id: "suco-morango",
    category: "drinks",
    name: "Suco de Morango",
    description: "Suco de morango batido com fruta e gelo...",
    fullDescription:
      "Suco de morango batido com fruta, gelo e opção de açúcar à parte para deixar no seu gosto.",
    priceCents: 1290,
    rating: "4.7",
    badgeColor: "bg-emerald-600 text-white",
    badgeIcon: DrinkIcon,
    imageUrl:
      "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=720&q=85",
    detailImageUrl:
      "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=1100&q=90",
    gallery: [
      "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=360&q=85",
      "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=360&q=85",
      "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=360&q=85",
    ],
    extras: [
      { name: "Sem açúcar", priceCents: 0 },
      { name: "Leite condensado", priceCents: 250 },
      { name: "Copo grande", priceCents: 300 },
    ],
  },
  {
    id: "milkshake-chocolate",
    category: "milkshakes",
    name: "Milkshake Chocolate",
    description: "Milkshake cremoso de chocolate com chantilly...",
    fullDescription:
      "Milkshake cremoso de chocolate batido com sorvete, calda e finalizado com chantilly.",
    priceCents: 1890,
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
      "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=420&q=85",
    ],
    extras: [
      { name: "Calda extra", priceCents: 250 },
      { name: "Ovomaltine", priceCents: 400 },
      { name: "Chantilly extra", priceCents: 300 },
    ],
  },
  {
    id: "milkshake-morango",
    category: "milkshakes",
    name: "Milkshake Morango",
    description: "Milkshake de morango com calda e chantilly...",
    fullDescription:
      "Milkshake cremoso de morango batido com sorvete, calda de morango e finalizado com chantilly.",
    priceCents: 1890,
    rating: "4.8",
    badgeColor: "bg-white text-amber-500",
    badgeIcon: MilkshakeIcon,
    imageUrl:
      "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=720&q=85",
    detailImageUrl:
      "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=1100&q=90",
    gallery: [
      "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=360&q=85",
      "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=360&q=85",
      "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=360&q=85",
    ],
    extras: [
      { name: "Calda extra", priceCents: 250 },
      { name: "Leite em pó", priceCents: 400 },
      { name: "Chantilly extra", priceCents: 300 },
    ],
  },
  {
    id: "milkshake-oreo",
    category: "milkshakes",
    name: "Milkshake Oreo",
    description: "Milkshake cremoso com biscoito Oreo triturado...",
    fullDescription:
      "Milkshake de baunilha com biscoito Oreo triturado, calda de chocolate e chantilly.",
    priceCents: 2090,
    rating: "4.9",
    badgeColor: "bg-white text-amber-500",
    badgeIcon: MilkshakeIcon,
    imageUrl: "/images/menu/milkshake-oreo.svg",
    detailImageUrl: "/images/menu/milkshake-oreo.svg?detail",
    gallery: [
      "/images/menu/milkshake-oreo.svg?thumb=1",
      "/images/menu/milkshake-oreo.svg?thumb=2",
      "/images/menu/milkshake-oreo.svg?thumb=3",
    ],
    extras: [
      { name: "Oreo extra", priceCents: 400 },
      { name: "Calda extra", priceCents: 250 },
      { name: "Chantilly extra", priceCents: 300 },
    ],
  },
  {
    id: "milkshake-baunilha",
    category: "milkshakes",
    name: "Milkshake Baunilha",
    description: "Milkshake de baunilha com calda e chantilly...",
    fullDescription:
      "Milkshake cremoso de baunilha batido com sorvete, finalizado com calda e chantilly.",
    priceCents: 1790,
    rating: "4.7",
    badgeColor: "bg-white text-amber-500",
    badgeIcon: MilkshakeIcon,
    imageUrl:
      "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=720&q=85",
    detailImageUrl:
      "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=1100&q=90",
    gallery: [
      "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=360&q=85",
      "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=360&q=85",
      "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=420&q=85",
    ],
    extras: [
      { name: "Calda de caramelo", priceCents: 250 },
      { name: "Ovomaltine", priceCents: 400 },
      { name: "Chantilly extra", priceCents: 300 },
    ],
  },
];

export const categories: MenuCategory[] = [
  { id: "all", label: "Destaques", icon: Cross2Icon },
  ...categoryOrder
    .filter((category) => products.some((product) => product.category === category))
    .map((category) => ({
      id: category,
      label: categoryDetails[category].label,
      icon: categoryDetails[category].icon,
    })),
];
