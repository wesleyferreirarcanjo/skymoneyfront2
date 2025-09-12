import { useState, useEffect } from 'react';
import { authAPI } from '../../lib/api';
import { Users, User, Mail, Phone, Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, X, Eye } from 'lucide-react';
import { User as UserType } from '../../types/user';

export default function Users() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [usersPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, allUsers, currentPage]);

  // Mock data generator for testing
  const generateMockUsers = (count: number): UserType[] => {
    const firstNames = [
      'João', 'Maria', 'José', 'Ana', 'Carlos', 'Mariana', 'Pedro', 'Julia', 'Lucas', 'Fernanda',
      'Rafael', 'Camila', 'Diego', 'Larissa', 'Felipe', 'Beatriz', 'Gabriel', 'Isabella', 'Thiago', 'Amanda',
      'Bruno', 'Carolina', 'André', 'Natália', 'Rodrigo', 'Patricia', 'Marcelo', 'Renata', 'Leandro', 'Cristina',
      'Wesley', 'Vanessa', 'Alexandre', 'Monica', 'Ricardo', 'Sandra', 'Eduardo', 'Tatiana', 'Paulo', 'Daniela'
    ];
    
    const lastNames = [
      'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes',
      'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa',
      'Rocha', 'Dias', 'Monteiro', 'Cardoso', 'Reis', 'Araújo', 'Mendes', 'Nunes', 'Moreira', 'Freitas'
    ];
    
    const roles = ['user', 'admin'];
    const statuses = ['active', 'pending', 'suspended', 'blocked'];
    
    return Array.from({ length: count }, (_, index) => {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const role = index < 5 ? 'admin' : roles[Math.floor(Math.random() * roles.length)]; // First 5 are admins
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      return {
        id: `user-${index + 1}-${Math.random().toString(36).substr(2, 9)}`,
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index + 1}@example.com`,
        phone: `+5511${Math.floor(Math.random() * 900000000) + 100000000}`,
        cpf: `${Math.floor(Math.random() * 90000000000) + 10000000000}`,
        birthDate: new Date(1980 + Math.floor(Math.random() * 30), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
        address: `Rua ${Math.floor(Math.random() * 999) + 1}`,
        addressNumber: `${Math.floor(Math.random() * 9999) + 1}`,
        cep: `${Math.floor(Math.random() * 90000000) + 10000000}`,
        bank: 'Banco do Brasil',
        agency: `${Math.floor(Math.random() * 9000) + 1000}`,
        account: `${Math.floor(Math.random() * 900000) + 100000}-${Math.floor(Math.random() * 9) + 1}`,
        pixKey: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index + 1}@example.com`,
        pixKeyType: 'email',
        pixOwnerName: `${firstName} ${lastName}`,
        pixCopyPaste: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index + 1}@example.com`,
        pixQrCode: `data:image/png;base64,mock-qr-code-${index + 1}`,
        btcAddress: `1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa${index}`,
        btcQrCode: `data:image/png;base64,mock-btc-qr-${index + 1}`,
        usdtAddress: `TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE${index}`,
        usdtQrCode: `data:image/png;base64,mock-usdt-qr-${index + 1}`,
        avatar: index % 3 === 0 ? `https://i.pravatar.cc/150?img=${index + 1}` : undefined,
        role: role as 'user' | 'admin' | 'USER' | 'ADMIN',
        emailVerified: Math.random() > 0.2, // 80% verified
        phoneVerified: Math.random() > 0.3, // 70% verified
        adminApproved: role === 'admin' || Math.random() > 0.4, // Admins always approved, 60% of users approved
        status: status as 'pending' | 'active' | 'suspended' | 'blocked',
        createdAt: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
        updatedAt: new Date().toISOString()
      };
    });
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Generate 1000 mock users only once
      const mockUsers = generateMockUsers(1000);
      setAllUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!allUsers.length) return;

    let filteredUsers = allUsers;

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filteredUsers = allUsers.filter(user => 
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.phone.includes(searchTerm)
      );
    }

    // Apply pagination to filtered results
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    setUsers(paginatedUsers);
    setTotalUsers(filteredUsers.length);
    setTotalPages(Math.ceil(filteredUsers.length / usersPerPage));
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
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

  const handleViewProfile = (userId: string) => {
    // TODO: Implement view profile functionality
    console.log('Viewing profile:', userId);
    // Could open a modal or navigate to profile page
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  return (
    <div className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Usuários</h1>
            <p className="text-gray-600">Gerenciar todos os usuários do sistema</p>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="p-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Buscar por nome, email ou telefone..."
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                {searchTerm && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      onClick={clearSearch}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Users Grid */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Lista de Usuários
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {searchTerm ? (
                      totalUsers > 0 
                        ? `${totalUsers} resultado${totalUsers !== 1 ? 's' : ''} encontrado${totalUsers !== 1 ? 's' : ''} para "${searchTerm}" - Mostrando ${((currentPage - 1) * usersPerPage) + 1} a ${Math.min(currentPage * usersPerPage, totalUsers)}`
                        : `Nenhum resultado encontrado para "${searchTerm}"`
                    ) : (
                      totalUsers > 0 
                        ? `Mostrando ${((currentPage - 1) * usersPerPage) + 1} a ${Math.min(currentPage * usersPerPage, totalUsers)} de ${totalUsers} usuários`
                        : 'Nenhum usuário para exibir'
                    )}
                  </p>
                </div>
                {totalPages > 0 && (
                  <div className="text-sm text-gray-600">
                    Página {currentPage} de {totalPages}
                  </div>
                )}
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
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm 
                        ? `Não foram encontrados usuários para "${searchTerm}". Tente uma busca diferente.`
                        : 'Não há usuários cadastrados no sistema.'
                      }
                    </p>
                    {searchTerm && (
                      <button
                        onClick={clearSearch}
                        className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                      >
                        Limpar busca
                      </button>
                    )}
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
                              <button
                                onClick={() => handleViewProfile(userData.id)}
                                className="flex items-center px-3 py-1 text-xs font-medium rounded-md bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors"
                                title="Ver perfil completo do usuário"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                Ver Perfil
                              </button>
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {/* Go to First Page */}
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Primeira página"
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </button>
                    
                    {/* Previous Page */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Anterior
                    </button>
                    
                    {/* Page Numbers */}
                    <div className="flex space-x-1">
                      {getPageNumbers().map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            page === currentPage
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    
                    {/* Next Page */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Próximo
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                    
                    {/* Go to Last Page */}
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Última página"
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="text-sm text-gray-700">
                    {usersPerPage} usuários por página
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
