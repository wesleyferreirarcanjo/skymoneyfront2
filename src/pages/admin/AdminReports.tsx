import { useState, useEffect } from 'react';
import { donationAPI, ReportsStats } from '../../lib/api';
import { DonationReport, ReportResolutionType } from '../../types/donation';
import {
  AlertCircle,
  Clock,
  CheckCircle,
  DollarSign,
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
  ChevronsRight,
  Flag,
  MessageSquare,
  CheckSquare
} from 'lucide-react';

type AdminReportsView = 'all' | 'pending' | 'investigating' | 'resolved' | 'dismissed';

export default function AdminReports() {
  const [activeView, setActiveView] = useState<AdminReportsView>('all');
  const [reports, setReports] = useState<DonationReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'reporter' | 'donation' | 'id'>('all');
  const [selectedReport, setSelectedReport] = useState<DonationReport | null>(null);
  const [reportDetailsLoading, setReportDetailsLoading] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [stats, setStats] = useState<ReportsStats>({
    totalReports: 0,
    pendingReports: 0,
    investigatingReports: 0,
    resolvedReports: 0,
    dismissedReports: 0
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  // Date filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Resolution modal state
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [resolutionLoading, setResolutionLoading] = useState(false);
  const [resolutionForm, setResolutionForm] = useState({
    resolution: ReportResolutionType.RESOLVED,
    resolution_message: '',
    admin_notes: ''
  });

  useEffect(() => {
    loadReports();
  }, [currentPage, pageSize, activeView, searchTerm, searchType, dateFrom, dateTo]);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      setSearching(searchTerm.length > 0);

      // Carregar estatísticas:
      // - Breakdown por status via listas (limit=1) usando totalItems
      // - Agregados via endpoint /admin/donations/reports/stats (quando disponível)
      try {
        const [allResp, pendingResp, investigatingResp, resolvedResp, dismissedResp, aggregateResp] = await Promise.all([
          donationAPI.getReports(1, 1),
          donationAPI.getReports(1, 1, { status: 'PENDING' }),
          donationAPI.getReports(1, 1, { status: 'INVESTIGATING' }),
          donationAPI.getReports(1, 1, { status: 'RESOLVED' }),
          donationAPI.getReports(1, 1, { status: 'DISMISSED' }),
          donationAPI.getReportsStats().catch(() => undefined),
        ]);

        setStats({
          totalReports: aggregateResp?.totalReports ?? (allResp.pagination.totalItems || 0),
          pendingReports: pendingResp.pagination.totalItems || 0,
          investigatingReports: investigatingResp.pagination.totalItems || 0,
          resolvedReports: resolvedResp.pagination.totalItems || 0,
          dismissedReports: dismissedResp.pagination.totalItems || 0,
          totalAmountReported: aggregateResp?.totalAmountReported,
          reportsThisWeek: aggregateResp?.reportsThisWeek,
          reportsThisMonth: aggregateResp?.reportsThisMonth,
          averageReportAmount: aggregateResp?.averageReportAmount,
        });
      } catch (statsErr: any) {
        // Se falhar, não bloquear a página; apenas logar e seguir
        console.warn('Falha ao calcular estatísticas de reports:', statsErr?.message || statsErr);
      }

      // Carregar reports baseado no filtro ativo
      let statusFilter: string | undefined;
      if (activeView !== 'all') {
        switch (activeView) {
          case 'pending':
            statusFilter = 'PENDING';
            break;
          case 'investigating':
            statusFilter = 'INVESTIGATING';
            break;
          case 'resolved':
            statusFilter = 'RESOLVED';
            break;
          case 'dismissed':
            statusFilter = 'DISMISSED';
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

      if (dateFrom) {
        searchParams.dateFrom = dateFrom;
      }

      if (dateTo) {
        searchParams.dateTo = dateTo;
      }

      if (searchTerm) {
        if (searchType === 'reporter') {
          searchParams.reporterId = searchTerm;
        } else if (searchType === 'donation') {
          searchParams.donationId = searchTerm;
        } else if (searchType === 'id') {
          // For ID search, we'll need to handle this on the frontend
        }
      }

      const reportsData = await donationAPI.getReports(currentPage, pageSize, searchParams);

      // Filter by ID on frontend if needed
      let filteredReports = reportsData.data;
      if (searchTerm && searchType === 'id') {
        filteredReports = reportsData.data.filter(report =>
          report.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setReports(filteredReports);

      // Update pagination info
      setTotalPages(reportsData.pagination.totalPages);
      setTotalRecords(reportsData.pagination.totalItems);

    } catch (err: any) {
      setError(err.message || 'Erro ao carregar reports');
      console.error('Load reports error:', err);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchType('all');
    setDateFrom('');
    setDateTo('');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) {
      console.warn('⚠️ formatDate recebeu valor vazio:', dateString);
      return 'Data não disponível';
    }

    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('❌ Erro ao formatar data:', dateString, error);
      return 'Data inválida';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'INVESTIGATING':
        return 'bg-blue-100 text-blue-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'DISMISSED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendente';
      case 'INVESTIGATING':
        return 'Investigando';
      case 'RESOLVED':
        return 'Resolvido';
      case 'DISMISSED':
        return 'Dispensado';
      default:
        return status;
    }
  };

  const handleViewReportDetails = async (reportId: string) => {
    try {
      setReportDetailsLoading(true);
      setShowDetailsModal(true);

      const details = await donationAPI.getReportDetails(reportId);
      setSelectedReport(details);
    } catch (err: any) {
      console.error('Error loading report details:', err);
      setError('Erro ao carregar detalhes do report');
      setShowDetailsModal(false);
    } finally {
      setReportDetailsLoading(false);
    }
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedReport(null);
  };

  const openResolutionModal = (report: DonationReport) => {
    setSelectedReport(report);
    setShowResolutionModal(true);
    // Reset form
    setResolutionForm({
      resolution: ReportResolutionType.RESOLVED,
      resolution_message: '',
      admin_notes: ''
    });
  };

  const closeResolutionModal = () => {
    setShowResolutionModal(false);
    setSelectedReport(null);
    setResolutionForm({
      resolution: ReportResolutionType.RESOLVED,
      resolution_message: '',
      admin_notes: ''
    });
  };

  const handleResolveReport = async () => {
    if (!selectedReport) return;

    // Validate form
    if (!resolutionForm.resolution_message.trim()) {
      setError('A mensagem de resolução é obrigatória');
      return;
    }

    if (!resolutionForm.admin_notes.trim()) {
      setError('As notas administrativas são obrigatórias');
      return;
    }

    try {
      setResolutionLoading(true);
      setError(null);

      await donationAPI.resolveReport(selectedReport.id, resolutionForm);

      // Reload reports to get updated status
      loadReports();
      closeResolutionModal();
      closeDetailsModal();
    } catch (err: any) {
      console.error('Error resolving report:', err);
      setError('Erro ao resolver report: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setResolutionLoading(false);
    }
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
              {searching ? 'Buscando reports...' : 'Carregando reports...'}
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
        <h1 className="text-2xl font-bold text-gray-800">Reports de Doações</h1>
        <p className="text-gray-600 text-sm">Visualize e gerencie reports de doações não recebidas</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4 px-4">
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <Flag className="h-6 w-6 text-blue-600 mr-2" />
            <div>
              <p className="text-xs font-medium text-blue-600">Total Reports</p>
              <p className="text-lg font-bold text-blue-900">{stats.totalReports}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-yellow-600 mr-2" />
            <div>
              <p className="text-xs font-medium text-yellow-600">Pendentes</p>
              <p className="text-lg font-bold text-yellow-900">{stats.pendingReports}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <Search className="h-6 w-6 text-blue-600 mr-2" />
            <div>
              <p className="text-xs font-medium text-blue-600">Investigando</p>
              <p className="text-lg font-bold text-blue-900">{stats.investigatingReports}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
            <div>
              <p className="text-xs font-medium text-green-600">Resolvidos</p>
              <p className="text-lg font-bold text-green-900">{stats.resolvedReports}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <X className="h-6 w-6 text-gray-600 mr-2" />
            <div>
              <p className="text-xs font-medium text-gray-600">Dispensados</p>
              <p className="text-lg font-bold text-gray-900">{stats.dismissedReports}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4 mx-4">
        <div className="flex flex-col gap-4">
          {/* Date Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Período:</span>
            </div>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Data inicial"
              />
              <span className="text-gray-400">até</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Data final"
              />
            </div>
          </div>

          {/* Search */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-lg">
              <div className="flex gap-2">
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">Todos</option>
                  <option value="reporter">Reportador (ID)</option>
                  <option value="donation">Doação (ID)</option>
                  <option value="id">ID do Report</option>
                </select>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={
                      searchType === 'reporter' ? 'ID do reportador...' :
                      searchType === 'donation' ? 'ID da doação...' :
                      searchType === 'id' ? 'ID do report...' :
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
                Todos ({stats.totalReports})
              </button>
              <button
                onClick={() => setActiveView('pending')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeView === 'pending'
                    ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pendentes ({stats.pendingReports})
              </button>
              <button
                onClick={() => setActiveView('investigating')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeView === 'investigating'
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Investigando ({stats.investigatingReports})
              </button>
              <button
                onClick={() => setActiveView('resolved')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeView === 'resolved'
                    ? 'bg-green-100 text-green-700 border-2 border-green-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Resolvidos ({stats.resolvedReports})
              </button>
              <button
                onClick={() => setActiveView('dismissed')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeView === 'dismissed'
                    ? 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Dispensados ({stats.dismissedReports})
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={loadReports}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </button>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mx-4 flex-1 flex flex-col">
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-red-700">{error}</span>
              </div>
              <button
                onClick={loadReports}
                className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Tentar novamente
              </button>
            </div>
          </div>
        )}

        {reports.length === 0 ? (
          <div className="p-12 text-center">
            <Flag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || activeView !== 'all' ? 'Nenhum report encontrado' : 'Nenhum report encontrado'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm && activeView !== 'all'
                ? `Não foram encontrados reports ${activeView === 'pending' ? 'pendentes' : activeView === 'investigating' ? 'em investigação' : activeView === 'resolved' ? 'resolvidos' : 'dispensados'} com "${searchTerm}"`
                : searchTerm
                  ? `Não foram encontrados reports com "${searchTerm}"`
                  : activeView !== 'all'
                    ? `Não há reports ${activeView === 'pending' ? 'pendentes' : activeView === 'investigating' ? 'em investigação' : activeView === 'resolved' ? 'resolvidos' : 'dispensados'}`
                    : 'Não há reports cadastrados no sistema'
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
                    Ver todos
                  </button>
                )}
              </div>
            )}
          </div>
        ) : reports.length === 1 ? (
          /* Card view for single report - better visualization */
          <div className="p-6">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <Flag className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Report #{reports[0].id}</h3>
                      <p className="text-sm text-gray-500">Criado em {formatDate(reports[0].created_at || reports[0].reported_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(reports[0].status)}`}>
                      {getStatusText(reports[0].status)}
                    </span>
                    <button
                      onClick={() => handleViewReportDetails(reports[0].id)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Reportador */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <User className="h-5 w-5 text-gray-600 mr-2" />
                      <span className="font-medium text-gray-800">Reportador</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{reports[0].receiver.name}</p>
                    <p className="text-xs text-gray-600">{reports[0].receiver.pixKey}</p>
                  </div>

                  {/* Doação */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-medium text-green-800">Doação</span>
                    </div>
                    <p className="text-sm font-semibold text-green-900">{formatCurrency(reports[0].amount)}</p>
                    <p className="text-xs text-green-700">{reports[0].donor.name} → {reports[0].receiver.name}</p>
                  </div>

                  {/* Motivo */}
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <MessageSquare className="h-5 w-5 text-red-600 mr-2" />
                      <span className="font-medium text-red-800">Motivo do Report</span>
                    </div>
                    <p className="text-sm text-red-700 leading-relaxed">{reports[0].report_reason}</p>
                    {reports[0].report_additional_info && (
                      <p className="text-xs text-red-600 mt-2 italic">{reports[0].report_additional_info}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Table view for multiple reports */
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reportador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Motivo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Criado em
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {report.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {report.receiver.name}
                          </div>
                          <div className="text-gray-500">
                            {report.receiver.pixKey}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {report.donor.name} → {report.receiver.name}
                          </div>
                          <div className="text-gray-500">
                            {formatCurrency(report.amount)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={report.report_reason}>
                          {report.report_reason}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                        {getStatusText(report.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(report.created_at || report.reported_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewReportDetails(report.id)}
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

      {/* Report Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Detalhes do Report
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
              {reportDetailsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Carregando...</span>
                </div>
              ) : selectedReport ? (
                <div className="space-y-6">
                  {/* Status and Actions */}
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedReport.status)}`}>
                      {getStatusText(selectedReport.status)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openResolutionModal(selectedReport)}
                        className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 flex items-center"
                      >
                        <CheckSquare className="h-4 w-4 mr-1" />
                        Resolver Report
                      </button>
                    </div>
                  </div>

                  {/* Report Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Report ID */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <FileText className="h-5 w-5 text-gray-600 mr-2" />
                        <span className="font-medium text-gray-800">ID do Report</span>
                      </div>
                      <p className="text-sm font-mono text-gray-700 break-all">{selectedReport.id}</p>
                    </div>

                    {/* Created At */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Calendar className="h-5 w-5 text-gray-600 mr-2" />
                        <span className="font-medium text-gray-800">Criado em</span>
                      </div>
                        <p className="text-sm text-gray-700">{formatDate(selectedReport.created_at || selectedReport.reported_at)}</p>
                    </div>
                  </div>

                  {/* Reporter */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <User className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="font-medium text-blue-800">Reportador</span>
                      </div>
                      <p className="text-lg font-semibold text-blue-900">{selectedReport.receiver.name}</p>
                      <p className="text-sm text-blue-700">{selectedReport.receiver.pixKey}</p>
                      <p className="text-xs text-blue-600 mt-1">ID: {selectedReport.receiver.id}</p>
                  </div>

                  {/* Donation Details */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-medium text-green-800">Detalhes da Doação</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-green-800">Valor</p>
                        <p className="text-lg font-bold text-green-900">{formatCurrency(selectedReport.amount)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-800">Status</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedReport.status)}`}>
                          {getStatusText(selectedReport.status)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm font-medium text-green-800">Doador → Recebedor</p>
                      <p className="text-sm text-green-700">
                        {selectedReport.donor.name} → {selectedReport.receiver.name}
                      </p>
                    </div>
                  </div>

                  {/* Report Reason */}
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <MessageSquare className="h-5 w-5 text-red-600 mr-2" />
                      <span className="font-medium text-red-800">Motivo do Report</span>
                    </div>
                    <p className="text-sm text-red-700 mb-2">{selectedReport.report_reason}</p>
                    {selectedReport.report_additional_info && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-red-600">Informações adicionais:</p>
                        <p className="text-sm text-red-700">{selectedReport.report_additional_info}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
                  <p className="text-red-600">Erro ao carregar detalhes do report</p>
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

      {/* Resolution Modal */}
      {showResolutionModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Resolver Report - {selectedReport.id}
              </h3>
              <button
                onClick={closeResolutionModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {resolutionLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <span className="ml-2 text-gray-600">Resolvendo report...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Report Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">Resumo do Report</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Reportador:</strong> {selectedReport.receiver.name}</p>
                      <p><strong>Doação:</strong> {selectedReport.donor.name} → {selectedReport.receiver.name}</p>
                      <p><strong>Valor:</strong> {formatCurrency(selectedReport.amount)}</p>
                      <p><strong>Motivo:</strong> {selectedReport.report_reason}</p>
                    </div>
                  </div>

                  {/* Resolution Form */}
                  <div className="space-y-4">
                    {/* Resolution Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Resolução *
                      </label>
                      <select
                        value={resolutionForm.resolution}
                        onChange={(e) => setResolutionForm(prev => ({
                          ...prev,
                          resolution: e.target.value as typeof prev.resolution
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value={ReportResolutionType.RESOLVED}>✅ {ReportResolutionType.RESOLVED} - Problema resolvido</option>
                        <option value={ReportResolutionType.INVESTIGATING}>🔍 {ReportResolutionType.INVESTIGATING} - Em investigação</option>
                        <option value={ReportResolutionType.NEEDS_MORE_INFO}>❓ {ReportResolutionType.NEEDS_MORE_INFO} - Precisa de mais informações</option>
                        <option value={ReportResolutionType.REJECTED}>❌ {ReportResolutionType.REJECTED} - Report rejeitado</option>
                      </select>
                    </div>

                    {/* Resolution Message */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mensagem de Resolução (para o usuário) *
                      </label>
                      <textarea
                        value={resolutionForm.resolution_message}
                        onChange={(e) => setResolutionForm(prev => ({
                          ...prev,
                          resolution_message: e.target.value
                        }))}
                        placeholder="Digite a mensagem que será enviada ao usuário..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Esta mensagem será enviada ao usuário reportador
                      </p>
                    </div>

                    {/* Admin Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notas Administrativas (interno) *
                      </label>
                      <textarea
                        value={resolutionForm.admin_notes}
                        onChange={(e) => setResolutionForm(prev => ({
                          ...prev,
                          admin_notes: e.target.value
                        }))}
                        placeholder="Digite notas administrativas para registro interno..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Estas notas são apenas para registro interno dos administradores
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={closeResolutionModal}
                disabled={resolutionLoading}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleResolveReport}
                disabled={resolutionLoading || !resolutionForm.resolution_message.trim() || !resolutionForm.admin_notes.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center"
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                {resolutionLoading ? 'Resolvendo...' : 'Resolver Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
