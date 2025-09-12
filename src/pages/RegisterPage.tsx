import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, CreditCard, Calendar, DollarSign, ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Progress } from '../components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Textarea } from '../components/ui/textarea';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cpf: '',
    birthDate: '',

    // Banking Info
    cep: '',
    address: '',
    addressNumber: '',
    bank: '',
    agency: '',
    account: '',
    pixKeyType: '',
    pixKey: '',
    pixOwnerName: '',
    pixCopyPaste: '',
    pixQrCode: '',

    // Crypto Info
    btcAddress: '',
    btcQrCode: '',
    usdtAddress: '',
    usdtQrCode: '',
    avatar: 'avatar_male_1',
    password: '',
    confirmPassword: '',

    // Terms
    termsAccepted: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data:image/xxx;base64, prefix to get just the base64 string
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  // Ensure form data type safety
  React.useEffect(() => {
    const hasCorruption = typeof formData.firstName !== 'string' ||
                         typeof formData.lastName !== 'string' ||
                         typeof formData.email !== 'string';

    if (hasCorruption) {
      setFormData(prev => ({
        ...prev,
        firstName: String(prev.firstName || ''),
        lastName: String(prev.lastName || ''),
        email: String(prev.email || ''),
        phone: String(prev.phone || ''),
        cpf: String(prev.cpf || ''),
        birthDate: String(prev.birthDate || ''),
      }));
    }
  }, [formData.firstName, formData.lastName, formData.email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value?: any; checked?: boolean; files?: FileList } }) => {
    const target = e.target;
    const { name } = target;

    const inputType = 'type' in target ? target.type : 'unknown';

    // Handle file inputs specifically - convert to base64
    if (inputType === 'file' && 'files' in target && target.files && target.files.length > 0) {
      const file = target.files[0];
      fileToBase64(file).then(base64 => {
        setFormData(prev => ({
          ...prev,
          [name]: base64,
        }));
      }).catch(error => {
        console.error('Error converting file to base64:', error);
        setValidationError('Erro ao processar a imagem. Tente novamente.');
      });
      return;
    }

    // Handle checkbox inputs specifically
    if (inputType === 'checkbox' && 'checked' in target) {
      setFormData(prev => ({
        ...prev,
        [name]: target.checked,
      }));
      return;
    }

    // Handle all other inputs (text, email, tel, date, etc.) - they all have .value
    if ('value' in target) {
      setFormData(prev => {
        const newData = {
          ...prev,
          [name]: target.value,
        };

        // Auto-fill pixKey with email if pixKey is empty and we're updating email
        if (name === 'email' && (!prev.pixKey || prev.pixKey === '')) {
          newData.pixKey = target.value;
        }

        return newData;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const fetchAddressByCep = async (cep: string) => {
    if (cep.length === 8 || cep.length === 9) {
      try {
        const cleanCep = cep.replace(/\D/g, '');
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();

        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            address: `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`,
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  const validateCurrentStep = () => {
    setValidationError('');

    // Common regex patterns
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{11}$/;
    const cepRegex = /^\d{8}$/;

    switch (currentStep) {
      case 1: // Personal Info
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.cpf || !formData.birthDate) {
          setValidationError('Por favor, preencha todos os campos obrigatórios');
          return false;
        }
        if (formData.cpf.length !== 11) {
          setValidationError('CPF deve ter 11 dígitos');
          return false;
        }
        // Validate email format
        if (!emailRegex.test(formData.email)) {
          setValidationError('Por favor, insira um email válido');
          return false;
        }
        // Validate phone format (Brazilian phone)
        if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
          setValidationError('Por favor, insira um telefone válido (11 dígitos)');
          return false;
        }
        // Validate birth date (must be 18+)
        const birthDate = new Date(formData.birthDate);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 18) {
          setValidationError('Você deve ter pelo menos 18 anos para se cadastrar');
          return false;
        }
        break;

      case 2: // Banking Info
        if (!formData.cep || !formData.address || !formData.addressNumber || !formData.bank || !formData.agency || !formData.account || !formData.pixKeyType || !formData.pixKey || !formData.pixOwnerName || !formData.pixCopyPaste || !formData.pixQrCode) {
          setValidationError('Por favor, preencha todos os campos bancários obrigatórios');
          return false;
        }
        // Validate CEP format
        if (!cepRegex.test(formData.cep.replace(/\D/g, ''))) {
          setValidationError('CEP deve ter 8 dígitos');
          return false;
        }
        // Validate PIX key based on type
        if (formData.pixKeyType === 'email' && !emailRegex.test(formData.pixKey)) {
          setValidationError('Chave PIX deve ser um email válido');
          return false;
        }
        if (formData.pixKeyType === 'phone' && !phoneRegex.test(formData.pixKey.replace(/\D/g, ''))) {
          setValidationError('Chave PIX deve ser um telefone válido (11 dígitos)');
          return false;
        }
        if (formData.pixKeyType === 'cpf' && !/^\d{11}$/.test(formData.pixKey.replace(/\D/g, ''))) {
          setValidationError('Chave PIX deve ser um CPF válido (11 dígitos)');
          return false;
        }
        break;

      case 3: // Crypto Info
        if (!formData.password || !formData.confirmPassword) {
          setValidationError('Por favor, preencha todos os campos');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setValidationError('As senhas não coincidem');
          return false;
        }
        if (formData.password.length < 6) {
          setValidationError('A senha deve ter pelo menos 6 caracteres');
          return false;
        }
        // Validate Bitcoin address if provided
        if (formData.btcAddress) {
          const btcRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/;
          if (!btcRegex.test(formData.btcAddress)) {
            setValidationError('Endereço Bitcoin inválido');
            return false;
          }
        }
        // Validate USDT address if provided
        if (formData.usdtAddress) {
          const usdtRegex = /^0x[a-fA-F0-9]{40}$/;
          if (!usdtRegex.test(formData.usdtAddress)) {
            setValidationError('Endereço USDT inválido');
            return false;
          }
        }
        break;

      case 4: // Terms
        if (!formData.termsAccepted) {
          setValidationError('Você deve aceitar os termos e condições');
          return false;
        }
        break;
    }

    return true;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setValidationError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep < totalSteps) {
      nextStep();
      return;
    }

    if (!validateCurrentStep()) {
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      const { confirmPassword, termsAccepted, ...registerData } = formData;
      await register(registerData);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = validationError || error;

  const stepTitles = [
    'Informações Pessoais',
    'Informações Bancárias',
    'Informações Crypto',
    'Termos e Condições'
  ];

  const renderPersonalInfoStep = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Nome</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-skymoney-teal-500" />
            <Input
              id="firstName"
              name="firstName"
              type="text"
              placeholder="João"
              value={String(formData.firstName || '')}
              onChange={handleChange}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Sobrenome</Label>
          <Input
            id="lastName"
            name="lastName"
            type="text"
            placeholder="Silva"
            value={String(formData.lastName || '')}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-skymoney-teal-500" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="joao@example.com"
            value={formData.email}
            onChange={handleChange}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefone (WhatsApp)</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 h-4 w-4 text-skymoney-teal-500" />
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="(11) 99999-9999"
            value={formData.phone}
            onChange={handleChange}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cpf">CPF</Label>
        <div className="relative">
          <CreditCard className="absolute left-3 top-3 h-4 w-4 text-skymoney-teal-500" />
          <Input
            id="cpf"
            name="cpf"
            type="text"
            placeholder="000.000.000-00"
            value={formData.cpf}
            onChange={handleChange}
            className="pl-10"
            maxLength={11}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="birthDate">Data de Nascimento</Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-3 h-4 w-4 text-skymoney-teal-500" />
          <Input
            id="birthDate"
            name="birthDate"
            type="date"
            value={formData.birthDate}
            onChange={handleChange}
            className="pl-10"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderBankingInfoStep = () => {
    const banks = [
      'Banco do Brasil', 'Bradesco', 'Caixa Econômica Federal', 'Itaú',
      'Santander', 'Nubank', 'Inter', 'C6 Bank', 'PicPay', 'Mercado Pago',
      'Sicoob', 'Sicredi', 'Banrisul', 'BTG Pactual', 'Original'
    ];

    const pixKeyTypes = [
      { value: 'phone', label: 'Celular' },
      { value: 'email', label: 'E-mail' },
      { value: 'cpf', label: 'CPF/CNPJ' },
      { value: 'random', label: 'Chave Aleatória' }
    ];

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-2">
            <Label htmlFor="cep">CEP</Label>
            <Input
              id="cep"
              name="cep"
              placeholder="00000-000"
              value={formData.cep}
              onChange={(e) => {
                handleChange(e);
                fetchAddressByCep(e.target.value);
              }}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="addressNumber">Número</Label>
            <Input
              id="addressNumber"
              name="addressNumber"
              placeholder="Nº"
              value={formData.addressNumber}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Endereço</Label>
          <Input
            id="address"
            name="address"
            placeholder="Rua, Bairro, Cidade - Estado"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>

        {/* Informações Bancárias */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Informações Bancárias</h3>
          
          <div className="space-y-2">
            <Label>Banco</Label>
            <Select onValueChange={(value) => handleSelectChange('bank', value)} value={formData.bank}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione seu banco" />
              </SelectTrigger>
              <SelectContent>
                {banks.map((bank) => (
                  <SelectItem key={bank} value={bank}>
                    {bank}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="agency">Agência</Label>
              <Input
                id="agency"
                name="agency"
                placeholder="0000"
                value={formData.agency}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account">Conta</Label>
              <Input
                id="account"
                name="account"
                placeholder="00000-0"
                value={formData.account}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Informações PIX */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Informações PIX</h3>
          
          <div className="space-y-2">
            <Label>Tipo da Chave PIX</Label>
            <Select onValueChange={(value) => handleSelectChange('pixKeyType', value)} value={formData.pixKeyType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo da chave" />
              </SelectTrigger>
              <SelectContent>
                {pixKeyTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pixKey">Chave PIX</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-skymoney-teal-500" />
              <Input
                id="pixKey"
                name="pixKey"
                placeholder="Sua chave PIX"
                value={formData.pixKey}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pixOwnerName">Nome do Titular PIX</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-skymoney-teal-500" />
              <Input
                id="pixOwnerName"
                name="pixOwnerName"
                placeholder="Nome completo do titular da conta PIX"
                value={formData.pixOwnerName}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pixCopyPaste">PIX Copia e Cola</Label>
            <Textarea
              id="pixCopyPaste"
              name="pixCopyPaste"
              placeholder="Cole aqui o seu código PIX Copia e Cola"
              value={formData.pixCopyPaste}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pixQrCode">QR Code PIX</Label>
            <Button type="button" variant="outline" className="w-full border-dashed">
              <label className="flex items-center justify-center cursor-pointer w-full">
                <Upload className="mr-2 h-4 w-4" />
                {formData.pixQrCode ? 'QR Code PIX enviado ✓' : 'Enviar imagem do QR Code'}
                <input
                  id="pixQrCode"
                  name="pixQrCode"
                  type="file"
                  onChange={handleChange}
                  className="sr-only"
                  accept="image/*"
                  required
                />
              </label>
            </Button>
            {formData.pixQrCode && (
              <div className="mt-2">
                <img
                  src={`data:image/jpeg;base64,${formData.pixQrCode}`}
                  alt="QR Code PIX"
                  className="w-32 h-32 object-contain mx-auto border rounded"
                />
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-2 text-center">
              <p>Não tem QR Code PIX?{' '}
                <a href="https://gerarpix.com.br" target="_blank" rel="noopener noreferrer" className="text-skymoney-teal-600 underline">
                  Crie gratuitamente aqui
                </a>
              </p>
            </div>
          </div>
        </div>
        </div>
    );
  };

  const renderCryptoInfoStep = () => {
    return (
      <div className="space-y-4">
        <div className="bg-blue-100 p-4 rounded-lg text-center">
          <div className="mb-4">
            <img
              src="/Bybit.jpg"
              alt="Bybit Logo"
              className="w-full h-32 object-cover rounded"
            />
          </div>
          <p className="text-sm text-blue-800">
            Não tem conta de Criptomoedas?{' '}
            <a href="https://www.bybit.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline font-bold">
              Cadastre-se na ByBit aqui e ganhe bônus!
            </a>
          </p>
        </div>

        <div className="bg-orange-50 rounded-lg p-4 space-y-4 border border-orange-200">
          <h3 className="text-lg font-semibold text-orange-800 flex items-center">
            <span className="mr-2">₿</span>
            Carteira Bitcoin (BTC) - Opcional
          </h3>
          <div className="space-y-2">
            <Label htmlFor="btcAddress">Endereço Bitcoin</Label>
            <Input
              id="btcAddress"
              name="btcAddress"
              placeholder="1EHVxuWm1og7tzy9u8gN..."
              value={formData.btcAddress}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="btcQrCode">QR Code Bitcoin (Opcional)</Label>
            <Button type="button" variant="outline" className="w-full border-dashed">
              <label className="flex items-center justify-center cursor-pointer w-full">
                <Upload className="mr-2 h-4 w-4" />
                {formData.btcQrCode ? 'QR Code BTC enviado ✓' : 'Enviar QR Code Bitcoin'}
                <input
                  id="btcQrCode"
                  name="btcQrCode"
                  type="file"
                  onChange={handleChange}
                  className="sr-only"
                  accept="image/*"
                />
              </label>
            </Button>
            {formData.btcQrCode && (
              <div className="mt-2">
                <img
                  src={`data:image/jpeg;base64,${formData.btcQrCode}`}
                  alt="QR Code Bitcoin"
                  className="w-32 h-32 object-contain mx-auto border rounded"
                />
              </div>
            )}
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 space-y-4 border border-green-200">
          <h3 className="text-lg font-semibold text-green-800 flex items-center">
            <span className="mr-2">₮</span>
            Carteira USDT (ERC20) - Opcional
          </h3>
          <div className="space-y-2">
            <Label htmlFor="usdtAddress">Endereço USDT</Label>
            <Input
              id="usdtAddress"
              name="usdtAddress"
              placeholder="0x34f79b957730b6e70bc..."
              value={formData.usdtAddress}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="usdtQrCode">QR Code USDT (Opcional)</Label>
            <Button type="button" variant="outline" className="w-full border-dashed">
              <label className="flex items-center justify-center cursor-pointer w-full">
                <Upload className="mr-2 h-4 w-4" />
                {formData.usdtQrCode ? 'QR Code USDT enviado ✓' : 'Enviar QR Code USDT'}
                <input
                  id="usdtQrCode"
                  name="usdtQrCode"
                  type="file"
                  onChange={handleChange}
                  className="sr-only"
                  accept="image/*"
                />
              </label>
            </Button>
            {formData.usdtQrCode && (
              <div className="mt-2">
                <img
                  src={`data:image/jpeg;base64,${formData.usdtQrCode}`}
                  alt="QR Code USDT"
                  className="w-32 h-32 object-contain mx-auto border rounded"
                />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Crie sua Senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-skymoney-teal-500" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo 8 caracteres"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              className="pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-skymoney-teal-500 hover:text-skymoney-teal-700"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar Senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-skymoney-teal-500" />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Digite a senha novamente"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="pl-10"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderTermsStep = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-center text-skymoney-teal-800">📜 TERMO DE ADESÃO E RESPONSABILIDADE</h3>
      <h4 className="text-lg font-semibold text-center text-skymoney-teal-700">SkyMoneyIA 2.0</h4>
      <div className="h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg border text-sm space-y-3">
        <div>
          <h4 className="font-bold text-skymoney-teal-800 mb-2">1. Objetivo</h4>
          <p><strong>1.1.</strong> A SkyMoneyIA 2.0 é um crowdfunding solidário, privado e fechado, exclusivo para pessoas físicas, baseado em contribuições mensais entre seus participantes, com o propósito de gerar prosperidade coletiva e realizar sonhos por meio de um sistema 100% P2P (peer-to-peer) e fraternal.</p>
          <p><strong>1.2.</strong> Cada grupo da SkyMoneyIA 2.0 é formado por no máximo 100 participantes, funcionando de maneira autônoma, com administração própria, servidores, domínios e suporte dedicados.</p>
          <p><strong>1.3.</strong> A SkyMoneyIA 2.0 surge como reestruturação e evolução da SkyMoneyIA original, lançada em maio de 2025, com melhorias significativas para garantir sustentabilidade e funcionamento contínuo.</p>
          <p><strong>1.4.</strong> A contribuição obrigatória de reentrada mensal é de R$100,00, independentemente de recebimentos, assegurando a continuidade dos ciclos solidários.</p>
        </div>

        <div>
          <h4 className="font-bold text-skymoney-teal-800 mb-2">2. Ciclos Solidários da SkyMoneyIA 2.0</h4>
          <p><strong>2.1.</strong> O funcionamento é estruturado em três níveis de ciclos solidários, que determinam contribuições, recebimentos, upgrades e lucros:</p>

          <div className="ml-4 space-y-2">
            <div>
              <p className="font-semibold">🔹 1º Nível – Contribuição Inicial</p>
              <ul className="ml-4 text-xs space-y-1">
                <li>• Contribuição: R$100,00</li>
                <li>• Recebimentos: 3 doações de R$100,00 = R$300,00</li>
                <li>• Upgrade: R$200,00 para o 2º nível</li>
                <li>• Sem lucro líquido: repassa R$100,00</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold">🔹 2º Nível – Expansão</p>
              <ul className="ml-4 text-xs space-y-1">
                <li>• Contribuição (upgrade): R$200,00</li>
                <li>• Recebimentos: 18 doações de R$200,00 = R$3.600,00</li>
                <li>• Upgrade: R$1.600,00 para o 3º nível</li>
                <li>• Sem lucro líquido: reinjetado R$2.000,00 no próprio N2 (cascata)</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold">🔹 3º Nível – Consolidação</p>
              <ul className="ml-4 text-xs space-y-1">
                <li>• Contribuição (upgrade): R$1.600,00</li>
                <li>• Recebimentos: 27 doações de R$1.600,00 = R$43.200,00</li>
                <li>• Deduções:</li>
                <li className="ml-4">– R$8.000,00 (5 upgrades de cada participante) para acelerar o N2 (reinjeção)</li>
                <li className="ml-4">– R$3.200,00 (2 upgrades de R$1.600,00) para a contaADM</li>
                <li>• Lucro líquido final: R$32.000,00</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold">🔹 Lucro Final Consolidado</p>
              <p className="text-xs">Ao término do ciclo completo, o participante obtém lucro líquido total de R$32.000,00, considerando todos os níveis e deduções obrigatórias.</p>
            </div>
          </div>

          <div className="mt-3">
            <p className="font-semibold">📌 Prazos de Encerramento dos Níveis</p>
            <p className="text-xs">Desde que todos os participantes sigam corretamente o processo, os prazos estimados para o encerramento de cada nível são:</p>
            <ul className="ml-4 text-xs space-y-1">
              <li>• 1º Nível: entre 2 a 3 meses</li>
              <li>• 2º Nível: entre 7 a 8 meses</li>
              <li>• 3º Nível (Recebimento Final): entre 18 a 20 meses, sendo este o prazo estimado para o recebimento do último participante, ou seja o participante N°#0100</li>
            </ul>
          </div>

          <p><strong>2.2.</strong> Após o encerramento do ciclo, o participante pode optar por realizar sua reentrada mensal de R$100,00, garantindo continuidade no fluxo solidário, ou sair com seu lucro, sem direito de retorno em novos grupos.</p>
        </div>

        <div>
          <h4 className="font-bold text-skymoney-teal-800 mb-2">3. Doações Voluntárias Espontâneas</h4>
          <p><strong>3.1.</strong> Todas as contribuições realizadas pelos participantes são voluntárias, conscientes e solidárias, não configurando investimentos financeiros nem promessa de rendimentos futuros.</p>
          <p><strong>3.2.</strong> Conforme o Código Civil Brasileiro (arts. 538 a 541), a doação é um contrato por liberalidade, transferindo bens ou vantagens de uma pessoa para outra. As contribuições na SkyMoneyIA 2.0 se enquadram nesse caráter voluntário.</p>
          <p><strong>3.3.</strong> A plataforma garante que permanecerá 100% operacional e em conformidade com o regulamento vigente, assegurando que todos os participantes tenham acesso às funcionalidades para realizar suas doações P2P diretamente entre si. Não há garantia de recebimento apenas em casos de descumprimento do ciclo por má-fé de participantes ou por erros causados por terceiros, situações estas que fogem ao controle da plataforma.</p>
        </div>

        <div>
          <h4 className="font-bold text-skymoney-teal-800 mb-2">4. Transações e Formas de Pagamento</h4>
          <p><strong>4.1.</strong> O meio obrigatório de contribuição é o PIX, via chave, chave "cópia e cola" ou QR Code.</p>
          <p><strong>4.2.</strong> Também são aceitas contribuições em USDT (Tether) e Bitcoin (BTC).</p>
          <p><strong>4.3.</strong> Nas transações com criptomoedas:</p>
          <ul className="ml-4 text-xs space-y-1">
            <li>• O uso é opcional e depende de acordo mútuo entre doador e recebedor.</li>
            <li>• O recebedor que optar por criptoativos deve ter disponibilidade em PIX para repasses a terceiros em real BRL de imediato.</li>
            <li>• A plataforma não garante devoluções em caso de erro, pois operações em carteiras erradas são irreversíveis.</li>
          </ul>
          <p><strong>4.4.</strong> Em transações via PIX, caso o valor seja enviado incorretamente, o participante deve contatar diretamente o destinatário para solicitar reembolso.</p>
          <p><strong>4.5.</strong> É responsabilidade exclusiva de cada participante inserir corretamente seus dados pessoais e financeiros. A SkyMoneyIA 2.0 não interfere, não altera e não tem autoridade sobre tais dados, conforme a Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018).</p>
        </div>

        <div>
          <h4 className="font-bold text-skymoney-teal-800 mb-2">5. Conta Administrativa (contaADM)</h4>
          <p><strong>5.1.</strong> A SkyMoneyIA 2.0 destina 2 doações de R$1.600,00 de cada participante do 3º nível para a contaADM, garantindo recursos para manutenção da estrutura administrativa.</p>
          <p><strong>5.2.</strong> Os recursos são destinados a servidores, funcionários, suporte, internet, aluguéis e demais custos operacionais.</p>
          <p><strong>5.3.</strong> Responsável contaADM:</p>
          <ul className="ml-4 text-xs space-y-1">
            <li>• Nome: Graciele Souza da Silva</li>
            <li>• Chave PIX: skymoneyia.app@gmail.com</li>
            <li>• ID: #000</li>
          </ul>
          <p><strong>5.4.</strong> Depósitos em contas de terceiros não serão aceitos. Quem cobrar adesão ou valores estará cometendo crime.</p>
        </div>

        <div>
          <h4 className="font-bold text-skymoney-teal-800 mb-2">6. Direito de Imagem e Prova Social</h4>
          <p><strong>6.1.</strong> Os participantes concordam em gravar vídeos curtos (30s a 1min), mostrando seus ganhos no dashboard/back-office, caso solicitado pela administração.</p>
          <p><strong>6.2.</strong> Não é obrigatório aparecer em vídeo; pode-se gravar apenas a tela.</p>
          <p><strong>6.3.</strong> O objetivo é fortalecer a credibilidade da comunidade por meio de provas sociais.</p>
        </div>

        <div>
          <h4 className="font-bold text-skymoney-teal-800 mb-2">7. Regras de Conduta e Responsabilidade Jurídica</h4>
          <p><strong>7.1.</strong> Cada grupo é autônomo, sem vínculo com instituições financeiras, corretoras, bancos, CVM ou mercado de capitais.</p>
          <p><strong>7.2.</strong> O participante assume integral responsabilidade por suas contribuições, sem garantias de recebimento em caso de má-fé de terceiros.</p>
          <p><strong>7.3.</strong> Cada posição é pessoal, individual e intransferível, ocupada por ordem de entrada ("fila indiana"). Saídas reorganizam a fila automaticamente.</p>
          <p><strong>7.4.</strong> É proibido usar o nome SkyMoneyIA para solicitar valores, prometer lucros, vender posições ou captar recursos fora das regras.</p>
          <p><strong>7.5.</strong> Atos de má-fé, fraude ou desvio de valores serão tratados conforme a legislação brasileira:</p>
          <ul className="ml-4 text-xs space-y-1">
            <li>• Art. 171 – Estelionato</li>
            <li>• Art. 168 – Apropriação indébita</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-skymoney-teal-800 mb-2">8. Disposições Finais</h4>
          <p><strong>8.1.</strong> A SkyMoneyIA 2.0 não cobra adesão nem realiza intermediações financeiras.</p>
          <p><strong>8.2.</strong> Cada participante pode ter apenas um login, pessoal e intransferível.</p>
          <p><strong>8.3.</strong> A participação implica plena aceitação deste Termo. Dúvidas serão solucionadas pela equipe de suporte no grupo oficial do Telegram.</p>
        </div>
      </div>
      <div className="flex items-center space-x-2 mt-4">
        <Checkbox
          id="termsAccepted"
          checked={formData.termsAccepted}
          onCheckedChange={(checked) => {
            setFormData(prev => ({
              ...prev,
              termsAccepted: checked === true
            }));
          }}
        />
        <Label htmlFor="termsAccepted" className="text-base cursor-pointer">
          Li e concordo com o Termo de Adesão e Responsabilidade da SkyMoneyIA 2.0.
        </Label>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderPersonalInfoStep();
      case 2:
        return renderBankingInfoStep();
      case 3:
        return renderCryptoInfoStep();
      case 4:
        return renderTermsStep();
      default:
        return renderPersonalInfoStep();
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{backgroundColor: '#499291'}}>
      <div className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-48 h-48 mx-auto mb-4">
            <img
              src="/main icon.jpg"
              alt="SkyMoney Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <p className="text-white mt-2 text-lg font-medium">Inteligência Financeira Crescimento Coletivo!</p>
        </div>

        <Card className="skymoney-shadow border-0">
          <CardHeader className="space-y-4">
            <div className="text-center">
              <CardTitle className="text-2xl text-skymoney-teal-800">
                {stepTitles[currentStep - 1]}
              </CardTitle>
              <CardDescription>
                Passo {currentStep} de {totalSteps}
              </CardDescription>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress value={progress} className="w-full [&>div]:bg-[#3A92A8]" />
              <div className="flex justify-between text-xs text-muted-foreground">
                {stepTitles.map((_title, index) => (
                  <span
                    key={index}
                    className={`${index + 1 <= currentStep ? 'text-skymoney-teal-600 font-medium' : ''}`}
                  >
                    {index + 1}
                  </span>
                ))}
              </div>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {displayError && (
                <Alert variant="destructive">
                  <AlertDescription>{displayError}</AlertDescription>
                </Alert>
              )}


              {renderCurrentStep()}
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <div className="flex gap-4 w-full">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="flex-1"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Anterior
                  </Button>
                )}

                <Button
                  type="submit"
                  className="flex-1"
                  style={{backgroundColor: '#3A92A8', backgroundImage: 'none'}}
                  disabled={isLoading}
                >
                  {isLoading ? 'Criando conta...' :
                   currentStep === totalSteps ? 'Criar Conta' : 'Próximo'}
                  {currentStep < totalSteps && <ChevronRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Já tem uma conta?{' '}
                  <Link
                    to="/login"
                    className="text-skymoney-teal-600 hover:text-skymoney-teal-700 font-medium hover:underline"
                  >
                    Fazer login
                  </Link>
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center" style={{backgroundColor: '#499291'}}>
        <p className="text-sm text-white font-medium">© 2025 SkyMoneyIA 2.0 — Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
