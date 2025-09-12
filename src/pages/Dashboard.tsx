import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from './admin/Dashboard';
import UserHome from './users/Home';

export default function Dashboard() {
  const { user } = useAuth();

  // Route based on user role
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  return <UserHome />;
}
