import type { ApiClient } from "../types/api";

export type ClientSession = {
  client: ApiClient;
  token: string;
};

const clientSessionKey = "fast-burguer-client-session";
const clientSessionEvent = "fast-burguer-client-session-changed";
const clientProfileEvent = "fast-burguer-client-profile-changed";

export function clearClientSession() {
  window.localStorage.removeItem(clientSessionKey);
  notifyClientSessionChanged();
}

export function notifyClientProfileChanged() {
  window.dispatchEvent(new Event(clientProfileEvent));
}

export function notifyClientSessionChanged() {
  window.dispatchEvent(new Event(clientSessionEvent));
}

export function readClientSession(): ClientSession | null {
  try {
    const savedSession = window.localStorage.getItem(clientSessionKey);

    if (!savedSession) {
      return null;
    }

    return JSON.parse(savedSession) as ClientSession;
  } catch {
    return null;
  }
}

export function subscribeClientProfileChanged(listener: () => void) {
  window.addEventListener(clientProfileEvent, listener);

  return () => window.removeEventListener(clientProfileEvent, listener);
}

export function subscribeClientSessionChanged(listener: () => void) {
  window.addEventListener(clientSessionEvent, listener);

  return () => window.removeEventListener(clientSessionEvent, listener);
}

export function writeClientSession(session: ClientSession) {
  window.localStorage.setItem(clientSessionKey, JSON.stringify(session));
  notifyClientSessionChanged();
}
