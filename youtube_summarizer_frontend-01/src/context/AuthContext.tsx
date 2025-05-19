"use client";

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken } from "@/utils/auth";
import { setItem } from "@/service/localstorage";

enum AuthStatus {
  LOADING = "LOADING",
  ERROR = "ERROR",
  LOADED = "LOADED",
}

interface AuthState {
  authenticating: AuthStatus;
  isAuthenticated: boolean;
  token: string | null;
}

type AuthAction =
  | { type: "LOADING" }
  | { type: "ERROR" }
  | { type: "LOGIN"; token: string }
  | { type: "LOGOUT" };

const initialState: AuthState = {
  authenticating: AuthStatus.LOADING,
  isAuthenticated: false,
  token: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOADING":
      return { ...state, authenticating: AuthStatus.LOADING };
    case "LOGIN":
      return { isAuthenticated: true, token: action.token, authenticating: AuthStatus.LOADED };
    case "ERROR":
      return { ...state, authenticating: AuthStatus.ERROR };
    case "LOGOUT":
      return { isAuthenticated: false, token: null, authenticating: AuthStatus.LOADED };
    default:
      return state;
  }
};

interface AuthContextType {
  state: AuthState;
  isAuthenticated: () => boolean;
  login: (token: string) => void;
  logout: () => void;
  redirectToAuth: () => void;
  redirectToHome: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    dispatch({ type: "LOADING" });
    const initializeAuth = async () => {
      const token = await getAuthToken();
      if (token) {
        dispatch({ type: "LOGIN", token });
      }
    };
    initializeAuth();
  }, []);

  const isAuthenticated = () => {
    return state.isAuthenticated;
  }

  const login = async (token: string) => {
    dispatch({ type: "LOGIN", token });
    await setItem("authToken", token);
  };

  const logout = async () => {
    dispatch({ type: "LOGOUT" });
    await setItem("authToken", '');
  };

  const redirectToAuth = () => router.push("/auth");
  const redirectToHome = () => router.push("/");

  return (
    <AuthContext.Provider value={{ state, isAuthenticated, login, logout, redirectToAuth, redirectToHome }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};