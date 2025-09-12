export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
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
  role: 'user' | 'admin';
  emailVerified: boolean;
  phoneVerified: boolean;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BLOCKED = 'blocked'
}

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

export interface RegisterRequest {
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
}
