import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/admin/Dashboard';
import UserHome from './pages/users/Home';
import { User } from './types/user';

// Utility function to check if user is admin
const isUserAdmin = (user: User | null): boolean => {
  if (!user) return false;
  return user.role?.toLowerCase() === 'admin' || user.email === 'admin@skymoney.com';
};


function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-skymoney-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isUserAdmin(user)) {
    console.log('❌ User is not admin, redirecting to home');
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}

function UserRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-skymoney-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isUserAdmin(user)) {
    console.log('❌ User is admin, redirecting to admin dashboard');
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
}

function RoleBasedRedirect() {
  const { user, isLoading } = useAuth();

  // Debug logging
  console.log('🔍 RoleBasedRedirect - User:', user);
  console.log('🔍 RoleBasedRedirect - User role:', user?.role);
  console.log('🔍 RoleBasedRedirect - User role lowercase:', user?.role?.toLowerCase());
  console.log('🔍 RoleBasedRedirect - Is admin?', user?.role?.toLowerCase() === 'admin');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-skymoney-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('❌ No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (isUserAdmin(user)) {
    console.log('✅ User is admin, redirecting to admin dashboard');
    return <Navigate to="/admin/dashboard" replace />;
  }

  console.log('➡️ User is regular user, redirecting to home');
  return <Navigate to="/home" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* User Routes */}
          <Route
            path="/home"
            element={
              <UserRoute>
                <UserHome />
              </UserRoute>
            }
          />



          {/* Root redirect */}
          <Route path="/" element={<RoleBasedRedirect />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
