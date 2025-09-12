import { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { User, authAPI } from '../lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    cpf: string;
    birthDate: string;
    address: string;
    addressNumber: string;
    cep: string;
    bank: string;
    agency: string;
    account: string;
    pixKey: string;
    pixKeyType: string;
    pixOwnerName: string;
    pixCopyPaste: string;
    pixQrCode: string;
    btcAddress?: string;
    btcQrCode?: string;
    usdtAddress?: string;
    usdtQrCode?: string;
    avatar?: string;
  }) => Promise<void>;
  logout: () => void;
  verifyEmail: (code: string) => Promise<void>;
  verifyPhone: (code: string) => Promise<void>;
  resendEmailVerification: () => Promise<void>;
  resendPhoneVerification: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        isAuthenticated: true,
        isAdmin: action.payload.user.role === 'admin' || action.payload.user.email === 'admin@skymoney.com',
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isAdmin: false,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
        isAdmin: action.payload.role === 'admin' || action.payload.email === 'admin@skymoney.com',
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');

        if (token && userData) {
          const user = JSON.parse(userData);
          dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });

          // Refresh profile to get latest data
          try {
            const response = await authAPI.getProfile();
            if (response.success) {
              dispatch({ type: 'UPDATE_USER', payload: response.data });
              localStorage.setItem('user', JSON.stringify(response.data));
            }
          } catch (error) {
            console.error('Failed to refresh profile:', error);
          }
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authAPI.login({ email, password });

      console.log('🔍 Login response:', response);

      if (response.success) {
        const { user, accessToken } = response.data;

        console.log('✅ Login successful, storing data:', { user, accessToken });

        // Store in localStorage
        localStorage.setItem('authToken', accessToken);
        localStorage.setItem('user', JSON.stringify(user));

        dispatch({ type: 'AUTH_SUCCESS', payload: { user, token: accessToken } });
      } else {
        console.log('❌ Login failed:', response.message);
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.log('💥 Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const register = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    cpf: string;
    birthDate: string;
    address: string;
    addressNumber: string;
    cep: string;
    bank: string;
    agency: string;
    account: string;
    pixKey: string;
    pixKeyType: string;
    pixOwnerName: string;
    pixCopyPaste: string;
    pixQrCode: string;
    btcAddress?: string;
    btcQrCode?: string;
    usdtAddress?: string;
    usdtQrCode?: string;
    avatar?: string;
  }) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authAPI.register(data);

      if (response.success) {
        const { user, accessToken } = response.data;

        // Store in localStorage
        localStorage.setItem('authToken', accessToken);
        localStorage.setItem('user', JSON.stringify(user));

        dispatch({ type: 'AUTH_SUCCESS', payload: { user, token: accessToken } });
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    dispatch({ type: 'AUTH_LOGOUT' });
  };

  const verifyEmail = async (code: string) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authAPI.verifyEmail(code);

      if (response.success) {
        // Refresh profile to get updated verification status
        await refreshProfile();
      } else {
        throw new Error(response.message || 'Email verification failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Email verification failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const verifyPhone = async (code: string) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authAPI.verifyPhone(code);

      if (response.success) {
        // Refresh profile to get updated verification status
        await refreshProfile();
      } else {
        throw new Error(response.message || 'Phone verification failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Phone verification failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const resendEmailVerification = async () => {
    try {
      const response = await authAPI.resendEmailVerification();
      if (!response.success) {
        throw new Error(response.message || 'Failed to resend email verification');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to resend email verification';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const resendPhoneVerification = async () => {
    try {
      const response = await authAPI.resendPhoneVerification();
      if (!response.success) {
        throw new Error(response.message || 'Failed to resend phone verification');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to resend phone verification';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const refreshProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.success) {
        dispatch({ type: 'UPDATE_USER', payload: response.data });
        localStorage.setItem('user', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    verifyEmail,
    verifyPhone,
    resendEmailVerification,
    resendPhoneVerification,
    refreshProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
