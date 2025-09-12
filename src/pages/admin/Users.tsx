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

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  Lista de Usuários
                </h3>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Carregando usuários...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                        Usuário
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                        Contato
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                        Função
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                        Verificação
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                        Cadastrado
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((userData) => (
                      <tr key={userData.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {userData.avatar ? (
                                <img
                                  className="h-10 w-10 rounded-full"
                                  src={userData.avatar}
                                  alt={`${userData.firstName} ${userData.lastName}`}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <User className="h-6 w-6 text-gray-600" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {userData.firstName} {userData.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {userData.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 text-gray-400 mr-2" />
                              {userData.email}
                            </div>
                            <div className="flex items-center mt-1">
                              <Phone className="h-4 w-4 text-gray-400 mr-2" />
                              {userData.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(userData.role)}`}>
                            {userData.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(userData.status)}`}>
                            {userData.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className={`flex items-center ${userData.role.toLowerCase() === 'admin' || userData.adminApproved ? 'text-green-600' : 'text-red-600'}`}>
                              <div className="w-4 h-4 mr-1 flex items-center justify-center">
                                <div className={`w-2 h-2 rounded-full ${userData.role.toLowerCase() === 'admin' || userData.adminApproved ? 'bg-green-500' : 'bg-red-500'}`}></div>
                              </div>
                              {userData.role.toLowerCase() === 'admin' ? 'Admin (Verificado)' : userData.adminApproved ? 'Aprovado pelo admin' : 'Não aprovado pelo admin'}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                              {formatDate(userData.createdAt)}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-1">
                            {userData.role.toLowerCase() !== 'admin' && (
                              <button
                                onClick={() => handleVerifyUser(userData.id)}
                                className={`px-2 py-1 text-xs font-medium rounded ${
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
                              className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800 hover:bg-gray-200"
                            >
                              Editar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {users.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum usuário encontrado</h3>
                    <p className="mt-1 text-sm text-gray-500">Não há usuários cadastrados no sistema.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
