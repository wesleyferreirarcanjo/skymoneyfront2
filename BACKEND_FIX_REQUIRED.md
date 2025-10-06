# ⚠️ BACKEND FIX REQUIRED - userId Extraction

## 🎯 Problema Confirmado

Os logs do frontend confirmam que a requisição está **100% correta**:

```javascript
🔍 [DEBUG] Accept Upgrade Request: {
  url: 'https://skymoney-test-back.dq4298.easypanel.host//donations/accept-upgrade',
  method: 'POST',
  hasToken: true,
  tokenPreview: 'eyJhbGciOiJIUzI1NiIs...',
  body: '{"from_level":1,"to_level":2}'
}
```

**Frontend está fazendo tudo certo:**
- ✅ Token JWT válido sendo enviado
- ✅ Header `Authorization: Bearer <token>` presente
- ✅ Body com `from_level` e `to_level` corretos
- ✅ Usuário autenticado (user1@test.com)

**Backend está falhando:**
- ❌ Retorna: "userId is required for upgrade"
- ❌ `req.user.userId` está retornando `undefined`

---

## 🔍 Verificar Estrutura do Token

Para confirmar, decodifique o token JWT:

### **Passo 1: Copiar o token**
```javascript
// No console do navegador (F12):
console.log(localStorage.getItem('authToken'));
// Copiar o token completo que aparecer
```

### **Passo 2: Decodificar**
1. Ir para https://jwt.io
2. Colar o token na área "Encoded"
3. Ver o payload decodificado

**Payload esperado:**
```json
{
  "sub": "afc3e132-5b58-4162-bc8e-42f6093976aa",
  "email": "user1@test.com",
  "iat": 1234567890,
  "exp": 1234567890
}
```

Observe que o campo é **`sub`** e não `userId`!

---

## 🛠️ FIX NECESSÁRIO NO BACKEND

### **Arquivo: `src/donations/donations.controller.ts`**

#### **Problema atual:**
```typescript
@Post('accept-upgrade')
@UseGuards(JwtAuthGuard)
async acceptUpgrade(
  @Body() acceptUpgradeDto: AcceptUpgradeDto,
  @Req() req: any
) {
  const userId = req.user.userId; // ❌ undefined! Token usa "sub"
  
  if (!userId) {
    throw new BadRequestException('userId is required for upgrade');
  }
  
  return this.donationsService.acceptUpgrade(userId, acceptUpgradeDto);
}
```

#### **Solução 1: Aceitar múltiplos campos (Recomendado)**
```typescript
@Post('accept-upgrade')
@UseGuards(JwtAuthGuard)
async acceptUpgrade(
  @Body() acceptUpgradeDto: AcceptUpgradeDto,
  @Req() req: any
) {
  // ✅ Tentar múltiplos campos possíveis
  const userId = req.user?.userId || req.user?.sub || req.user?.id;
  
  if (!userId) {
    // Log para debug
    this.logger.error('[UPGRADE] Could not extract userId from req.user:', req.user);
    throw new BadRequestException('userId is required for upgrade');
  }
  
  this.logger.log(`[UPGRADE] Processing upgrade for user: ${userId}`);
  return this.donationsService.acceptUpgrade(userId, acceptUpgradeDto);
}
```

#### **Solução 2: Padronizar JWT Strategy**
```typescript
// src/auth/strategies/jwt.strategy.ts

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // ✅ Padronizar: sempre retornar userId
    return {
      userId: payload.sub || payload.id || payload.userId, // Aceitar qualquer formato
      sub: payload.sub,
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };
  }
}
```

Com a **Solução 2**, todos os endpoints terão `req.user.userId` disponível automaticamente!

---

## 🔄 Comparação com Outros Endpoints

Verificar como outros endpoints extraem o userId:

```typescript
// Exemplos de endpoints que FUNCIONAM:

@Get('stats')
@UseGuards(JwtAuthGuard)
async getDonationStats(@Req() req: any) {
  const userId = req.user.???  // ← Verificar qual campo está usando
  // ...
}

@Get('to-send')
@UseGuards(JwtAuthGuard)
async getDonationsToSend(@Req() req: any) {
  const userId = req.user.???  // ← Verificar qual campo está usando
  // ...
}
```

