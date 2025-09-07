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
  PasswordChangeRequest,
} from "@/types/auth";
import { toast } from "sonner";
import { useSocket } from "@/contexts/SocketContext";
import { ApiResponse } from "@/types/api";

export interface UseAuthReturn {
  login: (data: LoginRequest) => Promise<LoginResponse>;
  register: (data: RegisterRequest) => Promise<RegisterResponse>;
  logout: () => Promise<LogoutResponse>;
  profile: () => Promise<RegisterResponse>;
  refresh: () => Promise<RefreshResponse>;
  passwordChange: (data: PasswordChangeRequest) => Promise<ApiResponse>;
  error: string | null;
  isLoading: boolean;
}

export const useAuth = (): UseAuthReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser, clearAuth } = useAuthContext();
  const { reconnectToSocket } = useSocket();

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
        reconnectToSocket(); // Reconnect with new token
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
      const response = await authService.logout();
      toast.success("Successfully logged out!");
      return response;
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || "Logout failed");
      throw err;
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
        setIsLoading(false);
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

  const passwordChange = useCallback(async (data: PasswordChangeRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.passwordChange(data);
      toast.success("Password changed successfully!");
      return response;
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || "Password change failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    login,
    logout,
    isLoading,
    error,
    register,
    profile,
    refresh,
    passwordChange,
  };
};
