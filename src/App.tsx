import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { AdminLayout } from './pages/admin';
import UserHome from './pages/users/Home';
import Profile from './pages/users/Profile';
import UserLayout from './pages/users/UserLayout';
import { User } from './types/user';

// Utility function to check if user is admin
const isUserAdmin = (user: User | null): boolean => {
  if (!user) return false;
  return user.role?.toLowerCase() === 'admin' || user.email === 'admin@skymoney.com';
};


function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  console.log('🛡️ ===== ADMIN ROUTE CHECK =====');
  console.log('🔍 AdminRoute - Current URL:', window.location.pathname);
  console.log('🔍 AdminRoute - User:', user);
  console.log('🔍 AdminRoute - Is admin:', isUserAdmin(user));
  console.log('🔍 AdminRoute - Is loading:', isLoading);

  if (isLoading) {
    console.log('⏳ AdminRoute: Still loading, showing spinner');
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
    console.log('❌ AdminRoute: No user, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  if (!isUserAdmin(user)) {
    console.log('🚫 AdminRoute: User is NOT admin, redirecting to /home');
    console.log('🛡️ ===== ADMIN ROUTE CHECK END (REDIRECT) =====');
    return <Navigate to="/home" replace />;
  }

  console.log('✅ AdminRoute: User is admin, allowing access to dashboard');
  console.log('🛡️ ===== ADMIN ROUTE CHECK END (ALLOW) =====');
  return <>{children}</>;
}

function UserRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  console.log('🏠 ===== USER ROUTE CHECK =====');
  console.log('🔍 UserRoute - Current URL:', window.location.pathname);
  console.log('🔍 UserRoute - User:', user);
  console.log('🔍 UserRoute - Is admin:', isUserAdmin(user));
  console.log('🔍 UserRoute - Is loading:', isLoading);

  if (isLoading) {
    console.log('⏳ UserRoute: Still loading, showing spinner');
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
    console.log('❌ UserRoute: No user, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  if (isUserAdmin(user)) {
    console.log('🔄 UserRoute: User is admin, redirecting to /admin/dashboard');
    console.log('🏠 ===== USER ROUTE CHECK END (REDIRECT) =====');
    return <Navigate to="/admin/dashboard" replace />;
  }

  console.log('✅ UserRoute: User is regular user, allowing access to home');
  console.log('🏠 ===== USER ROUTE CHECK END (ALLOW) =====');
  return <>{children}</>;
}

function RoleBasedRedirect() {
  const { user, isLoading } = useAuth();

  // Enhanced debug logging with distinct markers
  console.log('🚀 ===== ROLE-BASED REDIRECT START =====');
  console.log('🔍 RoleBasedRedirect - Current URL:', window.location.pathname);
  console.log('🔍 RoleBasedRedirect - User:', user);
  console.log('🔍 RoleBasedRedirect - User role:', user?.role);
  console.log('🔍 RoleBasedRedirect - User role lowercase:', user?.role?.toLowerCase());
  console.log('🔍 RoleBasedRedirect - User email:', user?.email);
  console.log('🔍 RoleBasedRedirect - Is admin check:', isUserAdmin(user));
  console.log('🔍 RoleBasedRedirect - Is loading:', isLoading);

  if (isLoading) {
    console.log('⏳ RoleBasedRedirect: Still loading, showing spinner');
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
    console.log('❌ RoleBasedRedirect: No user found, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  if (isUserAdmin(user)) {
    console.log('🎯 RoleBasedRedirect: ✅ ADMIN USER - Redirecting to /admin/dashboard');
    console.log('🚀 ===== ROLE-BASED REDIRECT END (ADMIN) =====');
    return <Navigate to="/admin/dashboard" replace />;
  }

  console.log('🏠 RoleBasedRedirect: ✅ REGULAR USER - Redirecting to /home');
  console.log('🚀 ===== ROLE-BASED REDIRECT END (USER) =====');
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
                <AdminLayout />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/queue"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <AdminRoute>
                <AdminLayout />
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
          <Route
            path="/profile"
            element={
              <UserRoute>
                <UserLayout />
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
