import React from 'react';
import { DonationHistory as DonationHistoryType, DonationHistoryItem, DonationType, DonationStatus } from '../types/donation';
import { User, ArrowUpRight, ArrowDownLeft, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

interface DonationHistoryProps {
  donations: DonationHistoryType | null;
  loading: boolean;
}

export default function DonationHistory({ donations, loading }: DonationHistoryProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Data não disponível';

    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return 'Data inválida';
    }

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const getStatusBadge = (status: DonationStatus) => {
    switch (status) {
      case DonationStatus.CONFIRMED:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Concluída
          </span>
        );
      case DonationStatus.CANCELLED:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelada
          </span>
        );
      case DonationStatus.EXPIRED:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            <Clock className="h-3 w-3 mr-1" />
            Expirada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-300 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!donations || donations.data.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhum histórico encontrado
        </h3>
        <p className="text-gray-600">
          Suas doações concluídas aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {donations.data.map((donation: DonationHistoryItem) => {
        // Determine if this donation was sent or received by current user
        const isOutgoing = donation.role === 'DONOR';

        const contactPerson = isOutgoing ? donation.receiver : donation.donor;

        return (
          <div key={donation.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {contactPerson?.avatarUrl ? (
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      src={contactPerson.avatarUrl}
                      alt={contactPerson.name}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                  )}
                </div>

                {/* Donation Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    {isOutgoing ? (
                      <ArrowUpRight className="h-4 w-4 text-red-500" />
                    ) : (
                      <ArrowDownLeft className="h-4 w-4 text-green-500" />
                    )}
                    <span className="text-sm font-medium text-gray-900">
                      {isOutgoing ? 'Enviado para' : 'Recebido de'} {contactPerson?.name}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{formatCurrency(donation.amount)}</span>
                    <span>•</span>
                    <span>{getDonationTypeLabel(donation.type)}</span>
                    <span>•</span>
                    <span>{formatDate(donation.completedAt ?? '')}</span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex-shrink-0">
                {getStatusBadge(donation.status)}
              </div>
            </div>

            {/* Additional Details for Completed Donations */}
            {donation.status === DonationStatus.CONFIRMED && donation.completedAt && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  Concluída em {formatDate(donation.completedAt)}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Load More Button (if needed) */}
      {donations && donations.pagination.currentPage < donations.pagination.totalPages && (
        <div className="text-center pt-4">
          <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors">
            Carregar mais
          </button>
        </div>
      )}
    </div>
  );
}
