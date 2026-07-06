"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api, getAccessToken, setAccessToken, type User } from "@/lib/api";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: {
    username: string;
    email: string;
    name: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const token = getAccessToken();
      if (token) {
        const { user: me } = await api.me();
        setUser(me);
        return;
      }
      const { accessToken, user: refreshed } = await api.refresh();
      setAccessToken(accessToken);
      setUser(refreshed);
    } catch {
      setAccessToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (username: string, password: string) => {
    const { accessToken, user: loggedIn } = await api.login({
      username,
      password,
    });
    setAccessToken(accessToken);
    setUser(loggedIn);
  };

  const register = async (data: {
    username: string;
    email: string;
    name: string;
    password: string;
  }) => {
    const { accessToken, user: registered } = await api.register(data);
    setAccessToken(accessToken);
    setUser(registered);
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
