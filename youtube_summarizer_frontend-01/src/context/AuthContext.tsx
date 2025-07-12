/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { saveAuthToken } from "@/utils/auth"; // Assuming this saves the token
import { setItem, getItem } from "@/service/localstorage"; // Assuming these handle local storage
import { apiService } from "@/service/apiService"; // Import the apiService

// Define more granular authentication statuses
export enum AuthStatus {
  UNKNOWN = "UNKNOWN", // Initial state before checking token
  AUTHENTICATING = "AUTHENTICATING", // Checking token and fetching user
  AUTHENTICATED = "AUTHENTICATED", // User is logged in
  UNAUTHENTICATED = "UNAUTHENTICATED", // User is not logged in
}

export interface User {
  username: string;
  email: string;
}

interface AuthState {
  status: AuthStatus;
  user: User | null;
  token: string | null;
  error: string | null;
}

type AuthAction =
  | { type: "SET_STATUS"; status: AuthStatus }
  | { type: "SET_USER"; user: User | null; token: string | null }
  | { type: "SET_ERROR"; error: string | null };

const initialState: AuthState = {
  status: AuthStatus.UNKNOWN,
  user: null,
  token: null,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "SET_STATUS":
      return { ...state, status: action.status };
    case "SET_USER":
      return {
        ...state,
        user: action.user,
        token: action.token,
        status: action.user ? AuthStatus.AUTHENTICATED : AuthStatus.UNAUTHENTICATED,
        error: null,
      };
    case "SET_ERROR":
      return { ...state, error: action.error, status: AuthStatus.UNAUTHENTICATED }; // Assuming any auth error leads to unauthenticated
    default:
      return state;
  }
};

interface AuthContextType {
  state: AuthState;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        dispatch({ type: "SET_STATUS", status: AuthStatus.AUTHENTICATING });
        const token = await getItem<string>("authToken"); // Get token from local storage
        if (token) {
          // Attempt to fetch user with the token
          try {
            const user = await apiService.get<User>("/auth/currentuser");
            dispatch({ type: "SET_USER", user, token });
          } catch (error: any) {
            console.error("Error fetching user:", error);
            if (error.response && error.response.status === 401) {
              // If 401, the token is invalid or expired
              await setItem("authToken", ""); // Clear invalid token
              dispatch({ type: "SET_ERROR", error: "Session expired. Please log in again." });
              router.push("/auth"); // Redirect to login
            } else {
              dispatch({ type: "SET_ERROR", error: "Failed to fetch user data." });
            }
          }
        } else {
          dispatch({ type: "SET_STATUS", status: AuthStatus.UNAUTHENTICATED });
        }
      } catch (initialError: any) {
        console.error("Error initializing auth:", initialError);
        dispatch({ type: "SET_ERROR", error: "An error occurred during authentication initialization." });
      }
    };
    initializeAuth();
  }, []); // Empty dependency array to run only once

  const login = async (token: string) => {
    try {
      dispatch({ type: "SET_STATUS", status: AuthStatus.AUTHENTICATING });
      await saveAuthToken(token); // Save the new token
      const user = await apiService.get<User>("/auth/currentuser"); // Fetch user with the new token
      dispatch({ type: "SET_USER", user, token });
    } catch (error: any) {
      console.error("Login error:", error);
      dispatch({ type: "SET_ERROR", error: "Login failed. Please check your credentials." });
      throw error; // Re-throw to allow components to handle login errors
    }
  };

  const logout = async () => {
    await setItem("authToken", ""); // Clear token from local storage
    dispatch({ type: "SET_USER", user: null, token: null });
    // No need to redirect here, ProtectedRoute will handle it if on a protected page
  };

  return (
    <AuthContext.Provider
      value={{
        state,
        login,
        logout,
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
