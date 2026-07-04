import type { CheckoutForm } from "../forms/checkoutForm";
import type { OrderItem } from "../types/menu";
import type { StoreOrder, StoreOrderStatus } from "../types/storeOrder";

export const storeOrdersStorageKey = "fast-burguer-store-orders";

const demoOrders: StoreOrder[] = [
  {
    addressLine: "Rua das Flores, 123 - Centro",
    cashChangeFor: "",
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    customerName: "João Silva",
    customerPhone: "(11) 99999-9999",
    fulfillment: "delivery",
    id: "demo-1042",
    items: [
      {
        extras: [{ name: "Bacon crocante", priceCents: 500 }],
        id: "demo-smash",
        instructions: "Sem cebola",
        name: "Smash Clássico",
        quantity: 1,
        unitPriceCents: 2890,
      },
      {
        extras: [],
        id: "demo-drink",
        instructions: "",
        name: "Refrigerante Lata",
        quantity: 2,
        unitPriceCents: 790,
      },
    ],
    number: 1042,
    payment: "card",
    status: "pending",
    totalCents: 4970,
  },
  {
    addressLine: "Retirada no balcão",
    cashChangeFor: "",
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    customerName: "Carlos Santos",
    customerPhone: "(11) 98888-7777",
    fulfillment: "pickup",
    id: "demo-1040",
    items: [
      {
        extras: [{ name: "Batata grande", priceCents: 600 }],
        id: "demo-combo",
        instructions: "",
        name: "Combo Smash",
        quantity: 1,
        unitPriceCents: 4290,
      },
    ],
    number: 1040,
    payment: "pix",
    status: "preparing",
    totalCents: 4890,
  },
];

export function readStoreOrders(): StoreOrder[] {
  try {
    const savedOrders = window.localStorage.getItem(storeOrdersStorageKey);

    if (!savedOrders) {
      return demoOrders;
    }

    const parsedOrders = JSON.parse(savedOrders) as StoreOrder[];

    return parsedOrders.map(normalizeStoreOrder);
  } catch {
    return demoOrders;
  }
}

export function writeStoreOrders(orders: StoreOrder[]) {
  window.localStorage.setItem(storeOrdersStorageKey, JSON.stringify(orders));
}

export function addStoreOrder(order: StoreOrder) {
  const orders = readStoreOrders();

  writeStoreOrders([order, ...orders]);
}

export function updateStoreOrderStatus(id: string, status: StoreOrderStatus) {
  const orders = readStoreOrders().map((order) =>
    order.id === id ? { ...order, status } : order,
  );

  writeStoreOrders(orders);

  return orders;
}

export function createStoreOrderFromCheckout({
  form,
  items,
  totalCents,
}: {
  form: CheckoutForm;
  items: OrderItem[];
  totalCents: number;
}): StoreOrder {
  const orders = readStoreOrders();
  const nextNumber =
    Math.max(1043, ...orders.map((order) => order.number)) + 1;

  return {
    addressLine: getAddressLine(form),
    cashChangeFor: form.cashChangeFor ?? "",
    createdAt: new Date().toISOString(),
    customerName: form.name,
    customerPhone: form.phone,
    fulfillment: form.fulfillment,
    id: `order-${Date.now()}`,
    items: items.map((item) => ({
      ...item,
      extras: item.extras.map((extra) => ({ ...extra })),
    })),
    number: nextNumber,
    payment: form.payment as StoreOrder["payment"],
    status: "pending",
    totalCents,
  };
}

function getAddressLine(form: CheckoutForm) {
  if (form.fulfillment === "pickup") {
    return "Retirada no balcão";
  }

  return [
    `${form.street}, ${form.number}`,
    form.complement,
    form.district,
    [form.city, form.state].filter(Boolean).join(" - "),
  ]
    .filter(Boolean)
    .join(" - ");
}

function normalizeStoreOrder(order: Partial<StoreOrder>): StoreOrder {
  return {
    addressLine: order.addressLine ?? "",
    cashChangeFor: order.cashChangeFor ?? "",
    createdAt: order.createdAt ?? new Date().toISOString(),
    customerName: order.customerName ?? "",
    customerPhone: order.customerPhone ?? "",
    fulfillment: order.fulfillment ?? "delivery",
    id: order.id ?? `order-${Date.now()}`,
    items: order.items ?? [],
    number: order.number ?? 0,
    payment: order.payment ?? "card",
    status: order.status ?? "pending",
    totalCents: order.totalCents ?? 0,
  };
}
