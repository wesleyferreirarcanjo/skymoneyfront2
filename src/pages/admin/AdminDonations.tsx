import { useState, useEffect } from 'react';
import { donationAPI } from '../../lib/api';
import type { Donation } from '../../types/donation';
import {
  AlertCircle,
  Clock,
  CheckCircle,
  DollarSign,
  Users,
  Eye,
  Search,
  RefreshCw,
  X,
  Calendar,
  User,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

type AdminDonationView = 'all' | 'pending' | 'completed' | 'expired';

export default function AdminDonations() {
  const [activeView, setActiveView] = useState<AdminDonationView>('all');
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'donor' | 'receiver' | 'id'>('all');
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [donationDetailsLoading, setDonationDetailsLoading] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [stats, setStats] = useState({
    totalDonations: 0,
    pendingPayment: 0,
    pendingConfirmation: 0,
    confirmed: 0,
    expired: 0,
    cancelled: 0,
    totalAmount: 0
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  // Computed values for filter counters
  const computedStats = {
    totalDonations: stats.totalDonations,
    pendingDonations: stats.pendingPayment + stats.pendingConfirmation,
    completedDonations: stats.confirmed,
    expiredDonations: stats.expired + stats.cancelled,
    totalAmount: stats.totalAmount
  };

  useEffect(() => {
    loadDonations();
  }, [currentPage, pageSize, activeView, searchTerm, searchType]);

  const loadDonations = async () => {
    try {
      setLoading(true);
      setError(null);
      setSearching(searchTerm.length > 0);

      // Carregar doações baseado no filtro ativo
      let statusFilter: string | undefined;
      if (activeView !== 'all') {
        switch (activeView) {
          case 'pending':
            statusFilter = 'PENDING_PAYMENT,PENDING_CONFIRMATION';
            break;
          case 'completed':
            statusFilter = 'CONFIRMED';
            break;
          case 'expired':
            statusFilter = 'EXPIRED,CANCELLED';
            break;
        }
      }

      // Prepare search parameters
      const searchParams: any = {
        page: currentPage,
        limit: pageSize
      };

      if (statusFilter) {
        searchParams.status = statusFilter;
      }

      if (searchTerm) {
        if (searchType === 'donor') {
          searchParams.donorId = searchTerm;
        } else if (searchType === 'receiver') {
          searchParams.receiverId = searchTerm;
        } else if (searchType === 'id') {
          searchParams.id = searchTerm;
        } else {
          // For 'all' search, we might need to handle this differently
          // For now, let's use the existing frontend filtering
        }
      }

      const donationsData = await donationAPI.getAllDonations(currentPage, pageSize, statusFilter, searchParams);
      setDonations(donationsData.data);

      // Atualizar estatísticas vindas da lista (se presentes)
      if ((donationsData as any).stats) {
        setStats((donationsData as any).stats);
      }

      // Update pagination info
      setTotalPages(donationsData.pagination.totalPages);
      setTotalRecords(donationsData.pagination.totalItems);

    } catch (err: any) {
      setError(err.message || 'Erro ao carregar doações');
      console.error('Load donations error:', err);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchType('all');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) {
      return 'Data não disponível';
    }

    try {
      const date = new Date(dateString);

      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }

      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Data inválida';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return 'bg-yellow-100 text-yellow-800';
      case 'PENDING_CONFIRMATION':
        return 'bg-blue-100 text-blue-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return 'Aguardando Pagamento';
      case 'PENDING_CONFIRMATION':
        return 'Aguardando Confirmação';
      case 'CONFIRMED':
        return 'Confirmada';
      case 'EXPIRED':
        return 'Expirada';
      case 'CANCELLED':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const getDonationTypeText = (type: string) => {
    switch (type) {
      case 'PULL':
        return 'PULL';
      case 'CASCADE_N1':
        return 'Cascata N1';
      case 'UPGRADE_N2':
        return 'Upgrade N2';
      case 'REINJECTION_N2':
        return 'Reinject N2';
      case 'UPGRADE_N3':
        return 'Upgrade N3';
      case 'REINFORCEMENT_N3':
        return 'Reforço N3';
      case 'ADM_N3':
        return 'ADM N3';
      case 'FINAL_PAYMENT_N3':
        return 'Pagamento Final N3';
      default:
        return type;
    }
  };

  const handleViewDonationDetails = async (donationId: string) => {
    try {
      setDonationDetailsLoading(true);
      setShowDetailsModal(true);

      const details = await donationAPI.getDonationDetails(donationId);
      setSelectedDonation(details);
    } catch (err: any) {
      console.error('Error loading donation details:', err);
      setError('Erro ao carregar detalhes da doação');
      setShowDetailsModal(false);
    } finally {
      setDonationDetailsLoading(false);
    }
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedDonation(null);
  };

  // Pagination functions
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {searching ? 'Buscando doações...' : 'Carregando doações...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-4 p-4">
        <h1 className="text-2xl font-bold text-gray-800">Doações do Sistema</h1>
        <p className="text-gray-600 text-sm">Visualize e gerencie todas as doações de todos os usuários</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4 px-4">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <DollarSign className="h-6 w-6 text-blue-600 mr-2" />
              <div>
                <p className="text-xs font-medium text-blue-600">Total Valor</p>
                <p className="text-lg font-bold text-blue-900">{formatCurrency(stats.totalAmount)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-gray-600 mr-2" />
              <div>
                <p className="text-xs font-medium text-gray-600">Total Doações</p>
                <p className="text-lg font-bold text-gray-900">{stats.totalDonations}</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-yellow-600 mr-2" />
              <div>
                <p className="text-xs font-medium text-yellow-600">Pendentes</p>
                <p className="text-lg font-bold text-yellow-900">{computedStats.pendingDonations}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
              <div>
                <p className="text-xs font-medium text-green-600">Concluídas</p>
                <p className="text-lg font-bold text-green-900">{computedStats.completedDonations}</p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 text-red-600 mr-2" />
              <div>
                <p className="text-xs font-medium text-red-600">Expiradas</p>
                <p className="text-lg font-bold text-red-900">{computedStats.expiredDonations}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4 mx-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-lg">
              <div className="flex gap-2">
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">Todos</option>
                  <option value="donor">Doador (ID)</option>
                  <option value="receiver">Recebedor (ID)</option>
                  <option value="id">ID da Doação</option>
                </select>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={
                      searchType === 'donor' ? 'ID do doador...' :
                      searchType === 'receiver' ? 'ID do recebedor...' :
                      searchType === 'id' ? 'ID da doação...' :
                      'Buscar por nome ou ID...'
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {searchTerm && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      title="Limpar busca"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveView('all')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeView === 'all'
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todas ({computedStats.totalDonations})
              </button>
              <button
                onClick={() => setActiveView('pending')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeView === 'pending'
                    ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pendentes ({computedStats.pendingDonations})
              </button>
              <button
                onClick={() => setActiveView('completed')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeView === 'completed'
                    ? 'bg-green-100 text-green-700 border-2 border-green-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Concluídas ({computedStats.completedDonations})
              </button>
              <button
                onClick={() => setActiveView('expired')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeView === 'expired'
                    ? 'bg-red-100 text-red-700 border-2 border-red-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Expiradas ({computedStats.expiredDonations})
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={loadDonations}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </button>
          </div>
        </div>

        {/* Donations List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mx-4 flex-1 flex flex-col">
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <span className="text-red-700">{error}</span>
                </div>
                <button
                  onClick={loadDonations}
                  className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Tentar novamente
                </button>
              </div>
            </div>
          )}

          {donations.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || activeView !== 'all' ? 'Nenhum resultado encontrado' : 'Nenhuma doação encontrada'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm && activeView !== 'all'
                  ? `Não foram encontradas doações ${activeView === 'pending' ? 'pendentes' : activeView === 'completed' ? 'concluídas' : 'expiradas'} com "${searchTerm}"`
                  : searchTerm
                    ? `Não foram encontradas doações com "${searchTerm}"`
                    : activeView !== 'all'
                      ? `Não há doações ${activeView === 'pending' ? 'pendentes' : activeView === 'completed' ? 'concluídas' : 'expiradas'}`
                      : 'Não há doações cadastradas no sistema'
                }
              </p>
              {(searchTerm || activeView !== 'all') && (
                <div className="flex gap-2 justify-center">
                  {searchTerm && (
                    <button
                      onClick={clearSearch}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Limpar busca
                    </button>
                  )}
                  {activeView !== 'all' && (
                    <button
                      onClick={() => setActiveView('all')}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                    >
                      Ver todas
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="min-w-full divide-y divide-gray-200 h-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Criado em
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prazo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {donations.map((donation) => (
                    <tr key={donation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {donation.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getDonationTypeText(donation.type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {donation.donor?.name} → {donation.receiver?.name}
                          </div>
                          <div className="text-gray-500">
                            {donation.donor?.pixKey}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(donation.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(donation.status)}`}>
                          {getStatusText(donation.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(donation.createdAt || (donation as any).created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {donation.deadline ? formatDate(donation.deadline) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewDonationDetails(donation.id)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-md p-3 mt-4 mx-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Page Size Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Itens por página:</span>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              {/* Page Info */}
              <div className="text-sm text-gray-600">
                Mostrando {(currentPage - 1) * pageSize + 1} a {Math.min(currentPage * pageSize, totalRecords)} de {totalRecords} resultados
              </div>

              {/* Page Navigation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={goToFirstPage}
                  disabled={currentPage === 1}
                  className="p-2 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Primeira página"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </button>

                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="p-2 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Página anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <span className="px-3 py-1 text-sm bg-gray-100 rounded">
                  Página {currentPage} de {totalPages}
                </span>

                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Próxima página"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                <button
                  onClick={goToLastPage}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Última página"
                >
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Donation Details Modal */}
        {showDetailsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Detalhes da Doação
                </h3>
                <button
                  onClick={closeDetailsModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {donationDetailsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Carregando...</span>
                  </div>
                ) : selectedDonation ? (
                  <div className="space-y-6">
                    {/* Status and Type */}
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedDonation.status)}`}>
                        {getStatusText(selectedDonation.status)}
                      </span>
                      <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                        {getDonationTypeText(selectedDonation.type)}
                      </span>
                    </div>

                    {/* Amount */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <DollarSign className="h-8 w-8 text-blue-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-blue-600">Valor da Doação</p>
                          <p className="text-2xl font-bold text-blue-900">{formatCurrency(selectedDonation.amount)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Donor and Receiver */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Donor */}
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <User className="h-5 w-5 text-green-600 mr-2" />
                          <span className="font-medium text-green-800">Doador</span>
                        </div>
                        <p className="text-lg font-semibold text-green-900">{selectedDonation.donor?.name}</p>
                        <p className="text-sm text-green-700">{selectedDonation.donor?.pixKey}</p>
                      </div>

                      {/* Receiver */}
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <User className="h-5 w-5 text-purple-600 mr-2" />
                          <span className="font-medium text-purple-800">Recebedor</span>
                        </div>
                        <p className="text-lg font-semibold text-purple-900">{selectedDonation.receiver?.name}</p>
                        <p className="text-sm text-purple-700">{selectedDonation.receiver?.pixKey}</p>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Created At */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Calendar className="h-5 w-5 text-gray-600 mr-2" />
                          <span className="font-medium text-gray-800">Criado em</span>
                        </div>
                        <p className="text-sm text-gray-700">{formatDate(selectedDonation.createdAt || (selectedDonation as any).created_at)}</p>
                      </div>

                      {/* Deadline */}
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                          <span className="font-medium text-yellow-800">Prazo</span>
                        </div>
                        <p className="text-sm text-yellow-700">
                          {selectedDonation.deadline ? formatDate(selectedDonation.deadline) : 'Sem prazo definido'}
                        </p>
                      </div>
                    </div>

                    {/* Completed At */}
                    {selectedDonation.completedAt && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                          <span className="font-medium text-green-800">Concluída em</span>
                        </div>
                        <p className="text-sm text-green-700">{formatDate(selectedDonation.completedAt)}</p>
                      </div>
                    )}

                    {/* Donation ID */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <FileText className="h-5 w-5 text-gray-600 mr-2" />
                        <span className="font-medium text-gray-800">ID da Doação</span>
                      </div>
                      <p className="text-sm font-mono text-gray-700 break-all">{selectedDonation.id}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
                    <p className="text-red-600">Erro ao carregar detalhes da doação</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end p-6 border-t border-gray-200">
                <button
                  onClick={closeDetailsModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
