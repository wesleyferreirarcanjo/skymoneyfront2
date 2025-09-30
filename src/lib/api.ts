import { AuthResponse, LoginRequest } from '../types/auth';
import { RegisterRequest } from '../types/user';
import { QueueEntry, CreateQueueEntryRequest, UpdateQueueEntryRequest, ReorderQueueRequest } from '../types/queue';
import {
  Donation,
  DonationStats,
  DonationHistory,
  SendComprovanteRequest,
  ConfirmDonationRequest,
  ComprovanteUrlResponse,
  DonationReportRequest,
  DonationReportResponse,
  DonationReport,
  ReportResolutionRequest,
  ReportResolutionResponse
} from '../types/donation';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';


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
      // Try to get error details from response body
      let errorDetails = '';
      try {
        const errorBody = await response.json();
        errorDetails = errorBody.message || errorBody.error || JSON.stringify(errorBody);
      } catch (e) {
        errorDetails = response.statusText;
      }
      
      // Create more specific error messages for authentication issues
      if (response.status === 401) {
        throw new Error(`401: Unauthorized - Token may be expired or invalid`);
      } else if (response.status === 403) {
        throw new Error(`403: Forbidden - Access denied`);
      } else if (response.status === 400) {
        throw new Error(`400: Bad Request - ${errorDetails}`);
      } else {
        throw new Error(`HTTP ${response.status}: ${errorDetails}`);
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
      throw error;
    }
  },

  getProfile: async (): Promise<any> => {
    try {
      const result = await makeAuthenticatedRequest('/users/profile');
      return result;
    } catch (error: any) {
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
      throw error;
    }
  },

  resendEmailVerification: async (): Promise<AuthResponse> => {
    try {
      return await makeAuthenticatedRequest('/auth/resend-email-verification', {
        method: 'POST',
      });
    } catch (error) {
      throw error;
    }
  },

  resendPhoneVerification: async (): Promise<AuthResponse> => {
    try {
      return await makeAuthenticatedRequest('/auth/resend-phone-verification', {
        method: 'POST',
      });
    } catch (error) {
      throw error;
    }
  },

  getUsers: async (): Promise<any[]> => {
    try {
      const result = await makeAuthenticatedRequest('/users');
      return result;
    } catch (error: any) {
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
      throw error;
    }
  },
};

