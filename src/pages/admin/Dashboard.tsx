import { useState, useEffect } from 'react';
import { authAPI, donationAPI } from '../../lib/api';
import { donationsService } from '../../services/donations.service';
import { Users, BarChart3, DollarSign, TrendingUp, Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { UserRole } from '../../types/user';

interface UserStats {
  totalUsers: number;
}

interface LevelStats {
  level: number;
  totalUsers: number;
  activeUsers: number;
  completedUsers: number;
  averageProgress: number;
  totalDonationsReceived: number;
  totalAmountReceived: number;
}

interface MonthlyPullResult {
  createdCount: number;
  skippedExisting: number;
  receiversProcessed: number;
}

export default function AdminDashboard() {
  const [userStats, setUserStats] = useState<UserStats>({ totalUsers: 0 });
  const [levelStats, setLevelStats] = useState<LevelStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingPull, setGeneratingPull] = useState(false);
  const [pullResult, setPullResult] = useState<MonthlyPullResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllStats();
  }, []);

  const fetchAllStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user stats
      const users = await authAPI.getUsers();
      const regularUsers = users.filter(user => user.role !== UserRole.ADMIN);
      setUserStats({ totalUsers: regularUsers.length || 0 });

      // Fetch level stats for all levels
      const levels = [1, 2, 3];
        const levelStatsPromises = levels.map(level => donationsService.getLevelStats(level));
      const levelStatsData = await Promise.all(levelStatsPromises);
      setLevelStats(levelStatsData);

    } catch (error: any) {
      console.error('Error fetching stats:', error);
      setError(error.message || 'Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMonthlyPull = async () => {
    try {
      setGeneratingPull(true);
      setError(null);
      setPullResult(null);

        const result = await donationsService.generateMonthlyPull();
      setPullResult(result);
      
      // Refresh stats after generating pull
      await fetchAllStats();
    } catch (error: any) {
      console.error('Error generating monthly pull:', error);
      setError(error.message || 'Erro ao gerar PULL mensal');
    } finally {
      setGeneratingPull(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-4 p-4">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 text-sm">Visão geral do sistema</p>
      </div>

      {/* Monthly Pull Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-md p-6 mb-4 mx-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Gestão de Doações Mensais</h2>
            <p className="text-blue-100">Gere doações mensais para todos os níveis do sistema</p>
          </div>
          <button
            onClick={handleGenerateMonthlyPull}
            disabled={generatingPull}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {generatingPull ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                Gerando...
              </>
            ) : (
              <>
                <Calendar className="h-5 w-5 mr-2" />
                Gerar PULL Mensal
              </>
            )}
          </button>
        </div>
      </div>

      {/* Pull Result */}
      {pullResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 mx-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <div>
              <h3 className="font-semibold text-green-800">PULL Mensal Gerado com Sucesso!</h3>
              <p className="text-green-700">
                Ciclo de doações iniciado com sucesso!
              </p>
              <div className="mt-2 text-sm text-green-600">
                <div>✓ {pullResult.createdCount} doações criadas</div>
                <div>✓ {pullResult.receiversProcessed} receptores processados</div>
                <div>• {pullResult.skippedExisting} já existentes (ignoradas)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 mx-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 px-4">
        {/* Total Users Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de usuários</p>
              <div className="flex items-center mt-2">
                {loading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                ) : (
                  <span className="text-3xl font-bold text-gray-900">{userStats.totalUsers}</span>
                )}
              </div>
            </div>
            <div className="p-3 bg-teal-100 rounded-full">
              <Users className="w-8 h-8 text-teal-600" />
            </div>
          </div>
        </div>

        {/* Level 1 Stats */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nível 1</p>
              <div className="flex items-center mt-2">
                {loading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                ) : (
                  <span className="text-3xl font-bold text-gray-900">
                    {levelStats.find(s => s.level === 1)?.completedUsers || 0}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {levelStats.find(s => s.level === 1)?.totalUsers || 0} usuários
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <TrendingUp className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Level 2 Stats */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nível 2</p>
              <div className="flex items-center mt-2">
                {loading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                ) : (
                  <span className="text-3xl font-bold text-gray-900">
                    {levelStats.find(s => s.level === 2)?.completedUsers || 0}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {levelStats.find(s => s.level === 2)?.totalUsers || 0} usuários
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Level 3 Stats */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nível 3</p>
              <div className="flex items-center mt-2">
                {loading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                ) : (
                  <span className="text-3xl font-bold text-gray-900">
                    {levelStats.find(s => s.level === 3)?.completedUsers || 0}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {levelStats.find(s => s.level === 3)?.totalUsers || 0} usuários
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Level Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4 px-4">
        {levelStats.map((level) => (
          <div key={level.level} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Nível {level.level}
              </h3>
              <div className={`p-2 rounded-full ${
                level.level === 1 ? 'bg-yellow-100' :
                level.level === 2 ? 'bg-orange-100' : 'bg-green-100'
              }`}>
                <TrendingUp className={`h-6 w-6 ${
                  level.level === 1 ? 'text-yellow-600' :
                  level.level === 2 ? 'text-orange-600' : 'text-green-600'
                }`} />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total de usuários:</span>
                <span className="font-semibold text-gray-900">{level.totalUsers}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Usuários ativos:</span>
                <span className="font-semibold text-blue-600">{level.activeUsers}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completaram:</span>
                <span className="font-semibold text-green-600">{level.completedUsers}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Progresso médio:</span>
                <span className="font-semibold text-purple-600">{level.averageProgress.toFixed(1)}%</span>
              </div>

              <hr className="border-gray-200" />

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Doações recebidas:</span>
                <span className="font-semibold text-gray-900">{level.totalDonationsReceived}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Valor total:</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(level.totalAmountReceived)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6 mx-4 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Atividade Recente</h3>
        <div className="text-gray-500 text-center py-8 flex-1">
          Nenhuma atividade recente
        </div>
      </div>
    </div>
  );
}