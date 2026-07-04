import type { OrderItem } from "./menu";

export type StoreOrderStatus = "pending" | "preparing" | "ready" | "finished";

export type StoreOrder = {
  addressLine: string;
  cashChangeFor: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  fulfillment: "delivery" | "pickup";
  id: string;
  items: OrderItem[];
  number: number;
  payment: "card" | "pix" | "cash";
  status: StoreOrderStatus;
  totalCents: number;
};