// Reports list response
export interface ReportsListResponse {
  data: DonationReport[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface ReportsStats {
  // Status breakdown (optional if backend doesn't return)
  pendingReports?: number;
  investigatingReports?: number;
  resolvedReports?: number;
  dismissedReports?: number;

  // Aggregate fields from backend stats endpoint
  totalReports?: number;
  totalAmountReported?: number;
  reportsThisWeek?: number;
  reportsThisMonth?: number;
  averageReportAmount?: number;
}

export const donationAPI = {
  // Get donations stats
  getDonationStats: async (): Promise<DonationStats> => {
    try {
      const result = await makeAuthenticatedRequest('/donations/stats');
      return result;
    } catch (error: any) {
      throw error;
    }
  },

  // Get donations to send (A Fazer)
  getDonationsToSend: async (): Promise<Donation[]> => {
    try {
      const result = await makeAuthenticatedRequest('/donations/to-send');
      return result;
    } catch (error: any) {
      throw error;
    }
  },

  // Get donations to receive (A Receber)
  getDonationsToReceive: async (): Promise<Donation[]> => {
    try {
      const result = await makeAuthenticatedRequest('/donations/to-receive');
      return result;
    } catch (error: any) {
      throw error;
    }
  },

  // Get donation history
  getDonationHistory: async (page: number = 1, limit: number = 20): Promise<DonationHistory> => {
    try {
      const result = await makeAuthenticatedRequest(`/donations/history?page=${page}&limit=${limit}`);
      return result;
    } catch (error: any) {
      throw error;
    }
  },

  // Send comprovante for donation
  sendComprovante: async (data: SendComprovanteRequest): Promise<{ message: string }> => {
    try {
      const result = await makeAuthenticatedRequest(`/donations/${data.donationId}/comprovante`, {
        method: 'POST',
        body: JSON.stringify({
          comprovanteBase64: data.comprovanteBase64
        }),
      });
      return result;
    } catch (error: any) {
      throw error;
    }
  },

  // Confirm donation receipt
  confirmDonation: async (data: ConfirmDonationRequest): Promise<{ message: string }> => {
    console.log('🚀 API: confirmDonation called with donationId:', data.donationId);
    try {
      const result = await makeAuthenticatedRequest(`/donations/${data.donationId}/confirm`, {
        method: 'PATCH',
      });
      console.log('✅ API: confirmDonation successful, result:', result);
      return result;
    } catch (error: any) {
      console.error('❌ API: confirmDonation failed:', error);
      throw error;
    }
  },

  // Get donation comprovante URL
  getComprovanteUrl: async (donationId: string): Promise<ComprovanteUrlResponse> => {
    try {
      const result = await makeAuthenticatedRequest(`/donations/${donationId}/comprovante`);
      return result;
    } catch (error: any) {
      throw error;
    }
  },

  // Report donation not received
  reportDonation: async (donationId: string, data: DonationReportRequest): Promise<DonationReportResponse> => {
    try {
      const result = await makeAuthenticatedRequest(`/donations/${donationId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return result;
    } catch (error: any) {
      throw error;
    }
  },

  // Admin endpoints
  getAllDonations: async (
    page: number = 1,
    limit: number = 20,
    status?: string,
    searchParams?: {
      donorId?: string;
      receiverId?: string;
      id?: string;
      dateFrom?: string;
      dateTo?: string;
      minAmount?: number;
      maxAmount?: number;
      type?: string;
    }
  ): Promise<{
    data: Donation[];
    pagination: { currentPage: number; totalPages: number; totalItems: number };
    stats?: any;
  }> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status }),
        ...(searchParams?.donorId && { donorId: searchParams.donorId }),
        ...(searchParams?.receiverId && { receiverId: searchParams.receiverId }),
        ...(searchParams?.id && { id: searchParams.id }),
        ...(searchParams?.dateFrom && { dateFrom: searchParams.dateFrom }),
        ...(searchParams?.dateTo && { dateTo: searchParams.dateTo }),
        ...(searchParams?.minAmount && { minAmount: searchParams.minAmount.toString() }),
        ...(searchParams?.maxAmount && { maxAmount: searchParams.maxAmount.toString() }),
        ...(searchParams?.type && { type: searchParams.type })
      });
      const result = await makeAuthenticatedRequest(`/admin/donations/list?${params}`);
      return result;
    } catch (error: any) {
      throw error;
    }
  },

  // Get donation details by ID
  getDonationDetails: async (donationId: string): Promise<Donation> => {
    try {
      const result = await makeAuthenticatedRequest(`/admin/donations/${donationId}`);
      return result;
    } catch (error: any) {
      throw error;
    }
  },

  // Deprecated by list.stats but kept for backward compatibility
  getDonationsStats: async (): Promise<{
    totalDonations: number;
    pendingPayment: number;
    pendingConfirmation: number;
    confirmed: number;
    expired: number;
    cancelled: number;
    totalAmount: number;
  }> => {
    try {
      const result = await makeAuthenticatedRequest('/admin/donations/stats');
      return result;
    } catch (error: any) {
      throw error;
    }
  },

  // Admin reports endpoints
  getReports: async (page: number = 1, limit: number = 20, filters?: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    reporterId?: string;
    donationId?: string;
    minAmount?: number;
    maxAmount?: number;
    type?: string;
  }): Promise<ReportsListResponse> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters?.dateTo && { dateTo: filters.dateTo }),
        ...(filters?.reporterId && { reporterId: filters.reporterId }),
        ...(filters?.donationId && { donationId: filters.donationId }),
        ...(filters?.minAmount && { minAmount: filters.minAmount.toString() }),
        ...(filters?.maxAmount && { maxAmount: filters.maxAmount.toString() }),
        ...(filters?.type && { type: filters.type })
      });

      const result = await makeAuthenticatedRequest(`/admin/donations/reports?${params}`);
      return result;
    } catch (error: any) {
      throw error;
    }
  },



  getReportDetails: async (reportId: string): Promise<DonationReport> => {
    try {
      const result = await makeAuthenticatedRequest(`/admin/donations/reports/${reportId}`);
      return result;
    } catch (error: any) {
      throw error;
    }
  },

  getReportsStats: async (filters?: {
    dateFrom?: string;
    dateTo?: string;
    minAmount?: number;
    maxAmount?: number;
    donorId?: string;
    receiverId?: string;
    type?: string;
  }): Promise<ReportsStats> => {
    try {
      // Backend supports GET /admin/donations/reports/stats with optional filters
      const params = new URLSearchParams();
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);
      if (filters?.minAmount) params.append('minAmount', String(filters.minAmount));
      if (filters?.maxAmount) params.append('maxAmount', String(filters.maxAmount));
      if (filters?.donorId) params.append('donorId', filters.donorId);
      if (filters?.receiverId) params.append('receiverId', filters.receiverId);
      if (filters?.type) params.append('type', filters.type);

      const query = params.toString();
      const url = query ? `/admin/donations/reports/stats?${query}` : '/admin/donations/reports/stats';

      const result = await makeAuthenticatedRequest(url);
      return result as ReportsStats;
    } catch (error: any) {
      throw error;
    }
  },

  updateReportStatus: async (reportId: string, status: 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED', notes?: string): Promise<{ message: string }> => {
    try {
      const result = await makeAuthenticatedRequest(`/admin/donations/reports/${reportId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, notes }),
      });
      return result;
    } catch (error: any) {
      throw error;
    }
  },

