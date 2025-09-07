import { apiClient } from "@/services/api/clientService";
import { ApiResponse } from "@/types/api";
import {
  LoginResponse,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  LogoutResponse,
  PasswordChangeRequest,
} from "@/types/auth";

export const authService = {
  login: (data: LoginRequest): Promise<LoginResponse> =>
    apiClient.post("login", data),
    
  register: (data: RegisterRequest): Promise<RegisterResponse> =>
    apiClient.post("register", data),
    
  refresh: (): Promise<LoginResponse> =>
    apiClient.post("refresh/token", {}),

  logout: (): Promise<LogoutResponse> =>
    apiClient.post("logout", {}),

  profile: (): Promise<RegisterResponse> =>
    apiClient.get("profile"),

  passwordChange: (data: PasswordChangeRequest): Promise<ApiResponse> =>
    apiClient.post("password/change", data),
};