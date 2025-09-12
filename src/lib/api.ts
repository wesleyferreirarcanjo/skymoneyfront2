import { AuthResponse, LoginRequest, RegisterRequest } from '../types/user';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

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

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // Create more specific error messages for authentication issues
      if (response.status === 401) {
        throw new Error(`401: Unauthorized - Token may be expired or invalid`);
      } else if (response.status === 403) {
        throw new Error(`403: Forbidden - Access denied`);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    }

    return response.json();
  } catch (error: any) {
    // Re-throw network errors with more context
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(`Network error: Unable to connect to server`);
    }
    throw error;
  }
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

      // Adaptar resposta do backend para o formato esperado pelo frontend
      if (result.access_token && result.user) {
        return {
          success: true,
          data: {
            user: result.user,
            accessToken: result.access_token,
            refreshToken: result.refresh_token
          }
        };
      }

      // Se já estiver no formato correto, retornar como está
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

      // Adaptar resposta do backend para o formato esperado pelo frontend
      if (result.access_token && result.user) {
        return {
          success: true,
          data: {
            user: result.user,
            accessToken: result.access_token,
            refreshToken: result.refresh_token
          }
        };
      }

      // Se já estiver no formato correto, retornar como está
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  getProfile: async (): Promise<AuthResponse> => {
    try {
      const result = await makeAuthenticatedRequest('/users/profile');
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      console.error('Get profile error:', error);

      // Check if it's an authentication error
      const isAuthError = error.message?.includes('401') || error.message?.includes('Unauthorized');

      return {
        success: false,
        message: error.message || 'Failed to get profile',
        isAuthError: isAuthError
      };
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

  getUsers: async (): Promise<any[]> => {
    try {
      const result = await makeAuthenticatedRequest('/users');
      return result;
    } catch (error: any) {
      console.error('Get users error:', error);
      throw error;
    }
  },

  updateUser: async (userId: string, userData: any): Promise<any> => {
    try {
      const result = await makeAuthenticatedRequest(`/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(userData),
      });
      return result;
    } catch (error: any) {
      console.error('Update user error:', error);
      throw error;
    }
  },

  approveUser: async (userId: string): Promise<any> => {
    try {
      const result = await makeAuthenticatedRequest(`/users/${userId}/approve`, {
        method: 'PATCH',
      });
      return result;
    } catch (error: any) {
      console.error('Approve user error:', error);
      throw error;
    }
  },
};
