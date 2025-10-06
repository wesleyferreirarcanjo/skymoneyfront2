# 🔧 Troubleshooting - Sistema de Upgrade

## ❌ Problema: "userId is required for upgrade"

### **Descrição do Erro**

```
[Nest] 1  - 10/04/2025, 2:12:04 PM   ERROR [DonationsService] [UPGRADE] userId is null or undefined!
[Nest] 1  - 10/04/2025, 2:12:04 PM   ERROR [DonationsService] Error in acceptUpgrade for user undefined:
[Nest] 1  - 10/04/2025, 2:12:04 PM   ERROR [DonationsService] Error: userId is required for upgrade
```

### **Causa Raiz**

O backend espera receber o `userId` através do token JWT no header `Authorization`, mas o token não está sendo enviado corretamente ou não contém as informações necessárias.

### **Verificações Necessárias**

#### 1. **Token JWT está sendo enviado?**

Verifique se o header `Authorization` está presente na requisição:

```typescript
// Verificar no console do navegador
const token = localStorage.getItem('authToken');
console.log('Token JWT:', token);
```

#### 2. **Token está no formato correto?**

O token deve estar no formato: `Bearer <token>`

```typescript
// Correto
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Incorreto
Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 3. **Token contém o userId?**

Decodifique o token para verificar se contém o `userId` ou `sub`:

```typescript
// Usar jwt-decode ou decodificar manualmente
import jwt_decode from 'jwt-decode';

const token = localStorage.getItem('authToken');
if (token) {
  const decoded = jwt_decode(token);
  console.log('Token decodificado:', decoded);
  // Deve conter: { sub: 'userId', email: '...', ... }
}
```

#### 4. **Token não expirou?**

Verifique a validade do token:

```typescript
const decoded = jwt_decode(token);
const now = Date.now() / 1000;
const isExpired = decoded.exp < now;

if (isExpired) {
  console.error('Token expirado! Faça login novamente.');
}
```

---

## ✅ Soluções

### **Solução 1: Verificar Autenticação**

Certifique-se de que o usuário está autenticado antes de fazer o upgrade:

```typescript
// No componente
import { useAuth } from '../context/AuthContext';

const { user, token } = useAuth();

