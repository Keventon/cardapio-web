import type { ApiStore } from "../types/api";
import { api } from "./http";

export async function listStores() {
  const { data } = await api.get<ApiStore[]>("/stores");

  return data;
}
