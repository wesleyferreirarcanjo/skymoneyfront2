# 🐛 Debug: userId Missing in accept-upgrade

## 📋 Situação Atual

### **Erro no Backend**
```
[Nest] 1  - ERROR [DonationsService] [UPGRADE] userId is null or undefined!
Error: userId is required for upgrade
```

### **Erro no Frontend**
```javascript
POST https://skymoney-test-back.dq4298.easypanel.host//donations/accept-upgrade 400 (Bad Request)
Error: 400: Bad Request - Erro ao processar upgrade: userId is required for upgrade
```

### **Contexto**
- **Usuário está autenticado**: `user1@test.com` (ID: `afc3e132-5b58-4162-bc8e-42f6093976aa`)
- **Token JWT está presente**: Verificado no localStorage
- **Outros endpoints funcionam**: `/donations/stats`, `/donations/to-send`, etc.
- **Apenas `/donations/accept-upgrade` falha**

---

## 🔍 Análise do Problema

### **O que está acontecendo:**

1. **Frontend envia requisição corretamente:**
   ```javascript
   POST /donations/accept-upgrade
   Headers: {
     Authorization: Bearer <token>
     Content-Type: application/json
   }
   Body: {
     from_level: 1,
     to_level: 2
   }
   ```

2. **Backend recebe requisição mas userId está undefined:**
   - O Guard JWT deve estar funcionando (senão retornaria 401)
   - O token é válido (outros endpoints funcionam)
   - Mas `req.user.userId` está retornando `null` ou `undefined`

### **Possíveis Causas:**

#### **1. Estrutura do Token JWT**
O token pode conter o userId em um campo diferente:
- `sub` (padrão JWT) ao invés de `userId`
- `id` ao invés de `userId`
- Campo aninhado: `user.id` ao invés de `userId` direto

#### **2. Backend esperando campo específico**
O código do backend pode estar tentando acessar:
```typescript
const userId = req.user.userId; // ❌ undefined
```

Quando deveria ser:
```typescript
const userId = req.user.sub || req.user.id; // ✅ funciona
```

#### **3. Guard diferente no endpoint**
O endpoint `/donations/accept-upgrade` pode estar usando um Guard diferente ou configuração diferente dos outros endpoints.

---

## 🛠️ Soluções Possíveis

### **Solução 1: Verificar estrutura do token (Frontend)**

Adicionar logging para ver o conteúdo decodificado do token:

```typescript
// No console do navegador ou no código:
import jwt_decode from 'jwt-decode';

const token = localStorage.getItem('authToken');
if (token) {
  const decoded = jwt_decode(token);
  console.log('📝 Token decodificado:', decoded);
  console.log('🔑 Campos disponíveis:', Object.keys(decoded));
}
```

**Resultado esperado:**
```javascript
{
  sub: "afc3e132-5b58-4162-bc8e-42f6093976aa",  // ← Este é o userId
  email: "user1@test.com",
  iat: 1234567890,
  exp: 1234567890
}
```

### **Solução 2: Ajustar Backend (Recomendado)**

No backend, o código deveria extrair o userId de forma compatível:

```typescript
// donations.controller.ts
@Post('accept-upgrade')
@UseGuards(JwtAuthGuard)
async acceptUpgrade(
  @Body() acceptUpgradeDto: AcceptUpgradeDto,
  @Req() req: any
) {
  // ✅ Tentar múltiplos campos possíveis
  const userId = req.user?.userId || req.user?.sub || req.user?.id;
  
  if (!userId) {
    console.error('❌ userId not found in req.user:', req.user);
    throw new BadRequestException('userId is required for upgrade');
  }

  console.log('✅ userId extraído:', userId);
  return this.donationsService.acceptUpgrade(userId, acceptUpgradeDto);
}
```

### **Solução 3: Verificar JWT Strategy**

Verificar como o JWT Strategy está populando o `req.user`:

```typescript
// jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  async validate(payload: any) {
    // ✅ Garantir que userId está disponível
    return {
      userId: payload.sub || payload.id,  // Mapear sub/id para userId
      sub: payload.sub,
      id: payload.id,
      email: payload.email,
      // ... outros campos
    };
  }
}
```

### **Solução 4: Adicionar Logging no Backend**

Adicionar logs no backend para ver o que está em `req.user`:

