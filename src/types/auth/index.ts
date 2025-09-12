import { User } from '../user';

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    accessToken: string;
    refreshToken?: string;
  };
  message?: string;
  isAuthError?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}
