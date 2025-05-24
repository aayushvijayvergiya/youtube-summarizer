"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { getAuthToken, saveAuthToken } from "@/utils/auth";
import { setItem } from "@/service/localstorage";
import { useUser } from "@/hooks/useUser";

enum AuthStatus {
  LOADING = "LOADING",
  ERROR = "ERROR",
  LOADED = "LOADED",
}

export interface User {
  username: string;
  email: string;
  token: string;
}

interface AuthState {
  authenticating: AuthStatus;
  isAuthenticated: boolean;
  user: User | null;
}

type AuthAction =
  | { type: "LOADING" }
  | { type: "ERROR" }
  | { type: "LOGIN" }
  | { type: "LOGOUT" }
  | { type: "CURRENT_USER"; user: User }
  | { type: "LOADING_USER" };

const initialState: AuthState = {
  authenticating: AuthStatus.LOADING,
  isAuthenticated: false,
  user: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOADING":
      return { ...state, authenticating: AuthStatus.LOADING };
    case "LOADING_USER":
      return {
        ...state,
        authenticating: AuthStatus.LOADING,
        isAuthenticated: false,
      };
    case "CURRENT_USER":
      return {
        ...state,
        user: action.user,
        authenticating: AuthStatus.LOADED,
        isAuthenticated: true,
      };
    case "LOGIN":
      return {
        ...state,
        isAuthenticated: true,
        authenticating: AuthStatus.LOADED,
      };
    case "ERROR":
      return { ...state, authenticating: AuthStatus.ERROR };
    case "LOGOUT":
      return {
        isAuthenticated: false,
        user: null,
        authenticating: AuthStatus.LOADED,
      };
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
  const { fetchUser } = useUser();

  useEffect(() => {
    dispatch({ type: "LOADING" });
    const initializeAuth = async () => {
      try {
        const token = await getAuthToken();
        if (token) {
          await dispatch({ type: "LOADING_USER" });
          const userData = await fetchUser(token);
          await dispatch({ type: "CURRENT_USER", user: userData });
        } else {
          await dispatch({ type: "LOGOUT" });
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        dispatch({ type: "ERROR" });
        redirectToAuth();
      }
    };
    initializeAuth();
  }, []);

  const isAuthenticated = () => {
    return state.authenticating == "LOADED" && state.isAuthenticated;
  };

  const login = async (token: string) => {
    await dispatch({ type: "LOGIN" });

    await dispatch({ type: "LOADING_USER" });
    const userData = await fetchUser(token);
    await dispatch({ type: "CURRENT_USER", user: userData });
    await saveAuthToken(token);
  };

  const logout = async () => {
    dispatch({ type: "LOGOUT" });
    await setItem("authToken", "");
  };

  const redirectToAuth = () => router.push("/auth");
  const redirectToHome = () => router.push("/");

  return (
    <AuthContext.Provider
      value={{
        state,
        isAuthenticated,
        login,
        logout,
        redirectToAuth,
        redirectToHome,
      }}
    >
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
