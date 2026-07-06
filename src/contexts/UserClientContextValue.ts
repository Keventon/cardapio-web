import { createContext } from "react";
import type { ClientSession } from "../utils/clientSession";

export type UserClientContextValue = {
  clearSession: () => void;
  isAuthenticated: boolean;
  session: ClientSession | null;
  setSession: (session: ClientSession) => void;
};

export const UserClientContext =
  createContext<UserClientContextValue | null>(null);