**Provavelmente esses endpoints estão usando:**
- `req.user.sub` ou
- `req.user.id` ou
- Algum decorator diferente

---

## 📝 Checklist de Correção

### **Backend Fix:**
- [ ] Verificar estrutura do token decodificado (jwt.io)
- [ ] Confirmar qual campo contém o userId (`sub`, `id`, ou `userId`)
- [ ] Atualizar controller `accept-upgrade` para usar o campo correto
- [ ] OU atualizar JWT Strategy para padronizar `userId`
- [ ] Adicionar logs de debug temporários
- [ ] Testar o endpoint após correção
- [ ] Remover logs de debug se desnecessário

### **Verificação:**
- [ ] Testar upgrade no frontend
- [ ] Verificar logs do backend
- [ ] Confirmar que userId está sendo extraído
- [ ] Confirmar que upgrade funciona

---

## 🚀 Teste Rápido após Fix

Após aplicar a correção no backend, testar:

```javascript
// No console do navegador:
fetch('https://skymoney-test-back.dq4298.easypanel.host/donations/accept-upgrade', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    from_level: 1,
    to_level: 2
  })
})
.then(r => r.json())
.then(data => console.log('✅ Success:', data))
.catch(err => console.error('❌ Error:', err));
```

**Resposta esperada após fix:**
```json
{
  "message": "Upgrade realizado com sucesso!",
  "new_level": 2,
  "donations_created": [
    {
      "type": "upgrade",
      "level": 2,
      "amount": 200,
      "position": 5
    },
    {
      "type": "cascade",
      "level": 1,
      "amount": 100
    }
  ]
}
```

---

## 💡 Recomendação

**Aplicar Solução 2** (padronizar JWT Strategy) é a melhor opção porque:

1. ✅ Corrige o problema em todos os endpoints de uma vez
2. ✅ Evita repetir código em cada controller
3. ✅ Garante consistência em todo o sistema
4. ✅ Mais fácil de manter no futuro
5. ✅ Outros desenvolvedores sempre terão `req.user.userId` disponível

---

## 📋 Código Completo da Solução

### **jwt.strategy.ts** (Solução Recomendada)

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Padronizar estrutura do req.user
    // Sempre ter userId disponível, independente do formato do token
    return {
      userId: payload.sub || payload.id || payload.userId,
      sub: payload.sub,
      id: payload.id,
      email: payload.email,
      role: payload.role,
      // Adicionar outros campos conforme necessário
    };
  }
}
```

### **donations.controller.ts** (accept-upgrade)

```typescript
import { Controller, Post, Body, UseGuards, Req, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DonationsService } from './donations.service';
import { AcceptUpgradeDto } from './dto/accept-upgrade.dto';

@Controller('donations')
export class DonationsController {
  private readonly logger = new Logger(DonationsController.name);

  constructor(private readonly donationsService: DonationsService) {}

  @Post('accept-upgrade')
  @UseGuards(JwtAuthGuard)
  async acceptUpgrade(
    @Body() acceptUpgradeDto: AcceptUpgradeDto,
    @Req() req: any
  ) {
    // Após fix do JWT Strategy, userId estará sempre disponível
    const userId = req.user.userId;
    
    if (!userId) {
      this.logger.error('[UPGRADE] userId not found in req.user:', req.user);
      throw new BadRequestException('userId is required for upgrade');
    }
    
    this.logger.log(`[UPGRADE] User ${userId} requesting upgrade from level ${acceptUpgradeDto.from_level} to ${acceptUpgradeDto.to_level}`);
    
    return this.donationsService.acceptUpgrade(userId, acceptUpgradeDto);
  }
}
```

---

## ✅ Conclusão

**O frontend está correto e não precisa de alterações.**

**O backend precisa extrair o `userId` do campo correto do token JWT (`sub` ao invés de `userId`).**

**Aplicar a correção no JWT Strategy resolve o problema de forma definitiva e consistente.** 🎯
