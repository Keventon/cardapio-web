import type { ApiClient } from "../types/api";
import { api, authHeaders } from "./http";

type LoginClientInput = {
  email: string;
  password: string;
};

type RegisterClientInput = {
  email: string;
  name: string;
  password: string;
  phone: string;
};

type UpdateClientInput = {
  email?: string;
  name?: string;
  password?: string;
  phone?: string;
};

type LoginClientResponse = {
  client: ApiClient;
  token: string;
};

export async function loginClient(input: LoginClientInput) {
  const { data } = await api.post<LoginClientResponse>("/clients/login", input);

  return data;
}

export async function registerClient(input: RegisterClientInput) {
  const { data } = await api.post<ApiClient>("/clients", input);

  return data;
}

export async function updateOwnClient(token: string, input: UpdateClientInput) {
  const { data } = await api.put<ApiClient>("/clients/me", input, {
    headers: authHeaders(token),
  });

  return data;
}
