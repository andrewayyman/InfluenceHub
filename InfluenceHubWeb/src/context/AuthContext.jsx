import React, { useCallback, useMemo, useState } from "react";
import { login as loginRequest } from "../services/api/authService";
import { AuthContext } from "./AuthContextStore";
import {
  buildSession,
  clearStoredSession,
  readStoredSession,
  writeStoredSession,
} from "../utils/auth";

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => readStoredSession());

  const persistSession = useCallback((nextSession) => {
    setSession(nextSession);

    if (nextSession) {
      writeStoredSession(nextSession);
      return nextSession;
    }

    clearStoredSession();
    return null;
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await loginRequest(credentials);
    const nextSession = buildSession(response);

    if (!nextSession) {
      throw new Error("Unable to start a session with this account.");
    }

    persistSession(nextSession);
    return nextSession;
  }, [persistSession]);

  const logout = useCallback(() => {
    persistSession(null);
  }, [persistSession]);

  const value = useMemo(() => ({
    token: session?.token ?? null,
    user: session?.user ?? null,
    isAuthenticated: Boolean(session?.token && session?.user),
    login,
    logout,
  }), [login, logout, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
