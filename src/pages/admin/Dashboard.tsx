import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Users, BarChart3, Settings, LogOut } from 'lucide-react';

interface UserStats {
  totalUsers: number;
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [userStats, setUserStats] = useState<UserStats>({ totalUsers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserStats({ totalUsers: data.length || 0 });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, active: true },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">SkyMoney Admin</h2>
            <p className="text-sm text-gray-600">{user?.firstName} {user?.lastName}</p>
          </div>

          {/* Menu */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      item.active
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t">
            <button
              onClick={logout}
              className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600">Visão geral do sistema</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Users Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Participantes</p>
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
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Atividade Recente</h3>
            <div className="text-gray-500 text-center py-8">
              Nenhuma atividade recente
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}