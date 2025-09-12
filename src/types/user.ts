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
  role: 'user' | 'admin' | 'USER' | 'ADMIN';
  emailVerified: boolean;
  phoneVerified: boolean;
  adminApproved: boolean;
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

// Queue Types
export interface QueueEntry {
  id: string;
  position: number;
  donation_number: number;
  is_receiver: boolean;
  passed_user_ids: string[];
  user_id: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateQueueEntryRequest {
  position: number;
  donation_number: number;
  user_id: string;
  is_receiver: boolean;
  passed_user_ids: string[];
}

export interface UpdateQueueEntryRequest {
  position?: number;
  donation_number?: number;
  is_receiver?: boolean;
  passed_user_ids?: string[];
}

export interface ReorderQueueRequest {
  id: string;
  position: number;
}