```typescript
@Post('accept-upgrade')
@UseGuards(JwtAuthGuard)
async acceptUpgrade(@Body() dto: AcceptUpgradeDto, @Req() req: any) {
  console.log('🔍 [DEBUG] req.user:', JSON.stringify(req.user, null, 2));
  console.log('🔍 [DEBUG] req.user.userId:', req.user?.userId);
  console.log('🔍 [DEBUG] req.user.sub:', req.user?.sub);
  console.log('🔍 [DEBUG] req.user.id:', req.user?.id);
  
  const userId = req.user?.userId || req.user?.sub || req.user?.id;
  
  if (!userId) {
    console.error('❌ Nenhum campo de userId encontrado!');
    console.error('❌ req.user disponível:', Object.keys(req.user || {}));
    throw new BadRequestException('userId is required for upgrade');
  }
  
  return this.donationsService.acceptUpgrade(userId, dto);
}
```

---

## 🧪 Como Testar

### **1. Verificar token no console do navegador**

```javascript
// Abrir DevTools (F12) e colar no console:

const token = localStorage.getItem('authToken');
console.log('Token:', token);

// Decodificar token (copiar token e colar em https://jwt.io)
// Verificar estrutura do payload
```

### **2. Verificar Network Request**

1. Abrir DevTools → Network Tab
2. Fazer tentativa de upgrade
3. Clicar na requisição `accept-upgrade`
4. Verificar:
   - **Request Headers**: `Authorization: Bearer ...` está presente?
   - **Request Payload**: `from_level` e `to_level` estão corretos?
   - **Response**: Qual mensagem de erro exata?

### **3. Comparar com endpoint que funciona**

Fazer requisição para endpoint que funciona e comparar:

```javascript
// Endpoint que funciona
fetch('https://skymoney-test-back.dq4298.easypanel.host/donations/stats', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log('✅ Stats OK:', data));

// Endpoint com problema
fetch('https://skymoney-test-back.dq4298.easypanel.host/donations/accept-upgrade', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ from_level: 1, to_level: 2 })
})
.then(r => r.json())
.then(data => console.log('❌ Upgrade response:', data))
.catch(err => console.error('❌ Upgrade error:', err));
```

---

## 📊 Próximos Passos

### **Imediato (Frontend)**
- [x] Adicionar logging detalhado na requisição
- [x] Verificar se token está sendo enviado
- [ ] Testar em produção com logs ativos
- [ ] Capturar estrutura exata do token decodificado

### **Backend (Recomendado)**
- [ ] Adicionar logging em `accept-upgrade` controller
- [ ] Verificar estrutura de `req.user`
- [ ] Ajustar extração de userId para aceitar `sub` ou `id`
- [ ] Padronizar JWT Strategy para sempre retornar `userId`

### **Validação**
- [ ] Verificar se outros endpoints POST funcionam
- [ ] Comparar Guards usados em diferentes endpoints
- [ ] Testar com diferentes usuários
- [ ] Verificar logs do backend em produção

---

## ✅ Checklist de Verificação

Quando o erro ocorrer novamente, verificar:

- [ ] Token existe no localStorage? (`localStorage.getItem('authToken')`)
- [ ] Token está no formato correto? (`Bearer <token>`)
- [ ] Token não expirou? (verificar campo `exp`)
- [ ] Token contém userId? (decodificar em jwt.io)
- [ ] Header Authorization está na requisição? (Network tab)
- [ ] Requisição está indo para URL correta?
- [ ] Body da requisição está correto? (`from_level`, `to_level`)
- [ ] Outros endpoints de doações funcionam?
- [ ] Usuário está autenticado? (verificar context)

---

## 💡 Próxima Ação Recomendada

**Deploy com logs de debug ativados** para capturar:

1. **Frontend**: Ver exatamente o que está sendo enviado
2. **Backend**: Ver exatamente o que `req.user` contém
3. **Comparar**: Com endpoints que funcionam

Depois dos logs, aplicar a correção apropriada no backend para aceitar o campo correto do token JWT.

---

## 📝 Notas Importantes

- **Não é problema de autenticação** (token é válido, outros endpoints funcionam)
- **É problema de mapeamento** (campo userId não está onde o código espera)
- **Solução simples**: Ajustar backend para buscar userId no campo correto (`sub`, `id`, ou `userId`)
- **Testável**: Logs mostrarão exatamente qual campo usar
