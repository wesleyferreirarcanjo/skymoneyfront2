import { useState, useEffect } from 'react';
import { donationAPI } from '../../lib/api';
import { DonationReport } from '../../types/donation';
import {
  AlertCircle,
  Clock,
  CheckCircle,
  DollarSign,
  Eye,
  RefreshCw,
  X,
  Calendar,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Flag,
  MessageSquare,
  CheckSquare,
  Search
} from 'lucide-react';

type UserReportsView = 'all' | 'pending' | 'resolved';

export default function UserReports() {
  const [activeView, setActiveView] = useState<UserReportsView>('all');
  const [reports, setReports] = useState<DonationReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<DonationReport | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [reportDetailsLoading, setReportDetailsLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    loadReports();
  }, [currentPage, pageSize, activeView]);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);

      // Carregar reports baseado no filtro ativo
      let resolvedFilter: boolean | undefined;
      if (activeView !== 'all') {
        switch (activeView) {
          case 'pending':
            resolvedFilter = false; // Reports não resolvidos (pendentes)
            break;
          case 'resolved':
            resolvedFilter = true; // Reports resolvidos
            break;
        }
      }

      const reportsData = await donationAPI.getUserReports(currentPage, pageSize, resolvedFilter);
      setReports(reportsData.data);

      // Update pagination info
      setTotalPages(reportsData.pagination.totalPages);
      setTotalRecords(reportsData.pagination.totalItems);

    } catch (err: any) {
      setError(err.message || 'Erro ao carregar reports');
      console.error('Load user reports error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        return 'Aguardando Análise';
      case 'INVESTIGATING':
        return 'Em Análise';
      case 'RESOLVED':
        return 'Resolvido';
      case 'DISMISSED':
        return 'Dispensado';
      case 'PENDING_PAYMENT':
        return 'Aguardando Pagamento';
      case 'PENDING_CONFIRMATION':
        return 'Aguardando Confirmação';
      case 'CONFIRMED':
        return 'Confirmado';
      case 'EXPIRED':
        return 'Expirado';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getFriendlyStatusText = (report: DonationReport) => {
    if (report.report_resolved) {
      return '✅ Resolvido';
    }

    if (report.report_resolution === 'INVESTIGATING') {
      return '🔍 Em Análise';
    }

    return `⏳ ${getStatusText(report.status)}`;
  };

  const handleViewReportDetails = async (reportId: string) => {
    try {
      setReportDetailsLoading(true);
      setShowDetailsModal(true);

      const details = await donationAPI.getUserReportDetails(reportId);
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
            <p className="text-gray-600">Carregando seus reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-64 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Meus Reports</h1>
          <p className="text-gray-600 text-sm">Acompanhe o status dos reports que você criou</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <Flag className="h-6 w-6 text-blue-600 mr-2" />
              <div>
                <p className="text-xs font-medium text-blue-600">Total Reports</p>
                <p className="text-lg font-bold text-blue-900">{totalRecords}</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-yellow-600 mr-2" />
              <div>
                <p className="text-xs font-medium text-yellow-600">Aguardando</p>
              <p className="text-lg font-bold text-yellow-900">
                {reports.filter(r => !r.report_resolved).length}
              </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
              <div>
                <p className="text-xs font-medium text-green-600">Concluídos</p>
              <p className="text-lg font-bold text-green-900">
                {reports.filter(r => r.report_resolved).length}
              </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveView('all')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeView === 'all'
                ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos ({totalRecords})
          </button>
          <button
            onClick={() => setActiveView('pending')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeView === 'pending'
                ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Aguardando Resolução ({reports.filter(r => !r.report_resolved).length})
          </button>
          <button
            onClick={() => setActiveView('resolved')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeView === 'resolved'
                ? 'bg-green-100 text-green-700 border-2 border-green-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Já Resolvidos ({reports.filter(r => r.report_resolved).length})
          </button>

          {/* Refresh Button */}
          <button
            onClick={loadReports}
            className="ml-auto flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </button>
        </div>
      </div>

        {/* Reports List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden flex-1 flex flex-col">
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
              Nenhum report encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              {activeView === 'all'
                ? 'Você ainda não criou nenhum report.'
                : `Você não tem reports ${activeView === 'pending' ? 'pendentes' : activeView === 'resolved' ? 'resolvidos' : ''}.`
              }
            </p>
            {activeView !== 'all' && (
              <button
                onClick={() => setActiveView('all')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Ver todos
              </button>
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
                    Doação
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
                            {report.donor.name} → {report.receiver.name}
                          </div>
                          <div className="text-gray-500">
                            {formatCurrency(report.amount)}
                          </div>
                        </div>
                      </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.report_resolved ? 'RESOLVED' : report.status)}`}>
                        {getFriendlyStatusText(report)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(report.reported_at)}
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
          <div className="bg-white rounded-lg shadow-md p-3 mt-4">
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
      </div>

      {/* Report Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
                  {/* Status */}
                  <div className="flex items-center justify-center">
                    <span className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full ${getStatusColor(selectedReport.status)}`}>
                      {getStatusText(selectedReport.status)}
                    </span>
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
                      <p className="text-sm text-gray-700">{formatDate(selectedReport.reported_at)}</p>
                    </div>
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

                  {/* Resolution Message - Only show if resolved */}
                  {selectedReport.report_resolved && (
                    <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                      <div className="flex items-center mb-2">
                        <CheckSquare className="h-5 w-5 text-green-600 mr-2" />
                        <span className="font-medium text-green-800">Resolução Administrativa</span>
                      </div>
                      <p className="text-sm text-green-700">
                        {selectedReport.report_resolution_message || 'Problema resolvido pela administração. Agradecemos sua participação no sistema SkyMoney.'}
                      </p>
                    </div>
                  )}

                  {/* Investigating Message */}
                  {!selectedReport.report_resolved && (
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                      <div className="flex items-center mb-2">
                        <Search className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="font-medium text-blue-800">
                          {selectedReport.report_resolution === 'INVESTIGATING' ? 'Em Investigação' : 'Aguardando Análise'}
                        </span>
                      </div>
                      <p className="text-sm text-blue-700">
                        {selectedReport.report_resolution === 'INVESTIGATING'
                          ? 'Sua denúncia está sendo investigada pela equipe administrativa.'
                          : 'Sua denúncia foi recebida e está aguardando análise da equipe administrativa.'
                        }
                      </p>
                    </div>
                  )}

                  {/* Dismissed Message */}
                  {selectedReport.report_resolution === 'REJECTED' && (
                    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400">
                      <div className="flex items-center mb-2">
                        <X className="h-5 w-5 text-gray-600 mr-2" />
                        <span className="font-medium text-gray-800">Report Dispensado</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        Após análise, este report foi dispensado pela administração.
                      </p>
                    </div>
                  )}
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
    </div>
  );
}
