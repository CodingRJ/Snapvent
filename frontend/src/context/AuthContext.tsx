"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loginApi } from "~/services/auth.service";

interface AuthUser {
  user_id: number;
  username: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  access_token: string | null;
  isLoading: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  access_token: string | null;
  login: (username: string, password: string) => Promise<void>;
  loginWithToken: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const COOKIE_NAME = "access_token";

function setCookie(value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(): string | null {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_NAME}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

function deleteCookie() {
  document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

function decodeJwt(token: string): AuthUser {
  const payload = JSON.parse(atob(token.split(".")[1]));
  return {
    user_id: payload.user_id,
    username: payload.username,
    email: payload.email,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [{ user, access_token, isLoading }, setAuth] = useState<AuthState>({
    user: null,
    access_token: null,
    isLoading: true,
  });
  const router = useRouter();

  useEffect(() => {
    const token = getCookie();
    if (!token) {
      setAuth({ user: null, access_token: null, isLoading: false });
      return;
    }
    try {
      setAuth({ user: decodeJwt(token), access_token: token, isLoading: false });
    } catch {
      deleteCookie();
      setAuth({ user: null, access_token: null, isLoading: false });
    }
  }, []);

  async function login(username: string, password: string) {
    const token = await loginApi(username, password);
    setCookie(token);
    setAuth({ user: decodeJwt(token), access_token: token, isLoading: false });
    router.push("/");
  }

  function loginWithToken(token: string) {
    setCookie(token);
    setAuth({ user: decodeJwt(token), access_token: token, isLoading: false });
    router.push("/");
  }

  function logout() {
    deleteCookie();
    setAuth({ user: null, access_token: null, isLoading: false });
    router.push("/login");
  }

  return (
    <AuthContext.Provider
      value={{ user, access_token, login, loginWithToken, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
