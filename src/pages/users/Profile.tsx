import React, { useState, useEffect } from 'react';
import { authAPI } from '../../lib/api';
import { formatDate } from '../../lib/dateUtils';
import { User, Mail, Phone, MapPin, Calendar, Edit3, Save, X, Building, Hash, Key, QrCode, CheckCircle, XCircle, Copy } from 'lucide-react';
import { User as UserType } from '../../types/user';

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<UserType | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cpf: '',
    birthDate: '',
    address: '',
    addressNumber: '',
    cep: '',
    bank: '',
    agency: '',
    account: '',
    pixKey: '',
    pixKeyType: '',
    pixOwnerName: '',
    pixCopyPaste: '',
    btcAddress: '',
    usdtAddress: '',
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const userData = await authAPI.getProfile();
      setProfileData(userData);
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        cpf: userData.cpf || '',
        birthDate: userData.birthDate || '',
        address: userData.address || '',
        addressNumber: userData.addressNumber || '',
        cep: userData.cep || '',
        bank: userData.bank || '',
        agency: userData.agency || '',
        account: userData.account || '',
        pixKey: userData.pixKey || '',
        pixKeyType: userData.pixKeyType || '',
        pixOwnerName: userData.pixOwnerName || '',
        pixCopyPaste: userData.pixCopyPaste || '',
        btcAddress: userData.btcAddress || '',
        usdtAddress: userData.usdtAddress || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving profile data:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset form data to original values
    if (profileData) {
      setFormData({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        cpf: profileData.cpf || '',
        birthDate: profileData.birthDate || '',
        address: profileData.address || '',
        addressNumber: profileData.addressNumber || '',
        cep: profileData.cep || '',
        bank: profileData.bank || '',
        agency: profileData.agency || '',
        account: profileData.account || '',
        pixKey: profileData.pixKey || '',
        pixKeyType: profileData.pixKeyType || '',
        pixOwnerName: profileData.pixOwnerName || '',
        pixCopyPaste: profileData.pixCopyPaste || '',
        btcAddress: profileData.btcAddress || '',
        usdtAddress: profileData.usdtAddress || '',
      });
    }
    setIsEditing(false);
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Perfil</h1>
              <p className="text-gray-600">Gerencie suas informações pessoais</p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                isEditing
                  ? 'bg-gray-500 hover:bg-gray-600 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Editar
                </>
              )}
            </button>
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
                    {isEditing ? (
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData?.firstName || 'Não informado'}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sobrenome
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData?.lastName || 'Não informado'}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData?.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Telefone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="(11) 99999-9999"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData?.phone || 'Não informado'}</p>
                    )}
                  </div>

                  {/* CPF */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Hash className="w-4 h-4 inline mr-1" />
                      CPF
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="cpf"
                        value={formData.cpf}
                        onChange={handleInputChange}
                        placeholder="000.000.000-00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData?.cpf || 'Não informado'}</p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Data de Nascimento
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        name="birthDate"
                        value={formData.birthDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{formatDate(profileData?.birthDate || '')}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Endereço
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Rua, Avenida, etc."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData?.address || 'Não informado'}</p>
                    )}
                  </div>

                  {/* Address Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="addressNumber"
                        value={formData.addressNumber}
                        onChange={handleInputChange}
                        placeholder="123"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData?.addressNumber || 'Não informado'}</p>
                    )}
                  </div>

                  {/* CEP */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CEP
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="cep"
                        value={formData.cep}
                        onChange={handleInputChange}
                        placeholder="00000-000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData?.cep || 'Não informado'}</p>
                    )}
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
                    {isEditing ? (
                      <input
                        type="text"
                        name="bank"
                        value={formData.bank}
                        onChange={handleInputChange}
                        placeholder="Nome do banco"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData?.bank || 'Não informado'}</p>
                    )}
                  </div>

                  {/* Agency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Agência
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="agency"
                        value={formData.agency}
                        onChange={handleInputChange}
                        placeholder="0000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData?.agency || 'Não informado'}</p>
                    )}
                  </div>

                  {/* Account */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Conta
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="account"
                        value={formData.account}
                        onChange={handleInputChange}
                        placeholder="00000-0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData?.account || 'Não informado'}</p>
                    )}
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
                    {isEditing ? (
                      <select
                        name="pixKeyType"
                        value={formData.pixKeyType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Selecione o tipo</option>
                        <option value="cpf">CPF</option>
                        <option value="email">Email</option>
                        <option value="phone">Telefone</option>
                        <option value="random">Chave Aleatória</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">{profileData?.pixKeyType || 'Não informado'}</p>
                    )}
                  </div>

                  {/* PIX Key */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chave PIX
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="pixKey"
                        value={formData.pixKey}
                        onChange={handleInputChange}
                        placeholder="Sua chave PIX"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData?.pixKey || 'Não informado'}</p>
                    )}
                  </div>

                  {/* PIX Owner Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Titular PIX
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="pixOwnerName"
                        value={formData.pixOwnerName}
                        onChange={handleInputChange}
                        placeholder="Nome completo do titular"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData?.pixOwnerName || 'Não informado'}</p>
                    )}
                  </div>

                  {/* PIX Copy & Paste */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PIX Copia e Cola
                    </label>
                    {isEditing ? (
                      <textarea
                        name="pixCopyPaste"
                        value={formData.pixCopyPaste}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Código PIX para copiar e colar"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
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
                    )}
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
                    {isEditing ? (
                      <input
                        type="text"
                        name="btcAddress"
                        value={formData.btcAddress}
                        onChange={handleInputChange}
                        placeholder="Endereço da carteira Bitcoin"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
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
                    )}
                  </div>

                  {/* USDT Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Endereço USDT
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="usdtAddress"
                        value={formData.usdtAddress}
                        onChange={handleInputChange}
                        placeholder="Endereço da carteira USDT"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
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
                    )}
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

              {/* Save/Cancel Buttons */}
              {isEditing && (
                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <button
                    onClick={handleCancel}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
