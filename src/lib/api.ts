import { AuthResponse, LoginRequest, RegisterRequest } from '../types/user';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://sky-money-ai-skymoneyback2.dq4298.easypanel.host';

// Debug: mostrar qual URL está sendo usada (apenas desenvolvimento)
if (import.meta.env.DEV) {
  console.log('🔗 API Base URL:', API_BASE_URL);
  console.log('🔗 Usando VITE_API_URL?', !!import.meta.env.VITE_API_URL);
}

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Helper function to make authenticated requests
const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}): Promise<any> => {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }

      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      return result;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  getProfile: async (): Promise<AuthResponse> => {
    try {
      return await makeAuthenticatedRequest('/auth/profile');
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  verifyEmail: async (code: string): Promise<AuthResponse> => {
    try {
      return await makeAuthenticatedRequest('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  },

  verifyPhone: async (code: string): Promise<AuthResponse> => {
    try {
      return await makeAuthenticatedRequest('/auth/verify-phone', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
    } catch (error) {
      console.error('Phone verification error:', error);
      throw error;
    }
  },

  resendEmailVerification: async (): Promise<AuthResponse> => {
    try {
      return await makeAuthenticatedRequest('/auth/resend-email-verification', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Resend email verification error:', error);
      throw error;
    }
  },

  resendPhoneVerification: async (): Promise<AuthResponse> => {
    try {
      return await makeAuthenticatedRequest('/auth/resend-phone-verification', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Resend phone verification error:', error);
      throw error;
    }
  },
};