if (!user || !token) {
  // Redirecionar para login
  navigate('/login');
  return;
}
```

### **Solução 2: Validar Token antes do Upgrade**

```typescript
const handleAcceptUpgrade = async () => {
  // Verificar se há token
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    console.error('Token não encontrado. Faça login novamente.');
    navigate('/login');
    return;
  }

  try {
    // Decodificar para verificar validade
    const decoded = jwt_decode(token);
    const now = Date.now() / 1000;
    
    if (decoded.exp < now) {
      console.error('Token expirado. Faça login novamente.');
      navigate('/login');
      return;
    }

    // Prosseguir com upgrade
    const response = await acceptUpgrade(fromLevel, toLevel);
    // ...
  } catch (error) {
    console.error('Erro ao processar upgrade:', error);
  }
};
```

### **Solução 3: Implementar Refresh Token**

Se o token expirar frequentemente, implemente um sistema de refresh:

```typescript
// src/lib/api.ts
export const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}): Promise<any> => {
  const token = getAuthToken();

  if (!token) {
    throw new Error('Token não encontrado. Faça login novamente.');
  }

  // Verificar se token vai expirar em breve (menos de 5 minutos)
  try {
    const decoded = jwt_decode(token);
    const now = Date.now() / 1000;
    const timeUntilExpiry = decoded.exp - now;

    if (timeUntilExpiry < 300) { // 5 minutos
      // Tentar refresh token
      await refreshAuthToken();
    }
  } catch (error) {
    console.error('Erro ao verificar token:', error);
  }

  // Continuar com a requisição normal
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // ... resto do código
};
```

### **Solução 4: Adicionar Logs de Debug**

Para identificar onde o problema ocorre:

```typescript
// src/services/donations.service.ts
async acceptUpgrade(data: AcceptUpgradeRequest): Promise<AcceptUpgradeResponse> {
  try {
    console.log('🔵 [DEBUG] Iniciando upgrade request');
    console.log('🔵 [DEBUG] Data:', data);
    
    const token = localStorage.getItem('authToken');
    console.log('🔵 [DEBUG] Token presente:', !!token);
    
    if (token) {
      const decoded = jwt_decode(token);
      console.log('🔵 [DEBUG] Token decodificado:', decoded);
    }

    const result = await makeAuthenticatedRequest('/donations/accept-upgrade', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    console.log('✅ [DEBUG] Upgrade bem-sucedido:', result);
    return result;
  } catch (error: any) {
    console.error('❌ [DEBUG] Erro no upgrade:', error);
    throw error;
  }
}
```

---

## 🔍 Checklist de Diagnóstico

Quando encontrar o erro "userId is required for upgrade", verifique:

- [ ] Token JWT está armazenado no `localStorage`?
- [ ] Token está no formato `Bearer <token>`?
- [ ] Token contém o campo `sub` ou `userId`?
- [ ] Token não expirou? (verificar `exp` timestamp)
- [ ] Header `Authorization` está sendo enviado?
- [ ] Usuário está autenticado no frontend?
- [ ] Backend está usando o guard correto? (`@UseGuards(JwtAuthGuard)`)
- [ ] Backend está extraindo o `userId` do request? (`@Req() req`)

---

## 📋 Exemplo de Request Correto

```typescript
// Request que FUNCIONA
POST /donations/accept-upgrade
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTYiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJleHAiOjE3MzAwMDAwMDB9...
  Content-Type: application/json

Body:
{
  "from_level": 1,
  "to_level": 2
}

// O backend extrai o userId do token JWT
// req.user.userId = "123456" (vem do campo "sub" do token)
```

---

## 🛠️ Como Testar

### **1. Teste Manual no Console do Navegador**

```javascript
// 1. Verificar token
const token = localStorage.getItem('authToken');
console.log('Token:', token);

// 2. Decodificar token (copie o token e cole em jwt.io)
// Verifique se contém:
// {
//   "sub": "user-id-here",
//   "email": "user@example.com",
//   "exp": 1730000000
// }

// 3. Fazer request de teste
fetch('https://skymoney-test-back.dq4298.easypanel.host/donations/accept-upgrade', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    from_level: 1,
    to_level: 2
  })
})
.then(r => r.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
```

### **2. Verificar no Network Tab do DevTools**

1. Abrir DevTools (F12)
2. Ir para aba "Network"
3. Fazer o upgrade
4. Clicar na requisição `accept-upgrade`
5. Verificar:
   - **Request Headers**: deve ter `Authorization: Bearer ...`
   - **Request Payload**: deve ter `from_level` e `to_level`
   - **Response**: verificar status e body

---

## 📝 Notas Importantes

1. **O backend NÃO espera `userId` no body** - ele extrai do token JWT
2. **O token DEVE estar no formato `Bearer <token>`**
3. **O token DEVE conter o campo `sub` com o userId**
4. **O token NÃO DEVE estar expirado**
5. **A requisição DEVE incluir o header `Authorization`**

---

## ✅ Verificação Final

Depois de aplicar as correções, teste novamente:

```typescript
// Teste completo
const testUpgrade = async () => {
  try {
    // 1. Verificar autenticação
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Token não encontrado');

    // 2. Verificar validade
    const decoded = jwt_decode(token);
    if (decoded.exp < Date.now() / 1000) throw new Error('Token expirado');

    // 3. Verificar userId
    if (!decoded.sub) throw new Error('Token não contém userId');

    console.log('✅ Autenticação OK. UserId:', decoded.sub);

    // 4. Fazer upgrade
    const response = await donationsService.acceptUpgrade({
      from_level: 1,
      to_level: 2
    });

    console.log('✅ Upgrade bem-sucedido:', response);
    return response;
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    throw error;
  }
};

testUpgrade();
```

---

**Se o problema persistir após todas as verificações, o problema pode estar no backend (guard não está funcionando corretamente).**
