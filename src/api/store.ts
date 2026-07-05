import type { ApiOrder, ApiOrderStatus, ApiStore, ApiStoreUser } from "../types/api";
import { api, authHeaders } from "./http";

type CreateStoreInput = {
  coverImageUrl?: string;
  logoUrl?: string;
  name: string;
  owner: {
    cpf: string;
    email: string;
    name: string;
    password: string;
  };
  slug: string;
};

type CreateStoreResponse = {
  owner: ApiStoreUser;
  store: ApiStore;
};

type LoginStoreUserInput = {
  email: string;
  password: string;
};

type LoginStoreUserResponse = {
  storeUser: ApiStoreUser;
  token: string;
};

export async function getStore(id: string) {
  const { data } = await api.get<ApiStore>(`/stores/${id}`);

  return data;
}

export async function createStore(input: CreateStoreInput) {
  const { data } = await api.post<CreateStoreResponse>("/stores", input);

  return data;
}

export async function listStoreOrders(token: string) {
  const { data } = await api.get<ApiOrder[]>("/store/orders", {
    headers: authHeaders(token),
  });

  return data;
}

export async function loginStoreUser(input: LoginStoreUserInput) {
  const { data } = await api.post<LoginStoreUserResponse>(
    "/store-users/login",
    input,
  );

  return data;
}

export async function updateStoreOrderStatus(
  token: string,
  orderId: string,
  status: ApiOrderStatus,
) {
  const { data } = await api.patch<ApiOrder>(
    `/store/orders/${orderId}/status`,
    { status },
    {
      headers: authHeaders(token),
    },
  );

  return data;
}
