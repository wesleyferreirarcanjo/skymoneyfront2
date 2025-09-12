import { useState, useEffect } from 'react';
import { authAPI } from '../../lib/api';
import { Users, User, Mail, Phone, Calendar } from 'lucide-react';
import { User as UserType } from '../../types/user';

export default function Users() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const allUsers = await authAPI.getUsers();
      setUsers(allUsers || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'user':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-orange-100 text-orange-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleVerifyUser = async (userId: string) => {
    try {
      // TODO: Implement API call to verify/unverify user
      console.log('Verifying user:', userId);
      // await authAPI.verifyUser(userId);
      // Refresh users list after verification
      // fetchUsers();
    } catch (error) {
      console.error('Error verifying user:', error);
    }
  };

  const handleEditUser = (userId: string) => {
    // TODO: Implement edit user functionality
    console.log('Editing user:', userId);
    // Could open a modal or navigate to edit page
  };

  return (
    <div className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Usuários</h1>
            <p className="text-gray-600">Gerenciar todos os usuários do sistema</p>
          </div>

          {/* Users Grid */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  Lista de Usuários ({users.length})
                </h3>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Carregando usuários...</p>
              </div>
            ) : (
              <div className="p-6">
                {users.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum usuário encontrado</h3>
                    <p className="mt-1 text-sm text-gray-500">Não há usuários cadastrados no sistema.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {users.map((userData) => (
                      <div key={userData.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          {/* User Info */}
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="flex-shrink-0">
                              {userData.avatar ? (
                                <img
                                  className="h-12 w-12 rounded-full"
                                  src={userData.avatar}
                                  alt={`${userData.firstName} ${userData.lastName}`}
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                                  <User className="h-6 w-6 text-gray-600" />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                  {userData.firstName} {userData.lastName}
                                </h4>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(userData.role)}`}>
                                  {userData.role.toUpperCase()}
                                </span>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(userData.status)}`}>
                                  {userData.status.toUpperCase()}
                                </span>
                              </div>
                              
                              <div className="space-y-1 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <Mail className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                                  <span className="truncate">{userData.email}</span>
                                </div>
                                <div className="flex items-center">
                                  <Phone className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                                  <span>{userData.phone}</span>
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                                  <span>Cadastrado em {formatDate(userData.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Verification & Actions */}
                          <div className="flex flex-col items-end space-y-3">
                            {/* Verification Status */}
                            <div className={`flex items-center text-sm ${userData.role.toLowerCase() === 'admin' || userData.adminApproved ? 'text-green-600' : 'text-red-600'}`}>
                              <div className="w-2 h-2 rounded-full mr-2 flex-shrink-0">
                                <div className={`w-2 h-2 rounded-full ${userData.role.toLowerCase() === 'admin' || userData.adminApproved ? 'bg-green-500' : 'bg-red-500'}`}></div>
                              </div>
                              <span className="text-xs">
                                {userData.role.toLowerCase() === 'admin' ? 'Admin (Verificado)' : userData.adminApproved ? 'Aprovado pelo admin' : 'Não aprovado pelo admin'}
                              </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-2">
                              {userData.role.toLowerCase() !== 'admin' && (
                                <button
                                  onClick={() => handleVerifyUser(userData.id)}
                                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                                    userData.adminApproved
                                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                      : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                  }`}
                                >
                                  {userData.adminApproved ? 'Desverificar' : 'Verificar'}
                                </button>
                              )}
                              <button
                                onClick={() => handleEditUser(userData.id)}
                                className="px-3 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
                              >
                                Editar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
