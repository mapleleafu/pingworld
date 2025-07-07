import { useState, useCallback } from "react";
import { authService } from "@/services/api/authService";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterResponse,
  RefreshResponse,
  LogoutResponse,
} from "@/types/auth";
import { toast } from "sonner";

export interface UseAuthReturn {
  login: (data: LoginRequest) => Promise<LoginResponse>;
  register: (data: RegisterRequest) => Promise<RegisterResponse>;
  logout: () => Promise<LogoutResponse>;
  profile: () => Promise<RegisterResponse>;
  refresh: () => Promise<RefreshResponse>;
  error: string | null;
  isLoading: boolean;
}

export const useAuth = (): UseAuthReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser, clearAuth } = useAuthContext();

  const login = useCallback(
    async ({ email, password }: LoginRequest) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authService.login({ email, password });
        const user = response?.data?.user;
        const accessToken = response?.data?.accessToken;
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("accessToken", accessToken);
        setUser(user);

        //TODO: reset the WS connection using accessToken

        return response;
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message || "Login failed");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setUser],
  );

  const logout = useCallback(async (): Promise<LogoutResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      return await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, error: "Logout failed", status: 500, data: {} };
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  const profile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.profile();
      const user = response?.data?.user;
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      return response;
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || "Failed to fetch profile");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setUser]);

  const register = useCallback(
    async (data: RegisterRequest) => {
      setIsLoading(true);
      setError(null);
      try {
        return await authService.register(data);
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message || "Registration failed");
        throw err;
      } finally {
        setIsLoading(false)
      }
    },
    [setUser],
  );

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.refresh();
      const user = response?.data?.user;
      const accessToken = response?.data?.accessToken;
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("accessToken", accessToken);
      setUser(user);
      return response;
    } catch (err: any) {
      setError(err.message);
      clearAuth();
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setUser]);

  return { login, logout, isLoading, error, register, profile, refresh };
};
