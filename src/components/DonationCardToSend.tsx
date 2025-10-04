import React, { useState } from 'react';
import { Donation, DonationType, DonationStatus } from '../types/donation';
import { donationAPI } from '../lib/api';
import { User, CreditCard, Calendar, Clock, Upload, Copy, Check, AlertCircle, MessageCircle } from 'lucide-react';

interface DonationCardToSendProps {
  donation: Donation;
  onUpdate: () => void;
}

export default function DonationCardToSend({ donation, onUpdate }: DonationCardToSendProps) {
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const getTimeRemaining = (deadline?: string) => {
    if (!deadline) return 'Prazo não definido';

    const now = new Date();
    const expiry = new Date(deadline);
    const diffMs = expiry.getTime() - now.getTime();

    if (diffMs <= 0) return 'Expirado';

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  };

  const handleCopyPixKey = async () => {
    try {
      const pixKey = donation.receiver?.pixCopyPaste || donation.receiver?.pixKey;
      if (pixKey) {
        await navigator.clipboard.writeText(pixKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy PIX key:', err);
    }
  };

  const getWhatsAppLink = (phone?: string): string => {
    if (!phone) return '#';
    const cleanPhone = phone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const message = encodeURIComponent('Ola eu sou um test');
    return `https://wa.me/${phoneWithCountry}?text=${message}`;
  };

  const getPhoneFromProfileOrPix = (phone?: string, pixKey?: string): string | undefined => {
    // Prefer explicit phone
    if (phone && phone.replace(/\D/g, '').length >= 10) return phone;
    // Try to derive from PIX key if it looks like a phone
    if (pixKey) {
      const digits = pixKey.replace(/\D/g, '');
      if (digits.length >= 10 && digits.length <= 13) {
        return digits;
      }
    }
    return undefined;
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const dataUrl = reader.result as string;
        // Extract base64 part (remove data:image/...;base64, prefix)
        const base64 = dataUrl.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione apenas arquivos de imagem (JPG, PNG, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Arquivo muito grande. Máximo 5MB permitido.');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // Convert file to base64
      const base64String = await fileToBase64(file);

      await donationAPI.sendComprovante({ 
        donationId: donation.id, 
        comprovanteBase64: base64String 
      });

      // Success - refresh the donations list
      onUpdate();

      // Clear the file input
      event.target.value = '';

    } catch (err: any) {
      setError(err.message || 'Erro ao enviar comprovante');
    } finally {
      setUploading(false);
    }
  };


  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4 flex-1">
          {/* Receiver Avatar */}
          <div className="flex-shrink-0">
            {formatAvatarUrl(donation.receiver?.avatarUrl) ? (
              <img
                className="h-12 w-12 rounded-full object-cover"
                src={formatAvatarUrl(donation.receiver.avatarUrl)!}
                alt={donation.receiver?.firstName && donation.receiver?.lastName 
                  ? `${donation.receiver.firstName} ${donation.receiver.lastName}`
                  : donation.receiver?.name}
              />
            ) : (
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${getAvatarColor(donation.receiver?.firstName, donation.receiver?.lastName)}`}>
                <span className="text-white text-lg font-semibold">
                  {getInitials(donation.receiver?.firstName, donation.receiver?.lastName)}
                </span>
              </div>
            )}
          </div>

          {/* Donation Info */}
          <div className="flex-1 min-w-0">
            <div className="mb-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {donation.receiver?.firstName && donation.receiver?.lastName 
                  ? `${donation.receiver.firstName} ${donation.receiver.lastName}`
                  : donation.receiver?.name}
              </h3>
              {donation.receiver_queue_position !== undefined && donation.receiver_queue_level !== undefined && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Fila N{donation.receiver_queue_level} - Pos #{donation.receiver_queue_position}
                </span>
              )}
            </div>

            {/* User Details */}
            {(donation.receiver?.firstName || donation.receiver?.email || donation.receiver?.phone || donation.receiver?.pixOwnerName) && (
              <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs font-semibold text-gray-700 mb-2">Informações do Recebedor:</p>
                <div className="space-y-1">
                  {(donation.receiver?.firstName || donation.receiver?.lastName) && (
                    <div className="flex items-center text-sm">
                      <span className="text-gray-600 w-20">Nome:</span>
                      <span className="text-gray-900 font-medium">
                        {donation.receiver.firstName} {donation.receiver.lastName}
                      </span>
                    </div>
                  )}
                  {donation.receiver?.email && (
                    <div className="flex items-center text-sm">
                      <span className="text-gray-600 w-20">Email:</span>
                      <span className="text-gray-900 font-medium">{donation.receiver.email}</span>
                    </div>
                  )}
                  {donation.receiver?.phone && (
                    <div className="flex items-center text-sm">
                      <span className="text-gray-600 w-20">Telefone:</span>
                      <span className="text-gray-900 font-medium">{donation.receiver.phone}</span>
                    </div>
                  )}
                  {donation.receiver?.pixOwnerName && (
                    <div className="flex items-center text-sm">
                      <span className="text-gray-600 w-20">Titular PIX:</span>
                      <span className="text-gray-900 font-medium">{donation.receiver.pixOwnerName}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

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

            {/* Payment Methods */}
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-3">Métodos de Pagamento:</p>
              
              {/* PIX */}
              {donation.receiver?.pixKey && (
                <div className="mb-3">
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">PIX</p>
                        <p className="text-sm font-mono text-gray-700">{donation.receiver.pixCopyPaste || donation.receiver.pixKey}</p>
                      </div>
                      <button
                        onClick={handleCopyPixKey}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
                        title="Copiar chave PIX"
                      >
                        {copied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        <span className="text-xs">{copied ? 'Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>
                    {donation.receiver?.pixQrCode && (
                      <div className="flex justify-center">
                        <img 
                          src={donation.receiver.pixQrCode} 
                          alt="QR Code PIX" 
                          className="w-24 h-24 border border-gray-200 rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bitcoin */}
              {donation.receiver?.btcAddress && (
                <div className="mb-3">
                  <div className="bg-orange-50 p-3 rounded-md border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-orange-900">Bitcoin (BTC)</p>
                        <p className="text-sm font-mono text-orange-700 break-all">{donation.receiver.btcAddress}</p>
                      </div>
                      <button
                        onClick={() => donation.receiver?.btcAddress && navigator.clipboard.writeText(donation.receiver.btcAddress)}
                        className="flex items-center space-x-1 text-orange-600 hover:text-orange-800 transition-colors"
                        title="Copiar endereço Bitcoin"
                      >
                        <Copy className="h-4 w-4" />
                        <span className="text-xs">Copiar</span>
                      </button>
                    </div>
                    {donation.receiver?.btcQrCode && (
                      <div className="flex justify-center">
                        <img 
                          src={donation.receiver.btcQrCode} 
                          alt="QR Code Bitcoin" 
                          className="w-24 h-24 border border-orange-200 rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* USDT */}
              {donation.receiver?.usdtAddress && (
                <div className="mb-3">
                  <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-blue-900">USDT (Tether)</p>
                        <p className="text-sm font-mono text-blue-700 break-all">{donation.receiver.usdtAddress}</p>
                      </div>
                      <button
                        onClick={() => donation.receiver?.usdtAddress && navigator.clipboard.writeText(donation.receiver.usdtAddress)}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
                        title="Copiar endereço USDT"
                      >
                        <Copy className="h-4 w-4" />
                        <span className="text-xs">Copiar</span>
                      </button>
                    </div>
                    {donation.receiver?.usdtQrCode && (
                      <div className="flex justify-center">
                        <img 
                          src={donation.receiver.usdtQrCode} 
                          alt="QR Code USDT" 
                          className="w-24 h-24 border border-blue-200 rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* WhatsApp Contact */}
            {(() => {
              const phone = getPhoneFromProfileOrPix(donation.receiver?.phone, donation.receiver?.pixKey);
              return phone ? (
                <div className="mb-4">
                  <a
                    href={getWhatsAppLink(phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Contatar via WhatsApp</span>
                  </a>
                </div>
              ) : null;
            })()}
          </div>
        </div>

        {/* Status and Deadline */}
        <div className="flex-shrink-0 ml-4">
          <div className="text-right">
            <div className="flex items-center text-orange-600 mb-2">
              <Clock className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Aguardando seu envio</span>
            </div>
            <div className="text-sm text-gray-500">
              Prazo: {getTimeRemaining(donation.deadline)}
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

      {/* Action Button */}
      <div className="flex justify-center">
        <label className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Enviando...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Enviar Comprovante
            </>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>Instruções:</strong> 1) Escolha um método de pagamento acima (PIX, Bitcoin ou USDT). 2) Copie o endereço/chave ou escaneie o QR Code. 3) Faça o pagamento. 4) Tire um print do comprovante. 5) Clique em "Enviar Comprovante" para fazer upload.
        </p>
      </div>
    </div>
  );
}
