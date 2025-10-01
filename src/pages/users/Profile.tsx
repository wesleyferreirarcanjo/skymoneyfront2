import React, { useState, useEffect, useRef } from 'react';
import { authAPI } from '../../lib/api';
import { formatDate } from '../../lib/dateUtils';
import { Mail, Phone, MapPin, Calendar, Building, Hash, Key, QrCode, CheckCircle, XCircle, Copy, Camera } from 'lucide-react';
import { User as UserType } from '../../types/user';

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<UserType | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const userData = await authAPI.getProfile();
      setProfileData(userData);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
      console.log(`${label} copiado para a área de transferência`);
    } catch (err) {
      console.error('Erro ao copiar:', err);
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

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const validateImage = (file: File): Promise<{ valid: boolean; error?: string }> => {
    return new Promise((resolve) => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        resolve({ valid: false, error: 'Por favor, selecione um arquivo de imagem válido.' });
        return;
      }

      // Check file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        resolve({ valid: false, error: 'A imagem deve ter no máximo 5MB.' });
        return;
      }

      // Check dimensions
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        if (img.width !== 400 || img.height !== 400) {
          resolve({ valid: false, error: 'A imagem deve ter exatamente 400x400 pixels.' });
        } else {
          resolve({ valid: true });
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({ valid: false, error: 'Erro ao carregar a imagem.' });
      };

      img.src = objectUrl;
    });
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadMessage(null);
    setUploadingAvatar(true);

    try {
      // Validate image
      const validation = await validateImage(file);
      if (!validation.valid) {
        setUploadMessage({ type: 'error', text: validation.error || 'Erro na validação da imagem.' });
        setUploadingAvatar(false);
        return;
      }

      // Convert to base64
      const base64Image = await convertToBase64(file);

      // Upload to server
      await authAPI.uploadAvatar(base64Image);

      // Refresh profile data
      await fetchProfileData();

      setUploadMessage({ type: 'success', text: 'Avatar atualizado com sucesso!' });
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setUploadMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      setUploadMessage({ 
        type: 'error', 
        text: error.message || 'Erro ao fazer upload do avatar. Tente novamente.' 
      });
    } finally {
      setUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return (
      <div className="ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-gray-600">Carregando perfil...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-64 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Perfil</h1>
            <p className="text-gray-600">Visualize suas informações pessoais</p>
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Picture and Basic Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
                    {profileData?.avatar ? (
                      <img src={profileData.avatar} alt="Avatar" className="w-32 h-32 rounded-full object-cover" />
                    ) : (
                      <div className={`w-full h-full ${getAvatarColor(profileData?.firstName, profileData?.lastName)} flex items-center justify-center`}>
                        <span className="text-white text-4xl font-semibold">
                          {getInitials(profileData?.firstName, profileData?.lastName)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Upload Avatar Button */}
                  <button
                    onClick={handleAvatarClick}
                    disabled={uploadingAvatar}
                    className="absolute bottom-2 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    title="Alterar foto de perfil (400x400px)"
                  >
                    {uploadingAvatar ? (
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </button>
                  
                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* Upload Message */}
                {uploadMessage && (
                  <div className={`mt-2 text-xs px-3 py-2 rounded ${
                    uploadMessage.type === 'success' 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {uploadMessage.text}
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-2">
                  Imagem: 400x400px
                </p>

                <h2 className="text-xl font-semibold text-gray-800 mt-3">
                  {profileData?.firstName} {profileData?.lastName}
                </h2>
                <p className="text-gray-600">{profileData?.email}</p>
                <div className="mt-4">
                  <div className="flex items-center justify-center">
                    {profileData?.adminApproved ? (
                      <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <XCircle className="w-4 h-4 text-yellow-500 mr-1" />
                    )}
                    <span className={`text-xs ${profileData?.adminApproved ? 'text-green-600' : 'text-yellow-600'}`}>
                      {profileData?.adminApproved ? 'Aprovado' : 'Pendente'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Informações Pessoais
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome
                    </label>
                    <p className="text-gray-900">{profileData?.firstName || 'Não informado'}</p>
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sobrenome
                    </label>
                    <p className="text-gray-900">{profileData?.lastName || 'Não informado'}</p>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email
                    </label>
                    <p className="text-gray-900">{profileData?.email}</p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Telefone
                    </label>
                    <p className="text-gray-900">{profileData?.phone || 'Não informado'}</p>
                  </div>

                  {/* CPF */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Hash className="w-4 h-4 inline mr-1" />
                      CPF
                    </label>
                    <p className="text-gray-900">{profileData?.cpf || 'Não informado'}</p>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Data de Nascimento
                    </label>
                    <p className="text-gray-900">{formatDate(profileData?.birthDate || '')}</p>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Endereço
                    </label>
                    <p className="text-gray-900">{profileData?.address || 'Não informado'}</p>
                  </div>

                  {/* Address Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número
                    </label>
                    <p className="text-gray-900">{profileData?.addressNumber || 'Não informado'}</p>
                  </div>

                  {/* CEP */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CEP
                    </label>
                    <p className="text-gray-900">{profileData?.cep || 'Não informado'}</p>
                  </div>
                </div>
              </div>

              {/* Banking Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  Informações Bancárias
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bank */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Banco
                    </label>
                    <p className="text-gray-900">{profileData?.bank || 'Não informado'}</p>
                  </div>

                  {/* Agency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Agência
                    </label>
                    <p className="text-gray-900">{profileData?.agency || 'Não informado'}</p>
                  </div>

                  {/* Account */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Conta
                    </label>
                    <p className="text-gray-900">{profileData?.account || 'Não informado'}</p>
                  </div>
                </div>
              </div>

              {/* PIX Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                  <Key className="w-5 h-5 mr-2" />
                  Informações PIX
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* PIX Key Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Chave PIX
                    </label>
                    <p className="text-gray-900">{profileData?.pixKeyType || 'Não informado'}</p>
                  </div>

                  {/* PIX Key */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chave PIX
                    </label>
                    <p className="text-gray-900">{profileData?.pixKey || 'Não informado'}</p>
                  </div>

                  {/* PIX Owner Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Titular PIX
                    </label>
                    <p className="text-gray-900">{profileData?.pixOwnerName || 'Não informado'}</p>
                  </div>

                  {/* PIX Copy & Paste */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PIX Copia e Cola
                    </label>
                    <div className="relative">
                      <p className="text-gray-900 break-all pr-10">{profileData?.pixCopyPaste || 'Não informado'}</p>
                      {profileData?.pixCopyPaste && (
                        <button
                          onClick={() => copyToClipboard(profileData.pixCopyPaste, 'PIX Copia e Cola')}
                          className="absolute top-0 right-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Copiar PIX"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* PIX QR Code */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      QR Code PIX
                    </label>
                    {profileData?.pixQrCode ? (
                      <div className="flex justify-center">
                        <img 
                          src={`data:image/png;base64,${profileData.pixQrCode}`} 
                          alt="QR Code PIX" 
                          className="w-48 h-48 border border-gray-300 rounded-lg object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling.style.display = 'block';
                          }}
                        />
                        <div className="hidden w-48 h-48 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                          <p className="text-gray-500 text-sm text-center">Erro ao carregar QR Code PIX</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">QR Code PIX não disponível</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Cryptocurrency Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                  <QrCode className="w-5 h-5 mr-2" />
                  Endereços de Criptomoedas
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bitcoin Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Endereço Bitcoin (BTC)
                    </label>
                    <div className="relative">
                      <p className="text-gray-900 break-all pr-10">{profileData?.btcAddress || 'Não informado'}</p>
                      {profileData?.btcAddress && (
                        <button
                          onClick={() => copyToClipboard(profileData.btcAddress, 'Endereço Bitcoin')}
                          className="absolute top-0 right-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Copiar Endereço Bitcoin"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* USDT Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Endereço USDT
                    </label>
                    <div className="relative">
                      <p className="text-gray-900 break-all pr-10">{profileData?.usdtAddress || 'Não informado'}</p>
                      {profileData?.usdtAddress && (
                        <button
                          onClick={() => copyToClipboard(profileData.usdtAddress, 'Endereço USDT')}
                          className="absolute top-0 right-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Copiar Endereço USDT"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* QR Codes Section */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bitcoin QR Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      QR Code Bitcoin (BTC)
                    </label>
                    {profileData?.btcQrCode ? (
                      <div className="flex justify-center">
                        <img 
                          src={`data:image/png;base64,${profileData.btcQrCode}`} 
                          alt="QR Code Bitcoin" 
                          className="w-48 h-48 border border-gray-300 rounded-lg object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling.style.display = 'block';
                          }}
                        />
                        <div className="hidden w-48 h-48 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                          <p className="text-gray-500 text-sm text-center">Erro ao carregar QR Code Bitcoin</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">QR Code Bitcoin não disponível</p>
                    )}
                  </div>

                  {/* USDT QR Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      QR Code USDT
                    </label>
                    {profileData?.usdtQrCode ? (
                      <div className="flex justify-center">
                        <img 
                          src={`data:image/png;base64,${profileData.usdtQrCode}`} 
                          alt="QR Code USDT" 
                          className="w-48 h-48 border border-gray-300 rounded-lg object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling.style.display = 'block';
                          }}
                        />
                        <div className="hidden w-48 h-48 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                          <p className="text-gray-500 text-sm text-center">Erro ao carregar QR Code USDT</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">QR Code USDT não disponível</p>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
