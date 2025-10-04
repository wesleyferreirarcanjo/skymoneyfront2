import React from 'react';
import { useUserProgress } from '../hooks/useUserProgress';
import { useUpgrade } from '../hooks/useUpgrade';
import { LevelProgressCard } from '../components/LevelProgressCard';
import { UpgradeModal } from '../components/UpgradeModal';

/**
 * Exemplo de como usar o sistema de níveis
 * Este componente demonstra a integração completa
 */
export const LevelSystemExample: React.FC = () => {
  const { 
    progress, 
    loading, 
    error, 
    refetch,
    getCurrentLevel,
    getCompletedLevels,
    hasUpgradeAvailable
  } = useUserProgress();

  const { acceptUpgrade, loading: upgradeLoading, error: upgradeError } = useUpgrade();

  const handleUpgradeSuccess = () => {
    console.log('Upgrade realizado com sucesso!');
    refetch(); // Atualizar dados
  };

  if (loading) {
    return <div>Carregando progresso...</div>;
  }

  if (error) {
    return <div className="error">Erro: {error}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Sistema de Níveis</h1>
      
      {/* Exemplo de uso do componente LevelProgressCard */}
      <LevelProgressCard onUpgradeSuccess={handleUpgradeSuccess} />
      
      {/* Informações adicionais usando hooks */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Informações do Progresso</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-3 rounded">
            <h3 className="font-medium text-blue-900">Nível Atual</h3>
            <p className="text-blue-700">
              {getCurrentLevel()?.level || 'Nenhum'}
            </p>
          </div>
          
          <div className="bg-green-50 p-3 rounded">
            <h3 className="font-medium text-green-900">Níveis Completados</h3>
            <p className="text-green-700">
              {getCompletedLevels().length}
            </p>
          </div>
          
          <div className="bg-purple-50 p-3 rounded">
            <h3 className="font-medium text-purple-900">Upgrade Disponível</h3>
            <p className="text-purple-700">
              {hasUpgradeAvailable() ? 'Sim' : 'Não'}
            </p>
          </div>
        </div>
      </div>

      {/* Exemplo de uso direto dos hooks */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Uso Direto dos Hooks</h2>
        
        <div className="space-y-4">
          {progress.map((level) => (
            <div key={level.level} className="border p-3 rounded">
              <div className="flex justify-between items-center">
                <span className="font-medium">Nível {level.level}</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  level.level_completed 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {level.level_completed ? 'Completado' : `${level.progress_percentage}%`}
                </span>
              </div>
              <div className="mt-2">
                <div className="text-sm text-gray-600">
                  {level.donations_received} / {level.donations_required} doações
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${level.progress_percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LevelSystemExample;
