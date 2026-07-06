import type { ApiStoreMenu } from "../types/api";
import { apiConfig } from "./config";
import { api } from "./http";

export async function getStoreMenu(slug = apiConfig.storeSlug) {
  const { data } = await api.get<ApiStoreMenu>(`/stores/${slug}/menu`);

  return data;
}
