import { makeAuthenticatedRequest } from '../lib/api';
import type {
  LevelProgress,
  AcceptUpgradeRequest,
  AcceptUpgradeResponse,
  ConfirmDonationResponse
} from '../types/donation';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const donationsService = {
  /**
   * Buscar progresso do usuário em todos os níveis
   */
  async getMyLevelProgress(): Promise<LevelProgress[]> {
    try {
      const result = await makeAuthenticatedRequest('/donations/my-level-progress');
      return result;
    } catch (error: any) {
      console.error('Error fetching level progress:', error);
      throw error;
    }
  },

  /**
   * Aceitar upgrade para próximo nível
   */
  async acceptUpgrade(data: AcceptUpgradeRequest): Promise<AcceptUpgradeResponse> {
    try {
      const result = await makeAuthenticatedRequest('/donations/accept-upgrade', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return result;
    } catch (error: any) {
      console.error('Error accepting upgrade:', error);
      throw error;
    }
  },

  /**
   * Confirmar recebimento de doação
   */
  async confirmDonation(donationId: string): Promise<ConfirmDonationResponse> {
    try {
      const result = await makeAuthenticatedRequest(`/donations/${donationId}/confirm`, {
        method: 'PATCH',
      });
      return result;
    } catch (error: any) {
      console.error('Error confirming donation:', error);
      throw error;
    }
  },

  /**
   * Gerar PULL mensal (Admin)
   */
  async generateMonthlyPull(): Promise<{
    message: string;
    created: number;
    errors: any[];
    breakdown: {
      n1: number;
      n2: number;
      n3: number;
    };
  }> {
    try {
      const result = await makeAuthenticatedRequest('/donations/admin/generate-monthly-pull', {
        method: 'POST',
      });
      return result;
    } catch (error: any) {
      console.error('Error generating monthly pull:', error);
      throw error;
    }
  },

  /**
   * Obter estatísticas de nível (Admin)
   */
  async getLevelStats(level: number): Promise<{
    level: number;
    totalUsers: number;
    activeUsers: number;
    completedUsers: number;
    averageProgress: number;
    totalDonationsReceived: number;
    totalAmountReceived: number;
  }> {
    try {
      const result = await makeAuthenticatedRequest(`/donations/admin/level-stats/${level}`);
      return result;
    } catch (error: any) {
      console.error('Error fetching level stats:', error);
      throw error;
    }
  },
};
