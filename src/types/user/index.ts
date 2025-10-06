export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatar?: string;
  cpf?: string;
  birthDate?: string;
  address?: string;
  addressNumber?: string;
  cep?: string;
  bank?: string;
  agency?: string;
  account?: string;
  pixKey?: string;
  pixKeyType?: string;
  pixOwnerName?: string;
  pixCopyPaste?: string;
  pixQrCode?: string;
  btcAddress?: string;
  btcQrCode?: string;
  usdtAddress?: string;
  usdtQrCode?: string;
  role: UserRole;
  status: UserStatus;
  adminApproved: boolean;
  adminApprovedAt?: string;
  adminApprovedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  ACTIVE_PARTICIPANT = 'ACTIVE_PARTICIPANT',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  APPROVED = 'APPROVED',
}

// DTO for creating users - matches backend CreateUserDto
export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string; // Should be validated with @IsPhoneNumber() in backend
  password: string;
  pixKey?: string;
  cpf?: string;
  birthDate?: string;
  role?: UserRole;
  status?: UserStatus;
  cep?: string;
  address?: string;
  addressNumber?: string;
  bank?: string;
  agency?: string;
  account?: string;
  pixKeyType?: string;
  pixCopyPaste?: string;
  pixQrCode?: string;
  btcAddress?: string;
  btcQrCode?: string;
  usdtAddress?: string;
  usdtQrCode?: string;
  pixOwnerName?: string;
  adminApproved?: boolean;
  adminApprovedAt?: string; // Should be Date in backend entity, string in DTO
  adminApprovedBy?: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  pixKey?: string;
  cpf?: string;
  birthDate?: string;
  role?: UserRole;
  status?: UserStatus;
  cep?: string;
  address?: string;
  addressNumber?: string;
  bank?: string;
  agency?: string;
  account?: string;
  pixKeyType?: string;
  pixCopyPaste?: string;
  pixQrCode?: string;
  btcAddress?: string;
  btcQrCode?: string;
  usdtAddress?: string;
  usdtQrCode?: string;
  pixOwnerName?: string;
  adminApproved?: boolean;
  adminApprovedAt?: string;
  adminApprovedBy?: string;
}
