import { useState, useEffect } from 'react';
import { authAPI } from '../../lib/api';
import { Users, BarChart3 } from 'lucide-react';

interface UserStats {
  totalUsers: number;
}

export default function AdminDashboard() {
  const [userStats, setUserStats] = useState<UserStats>({ totalUsers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const users = await authAPI.getUsers();
      // Filter out admin users - only count regular users
      const regularUsers = users.filter(user => 
        user.role !== 'admin' && user.role !== 'ADMIN'
      );
      setUserStats({ totalUsers: regularUsers.length || 0 });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-4 p-4">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 text-sm">Visão geral do sistema</p>
      </div>

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

            {/* Additional stats cards can be added here */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
                  <span className="text-3xl font-bold text-gray-900">--</span>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <BarChart3 className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Transações</p>
                  <span className="text-3xl font-bold text-gray-900">--</span>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Receita</p>
                  <span className="text-3xl font-bold text-gray-900">--</span>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <BarChart3 className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>
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