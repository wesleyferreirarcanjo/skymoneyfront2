import { useState, useEffect } from 'react';
import { donationAPI } from '../../lib/api';
import type { Donation, DonationStats, DonationHistory } from '../../types/donation';
import { AlertCircle, Clock, CheckCircle, History, DollarSign } from 'lucide-react';
import DonationCardToSend from '../../components/DonationCardToSend';
import DonationCardToReceive from '../../components/DonationCardToReceive';
import DonationHistoryComponent from '../../components/DonationHistory';

type TabType = 'to-send' | 'to-receive' | 'history';

export default function UserDonationsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('to-send');
  const [donationsToSend, setDonationsToSend] = useState<Donation[]>([]);
  const [donationsToReceive, setDonationsToReceive] = useState<Donation[]>([]);
  const [donationHistory, setDonationHistory] = useState<DonationHistory | null>(null);
  const [stats, setStats] = useState<DonationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load stats
      const statsData = await donationAPI.getDonationStats();
      setStats(statsData);

      // Load donations based on active tab
      if (activeTab === 'to-send') {
        const toSend = await donationAPI.getDonationsToSend();
        setDonationsToSend(toSend);
      } else if (activeTab === 'to-receive') {
        const toReceive = await donationAPI.getDonationsToReceive();
        setDonationsToReceive(toReceive);
      } else if (activeTab === 'history') {
        const history = await donationAPI.getDonationHistory();
        setDonationHistory(history);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados das doações');
      console.error('Load donations data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = async (tab: TabType) => {
    setActiveTab(tab);

    // Load data for the new tab if not already loaded
    if (tab === 'to-send' && donationsToSend.length === 0) {
      try {
        const toSend = await donationAPI.getDonationsToSend();
        setDonationsToSend(toSend);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar doações a enviar');
      }
    } else if (tab === 'to-receive' && donationsToReceive.length === 0) {
      try {
        const toReceive = await donationAPI.getDonationsToReceive();
        setDonationsToReceive(toReceive);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar doações a receber');
      }
    } else if (tab === 'history' && !donationHistory) {
      try {
        const history = await donationAPI.getDonationHistory();
        setDonationHistory(history);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar histórico');
      }
    }
  };

  const handleDonationUpdate = () => {
    // Reload all data
    loadData();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getTabCount = (tab: TabType) => {
    switch (tab) {
      case 'to-send':
        return donationsToSend.length;
      case 'to-receive':
        return donationsToReceive.length;
      case 'history':
        return donationHistory?.data.length || 0;
      default:
        return 0;
    }
  };

  if (loading && !stats) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="h-12 bg-gray-300 rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-300 rounded"></div>
              <div className="h-32 bg-gray-300 rounded"></div>
              <div className="h-32 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Doações</h1>
          <p className="text-gray-600">Gerencie suas doações e contribuições</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Doado</p>
                  <p className="text-2xl font-bold text-blue-900">{formatCurrency(stats.totalDonated)}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-600">Total Recebido</p>
                  <p className="text-2xl font-bold text-green-900">{formatCurrency(stats.totalReceived)}</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-yellow-600">A Fazer</p>
                  <p className="text-2xl font-bold text-yellow-900">{stats.pendingToSend}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-purple-600">A Receber</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.pendingToReceive}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => handleTabChange('to-send')}
                className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'to-send'
                    ? 'border-yellow-500 text-yellow-600 bg-yellow-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Clock className="h-4 w-4 mr-2" />
                A Fazer
                {getTabCount('to-send') > 0 && (
                  <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                    {getTabCount('to-send')}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleTabChange('to-receive')}
                className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'to-receive'
                    ? 'border-green-500 text-green-600 bg-green-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                A Receber
                {getTabCount('to-receive') > 0 && (
                  <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                    {getTabCount('to-receive')}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleTabChange('history')}
                className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'history'
                    ? 'border-gray-500 text-gray-600 bg-gray-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <History className="h-4 w-4 mr-2" />
                Histórico
                {getTabCount('history') > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
                    {getTabCount('history')}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <span className="text-red-700">{error}</span>
                </div>
              </div>
            )}

            {activeTab === 'to-send' && (
              <div>
                {donationsToSend.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="mx-auto h-16 w-16 text-green-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhuma tarefa pendente! 🎉
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Você não tem doações para enviar no momento.
                    </p>
                    {stats && (
                      <div className="text-sm text-gray-500">
                        <p>Sua posição na fila: #{stats.queuePosition}</p>
                        {stats.nextMonthlyContribution && (
                          <p>Próxima contribuição mensal: {new Date(stats.nextMonthlyContribution).toLocaleDateString('pt-BR')}</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {donationsToSend.map((donation) => (
                      <DonationCardToSend
                        key={donation.id}
                        donation={donation}
                        onUpdate={handleDonationUpdate}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'to-receive' && (
              <div>
                {donationsToReceive.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhuma doação aguardando
                    </h3>
                    <p className="text-gray-600">
                      Você não tem doações para receber no momento.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {donationsToReceive.map((donation) => (
                      <DonationCardToReceive
                        key={donation.id}
                        donation={donation}
                        onUpdate={handleDonationUpdate}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <DonationHistoryComponent donations={donationHistory} loading={loading} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
