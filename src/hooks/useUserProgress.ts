import { useState, useEffect, useCallback } from 'react';
import { donationsService } from '../services/donations.service';
import type { LevelProgress } from '../types/donation';

export const useUserProgress = () => {
  const [progress, setProgress] = useState<LevelProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await donationsService.getMyLevelProgress();
      setProgress(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar progresso');
      console.error('Error fetching progress:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Helper para pegar progresso de um nível específico
  const getLevelProgress = useCallback(
    (level: number): LevelProgress | undefined => {
      return progress.find((p) => p.level === level);
    },
    [progress]
  );

  // Helper para verificar se pode fazer upgrade
  const canUpgradeFromLevel = useCallback(
    (level: number): boolean => {
      const levelProgress = getLevelProgress(level);
      return levelProgress?.level_completed ?? false;
    },
    [getLevelProgress]
  );

  // Helper para encontrar o nível atual (primeiro não completado)
  const getCurrentLevel = useCallback((): LevelProgress | undefined => {
    return progress.find((p) => !p.level_completed);
  }, [progress]);

  // Helper para encontrar níveis completados
  const getCompletedLevels = useCallback((): LevelProgress[] => {
    return progress.filter((p) => p.level_completed);
  }, [progress]);

  // Helper para verificar se há upgrade disponível
  const hasUpgradeAvailable = useCallback((): boolean => {
    const completedLevels = getCompletedLevels();
    if (completedLevels.length === 0) return false;
    
    // Verifica se há um nível completado mas o próximo nível NÃO existe ainda
    // Se o próximo nível existe, significa que o upgrade já foi aceito
    for (const completed of completedLevels) {
      const nextLevel = getLevelProgress(completed.level + 1);
      if (!nextLevel) {
        return true;
      }
    }
    
    return false;
  }, [getCompletedLevels, getLevelProgress]);

  return {
    progress,
    loading,
    error,
    refetch: fetchProgress,
    getLevelProgress,
    canUpgradeFromLevel,
    getCurrentLevel,
    getCompletedLevels,
    hasUpgradeAvailable,
  };
};
