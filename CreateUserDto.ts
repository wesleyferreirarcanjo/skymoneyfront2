import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsPhoneNumber,
  MinLength,
  IsBoolean,
} from 'class-validator';
import { UserRole, UserStatus } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsPhoneNumber() // Changed from @IsString() for proper phone validation
  phone: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  pixKey?: string;

  @IsOptional()
  @IsString()
  cpf?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsString()
  cep?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  addressNumber?: string;

  @IsOptional()
  @IsString()
  bank?: string;

  @IsOptional()
  @IsString()
  agency?: string;

  @IsOptional()
  @IsString()
  account?: string;

  @IsOptional()
  @IsString()
  pixKeyType?: string;

  @IsOptional()
  @IsString()
  pixCopyPaste?: string;

  @IsOptional()
  @IsString()
  pixQrCode?: string;

  @IsOptional()
  @IsString()
  btcAddress?: string;

  @IsOptional()
  @IsString()
  btcQrCode?: string;

  @IsOptional()
  @IsString()
  usdtAddress?: string;

  @IsOptional()
  @IsString()
  usdtQrCode?: string;

  @IsOptional()
  @IsString()
  pixOwnerName?: string;

  @IsOptional()
  @IsBoolean()
  adminApproved?: boolean;

  @IsOptional()
  @IsDateString() // Changed from Date to string for DTO consistency
  adminApprovedAt?: string;

  @IsOptional()
  @IsString()
  adminApprovedBy?: string;
}
