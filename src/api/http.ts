import axios from "axios";
import { apiConfig } from "./config";

export const api = axios.create({
  baseURL: apiConfig.baseUrl,
});

export function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? fallback;
  }

  return fallback;
}
