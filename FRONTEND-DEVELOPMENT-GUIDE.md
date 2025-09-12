# 🚀 Diretiva de Desenvolvimento Frontend - SkyMoney IA 2.0

## 📋 Visão Geral do Projeto

O SkyMoney IA 2.0 é uma aplicação React + TypeScript + Vite para gestão financeira com IA. O projeto utiliza uma arquitetura moderna com Context API para gerenciamento de estado e componentes UI reutilizáveis.

## 🏗️ Arquitetura Atual

### Estrutura de Pastas
```
src/
├── components/          # Componentes reutilizáveis
│   └── ui/             # Componentes base (shadcn/ui)
├── contexts/           # Contextos React (AuthContext)
├── lib/               # Utilitários e configurações
├── pages/             # Páginas da aplicação
├── types/             # Definições TypeScript
├── assets/            # Recursos estáticos
├── App.tsx            # Componente principal
└── main.tsx           # Ponto de entrada
```

### Stack Tecnológica
- **React 18** com TypeScript
- **Vite** como bundler
- **React Router** para navegação
- **Tailwind CSS** para estilização
- **Context API** para gerenciamento de estado
- **Fetch API** para requisições HTTP

## 🔧 Configuração e Setup

### Variáveis de Ambiente
```env
# .env.local (desenvolvimento)
VITE_API_URL=https://sky-money-ai-skymoneyback2.dq4298.easypanel.host
```

### Scripts Disponíveis
```bash
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
npm run lint         # Linting
```

## 📚 Padrões de Desenvolvimento

### 1. Estrutura de Componentes

#### Componentes UI (shadcn/ui)
Localização: `src/components/ui/`
- Use componentes base existentes: `Button`, `Input`, `Card`, `Alert`, etc.
- Mantenha consistência visual seguindo o design system
- Documente props e comportamentos

```tsx
// Exemplo de uso de componente UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function MyComponent() {
  return (
    <div>
      <Input placeholder="Digite algo..." />
      <Button variant="primary">Confirmar</Button>
    </div>
  );
}
```

#### Componentes de Página
Localização: `src/pages/`
- Uma página por arquivo
- Use hooks do contexto para dados globais
- Implemente loading states e error handling

```tsx
// Exemplo de página
import { useAuth } from '@/contexts/AuthContext';

export default function MyPage() {
  const { user, isLoading, error } = useAuth();
  
  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;
  
  return <div>Conteúdo da página</div>;
}
```

### 2. Gerenciamento de Estado

#### AuthContext
- **Localização**: `src/contexts/AuthContext.tsx`
- **Uso**: Para dados de autenticação e usuário
- **Hooks disponíveis**: `useAuth()`

```tsx
// Exemplo de uso do AuthContext
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { 
    user, 
    isAuthenticated, 
    login, 
    logout, 
    isLoading 
  } = useAuth();
  
  // Lógica do componente
}
```

#### Estado Local
- Use `useState` para estado local simples
- Use `useReducer` para estado complexo
- Evite prop drilling - use Context quando necessário

### 3. Requisições HTTP

#### API Client
- **Localização**: `src/lib/api.ts`
- **Padrão**: Funções assíncronas com error handling
- **Configuração**: URL base via `VITE_API_URL`

```tsx
// Exemplo de nova função API
export const userAPI = {
  updateProfile: async (data: UpdateProfileRequest): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Update failed');
      }
      return result;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },
};
```

### 4. Tipagem TypeScript

#### Interfaces de Usuário
- **Localização**: `src/types/user.ts`
- **Padrão**: Interfaces exportadas com nomes descritivos

```tsx
// Exemplo de nova interface
export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string;
  userId: string;
}

export interface TransactionRequest {
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
}
```

## 🎯 Funcionalidades a Implementar

### 1. Dashboard Principal
**Arquivo**: `src/pages/Dashboard.tsx`

#### Funcionalidades Necessárias:
- [ ] Resumo financeiro (saldo, receitas, despesas)
- [ ] Gráficos de movimentação financeira
- [ ] Lista de transações recentes
- [ ] Cards de ações rápidas
- [ ] Notificações e alertas

#### Componentes Sugeridos:
```tsx
// src/components/dashboard/
├── FinancialSummary.tsx    # Resumo financeiro
├── TransactionChart.tsx    # Gráficos
├── RecentTransactions.tsx  # Lista de transações
├── QuickActions.tsx        # Ações rápidas
└── Notifications.tsx       # Notificações
```

### 2. Gestão de Transações
**Arquivo**: `src/pages/Transactions.tsx`

#### Funcionalidades:
- [ ] Lista de transações com filtros
- [ ] Adicionar nova transação
- [ ] Editar/Excluir transações
- [ ] Categorização automática com IA
- [ ] Exportação de dados

#### Componentes Sugeridos:
```tsx
// src/components/transactions/
├── TransactionList.tsx     # Lista de transações
├── TransactionForm.tsx     # Formulário de transação
├── TransactionFilters.tsx  # Filtros e busca
├── CategorySelector.tsx    # Seletor de categoria
└── ExportButton.tsx        # Exportação
```

### 3. Perfil do Usuário
**Arquivo**: `src/pages/Profile.tsx`

#### Funcionalidades:
- [ ] Edição de dados pessoais
- [ ] Configurações de conta
- [ ] Preferências de notificação
- [ ] Upload de avatar
- [ ] Alteração de senha

### 4. Relatórios e Analytics
**Arquivo**: `src/pages/Reports.tsx`

