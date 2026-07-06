import { useUserClient } from "./useUserClient";

export function useClientSession() {
  return useUserClient().session;
}
