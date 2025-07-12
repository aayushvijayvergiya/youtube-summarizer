/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAuthToken } from "@/utils/auth"; // Assuming this utility exists
import { API_BASE_URL } from "@/constants/api-constants"; // Assuming this constant exists

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const token = await getAuthToken();
    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.detail || response.statusText || "Something went wrong";
      const error: any = new Error(errorMessage);
      error.status = response.status;
      error.response = response;
      throw error;
    }

    return response.json();
  }

  get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  post<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Add other HTTP methods (PUT, DELETE, etc.) as needed
  // put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
  //   return this.request<T>(endpoint, {
  //     ...options,
  //     method: "PUT",
  //     body: data ? JSON.stringify(data) : undefined,
  //   });
  // }

  // delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
  //   return this.request<T>(endpoint, { ...options, method: "DELETE" });
  // }
}

export const apiService = new ApiService();