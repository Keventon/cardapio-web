export type ApiAddress = {
  city: string;
  complement: string | null;
  id: string;
  main: boolean;
  neighborhood: string;
  number: string | null;
  postalCode: string;
  reference: string | null;
  state: string;
  street: string;
};

export type ApiClient = {
  email: string;
  id: string;
  name: string;
  phone: string;
};

export type ApiStore = {
  coverImageUrl: string | null;
  id: string;
  logoUrl: string | null;
  name: string;
  slug: string;
};

export type ApiStoreUser = {
  enabled: boolean;
  id: string;
  name: string;
  role: string;
  storeId: string;
};

export type ApiFulfillmentType = "DELIVERY" | "PICKUP";

export type ApiMenuCategory = {
  id: string;
  name: string;
  position: number;
  products: ApiMenuProduct[];
};

export type ApiMenuProduct = {
  description: string | null;
  id: string;
  imageUrl: string | null;
  name: string;
  position: number;
  price: number;
};

export type ApiOrder = {
  address?: unknown;
  changeFor?: number | null;
  client?: {
    id: string;
    name: string;
    phone: string;
  };
  createdAt?: string;
  fulfillmentType?: ApiFulfillmentType;
  id: string;
  items?: ApiOrderItem[];
  number: number;
  paymentMethod?: ApiPaymentMethod;
  status: ApiOrderStatus;
  total: number;
};

export type ApiOrderItem = {
  id: string;
  observation: string | null;
  orderId: string;
  product?: {
    id: string;
    name: string;
  };
  productId: string;
  quantity: number;
  unitPrice: number;
};

export type ApiOrderStatus =
  | "PENDING"
  | "PREPARING"
  | "OUT_FOR_DELIVERY"
  | "READY"
  | "CANCELED"
  | "DELIVERED"
  | "REJECTED"
  | "COMPLETED";

export type ApiPaymentMethod =
  | "CASH"
  | "PIX"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "MEAL_VOUCHER";

export type ApiStoreMenu = {
  categories: ApiMenuCategory[];
  id: string;
  logoUrl: string | null;
  name: string;
  slug: string;
};
