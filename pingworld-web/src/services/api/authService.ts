import { apiClient } from "@/services/api/clientService";
import {
  LoginResponse,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  LogoutResponse,
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
};