  resolveReport: async (donationId: string, data: ReportResolutionRequest): Promise<ReportResolutionResponse> => {
    try {
      const result = await makeAuthenticatedRequest(`/admin/donations/reports/${donationId}/resolve`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return result;
    } catch (error: any) {
      throw error;
    }
  },

  // User reports endpoints
  getUserReports: async (page: number = 1, limit: number = 20, resolved?: boolean): Promise<ReportsListResponse> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (resolved !== undefined) {
        params.append('resolved', resolved.toString());
      }

      const result = await makeAuthenticatedRequest(`/donations/reports?${params}`);
      return result;
    } catch (error: any) {
      throw error;
    }
  },

  getUserReportDetails: async (reportId: string): Promise<DonationReport> => {
    try {
      const result = await makeAuthenticatedRequest(`/donations/reports/${reportId}`);
      return result;
    } catch (error: any) {
      throw error;
    }
  },
};

export const queueAPI = {
  // Get all queue entries
  getQueueEntries: async (): Promise<QueueEntry[]> => {
    try {
      const result = await makeAuthenticatedRequest('/queue');
      return result;
    } catch (error: any) {
      throw error;
    }
  },

  // Add user to donation queue
  addToQueue: async (data: CreateQueueEntryRequest): Promise<QueueEntry> => {
    try {
      const result = await makeAuthenticatedRequest('/queue', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return result;
    } catch (error: any) {
      throw error;
    }
  },

  // Update queue entry
  updateQueueEntry: async (queueId: string, data: UpdateQueueEntryRequest): Promise<QueueEntry> => {
    try {
      const result = await makeAuthenticatedRequest(`/queue/${queueId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return result;
    } catch (error: any) {
      throw error;
    }
  },

  // Set specific user as receiver
  setReceiver: async (donationNumber: number, userId: string): Promise<QueueEntry> => {
    try {
      const result = await makeAuthenticatedRequest(`/queue/set-receiver/${donationNumber}/${userId}`, {
        method: 'PATCH',
      });
      return result;
    } catch (error: any) {
      throw error;
    }
  },

  // Move to next receiver
  nextReceiver: async (donationNumber: number): Promise<QueueEntry> => {
    try {
      const result = await makeAuthenticatedRequest(`/queue/next-receiver/${donationNumber}`, {
        method: 'PATCH',
      });
      return result;
    } catch (error: any) {
      throw error;
    }
  },

  // Reorder queue positions
  reorderQueue: async (donationNumber: number, reorderData: ReorderQueueRequest[]): Promise<QueueEntry[]> => {
    try {
      const result = await makeAuthenticatedRequest(`/queue/reorder/${donationNumber}`, {
        method: 'PATCH',
        body: JSON.stringify(reorderData),
      });
      return result;
    } catch (error: any) {
      throw error;
    }
  },

  // Remove queue entry
  removeFromQueue: async (queueId: string): Promise<{ message: string }> => {
    try {
      const result = await makeAuthenticatedRequest(`/queue/${queueId}`, {
        method: 'DELETE',
      });
      return result;
    } catch (error: any) {
      throw error;
    }
  },

  // Swap positions between two users
  swapPositions: async (firstUserId: string, secondUserId: string): Promise<any> => {
    try {
      const result = await makeAuthenticatedRequest('/queue/swap-positions', {
        method: 'PATCH',
        body: JSON.stringify({
          firstUserId,
          secondUserId
        }),
      });
      return result;
    } catch (error: any) {
      throw error;
    }
  },

  // Move user to end of queue
  moveUserToEnd: async (userId: string, donationNumber: number): Promise<any> => {
    try {
      const result = await makeAuthenticatedRequest('/queue/godown/move-user-to-end', {
        method: 'POST',
        body: JSON.stringify({
          user_id: userId,
          donation_number: donationNumber
        }),
      });
      return result;
    } catch (error: any) {
      throw error;
    }
  },
};
