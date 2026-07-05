import { create } from "zustand";
import type { StoreUser } from "../types/storeAuth";

const storeAuthStorageKey = "fast-burguer-store-auth";

type StoreAuth = {
  storeUser: StoreUser | null;
  token: string | null;
};

type StoreAuthStore = StoreAuth & {
  clearAuth: () => void;
  setAuth: (auth: StoreAuth) => void;
};

const emptyAuth: StoreAuth = { storeUser: null, token: null };

function readPersistedAuth(): StoreAuth {
  try {
    const savedAuth = window.localStorage.getItem(storeAuthStorageKey);

    if (!savedAuth) {
      return emptyAuth;
    }

    return JSON.parse(savedAuth) as StoreAuth;
  } catch {
    return emptyAuth;
  }
}

export const useStoreAuthStore = create<StoreAuthStore>((set) => ({
  ...readPersistedAuth(),
  clearAuth: () => {
    window.localStorage.removeItem(storeAuthStorageKey);
    set(emptyAuth);
  },
  setAuth: (auth) => {
    window.localStorage.setItem(storeAuthStorageKey, JSON.stringify(auth));
    set(auth);
  },
}));
