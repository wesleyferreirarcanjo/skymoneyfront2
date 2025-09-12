import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{backgroundColor: '#499291'}}>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-48 h-48 mx-auto mb-4">
              <img 
                src="/main%20icon.jpg" 
                alt="SkyMoney Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <p className="text-white mt-2 text-lg font-medium">Inteligência Financeira Crescimento Coletivo!</p>
          </div>

          <Card className="skymoney-shadow border-0 max-w-md mx-auto">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center text-skymoney-teal-800">
                Fazer Login
              </CardTitle>
              <CardDescription className="text-center">
                Entre com suas credenciais para acessar sua conta
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-skymoney-teal-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-skymoney-teal-500" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
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
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full"
                  style={{backgroundColor: '#3A92A8', backgroundImage: 'none'}}
                  disabled={isLoading}
                >
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </Button>

                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Não tem uma conta?{' '}
                    <Link
                      to="/register"
                      className="text-skymoney-teal-600 hover:text-skymoney-teal-700 font-medium hover:underline"
                    >
                      Criar conta
                    </Link>
                  </p>
                  
                  <p className="text-xs text-muted-foreground">
                    Admin? Use: admin@skymoney.com / admin123456
                  </p>
                </div>
              </CardFooter>
            </form>
          </Card>

          {/* Features */}
          <div className="mt-8 text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white font-medium max-w-6xl mx-auto">
              <div className="h-40 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 flex flex-col items-center justify-center shadow-lg p-4">
                <div className="flex justify-center mb-3">
                  <svg width="40" height="40" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    <path d="M8 12h8"/>
                  </svg>
                </div>
                <p className="text-sm font-bold mb-2">Sistema P2P</p>
                <p className="text-xs text-white/80 text-center leading-relaxed">Transações diretas de pessoa para pessoa, sem intermediários, com agilidade, praticidade e total segurança.</p>
              </div>
              <div className="h-40 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 flex flex-col items-center justify-center shadow-lg p-4">
                <div className="flex justify-center mb-3">
                  <svg width="40" height="40" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </div>
                <p className="text-sm font-bold mb-2">Avancado</p>
                <p className="text-xs text-white/80 text-center leading-relaxed">Sistema de niveis inteligente para maximizar seu potencial de ganhos</p>
              </div>
              <div className="h-40 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 flex flex-col items-center justify-center shadow-lg p-4">
                <div className="flex justify-center mb-3">
                  <svg width="40" height="40" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <p className="text-sm font-bold mb-2">Seguranca Total</p>
                <p className="text-xs text-white/80 text-center leading-relaxed">Transacoes P2P PIX e criptomoedas com total confianca e tranquilidade</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-4 text-center" style={{backgroundColor: '#499291'}}>
        <p className="text-sm text-white font-medium">© 2025 SkyMoneyIA 2.0 — Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
