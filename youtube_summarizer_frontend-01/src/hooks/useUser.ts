import { useCallback } from "react";
import { API_BASE_URL } from "@/constants/api-constants";
import { apiService } from "@/service/apiService";

export const useUser = () => {
  const fetchUser = useCallback(async () => {
    // The apiService will handle adding the token and basic error handling
    const data = await apiService.get(
      `${API_BASE_URL}/auth/currentuser`);
    return data;
  }, []);

  return { fetchUser };
};
