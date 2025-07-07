import { API_URL, VITE_API_VERSION } from "@/utils/constants";
import { ApiError } from "@/types";

interface QueueItem {
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

class ApiClient {
  private isRefreshing = false;
  private failedQueue: QueueItem[] = [];

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    this.failedQueue = [];
  }

  private getAccessToken(): string | null {
    return localStorage.getItem("accessToken");
  }

  private setAccessToken(token: string): void {
    localStorage.setItem("accessToken", token);
  }

  private removeAccessToken(): void {
    localStorage.removeItem("accessToken");
  }

  private async refreshToken(): Promise<string> {
    const response = await fetch(
      `${API_URL}/${VITE_API_VERSION}/refresh/token`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      },
    );

    if (!response.ok) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:logout"));
      }
      throw new Error("Refresh token failed");
    }

    const data = await response.json();

    if (!data.success || !data.data?.accessToken) {
      throw new Error("No access token in refresh response");
    }

    this.setAccessToken(data.data.accessToken);
    return data.data.accessToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0,
  ): Promise<T> {
    const token = this.getAccessToken();

    const config: RequestInit = {
      ...options,
      credentials: "include", // Always send cookies
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(
      `${API_URL}/${VITE_API_VERSION}/${endpoint}`,
      config,
    );

    if (response.status === 401 && retryCount === 0) {
      if (this.isRefreshing) {
        return new Promise<T>((resolve, reject) => {
          this.failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          const retryConfig = {
            ...config,
            headers: {
              ...config.headers,
              Authorization: `Bearer ${newToken}`,
            },
          };
          return fetch(
            `${API_URL}/${VITE_API_VERSION}/${endpoint}`,
            retryConfig,
          ).then((res) => this.handleResponse<T>(res));
        });
      }

      this.isRefreshing = true;

      try {
        const newToken = await this.refreshToken();
        this.processQueue(null, newToken);

        // Retry original request with new token
        const retryConfig = {
          ...config,
          headers: {
            ...config.headers,
            Authorization: `Bearer ${newToken}`,
          },
        };

        const retryResponse = await fetch(
          `${API_URL}/${VITE_API_VERSION}/${endpoint}`,
          retryConfig,
        );

        return this.handleResponse<T>(retryResponse);
      } catch (refreshError) {
        this.processQueue(refreshError, null);
        this.removeAccessToken();

        // Dispatch logout event
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth:logout"));
        }

        throw refreshError;
      } finally {
        this.isRefreshing = false;
      }
    }

    return this.handleResponse<T>(response);
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError({
        success: false,
        data: data.data,
        error: data.error || "An unexpected error occurred.",
        status: response.status,
      });
    }

    return data;
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint);
  }

  post<T>(endpoint: string, body: any, options: RequestInit = {}) {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      ...options,
    });
  }

  put<T>(endpoint: string, body: any) {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, {
      method: "DELETE",
    });
  }
}

export const apiClient = new ApiClient();
