import { useState, useEffect } from 'react';
import { authAPI } from '../../lib/api';
import { Users as UsersIcon, User, Mail, Phone, Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, X, Eye, MapPin, CreditCard, QrCode, Bitcoin, Upload, Save, Copy, Check, MessageCircle } from 'lucide-react';
import { User as UserType, UserRole, UserStatus } from '../../types/user';

// Extended type for editing with optional password field
type EditUserFormData = Partial<UserType> & {
  password?: string;
};

export default function Users() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [usersPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [showUnverifiedOnly, setShowUnverifiedOnly] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [editFormData, setEditFormData] = useState<EditUserFormData>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [userToVerify, setUserToVerify] = useState<UserType | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, allUsers, currentPage, showUnverifiedOnly]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await authAPI.getUsers();
      setAllUsers(allUsers || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!allUsers.length) return;

    let filteredUsers = allUsers;

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

    // Apply unverified filter
    if (showUnverifiedOnly) {
      filteredUsers = filteredUsers.filter(user =>
        user.role !== UserRole.ADMIN && !user.adminApproved
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

  const toggleUnverifiedFilter = () => {
    setShowUnverifiedOnly(!showUnverifiedOnly);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-red-100 text-red-800';
      case UserRole.USER:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case UserStatus.ACTIVE:
      case UserStatus.ACTIVE_PARTICIPANT:
        return 'bg-green-100 text-green-800';
      case UserStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case UserStatus.SUSPENDED:
        return 'bg-orange-100 text-orange-800';
      case UserStatus.APPROVED:
        return 'bg-blue-100 text-blue-800';
      case UserStatus.INACTIVE:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleVerifyUser = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
      setUserToVerify(user);
      setIsConfirmModalOpen(true);
    }
  };

  const confirmVerifyUser = async () => {
    if (!userToVerify) return;

    try {
      setVerifyLoading(true);
      
      // Call the PATCH /users/:id/approve endpoint
      await authAPI.approveUser(userToVerify.id);
      console.log('User approved successfully:', userToVerify.id);
      
      // Reload users data to get the most up-to-date information
      await fetchUsers();
      
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

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setUserToVerify(null);
  };

  const handleEditUser = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
      setEditingUser(user);
      setEditFormData({ ...user });
      setIsEditModalOpen(true);
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
    setEditFormData({});
    setEditErrors({});
  };

  const handleInputChange = (field: keyof EditUserFormData, value: any) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (editErrors[field]) {
      setEditErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleFileUpload = (field: 'avatar' | 'pixQrCode' | 'btcQrCode' | 'usdtQrCode', file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // Remove data:image/png;base64, prefix if present
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      handleInputChange(field, base64);
    };
    reader.readAsDataURL(file);
  };

  const handleCopyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000); // Reset after 2 seconds
    } catch (error) {
      console.error('Failed to copy text: ', error);
    }
  };

  const getInitials = (firstName?: string, lastName?: string): string => {
    const first = firstName?.charAt(0).toUpperCase() || '';
    const last = lastName?.charAt(0).toUpperCase() || '';
    return first + last;
  };

  const getAvatarColor = (firstName?: string, lastName?: string): string => {
    // Generate a consistent color based on the name
    const name = `${firstName}${lastName}`.toLowerCase();
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500',
    ];
    
    // Simple hash function to pick a color consistently
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const isValidBase64Image = (str?: string): boolean => {
    if (!str || str.trim() === '') return false;
    
    // Check if it already has data URI prefix
    if (str.startsWith('data:image/')) return true;
    
    // Check if it looks like base64
    const base64Regex = /^[A-Za-z0-9+/=]+$/;
    return base64Regex.test(str.replace(/\s/g, ''));
  };

  const formatAvatarUrl = (avatar?: string): string | null => {
    if (!avatar || avatar.trim() === '') return null;
    
    // If already has data URI prefix, return as is
    if (avatar.startsWith('data:image/')) return avatar;
    
    // If it's base64, add the data URI prefix (assuming PNG)
    if (isValidBase64Image(avatar)) {
      return `data:image/png;base64,${avatar}`;
    }
    
    // If it's a URL, return as is
    if (avatar.startsWith('http://') || avatar.startsWith('https://')) return avatar;
    
    return null;
  };

  const formatQrCodeImage = (qrCode?: string): string | null => {
    if (!qrCode || qrCode.trim() === '') return null;
    
    // If already has data URI prefix, return as is
    if (qrCode.startsWith('data:image/')) return qrCode;
    
    // If it's base64, add the data URI prefix (assuming PNG)
    if (isValidBase64Image(qrCode)) {
      return `data:image/png;base64,${qrCode}`;
    }
    
    return null;
  };

  const getWhatsAppLink = (phone?: string): string => {
    if (!phone) return '#';
    // Remove all non-numeric characters
    const cleanPhone = phone.replace(/\D/g, '');
    // Add country code if not present (assuming Brazil +55)
    const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const message = encodeURIComponent('Ola eu sou um test');
    return `https://wa.me/${phoneWithCountry}?text=${message}`;
  };


  const handleSaveUser = async () => {
    if (!editingUser) return;

    try {
      setEditLoading(true);
      
      console.log('Saving user data:', editFormData);
      
      // Clear any existing errors
      setEditErrors({});
      
      // Prepare the update data - exclude fields that shouldn't be sent to backend
      const updateData = { ...editFormData };
      
      // Delete fields that should not be sent to backend
      delete updateData.id;
      delete updateData.createdAt;
      delete updateData.updatedAt;
      delete (updateData as any).current_level;
      delete (updateData as any).can_reenter;
      delete (updateData as any).n3_completed_at;

      console.log('Sending update to API:', updateData);

      // Call the PATCH /users/:id endpoint
      await authAPI.updateUser(editingUser.id, updateData);
      console.log('User updated successfully:', editingUser.id);
      
      // Reload users to get fresh data from backend
      await fetchUsers();
      
      alert('Usuário atualizado com sucesso!');
      closeEditModal();
    } catch (error: any) {
      console.error('Error updating user:', error);
      // Show API error
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido';
      alert('Erro ao atualizar usuário: ' + errorMessage);
      setEditErrors({ general: errorMessage });
    } finally {
      setEditLoading(false);
    }
  };

  const handleViewProfile = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
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
            <h1 className="text-3xl font-bold text-gray-800">Usuários</h1>
            <p className="text-gray-600">Gerenciar todos os usuários do sistema</p>
          </div>

          {/* Search Bar and Filters */}
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
                
                {/* Filter Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={toggleUnverifiedFilter}
                    className={`px-4 py-3 text-sm font-medium rounded-lg border transition-colors ${
                      showUnverifiedOnly
                        ? 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200'
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {showUnverifiedOnly ? 'Mostrar Todos' : 'Não Verificados'}
                  </button>
                </div>
              </div>
              
              {/* Active Filters Display */}
              {(searchTerm || showUnverifiedOnly) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {searchTerm && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Busca: "{searchTerm}"
                      <button
                        onClick={clearSearch}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {showUnverifiedOnly && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Apenas não verificados
                      <button
                        onClick={toggleUnverifiedFilter}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}
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
                    <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
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
                              {formatAvatarUrl(userData.avatar) ? (
                                <img
                                  className="h-12 w-12 rounded-full object-cover"
                                  src={formatAvatarUrl(userData.avatar)!}
                                  alt={`${userData.firstName} ${userData.lastName}`}
                                />
                              ) : (
                                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${getAvatarColor(userData.firstName, userData.lastName)}`}>
                                  <span className="text-white text-lg font-semibold">
                                    {getInitials(userData.firstName, userData.lastName)}
                                  </span>
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
                                <div>
                                  <a
                                    href={getWhatsAppLink(userData.phone)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center space-x-1 px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                                  >
                                    <MessageCircle className="h-3 w-3" />
                                    <span>WhatsApp</span>
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Verification & Actions */}
                          <div className="flex flex-col items-end space-y-3">
                            {/* Verification Status */}
                            <div className={`flex items-center text-sm ${userData.role === UserRole.ADMIN || userData.adminApproved ? 'text-green-600' : 'text-red-600'}`}>
                              <div className="w-2 h-2 rounded-full mr-2 flex-shrink-0">
                                <div className={`w-2 h-2 rounded-full ${userData.role === UserRole.ADMIN || userData.adminApproved ? 'bg-green-500' : 'bg-red-500'}`}></div>
                              </div>
                              <span className="text-xs">
                                {userData.role === UserRole.ADMIN ? 'Admin (Verificado)' : userData.adminApproved ? 'Aprovado pelo admin' : 'Não aprovado pelo admin'}
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
                              {userData.role !== UserRole.ADMIN && !userData.adminApproved && (
                                <button
                                  onClick={() => handleVerifyUser(userData.id)}
                                  className="px-3 py-1 text-xs font-medium rounded-md transition-colors bg-blue-100 text-blue-800 hover:bg-blue-200"
                                >
                                  Verificar
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

        {/* User Profile Modal */}
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

              {/* Modal Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* User Avatar and Basic Info */}
                  <div className="lg:col-span-1">
                    <div className="text-center">
                      {formatAvatarUrl(selectedUser.avatar) ? (
                        <img
                          src={formatAvatarUrl(selectedUser.avatar)!}
                          alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                          className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                        />
                      ) : (
                        <div className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-4 ${getAvatarColor(selectedUser.firstName, selectedUser.lastName)}`}>
                          <span className="text-white text-4xl font-semibold">
                            {getInitials(selectedUser.firstName, selectedUser.lastName)}
                          </span>
                        </div>
                      )}
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {selectedUser.firstName} {selectedUser.lastName}
                      </h3>
                      
                      <div className="flex justify-center space-x-2 mb-4">
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRoleBadgeColor(selectedUser.role)}`}>
                          {selectedUser.role.toUpperCase()}
                        </span>
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeColor(selectedUser.status)}`}>
                          {selectedUser.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Verification Status */}
                      <div className="space-y-2">
                        <div className={`flex items-center justify-center ${selectedUser.role === UserRole.ADMIN || selectedUser.adminApproved ? 'text-green-600' : 'text-red-600'}`}>
                          <div className={`w-3 h-3 rounded-full mr-2 ${selectedUser.role === UserRole.ADMIN || selectedUser.adminApproved ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-sm font-medium">
                            {selectedUser.role === UserRole.ADMIN ? 'Admin (Verificado)' : selectedUser.adminApproved ? 'Aprovado pelo admin' : 'Não aprovado pelo admin'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* User Details */}
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
                        <div className="md:col-span-2">
                          <a
                            href={getWhatsAppLink(selectedUser.phone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          >
                            <MessageCircle className="h-4 w-4" />
                            <span>Contatar via WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Address Information */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <MapPin className="h-5 w-5 mr-2" />
                        Endereço
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Endereço</label>
                          <p className="text-sm text-gray-900">{selectedUser.address}, {selectedUser.addressNumber}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">CEP</label>
                          <p className="text-sm text-gray-900">{selectedUser.cep}</p>
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
                        {formatQrCodeImage(selectedUser.pixQrCode) && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">QR Code PIX</label>
                            <div className="mt-2">
                              <img
                                src={formatQrCodeImage(selectedUser.pixQrCode)!}
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
                              {formatQrCodeImage(selectedUser.btcQrCode) && (
                                <div>
                                  <label className="text-sm font-medium text-gray-500">QR Code Bitcoin</label>
                                  <div className="mt-2">
                                    <img
                                      src={formatQrCodeImage(selectedUser.btcQrCode)!}
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
                              {formatQrCodeImage(selectedUser.usdtQrCode) && (
                                <div>
                                  <label className="text-sm font-medium text-gray-500">QR Code USDT</label>
                                  <div className="mt-2">
                                    <img
                                      src={formatQrCodeImage(selectedUser.usdtQrCode)!}
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
                  onClick={() => handleEditUser(selectedUser.id)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors"
                >
                  Editar Usuário
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {isEditModalOpen && editingUser && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeEditModal}
          >
            <div 
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  Editar Usuário
                </h2>
                <button
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Display general errors */}
                {editErrors.general && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-800 text-sm font-medium">{editErrors.general}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Personal Information */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Informações Pessoais</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Avatar</label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload('avatar', file);
                          }}
                          className="hidden"
                          id="avatar-upload"
                        />
                        <label
                          htmlFor="avatar-upload"
                          className="flex items-center px-3 py-2 bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200 cursor-pointer"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Avatar
                        </label>
                        {editFormData.avatar && formatAvatarUrl(editFormData.avatar) ? (
                          <img
                            src={formatAvatarUrl(editFormData.avatar)!}
                            alt="Avatar Preview"
                            className="w-16 h-16 rounded-full border border-gray-300 object-cover"
                          />
                        ) : (
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center border border-gray-300 ${getAvatarColor(editFormData.firstName, editFormData.lastName)}`}>
                            <span className="text-white text-xl font-semibold">
                              {getInitials(editFormData.firstName, editFormData.lastName)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                      <input
                        type="text"
                        value={editFormData.firstName || ''}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sobrenome</label>
                      <input
                        type="text"
                        value={editFormData.lastName || ''}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={editFormData.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                      <input
                        type="tel"
                        value={editFormData.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                      <input
                        type="text"
                        value={editFormData.cpf || ''}
                        onChange={(e) => handleInputChange('cpf', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                      <input
                        type="date"
                        value={editFormData.birthDate ? editFormData.birthDate.split('T')[0] : ''}
                        onChange={(e) => handleInputChange('birthDate', e.target.value + 'T00:00:00.000Z')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha (opcional)</label>
                      <input
                        type="password"
                        placeholder="Deixe em branco para manter a senha atual"
                        value={editFormData.password || ''}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Deixe em branco se não desejar alterar a senha</p>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Endereço</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                      <input
                        type="text"
                        value={editFormData.address || ''}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                      <input
                        type="text"
                        value={editFormData.addressNumber || ''}
                        onChange={(e) => handleInputChange('addressNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                      <input
                        type="text"
                        value={editFormData.cep || ''}
                        onChange={(e) => handleInputChange('cep', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Banking Information */}
                  <div className="lg:col-span-2 space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Informações Bancárias</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Banco</label>
                      <input
                        type="text"
                        value={editFormData.bank || ''}
                        onChange={(e) => handleInputChange('bank', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Agência</label>
                      <input
                        type="text"
                        value={editFormData.agency || ''}
                        onChange={(e) => handleInputChange('agency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Conta</label>
                      <input
                        type="text"
                        value={editFormData.account || ''}
                        onChange={(e) => handleInputChange('account', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    </div>
                  </div>

                  {/* PIX Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">PIX</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Chave</label>
                      <select
                        value={editFormData.pixKeyType || ''}
                        onChange={(e) => handleInputChange('pixKeyType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="email">Email</option>
                        <option value="cpf">CPF</option>
                        <option value="phone">Telefone</option>
                        <option value="random">Chave Aleatória</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Chave PIX</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={editFormData.pixKey || ''}
                          onChange={(e) => handleInputChange('pixKey', e.target.value)}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Sua chave PIX"
                        />
                        {editFormData.pixKey && (
                          <button
                            type="button"
                            onClick={() => handleCopyToClipboard(editFormData.pixKey || '', 'pixKey')}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Copiar chave PIX"
                          >
                            {copiedField === 'pixKey' ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Titular</label>
                      <input
                        type="text"
                        value={editFormData.pixOwnerName || ''}
                        onChange={(e) => handleInputChange('pixOwnerName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">PIX Copia e Cola</label>
                      <div className="relative">
                        <textarea
                          id="pixCopyPaste"
                          value={editFormData.pixCopyPaste || ''}
                          onChange={(e) => handleInputChange('pixCopyPaste', e.target.value)}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                          placeholder="Cole aqui o seu código PIX Copia e Cola"
                        />
                        {editFormData.pixCopyPaste && (
                          <button
                            type="button"
                            onClick={() => handleCopyToClipboard(editFormData.pixCopyPaste || '', 'pixCopyPaste')}
                            className="absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Copiar PIX Copia e Cola"
                          >
                            {copiedField === 'pixCopyPaste' ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">QR Code PIX</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload('pixQrCode', file);
                          }}
                          className="hidden"
                          id="pix-qr-upload"
                        />
                        <label
                          htmlFor="pix-qr-upload"
                          className="flex items-center px-3 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 cursor-pointer"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload QR Code
                        </label>
                        {formatQrCodeImage(editFormData.pixQrCode) && (
                          <img
                            src={formatQrCodeImage(editFormData.pixQrCode)!}
                            alt="PIX QR Code"
                            className="w-16 h-16 border border-gray-300 rounded"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Crypto Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Criptomoedas</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Endereço Bitcoin</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={editFormData.btcAddress || ''}
                          onChange={(e) => handleInputChange('btcAddress', e.target.value)}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Endereço Bitcoin"
                        />
                        {editFormData.btcAddress && (
                          <button
                            type="button"
                            onClick={() => handleCopyToClipboard(editFormData.btcAddress || '', 'btcAddress')}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Copiar endereço Bitcoin"
                          >
                            {copiedField === 'btcAddress' ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">QR Code Bitcoin</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload('btcQrCode', file);
                          }}
                          className="hidden"
                          id="btc-qr-upload"
                        />
                        <label
                          htmlFor="btc-qr-upload"
                          className="flex items-center px-3 py-2 bg-orange-100 text-orange-800 rounded-md hover:bg-orange-200 cursor-pointer"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload QR Code
                        </label>
                        {formatQrCodeImage(editFormData.btcQrCode) && (
                          <img
                            src={formatQrCodeImage(editFormData.btcQrCode)!}
                            alt="Bitcoin QR Code"
                            className="w-16 h-16 border border-gray-300 rounded"
                          />
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Endereço USDT</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={editFormData.usdtAddress || ''}
                          onChange={(e) => handleInputChange('usdtAddress', e.target.value)}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Endereço USDT"
                        />
                        {editFormData.usdtAddress && (
                          <button
                            type="button"
                            onClick={() => handleCopyToClipboard(editFormData.usdtAddress || '', 'usdtAddress')}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Copiar endereço USDT"
                          >
                            {copiedField === 'usdtAddress' ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">QR Code USDT</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload('usdtQrCode', file);
                          }}
                          className="hidden"
                          id="usdt-qr-upload"
                        />
                        <label
                          htmlFor="usdt-qr-upload"
                          className="flex items-center px-3 py-2 bg-green-100 text-green-800 rounded-md hover:bg-green-200 cursor-pointer"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload QR Code
                        </label>
                        {formatQrCodeImage(editFormData.usdtQrCode) && (
                          <img
                            src={formatQrCodeImage(editFormData.usdtQrCode)!}
                            alt="USDT QR Code"
                            className="w-16 h-16 border border-gray-300 rounded"
                          />
                        )}
                      </div>
                    </div>
                  </div>


                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={closeEditModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveUser}
                  disabled={editLoading}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {editLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
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
                  {formatAvatarUrl(userToVerify.avatar) ? (
                    <img
                      src={formatAvatarUrl(userToVerify.avatar)!}
                      alt={`${userToVerify.firstName} ${userToVerify.lastName}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getAvatarColor(userToVerify.firstName, userToVerify.lastName)}`}>
                      <span className="text-white text-lg font-semibold">
                        {getInitials(userToVerify.firstName, userToVerify.lastName)}
                      </span>
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
      </div>
  );
}
