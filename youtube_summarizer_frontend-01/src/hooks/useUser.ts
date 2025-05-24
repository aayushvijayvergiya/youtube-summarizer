import { useCallback } from "react";
import { API_BASE_URL } from "@/constants/api-constants";

export const useUser = () => {
  const fetchUser = useCallback(async (token: string) => {
    if (!token) {
      throw new Error("Token is required to fetch user data.");
    }

    const response = await fetch(`${API_BASE_URL}/auth/currentuser`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized access. Please log in again.");
      }
    }

    const data = await response.json();
    return data;
  }, []);

  return { fetchUser };
};
