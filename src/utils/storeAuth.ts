import type { ApiStore, ApiStoreUser } from "../types/api";

export type StoreSession = {
  store: ApiStore | null;
  storeUser: ApiStoreUser;
  token: string;
};

const storeSessionKey = "fast-burguer-store-session";

export function readStoreSession(): StoreSession | null {
  try {
    const savedSession = window.localStorage.getItem(storeSessionKey);

    if (!savedSession) {
      return null;
    }

    return JSON.parse(savedSession) as StoreSession;
  } catch {
    return null;
  }
}

export function writeStoreSession(session: StoreSession) {
  window.localStorage.setItem(storeSessionKey, JSON.stringify(session));
}

export function clearStoreSession() {
  window.localStorage.removeItem(storeSessionKey);
}
