import React, { useState, useEffect } from 'react';
import { authAPI } from '../../lib/api';
import { formatDate } from '../../lib/dateUtils';
import { User, Mail, Phone, MapPin, Calendar, Building, Hash, Key, QrCode, CheckCircle, XCircle, Copy } from 'lucide-react';
import { User as UserType } from '../../types/user';

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<UserType | null>(null);

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
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  {profileData?.avatar ? (
                    <img src={profileData.avatar} alt="Avatar" className="w-32 h-32 rounded-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
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
