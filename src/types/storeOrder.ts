export type OrderStatus =
  | "PENDING"
  | "PREPARING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELED"
  | "REJECTED";

export type PaymentMethod =
  | "CASH"
  | "PIX"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "MEAL_VOUCHER";

export type FulfillmentType = "DELIVERY" | "PICKUP";

export type StoreOrderClient = {
  id: string;
  name: string;
  phone: string;
};

export type StoreOrderItem = {
  id: string;
  observation: string | null;
  orderId: string;
  product: { name: string };
  productId: string;
  quantity: number;
  unitPrice: number;
};

export type StoreOrderAddress = {
  city: string;
  complement: string | null;
  neighborhood: string;
  number: string;
  postalCode: string;
  reference: string | null;
  state: string;
  street: string;
};

export type StoreOrder = {
  address: StoreOrderAddress | null;
  changeFor: number | null;
  client: StoreOrderClient;
  clientId: string;
  createdAt: string;
  discount: number;
  deliveryFee: number;
  fulfillmentType: FulfillmentType;
  id: string;
  items: StoreOrderItem[];
  number: number;
  observation: string | null;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  storeId: string;
  subtotal: number;
  total: number;
  updateAt: string;
};
