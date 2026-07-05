import type { Address } from "../types/profile";
import type { ApiAddress } from "../types/api";
import { api, authHeaders } from "./http";

type SaveAddressInput = {
  city: string;
  complement?: string;
  main?: boolean;
  neighborhood: string;
  number?: string;
  postalCode: string;
  state: string;
  street: string;
};

export async function createClientAddress(token: string, input: SaveAddressInput) {
  const { data } = await api.post<ApiAddress>("/clients/me/addresses", input, {
    headers: authHeaders(token),
  });

  return mapApiAddress(data);
}

export async function deleteClientAddress(token: string, id: string) {
  await api.delete(`/clients/me/addresses/${id}`, {
    headers: authHeaders(token),
  });
}

export async function listClientAddresses(token: string) {
  const { data } = await api.get<ApiAddress[]>("/clients/me/addresses", {
    headers: authHeaders(token),
  });

  return data.map(mapApiAddress);
}

export async function updateClientAddress(
  token: string,
  id: string,
  input: Partial<SaveAddressInput>,
) {
  const { data } = await api.put<ApiAddress>(
    `/clients/me/addresses/${id}`,
    input,
    {
      headers: authHeaders(token),
    },
  );

  return mapApiAddress(data);
}

export function mapAddressToApiInput(address: Address): SaveAddressInput {
  return {
    city: address.city,
    complement: address.complement || undefined,
    main: address.isDefault,
    neighborhood: address.district,
    number: address.number || undefined,
    postalCode: address.postalCode.replace(/\D/g, ""),
    state: address.state,
    street: address.street,
  };
}

function mapApiAddress(address: ApiAddress): Address {
  return {
    city: address.city,
    complement: address.complement ?? "",
    district: address.neighborhood,
    id: address.id,
    isDefault: address.main,
    label: address.main ? "Principal" : "Endereço",
    number: address.number ?? "",
    postalCode: address.postalCode,
    state: address.state,
    street: address.street,
  };
}
