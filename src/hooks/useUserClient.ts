import { useContext } from "react";
import { UserClientContext } from "../contexts/UserClientContextValue";

export function useUserClient() {
  const context = useContext(UserClientContext);

  if (!context) {
    throw new Error("useUserClient must be used within UserClientProvider");
  }

  return context;
}
