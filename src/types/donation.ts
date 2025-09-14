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
  comprovanteFile: File;
}

export interface ConfirmDonationRequest {
  donationId: string;
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
