import { useState } from 'react';
import { donationsService } from '../services/donations.service';
import type {
  AcceptUpgradeRequest,
  AcceptUpgradeResponse,
} from '../types/donation';

export const useUpgrade = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptUpgrade = async (
    fromLevel: number,
    toLevel: number
  ): Promise<AcceptUpgradeResponse | null> => {
    try {
      setLoading(true);
      setError(null);

      const data: AcceptUpgradeRequest = {
        from_level: fromLevel,
        to_level: toLevel,
      };

      const response = await donationsService.acceptUpgrade(data);
      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao processar upgrade';
      setError(errorMessage);
      console.error('Error accepting upgrade:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    acceptUpgrade,
    loading,
    error,
    clearError,
  };
};
