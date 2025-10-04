import { useState, useEffect } from 'react';
import { LevelProgress, UpgradeAvailable, AcceptUpgradeRequest } from '../types/donation';
import { donationAPI } from '../lib/api';
import { CheckCircle, Clock, Lock, ArrowUp, DollarSign, TrendingUp, Loader2 } from 'lucide-react';
import UpgradeModal from './UpgradeModal';

interface LevelProgressCardProps {
  levelProgress: LevelProgress[];
  onUpgradeSuccess: () => void;
}

export default function LevelProgressCard({ levelProgress, onUpgradeSuccess }: LevelProgressCardProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeInfo, setUpgradeInfo] = useState<UpgradeAvailable | null>(null);
  const [loading, setLoading] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getLevelIcon = (level: number, completed: boolean, inProgress: boolean) => {
    if (completed) {
      return <CheckCircle className="h-6 w-6 text-green-600" />;
    } else if (inProgress) {
      return <Clock className="h-6 w-6 text-yellow-600" />;
    } else {
      return <Lock className="h-6 w-6 text-gray-400" />;
    }
  };

  const getLevelColor = (level: number, completed: boolean, inProgress: boolean) => {
    if (completed) {
      return 'bg-green-50 border-green-200';
    } else if (inProgress) {
      return 'bg-yellow-50 border-yellow-200';
    } else {
      return 'bg-gray-50 border-gray-200';
    }
  };

  const getProgressBarColor = (completed: boolean, inProgress: boolean) => {
    if (completed) {
      return 'bg-green-500';
    } else if (inProgress) {
      return 'bg-yellow-500';
    } else {
      return 'bg-gray-300';
    }
  };

  const checkForPendingUpgrade = async () => {
    // Find completed levels that might have pending upgrades
    const completedLevels = levelProgress.filter(level => level.level_completed);
    
    if (completedLevels.length > 0) {
      // Check if there's a completed level followed by a non-started level
      for (let i = 0; i < completedLevels.length; i++) {
        const completedLevel = completedLevels[i];
        const nextLevel = levelProgress.find(l => l.level === completedLevel.level + 1);
        
        if (nextLevel && nextLevel.donations_received === 0) {
          // This level is completed and the next level hasn't started - check if upgrade is available
          try {
            setLoading(true);
            const progress = await donationAPI.getMyLevelProgress();
            // Check if the user has enough balance and can upgrade
            // For now, we'll assume upgrade is available if level is completed
            // The actual upgrade availability will be checked when user tries to upgrade
            return true;
          } catch (error) {
            console.error('Error checking upgrade availability:', error);
            return false;
          } finally {
            setLoading(false);
          }
        }
      }
    }
    return false;
  };

  const handleUpgradeClick = async (fromLevel: number) => {
    try {
      setLoading(true);
      
      // Get current progress to check upgrade availability
      const progress = await donationAPI.getMyLevelProgress();
      const completedLevel = progress.find(p => p.level === fromLevel && p.level_completed);
      
      if (completedLevel) {
        // Create a mock upgrade info for now
        // In a real scenario, this would come from the backend
        const mockUpgradeInfo: UpgradeAvailable = {
          can_upgrade: true,
          from_level: fromLevel,
          to_level: fromLevel + 1,
          requirements: {
            upgrade_amount: fromLevel === 1 ? 200 : fromLevel === 2 ? 600 : 0,
            cascade_amount: fromLevel === 1 ? 100 : fromLevel === 2 ? 300 : 0,
            total: fromLevel === 1 ? 300 : fromLevel === 2 ? 900 : 0,
            description: `Upgrade para Nível ${fromLevel + 1} + Cascata N${fromLevel}`
          },
          user_balance: completedLevel.total_received,
          can_afford: completedLevel.total_received >= (fromLevel === 1 ? 300 : 900)
        };
        
        setUpgradeInfo(mockUpgradeInfo);
        setShowUpgradeModal(true);
      }
    } catch (error) {
      console.error('Error preparing upgrade:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeSuccess = (newLevel: number) => {
    console.log('🎉 Upgrade successful! New level:', newLevel);
    setShowUpgradeModal(false);
    setUpgradeInfo(null);
    onUpgradeSuccess();
  };

  const closeUpgradeModal = () => {
    setShowUpgradeModal(false);
    setUpgradeInfo(null);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Progresso dos Níveis</h2>
          <div className="flex items-center text-sm text-gray-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            Sistema de Níveis
          </div>
        </div>

        <div className="space-y-4">
          {levelProgress.map((level, index) => {
            const isCompleted = level.level_completed;
            const isInProgress = level.donations_received > 0 && !isCompleted;
            const isLocked = level.donations_received === 0 && !isCompleted && index > 0;
            const hasUpgradeAvailable = isCompleted && index < levelProgress.length - 1 && 
              levelProgress[index + 1]?.donations_received === 0;

            return (
              <div
                key={level.level}
                className={`p-4 rounded-lg border-2 transition-all ${getLevelColor(isCompleted, isInProgress, isLocked)} ${
                  hasUpgradeAvailable ? 'ring-2 ring-blue-200 ring-opacity-50' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    {getLevelIcon(level.level, isCompleted, isInProgress)}
                    <div className="ml-3">
                      <h3 className="font-semibold text-gray-900">
                        Nível {level.level}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {isCompleted ? 'Concluído' : isInProgress ? 'Em progresso' : isLocked ? 'Bloqueado' : 'Disponível'}
                      </p>
                    </div>
                  </div>

                  {hasUpgradeAvailable && (
                    <button
                      onClick={() => handleUpgradeClick(level.level)}
                      disabled={loading}
                      className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors animate-pulse"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <ArrowUp className="h-4 w-4 mr-1" />
                      )}
                      Upgrade Disponível!
                    </button>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>
                      {level.donations_received} / {level.donations_required} doações
                    </span>
                    <span>{level.progress_percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(isCompleted, isInProgress)}`}
                      style={{ width: `${Math.min(level.progress_percentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span>Total recebido: {formatCurrency(level.total_received)}</span>
                  </div>
                  
                  {isCompleted && level.level_completed_at && (
                    <span className="text-green-600 font-medium">
                      Concluído em {new Date(level.level_completed_at).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Como funciona o sistema de níveis?</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Cada nível requer um número específico de doações</li>
            <li>• Ao completar um nível, você pode fazer upgrade para o próximo</li>
            <li>• O upgrade cria doações automaticamente para ajudar outros usuários</li>
            <li>• Quanto maior o nível, mais oportunidades de receber doações</li>
          </ul>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && upgradeInfo && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={closeUpgradeModal}
          upgradeInfo={upgradeInfo}
          onUpgradeSuccess={handleUpgradeSuccess}
        />
      )}
    </>
  );
}
