import { useAuth } from '../../contexts/AuthContext';
import { Users as UsersIcon, BarChart3, Settings, LogOut, Clock, DollarSign, Flag } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminDashboard from './Dashboard';
import Users from './Users';
import AdminDonations from './AdminDonations';
import AdminReports from './AdminReports';
import Queue from './Queue';

type AdminView = 'dashboard' | 'users' | 'donations' | 'reports' | 'queue' | 'settings';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get current view from URL path
  const getCurrentView = (): AdminView => {
    const path = location.pathname;
    if (path.includes('/admin/users')) return 'users';
    if (path.includes('/admin/donations')) return 'donations';
    if (path.includes('/admin/reports')) return 'reports';
    if (path.includes('/admin/queue')) return 'queue';
    if (path.includes('/admin/settings')) return 'settings';
    return 'dashboard';
  };
  
  const activeView = getCurrentView();

  const menuItems = [
    { id: 'dashboard' as AdminView, label: 'Dashboard', icon: BarChart3, path: '/admin/dashboard' },
    { id: 'users' as AdminView, label: 'Usuários', icon: UsersIcon, path: '/admin/users' },
    { id: 'donations' as AdminView, label: 'Doações', icon: DollarSign, path: '/admin/donations' },
    { id: 'reports' as AdminView, label: 'Reports', icon: Flag, path: '/admin/reports' },
    { id: 'queue' as AdminView, label: 'Fila', icon: Clock, path: '/admin/queue' },
    { id: 'settings' as AdminView, label: 'Configurações', icon: Settings, path: '/admin/settings' },
  ];

  const handleMenuClick = (item: typeof menuItems[0]) => {
    navigate(item.path);
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div className="ml-64 h-screen bg-gray-100 flex flex-col">
            <AdminDashboard />
          </div>
        );
      case 'users':
        return (
          <div className="ml-64 h-screen bg-gray-100 flex flex-col">
            <Users />
          </div>
        );
      case 'donations':
        return (
          <div className="ml-64 h-screen bg-gray-100 flex flex-col">
            <AdminDonations />
          </div>
        );
      case 'reports':
        return (
          <div className="ml-64 h-screen bg-gray-100 flex flex-col">
            <AdminReports />
          </div>
        );
      case 'queue':
        return (
          <div className="ml-64 h-screen bg-gray-100 flex flex-col">
            <Queue />
          </div>
        );
      case 'settings':
        return (
          <div className="ml-64 h-screen bg-gray-100 flex flex-col">
            <div className="flex flex-col h-full">
              <div className="mb-4 p-4">
                <h1 className="text-2xl font-bold text-gray-800">Configurações</h1>
                <p className="text-gray-600 text-sm">Configurações do sistema em desenvolvimento...</p>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="ml-64 h-screen bg-gray-100 flex flex-col">
            <AdminDashboard />
          </div>
        );
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
