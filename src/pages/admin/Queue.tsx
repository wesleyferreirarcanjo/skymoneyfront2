import { useState, useEffect } from 'react';
import { authAPI } from '../../lib/api';
import { formatDate } from '../../lib/dateUtils';
import { Clock, Users, CheckCircle, XCircle, AlertCircle, Search, X, Eye, Calendar, User, Mail, Phone, MapPin, CreditCard, QrCode, Bitcoin, DollarSign, Upload, Save, Copy, Check, RefreshCw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { User as UserType } from '../../types/user';

export default function Queue() {
  const [queueUsers, setQueueUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [usersPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [allQueueUsers, setAllQueueUsers] = useState<UserType[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [userToVerify, setUserToVerify] = useState<UserType | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [userToReject, setUserToReject] = useState<UserType | null>(null);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchQueueUsers();
  }, []);

  useEffect(() => {
    filterQueueUsers();
  }, [searchTerm, allQueueUsers, currentPage]);

  const fetchQueueUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await authAPI.getUsers();
      // Filter only unverified users (not admin and not adminApproved)
      const queueUsers = (allUsers || []).filter(user => 
        user.role.toLowerCase() !== 'admin' && !user.adminApproved
      );
      setAllQueueUsers(queueUsers);
    } catch (error) {
      console.error('Error fetching queue users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterQueueUsers = () => {
    if (!allQueueUsers.length) return;

    let filteredUsers = allQueueUsers;

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
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

    setQueueUsers(paginatedUsers);
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

  const handleVerifyUser = (userId: string) => {
    const user = allQueueUsers.find(u => u.id === userId);
    if (user) {
      setUserToVerify(user);
      setIsConfirmModalOpen(true);
    }
  };

  const handleRejectUser = (userId: string) => {
    const user = allQueueUsers.find(u => u.id === userId);
    if (user) {
      setUserToReject(user);
      setIsRejectModalOpen(true);
    }
  };

  const confirmVerifyUser = async () => {
    if (!userToVerify) return;

    try {
      setVerifyLoading(true);
      
      // Call the PATCH /users/:id/approve endpoint
      await authAPI.approveUser(userToVerify.id);
      console.log('User approved successfully:', userToVerify.id);
      
      // Reload queue users data
      await fetchQueueUsers();
      
      // Close modal
      setIsConfirmModalOpen(false);
      setUserToVerify(null);
    } catch (error: any) {
      console.error('Error approving user:', error);
      alert(error.message || 'Erro ao aprovar usuário');
    } finally {
      setVerifyLoading(false);
    }
  };

  const confirmRejectUser = async () => {
    if (!userToReject) return;

    try {
      setRejectLoading(true);
      
      // Here you would call a reject user API endpoint
      // For now, we'll just remove from queue by refreshing
      console.log('User rejected:', userToReject.id, 'Reason:', rejectReason);
      
      // Reload queue users data
      await fetchQueueUsers();
      
      // Close modal and reset
      setIsRejectModalOpen(false);
      setUserToReject(null);
      setRejectReason('');
    } catch (error: any) {
      console.error('Error rejecting user:', error);
      alert(error.message || 'Erro ao rejeitar usuário');
    } finally {
      setRejectLoading(false);
    }
  };

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setUserToVerify(null);
  };

  const closeRejectModal = () => {
    setIsRejectModalOpen(false);
    setUserToReject(null);
    setRejectReason('');
  };

  const handleViewProfile = (userId: string) => {
    const user = allQueueUsers.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Fila de Aprovação</h1>
              <p className="text-gray-600">Usuários aguardando aprovação do administrador</p>
            </div>
            <button
              onClick={fetchQueueUsers}
              disabled={loading}
              className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aguardando</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aprovados Hoje</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejeitados Hoje</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
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
            
            {/* Active Filters Display */}
            {searchTerm && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Busca: "{searchTerm}"
                  <button
                    onClick={clearSearch}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Queue Users Grid */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Usuários na Fila
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {searchTerm ? (
                    totalUsers > 0 
                      ? `${totalUsers} resultado${totalUsers !== 1 ? 's' : ''} encontrado${totalUsers !== 1 ? 's' : ''} para "${searchTerm}" - Mostrando ${((currentPage - 1) * usersPerPage) + 1} a ${Math.min(currentPage * usersPerPage, totalUsers)}`
                      : `Nenhum resultado encontrado para "${searchTerm}"`
                  ) : (
                    totalUsers > 0 
                      ? `Mostrando ${((currentPage - 1) * usersPerPage) + 1} a ${Math.min(currentPage * usersPerPage, totalUsers)} de ${totalUsers} usuários`
                      : 'Nenhum usuário na fila'
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
              <p className="mt-2 text-gray-600">Carregando fila...</p>
            </div>
          ) : (
            <div className="p-6">
              {queueUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    {searchTerm ? 'Nenhum usuário encontrado' : 'Fila vazia'}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm 
                      ? `Não foram encontrados usuários para "${searchTerm}". Tente uma busca diferente.`
                      : 'Não há usuários aguardando aprovação no momento.'
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
                  {queueUsers.map((userData) => (
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
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(userData.status)}`}>
                                {userData.status.toUpperCase()}
                              </span>
                              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                <Clock className="h-3 w-3 mr-1" />
                                AGUARDANDO
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

                        {/* Actions */}
                        <div className="flex flex-col items-end space-y-3">
                          {/* Waiting Time */}
                          <div className="flex items-center text-sm text-yellow-600">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            <span className="text-xs">
                              Aguardando aprovação
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
                            <button
                              onClick={() => handleVerifyUser(userData.id)}
                              className="px-3 py-1 text-xs font-medium rounded-md transition-colors bg-green-100 text-green-800 hover:bg-green-200"
                            >
                              Aprovar
                            </button>
                            <button
                              onClick={() => handleRejectUser(userData.id)}
                              className="px-3 py-1 text-xs font-medium rounded-md transition-colors bg-red-100 text-red-800 hover:bg-red-200"
                            >
                              Rejeitar
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

      {/* User Profile Modal - Same as Users.tsx */}
      {isModalOpen && selectedUser && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Perfil do Usuário
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content - Same structure as Users.tsx but simplified for queue view */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User Avatar and Basic Info */}
                <div className="lg:col-span-1">
                  <div className="text-center">
                    {selectedUser.avatar ? (
                      <img
                        src={selectedUser.avatar}
                        alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                        className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center mx-auto mb-4">
                        <User className="h-16 w-16 text-gray-600" />
                      </div>
                    )}
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </h3>
                    
                    <div className="flex justify-center space-x-2 mb-4">
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeColor(selectedUser.status)}`}>
                        {selectedUser.status.toUpperCase()}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        <Clock className="h-3 w-3 mr-1" />
                        AGUARDANDO
                      </span>
                    </div>

                    {/* Verification Status */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-center text-yellow-600">
                        <AlertCircle className="w-3 h-3 mr-2" />
                        <span className="text-sm font-medium">
                          Aguardando aprovação do admin
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Details - Same as Users.tsx */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Informações Pessoais
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Nome Completo</label>
                        <p className="text-sm text-gray-900">{selectedUser.firstName} {selectedUser.lastName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">CPF</label>
                        <p className="text-sm text-gray-900">{selectedUser.cpf}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Data de Nascimento</label>
                        <p className="text-sm text-gray-900">{formatDate(selectedUser.birthDate)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">ID do Usuário</label>
                        <p className="text-sm text-gray-900 font-mono">{selectedUser.id}</p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Mail className="h-5 w-5 mr-2" />
                      Informações de Contato
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="text-sm text-gray-900 flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          {selectedUser.email}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Telefone</label>
                        <p className="text-sm text-gray-900 flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          {selectedUser.phone}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Banking Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Informações Bancárias
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Banco</label>
                        <p className="text-sm text-gray-900">{selectedUser.bank}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Agência</label>
                        <p className="text-sm text-gray-900">{selectedUser.agency}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Conta</label>
                        <p className="text-sm text-gray-900">{selectedUser.account}</p>
                      </div>
                    </div>
                  </div>

                  {/* PIX Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <QrCode className="h-5 w-5 mr-2" />
                      PIX
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Chave PIX</label>
                        <p className="text-sm text-gray-900 font-mono">{selectedUser.pixKey}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Tipo de Chave</label>
                        <p className="text-sm text-gray-900">{selectedUser.pixKeyType}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Nome do Titular</label>
                        <p className="text-sm text-gray-900">{selectedUser.pixOwnerName}</p>
                      </div>
                      {selectedUser.pixQrCode && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">QR Code PIX</label>
                          <div className="mt-2">
                            <img
                              src={`data:image/png;base64,${selectedUser.pixQrCode}`}
                              alt="PIX QR Code"
                              className="border border-gray-300 rounded-lg"
                              style={{ width: '200px', height: '200px' }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Crypto Information */}
                  {(selectedUser.btcAddress || selectedUser.usdtAddress) && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Bitcoin className="h-5 w-5 mr-2" />
                        Criptomoedas
                      </h4>
                      <div className="space-y-6">
                        {selectedUser.btcAddress && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Endereço Bitcoin</label>
                            <p className="text-sm text-gray-900 font-mono break-all mb-2">{selectedUser.btcAddress}</p>
                            {selectedUser.btcQrCode && (
                              <div>
                                <label className="text-sm font-medium text-gray-500">QR Code Bitcoin</label>
                                <div className="mt-2">
                                  <img
                                    src={`data:image/png;base64,${selectedUser.btcQrCode}`}
                                    alt="Bitcoin QR Code"
                                    className="border border-gray-300 rounded-lg"
                                    style={{ width: '200px', height: '200px' }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        {selectedUser.usdtAddress && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Endereço USDT</label>
                            <p className="text-sm text-gray-900 font-mono break-all mb-2">{selectedUser.usdtAddress}</p>
                            {selectedUser.usdtQrCode && (
                              <div>
                                <label className="text-sm font-medium text-gray-500">QR Code USDT</label>
                                <div className="mt-2">
                                  <img
                                    src={`data:image/png;base64,${selectedUser.usdtQrCode}`}
                                    alt="USDT QR Code"
                                    className="border border-gray-300 rounded-lg"
                                    style={{ width: '200px', height: '200px' }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Account Dates */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Datas da Conta
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Criado em</label>
                        <p className="text-sm text-gray-900">{formatDate(selectedUser.createdAt)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Atualizado em</label>
                        <p className="text-sm text-gray-900">{formatDate(selectedUser.updatedAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
              <button
                onClick={() => handleRejectUser(selectedUser.id)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 transition-colors"
              >
                Rejeitar
              </button>
              <button
                onClick={() => handleVerifyUser(selectedUser.id)}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 transition-colors"
              >
                Aprovar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Confirmation Modal */}
      {isConfirmModalOpen && userToVerify && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeConfirmModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Confirmar Aprovação
              </h2>
              <button
                onClick={closeConfirmModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                {userToVerify.avatar ? (
                  <img
                    src={userToVerify.avatar}
                    alt={`${userToVerify.firstName} ${userToVerify.lastName}`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-600" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {userToVerify.firstName} {userToVerify.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">{userToVerify.email}</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Tem certeza que deseja aprovar este usuário? Esta ação permitirá que o usuário tenha acesso completo ao sistema.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeConfirmModal}
                disabled={verifyLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmVerifyUser}
                disabled={verifyLoading}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {verifyLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Aprovando...
                  </>
                ) : (
                  'Confirmar Aprovação'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {isRejectModalOpen && userToReject && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeRejectModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Rejeitar Usuário
              </h2>
              <button
                onClick={closeRejectModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                {userToReject.avatar ? (
                  <img
                    src={userToReject.avatar}
                    alt={`${userToReject.firstName} ${userToReject.lastName}`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-600" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {userToReject.firstName} {userToReject.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">{userToReject.email}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo da rejeição (opcional)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                  placeholder="Descreva o motivo da rejeição..."
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeRejectModal}
                disabled={rejectLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmRejectUser}
                disabled={rejectLoading}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {rejectLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Rejeitando...
                  </>
                ) : (
                  'Confirmar Rejeição'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
