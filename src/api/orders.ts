import type { CheckoutForm } from "../forms/checkoutForm";
import type { OrderItem } from "../types/menu";
import type {
  ApiFulfillmentType,
  ApiOrder,
  ApiPaymentMethod,
} from "../types/api";
import { parseCurrencyToCents } from "../utils/currency";
import { api, authHeaders } from "./http";

type CreateOrderInput = {
  addressId?: string;
  form: CheckoutForm;
  items: OrderItem[];
  storeId: string;
  token: string;
};

export async function createOrder({
  addressId,
  form,
  items,
  storeId,
  token,
}: CreateOrderInput) {
  const { data } = await api.post<ApiOrder>(
    "/orders",
    {
      addressId,
      changeFor: getChangeFor(form),
      fulfillmentType: mapFulfillment(form.fulfillment),
      items: items.map((item) => ({
        observation: getItemObservation(item),
        productId: item.productId,
        quantity: item.quantity,
      })),
      paymentMethod: mapPaymentMethod(form.payment),
      storeId,
    },
    {
      headers: authHeaders(token),
    },
  );

  return data;
}

function getChangeFor(form: CheckoutForm) {
  if (form.payment !== "cash" || form.cashChangeType !== "change") {
    return undefined;
  }

  return parseCurrencyToCents(form.cashChangeFor ?? "");
}

function getItemObservation(item: OrderItem) {
  return item.instructions || undefined;
}

function mapFulfillment(fulfillment: CheckoutForm["fulfillment"]): ApiFulfillmentType {
  return fulfillment === "delivery" ? "DELIVERY" : "PICKUP";
}

function mapPaymentMethod(payment: CheckoutForm["payment"]): ApiPaymentMethod {
  if (payment === "cash") {
    return "CASH";
  }

  if (payment === "pix") {
    return "PIX";
  }

  return "CREDIT_CARD";
}

export async function listClientOrders(token: string) {
  const { data } = await api.get<ApiOrder[]>("/clients/me/orders", {
    headers: authHeaders(token),
  });

  return data;
}

export async function getClientOrderStreamTicket(token: string) {
  const { data } = await api.post<{ ticket: string }>(
    "/orders/stream-ticket",
    undefined,
    { headers: authHeaders(token) },
  );

  return data;
}
