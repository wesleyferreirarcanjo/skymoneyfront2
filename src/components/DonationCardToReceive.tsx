import { useState, useEffect } from 'react';
import { Donation, DonationType, DonationStatus, ComprovanteUrlResponse, DonationReportRequest } from '../types/donation';
import { donationAPI } from '../lib/api';
import { User, Clock, CheckCircle, Eye, AlertCircle, Flag, Check } from 'lucide-react';

interface DonationCardToReceiveProps {
  donation: Donation;
  onUpdate: () => void;
}

export default function DonationCardToReceive({ donation, onUpdate }: DonationCardToReceiveProps) {
  const [confirming, setConfirming] = useState(false);
  const [viewingComprovante, setViewingComprovante] = useState(false);
  const [comprovanteUrl, setComprovanteUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportData, setReportData] = useState<DonationReportRequest>({
    reason: '',
    additionalInfo: ''
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getDonationTypeLabel = (type: DonationType) => {
    switch (type) {
      case DonationType.PULL:
        return 'Contribuição Mensal (PULL)';
      case DonationType.CASCADE_N1:
        return 'Cascata N1';
      case DonationType.UPGRADE_N2:
        return 'Upgrade N2';
      case DonationType.REINJECTION_N2:
        return 'Reinjeção N2';
      case DonationType.UPGRADE_N3:
        return 'Upgrade N3';
      case DonationType.REINFORCEMENT_N3:
        return 'Reforço N3';
      case DonationType.ADM_N3:
        return 'ADM N3';
      case DonationType.FINAL_PAYMENT_N3:
        return 'Pagamento Final N3';
      default:
        return 'Doação';
    }
  };

  const getInitials = (name?: string): string => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getAvatarColor = (name?: string): string => {
    if (!name) return 'bg-gray-500';
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

  const handleViewComprovante = async () => {
    try {
      setError(null);
      const result: ComprovanteUrlResponse = await donationAPI.getComprovanteUrl(donation.id);
      setComprovanteUrl(result.comprovanteUrl);
      setViewingComprovante(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar comprovante');
    }
  };

  const handleConfirmReceipt = async () => {
    console.log('🟢 Confirm button clicked for donation:', donation.id);
    try {
      setConfirming(true);
      setError(null);
      console.log('🔄 Making API call to confirm donation...');
      await donationAPI.confirmDonation({ donationId: donation.id });
      console.log('✅ Donation confirmed successfully');
      onUpdate(); // Refresh the donations list
    } catch (err: any) {
      console.error('❌ Error confirming donation:', err);
      setError(err.message || 'Erro ao confirmar recebimento');
    } finally {
      setConfirming(false);
    }
  };

  const closeComprovanteModal = () => {
    setViewingComprovante(false);
    setComprovanteUrl(null);
  };

  const handleReportDonation = async () => {
    if (!reportData.reason.trim()) {
      setError('Por favor, informe o motivo do reporte');
      return;
    }

    try {
      setReporting(true);
      setError(null);
      await donationAPI.reportDonation(donation.id, reportData);
      setReportSuccess(true);
      setReportData({ reason: '', additionalInfo: '' });
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar reporte');
    } finally {
      setReporting(false);
    }
  };

  // Auto-close modal after successful report
  useEffect(() => {
    if (reportSuccess) {
      const timer = setTimeout(() => {
        setShowReportModal(false);
        setReportSuccess(false);
      }, 3000); // Close after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [reportSuccess]);

  const openReportModal = () => {
    setShowReportModal(true);
    setError(null);
    setReportSuccess(false);
  };

  const closeReportModal = () => {
    setShowReportModal(false);
    setReportData({ reason: '', additionalInfo: '' });
    setError(null);
    setReportSuccess(false);
  };

  const isComprovanteSent = donation.status === DonationStatus.PENDING_CONFIRMATION;

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4 flex-1">
            {/* Donor Avatar */}
            <div className="flex-shrink-0">
              {formatAvatarUrl(donation.donor?.avatarUrl) ? (
                <img
                  className="h-12 w-12 rounded-full object-cover"
                  src={formatAvatarUrl(donation.donor.avatarUrl)!}
                  alt={donation.donor.name}
                />
              ) : (
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${getAvatarColor(donation.donor?.name)}`}>
                  <span className="text-white text-lg font-semibold">
                    {getInitials(donation.donor?.name)}
                  </span>
                </div>
              )}
            </div>

            {/* Donation Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {donation.donor?.name}
                </h3>
                <span className="text-sm text-gray-500">#{donation.donor?.id.slice(-3)}</span>
              </div>

              {/* Amount */}
              <div className="mb-3">
                <p className="text-sm text-gray-500">Valor:</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(donation.amount)}</p>
              </div>

              {/* Donation Type */}
              <div className="mb-3">
                <p className="text-sm text-gray-500">Tipo de Doação:</p>
                <p className="text-sm font-medium text-blue-600">{getDonationTypeLabel(donation.type)}</p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex-shrink-0 ml-4">
            <div className="text-right">
              {isComprovanteSent ? (
                <div className="flex items-center text-green-600 mb-2">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">Comprovante Enviado!</span>
                </div>
              ) : (
                <div className="flex items-center text-orange-600 mb-2">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">Aguardando pagamento</span>
                </div>
              )}
              <div className="text-sm text-gray-500">
                Verifique sua conta
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {isComprovanteSent ? (
          <>
            <div className="flex justify-center space-x-3 mb-4">
              <button
                onClick={handleViewComprovante}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver Comprovante
              </button>

              <button
                onClick={handleConfirmReceipt}
                disabled={confirming}
                className="inline-flex items-center px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {confirming ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Confirmando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirmar Recebimento
                  </>
                )}
              </button>
            </div>

            {/* Report Button - Available even when comprovante is sent */}
            <div className="flex justify-center">
              {donation.is_reported ? (
                <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-800 font-medium rounded-lg">
                  <Check className="h-4 w-4 mr-2" />
                  Já reportado
                  {donation.report_resolved && (
                    <span className="ml-2 text-green-600 text-sm">(Resolvido)</span>
                  )}
                </div>
              ) : (
                <button
                  onClick={openReportModal}
                  className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 font-medium rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Flag className="h-4 w-4 mr-2" />
                  Reportar não recebimento
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="flex items-center justify-center text-orange-600 mb-2">
              <Clock className="h-5 w-5 mr-2" />
              <span className="font-medium">Aguardando o doador enviar o comprovante...</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Você será notificado quando {donation.donor?.name} enviar o comprovante de pagamento.
            </p>

            {/* Report Button */}
            {donation.is_reported ? (
              <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-800 font-medium rounded-lg">
                <Check className="h-4 w-4 mr-2" />
                Já reportado
                {donation.report_resolved && (
                  <span className="ml-2 text-green-600 text-sm">(Resolvido)</span>
                )}
              </div>
            ) : (
              <button
                onClick={openReportModal}
                className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 font-medium rounded-lg hover:bg-red-200 transition-colors"
              >
                <Flag className="h-4 w-4 mr-2" />
                Reportar não recebimento
              </button>
            )}
          </div>
        )}

        {/* Instructions */}
        {isComprovanteSent && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              <strong>Importante:</strong> Antes de confirmar, verifique se o valor de {formatCurrency(donation.amount)} realmente chegou na sua conta bancária. Esta ação não pode ser desfeita.
            </p>
            <p className="text-sm text-green-700 mt-2">
              <strong>Dica:</strong> Se o comprovante parece suspeito ou você não recebeu o valor, use o botão "Reportar não recebimento" acima.
            </p>
          </div>
        )}
      </div>

      {/* Comprovante Modal */}
      {viewingComprovante && comprovanteUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Comprovante de {donation.donor?.name ?? 'Doador'}
              </h3>
              <button
                onClick={closeComprovanteModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-4">
              <img
                src={comprovanteUrl}
                alt="Comprovante de pagamento"
                className="w-full max-h-96 object-contain rounded-lg border border-gray-200"
              />
            </div>

            <div className="flex justify-end space-x-3 p-4 border-t border-gray-200">
              <button
                onClick={closeComprovanteModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {reportSuccess ? 'Reporte Enviado' : 'Reportar Doação Não Recebida'}
              </h3>
              {!reportSuccess && (
                <button
                  onClick={closeReportModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="p-4">
              {reportSuccess ? (
                <div className="text-center py-8">
                  <div className="mb-4">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                      <Check className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Reporte Enviado com Sucesso!
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Sua denúncia foi registrada e nossa equipe irá analisar o caso em breve.
                  </p>
                  <p className="text-xs text-gray-500">
                    Esta janela será fechada automaticamente em alguns segundos...
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Você está reportando que não recebeu a doação de <strong>{formatCurrency(donation.amount)}</strong> de <strong>{donation.donor?.name}</strong>.
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Motivo do reporte *
                    </label>
                    <textarea
                      value={reportData.reason}
                      onChange={(e) => setReportData({ ...reportData, reason: e.target.value })}
                      placeholder="Descreva o motivo do reporte..."
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Informações adicionais (opcional)
                    </label>
                    <textarea
                      value={reportData.additionalInfo}
                      onChange={(e) => setReportData({ ...reportData, additionalInfo: e.target.value })}
                      placeholder="Adicione qualquer informação adicional que possa ajudar..."
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      rows={2}
                    />
                  </div>

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
                        <span className="text-sm text-red-700">{error}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={closeReportModal}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleReportDonation}
                      disabled={reporting || !reportData.reason.trim()}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {reporting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                          Enviando...
                        </>
                      ) : (
                        'Enviar Reporte'
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
