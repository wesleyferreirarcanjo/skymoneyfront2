import { useState } from 'react';
import { donationAPI } from '../lib/api';
import { UpgradeAvailable, AcceptUpgradeRequest } from '../types/donation';
import { X, CheckCircle, ArrowUp, DollarSign, Info, Loader2 } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  upgradeInfo: UpgradeAvailable;
  onUpgradeSuccess: (newLevel: number) => void;
}

export default function UpgradeModal({ 
  isOpen, 
  onClose, 
  upgradeInfo, 
  onUpgradeSuccess 
}: UpgradeModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleAcceptUpgrade = async () => {
    if (!upgradeInfo.can_afford) {
      setError('Saldo insuficiente para realizar o upgrade');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      const upgradeRequest: AcceptUpgradeRequest = {
        from_level: upgradeInfo.from_level,
        to_level: upgradeInfo.to_level
      };

      const response = await donationAPI.acceptUpgrade(upgradeRequest);
      
      // Success!
      onUpgradeSuccess(response.new_level);
      onClose();
    } catch (err: any) {
      console.error('Erro ao realizar upgrade:', err);
      setError(err.message || 'Erro ao processar upgrade. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mr-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                🎉 Parabéns!
              </h3>
              <p className="text-sm text-gray-600">
                Você completou o Nível {upgradeInfo.from_level}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Success Message */}
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900 mb-2">
              Nível {upgradeInfo.from_level} Concluído! ✅
            </p>
            <p className="text-gray-600">
              Você recebeu um total de {formatCurrency(upgradeInfo.user_balance)} em doações
            </p>
          </div>

          {/* Upgrade Information */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center mb-3">
              <ArrowUp className="h-5 w-5 text-blue-600 mr-2" />
              <h4 className="font-medium text-blue-900">
                Upgrade para Nível {upgradeInfo.to_level}
              </h4>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">Valor do Upgrade:</span>
                <span className="font-medium text-blue-900">
                  {formatCurrency(upgradeInfo.requirements.upgrade_amount)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">Cascata N{upgradeInfo.from_level}:</span>
                <span className="font-medium text-blue-900">
                  {formatCurrency(upgradeInfo.requirements.cascade_amount)}
                </span>
              </div>
              
              <hr className="border-blue-200" />
              
              <div className="flex justify-between items-center">
                <span className="font-medium text-blue-900">Total:</span>
                <span className="font-bold text-blue-900 text-lg">
                  {formatCurrency(upgradeInfo.requirements.total)}
                </span>
              </div>
            </div>
          </div>

          {/* User Balance */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <DollarSign className="h-5 w-5 text-gray-600 mr-2" />
              <span className="font-medium text-gray-800">Seu Saldo Atual:</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(upgradeInfo.user_balance)}
            </p>
          </div>

          {/* Affordability Check */}
          {!upgradeInfo.can_afford && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center">
                <X className="h-5 w-5 text-red-600 mr-2" />
                <span className="font-medium text-red-800">
                  Saldo Insuficiente
                </span>
              </div>
              <p className="text-sm text-red-700 mt-1">
                Você precisa de {formatCurrency(upgradeInfo.requirements.total - upgradeInfo.user_balance)} a mais para fazer o upgrade.
              </p>
            </div>
          )}

          {/* Info */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">O que acontece quando você faz o upgrade:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Você será movido para o Nível {upgradeInfo.to_level}</li>
                  <li>Duas doações serão criadas automaticamente</li>
                  <li>Uma doação de upgrade para o próximo nível</li>
                  <li>Uma doação de cascata para ajudar outros usuários</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center">
                <X className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Fazer Depois
          </button>
          
          <button
            onClick={handleAcceptUpgrade}
            disabled={isProcessing || !upgradeInfo.can_afford}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <ArrowUp className="h-4 w-4 mr-2" />
                Fazer Upgrade Agora
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
