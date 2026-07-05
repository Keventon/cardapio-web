import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { ClientSession } from "../utils/clientSession";
import {
  UserClientContext,
  type UserClientContextValue,
} from "./UserClientContextValue";
import {
  clearClientSession,
  readClientSession,
  subscribeClientSessionChanged,
  writeClientSession,
} from "../utils/clientSession";

type UserClientProviderProps = {
  children: ReactNode;
};

export function UserClientProvider({ children }: UserClientProviderProps) {
  const [session, setCurrentSession] = useState<ClientSession | null>(() =>
    readClientSession(),
  );

  useEffect(() => {
    return subscribeClientSessionChanged(() => {
      setCurrentSession(readClientSession());
    });
  }, []);

  const setSession = useCallback((nextSession: ClientSession) => {
    writeClientSession(nextSession);
    setCurrentSession(nextSession);
  }, []);

  const clearSession = useCallback(() => {
    clearClientSession();
    setCurrentSession(null);
  }, []);

  const value = useMemo<UserClientContextValue>(
    () => ({
      clearSession,
      isAuthenticated: Boolean(session),
      session,
      setSession,
    }),
    [clearSession, session, setSession],
  );

  return (
    <UserClientContext.Provider value={value}>
      {children}
    </UserClientContext.Provider>
  );
}
