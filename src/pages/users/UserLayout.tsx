import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Profile from './Profile';

type UserView = 'home' | 'profile';

export default function UserLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get current view from URL path
  const getCurrentView = (): UserView => {
    const path = location.pathname;
    if (path.includes('/profile')) return 'profile';
    return 'home';
  };
  
  const activeView = getCurrentView();

  const menuItems = [
    { id: 'home' as UserView, label: 'Início', icon: User, path: '/home' },
    { id: 'profile' as UserView, label: 'Perfil', icon: User, path: '/profile' },
  ];

  const handleMenuClick = (item: typeof menuItems[0]) => {
    navigate(item.path);
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'home':
        return (
          <div className="ml-64 p-8">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Início</h1>
                <p className="text-gray-600">Bem-vindo ao SkyMoney</p>
              </div>

              {/* Main Content Area - Blank for now */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center py-12">
                  <h2 className="text-xl font-semibold text-gray-600 mb-4">
                    Conteúdo em desenvolvimento
                  </h2>
                  <p className="text-gray-500">
                    Em breve, novas funcionalidades estarão disponíveis aqui.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'profile':
        return <Profile />;
      default:
        return (
          <div className="ml-64 p-8">
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-3xl font-bold text-gray-800">Início</h1>
                <p className="text-gray-600">Bem-vindo ao SkyMoney</p>
              </div>
            </div>
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
            <h2 className="text-xl font-bold text-gray-800">SkyMoney</h2>
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
