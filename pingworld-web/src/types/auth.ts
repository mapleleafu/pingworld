export interface User {
  id: string;
  email: string;
  user_name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  user_name: string;
  password: string;
}

export interface PasswordChangeRequest {
  oldPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}

export interface RegisterResponse {
  data: {
    user: User;
    message?: string;
  };
  error?: string;
  status: number;
  success: boolean;
}

export interface LoginResponse {
  data: {
    user: User;
    accessToken: string;
    message?: string;
  };
  error?: string;
  status: number;
  success: boolean;
}

export interface RefreshResponse {
  data?: {
    accessToken: string;
    message?: string;
  };
  error?: string;
  status: number;
  success: boolean;
}

export interface LogoutResponse {
  data?: {
    message?: string;
  };
  error?: string;
  status: number;
  success: boolean;
}
