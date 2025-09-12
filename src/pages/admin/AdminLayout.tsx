import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Users as UsersIcon, BarChart3, Settings, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminDashboard from './Dashboard';
import Users from './Users';

type AdminView = 'dashboard' | 'users' | 'settings';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get current view from URL path
  const getCurrentView = (): AdminView => {
    const path = location.pathname;
    if (path.includes('/users')) return 'users';
    if (path.includes('/settings')) return 'settings';
    return 'dashboard';
  };
  
  const activeView = getCurrentView();

  const menuItems = [
    { id: 'dashboard' as AdminView, label: 'Dashboard', icon: BarChart3, path: '/dashboard' },
    { id: 'users' as AdminView, label: 'Usuários', icon: UsersIcon, path: '/dashboard/users' },
    { id: 'settings' as AdminView, label: 'Configurações', icon: Settings, path: '/dashboard/settings' },
  ];

  const handleMenuClick = (item: typeof menuItems[0]) => {
    navigate(item.path);
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'users':
        return <Users />;
      case 'settings':
        return (
          <div className="min-h-screen bg-gray-100">
            <div className="ml-64 p-8">
              <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h1 className="text-3xl font-bold text-gray-800 mb-4">Configurações</h1>
                  <p className="text-gray-600">Configurações do sistema em desenvolvimento...</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <AdminDashboard />;
    }
  };

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
                    onClick={() => handleMenuClick(item)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      activeView === item.id
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
      {renderActiveView()}
    </div>
  );
}
