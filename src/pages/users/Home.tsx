import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function UserHome() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">SkyMoney</h1>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Sair
            </button>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <h2 className="text-2xl font-semibold text-blue-800 mb-4">
              Bem-vindo, {user?.firstName || user?.email}!
            </h2>
            <p className="text-blue-700 mb-4">
              Você está logado com sucesso no SkyMoney.
            </p>
            <p className="text-blue-600">
              Em breve, novas funcionalidades estarão disponíveis aqui.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}