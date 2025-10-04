export enum DonationStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PENDING_CONFIRMATION = 'PENDING_CONFIRMATION',
  CONFIRMED = 'CONFIRMED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED'
}

export enum DonationType {
  PULL = 'PULL',
  CASCADE_N1 = 'CASCADE_N1',
  UPGRADE_N2 = 'UPGRADE_N2',
  REINJECTION_N2 = 'REINJECTION_N2',
  UPGRADE_N3 = 'UPGRADE_N3',
  REINFORCEMENT_N3 = 'REINFORCEMENT_N3',
  ADM_N3 = 'ADM_N3',
  FINAL_PAYMENT_N3 = 'FINAL_PAYMENT_N3'
}

export interface Donation {
  id: string;
  amount: number;
  type: DonationType;
  status: DonationStatus;
  createdAt: string;
  deadline?: string;
  completedAt?: string;
  donor?: UserPublicProfile;
  receiver?: UserPublicProfile;
  // Report fields
  is_reported?: boolean;
  report_reason?: string;
  report_additional_info?: string;
  reported_at?: string;
  report_resolved?: boolean;
  report_resolution?: ReportResolutionType | null;
  report_resolution_message?: string | null;
  report_resolved_at?: string | null;
}

export interface UserPublicProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  pixKey?: string;
  // Extended user information from backend
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  role?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
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
  adminApprovedBy?: string | null;
}

export interface DonationHistoryItem extends Donation {
  role: 'DONOR' | 'RECEIVER';
}

export interface DonationStats {
  totalDonated: number;
  totalReceived: number;
  pendingToSend: number;
  pendingToReceive: number;
  queuePosition?: number;
  nextMonthlyContribution?: string | null;
}

export interface DonationHistory {
  data: DonationHistoryItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface CreateDonationRequest {
  recipientId: string;
  amount: number;
  type: DonationType;
}

export interface SendComprovanteRequest {
  donationId: string;
  comprovanteBase64: string;
}

export interface ConfirmDonationRequest {
  donationId: string;
}

// New types for level system
export interface LevelProgress {
  level: number;
  donations_received: number;
  donations_required: number;
  total_received: number;
  progress_percentage: number;
  level_completed: boolean;
  level_completed_at: string | null;
}

export interface UpgradeRequirements {
  upgrade_amount?: number;
  cascade_amount?: number;
  reinjection_amount?: number;
  total: number;
  description: string;
}

export interface UpgradeAvailable {
  can_upgrade: boolean;
  from_level: number;
  to_level: number | null;
  requirements: UpgradeRequirements;
  user_balance: number;
  can_afford: boolean;
}

export interface ConfirmDonationResponse {
  message: string;
  level_completed?: boolean;
  completed_level?: number;
  upgrade_available?: UpgradeAvailable;
}

export interface AcceptUpgradeRequest {
  from_level: number;
  to_level: number;
}

export interface AcceptUpgradeResponse {
  message: string;
  new_level: number;
  donations_created: Array<{
    type: string;
    level: number;
    amount: number;
    position?: number;
  }>;
}

export interface ComprovanteUrlResponse {
  comprovanteUrl: string;
}

export interface DonationReportRequest {
  reason: string;
  additionalInfo?: string;
}

export interface DonationReportResponse {
  message: string;
  donationId: string;
  reportedAt: string;
}

// Tipos de resolução conforme documentação
export enum ReportResolutionType {
  RESOLVED = 'RESOLVED',
  INVESTIGATING = 'INVESTIGATING',
  NEEDS_MORE_INFO = 'NEEDS_MORE_INFO',
  REJECTED = 'REJECTED'
}

// Estrutura atualizada conforme API de admin
export interface DonationReport {
  id: string;
  amount: number;
  type: DonationType;
  status: DonationStatus;
  is_reported: boolean;
  report_reason?: string;
  report_additional_info?: string;
  reported_at?: string;
  report_resolved: boolean;
  report_resolution?: ReportResolutionType | null;
  report_admin_notes?: string | null;
  report_resolved_at?: string | null;
  donor: UserPublicProfile;
  receiver: UserPublicProfile;
  created_at: string;
  deadline?: string;
  notes?: string;
}

// Resposta da API de resolução de reports
export interface ReportResolutionRequest {
  resolution: ReportResolutionType;
  resolution_message: string;
  admin_notes?: string;
}

export interface ReportResolutionResponse {
  message: string;
  donationId: string;
  resolution: ReportResolutionType;
  resolvedAt: string;
}
