import { useCallback } from "react";
import { API_BASE_URL } from "@/constants/api-constants";
import { useAuthContext } from "@/context/AuthContext";

export const useUser = () => {
  const { state: { token}, redirectToAuth } = useAuthContext()

  const fetchUser = useCallback(async () => {
    if (!token) {
      redirectToAuth();
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/currentuser`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if(response.status === 401) {
          redirectToAuth();
        }
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching user data:", error);
      redirectToAuth();
    }
  }, [token, redirectToAuth]);

  return { fetchUser };
}