#### Funcionalidades:
- [ ] Relatórios mensais/anuais
- [ ] Análise de gastos por categoria
- [ ] Projeções financeiras
- [ ] Metas e objetivos
- [ ] Insights com IA

### 5. Configurações
**Arquivo**: `src/pages/Settings.tsx`

#### Funcionalidades:
- [ ] Configurações gerais
- [ ] Integrações bancárias
- [ ] Backup e sincronização
- [ ] Privacidade e segurança
- [ ] Suporte e ajuda

## 🎨 Design System

### Cores Principais
```css
/* Cores do SkyMoney */
--primary: #3B82F6;      /* Azul principal */
--secondary: #10B981;    /* Verde sucesso */
--accent: #F59E0B;       /* Amarelo destaque */
--danger: #EF4444;       /* Vermelho erro */
--warning: #F59E0B;      /* Amarelo aviso */
--info: #3B82F6;         /* Azul informação */
```

### Componentes Base
- **Button**: Variações primary, secondary, outline, ghost
- **Input**: Com estados de erro e sucesso
- **Card**: Para agrupamento de conteúdo
- **Alert**: Para mensagens de feedback
- **Modal**: Para diálogos e confirmações

### Layout Responsivo
- **Mobile First**: Design otimizado para mobile
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Grid System**: Flexbox e CSS Grid

## 🔒 Segurança e Validação

### Validação de Formulários
```tsx
// Exemplo de validação
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateCPF = (cpf: string): boolean => {
  // Implementar validação de CPF
  return cpf.replace(/\D/g, '').length === 11;
};
```

### Sanitização de Dados
- Sempre sanitize inputs do usuário
- Use bibliotecas como `dompurify` para HTML
- Valide dados antes de enviar para API

### Autenticação
- Token JWT armazenado em localStorage
- Refresh automático de token
- Logout automático em caso de token inválido

## 📱 Responsividade

### Breakpoints
```css
/* Mobile First */
.container {
  @apply px-4; /* Mobile */
}

@media (min-width: 640px) {
  .container {
    @apply px-6; /* sm */
  }
}

@media (min-width: 768px) {
  .container {
    @apply px-8; /* md */
  }
}
```

### Componentes Responsivos
- Use `flex-col md:flex-row` para layouts
- Implemente `hidden md:block` para elementos condicionais
- Teste em diferentes tamanhos de tela

## 🧪 Testes

### Estrutura de Testes
```
src/
├── __tests__/           # Testes unitários
├── components/
│   └── __tests__/      # Testes de componentes
└── pages/
    └── __tests__/      # Testes de páginas
```

### Testes Recomendados
- **Unitários**: Funções utilitárias e hooks
- **Integração**: Fluxos de autenticação
- **E2E**: Fluxos completos do usuário

## 🚀 Deploy e Build

### Build de Produção
```bash
npm run build
```

### Docker
```dockerfile
# Dockerfile otimizado para produção
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Variáveis de Ambiente
- **Desenvolvimento**: `.env.local`
- **Produção**: Configurar no EasyPanel

## 📝 Convenções de Código

### Nomenclatura
- **Componentes**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase com prefixo `use` (`useAuth`)
- **Funções**: camelCase (`getUserData`)
- **Constantes**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Interfaces**: PascalCase (`User`, `AuthResponse`)

### Estrutura de Arquivos
```tsx
// 1. Imports externos
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

// 2. Imports internos
import { Button } from '@/components/ui/button';

// 3. Tipos e interfaces
interface Props {
  title: string;
}

// 4. Componente principal
export default function MyComponent({ title }: Props) {
  // 5. Hooks
  const { user } = useAuth();
  
  // 6. Handlers
  const handleClick = () => {
    // Lógica
  };
  
  // 7. Render
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleClick}>Click me</Button>
    </div>
  );
}
```

## 🔄 Fluxo de Desenvolvimento

### 1. Nova Funcionalidade
1. Criar branch: `git checkout -b feature/nova-funcionalidade`
2. Implementar componentes necessários
3. Adicionar testes
4. Documentar mudanças
5. Criar PR para review

### 2. Correção de Bugs
1. Criar branch: `git checkout -b fix/descricao-bug`
2. Reproduzir e corrigir bug
3. Adicionar teste para prevenir regressão
4. Criar PR para review

### 3. Refatoração
1. Criar branch: `git checkout -b refactor/descricao`
2. Implementar melhorias
3. Manter funcionalidade existente
4. Atualizar testes
5. Criar PR para review

## 📚 Recursos Úteis

### Documentação
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)

### Ferramentas
- **VS Code Extensions**: ES7+ React/Redux/React-Native snippets
- **DevTools**: React Developer Tools
- **Linting**: ESLint + Prettier
- **Testing**: Vitest + React Testing Library

## 🎯 Próximos Passos

### Prioridade Alta
1. ✅ Implementar Dashboard completo
2. ✅ Criar sistema de transações
3. ✅ Adicionar relatórios básicos
4. ✅ Implementar perfil do usuário

### Prioridade Média
1. 🔄 Sistema de notificações
2. 🔄 Integração com APIs externas
3. 🔄 Funcionalidades de IA
4. 🔄 PWA (Progressive Web App)

### Prioridade Baixa
1. ⏳ Temas personalizáveis
2. ⏳ Múltiplos idiomas
3. ⏳ Modo offline
4. ⏳ Analytics avançados

---

**Última atualização**: Dezembro 2024
**Versão**: 1.0.0
**Mantenedor**: Equipe SkyMoney
