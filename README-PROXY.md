# 🔄 Nginx Proxy para Backend - SkyMoney IA 2.0

## 📋 Como Funciona

O nginx agora funciona como **proxy reverso** para resolver problemas de CORS:

1. **Frontend** faz requisições para `/api/*`
2. **Nginx** remove `/api` e redireciona para `${API_BACKEND_URL}/*`
3. **Backend** recebe requisições sem problemas de CORS

## 🚀 Configuração

### Variável de Ambiente Obrigatória

No EasyPanel, configure:

```
API_BACKEND_URL=https://seu-backend.com
```

**Importante:** A URL deve terminar com `/` (barra final).

### Exemplos de URLs válidas:
- `https://api.exemplo.com/`
- `https://backend.exemplo.com/`
- `https://sky-money-ai-skymoneyback2.dq4298.easypanel.host/`

## 🔄 Fluxo de Requisições

### Antes (com CORS):
```
Frontend → https://backend.com/auth/login ❌ CORS Error
```

### Agora (com proxy):
```
Frontend → /api/auth/login
Nginx → https://backend.com/auth/login ✅ Success
```

## 📁 Arquivos Modificados

### 1. `nginx.conf.template`
- Template com placeholder `${API_BACKEND_URL}`
- Configuração de proxy para `/api/*`
- Headers CORS automáticos

### 2. `start.sh`
- Script que processa o template
- Substitui variável de ambiente
- Valida configuração do nginx

### 3. `Dockerfile`
- Instala `envsubst` para processar template
- Usa script de inicialização
- Suporte a variáveis de ambiente

### 4. `src/lib/api.ts`
- Frontend usa `/api` como base URL
- Nginx faz proxy para backend real

## 🛠️ Como Usar

### 1. Build da Imagem
```bash
docker build -t skymoney-frontend .
```

### 2. Deploy no EasyPanel
- Configure: `API_BACKEND_URL=https://seu-backend.com/`
- Deploy da imagem
- Reinicie o serviço

### 3. Teste
- Acesse o frontend
- Faça login
- Verifique se não há mais erros CORS

## 🔍 Logs e Debug

### Logs do Container
```bash
docker logs <container-id>
```

### Logs do Nginx
```bash
docker exec <container-id> cat /var/log/nginx/access.log
docker exec <container-id> cat /var/log/nginx/error.log
```

### Verificar Configuração
```bash
docker exec <container-id> nginx -t
```

## ✅ Vantagens

- **Sem CORS**: Nginx resolve automaticamente
- **Flexível**: URL do backend via variável de ambiente
- **Seguro**: Headers de segurança mantidos
- **Performance**: Cache e compressão do nginx
- **Fácil**: Só precisa definir uma variável

## 🚨 Troubleshooting

### Erro: "Variável de ambiente API_BACKEND_URL não está definida"
- Verifique se a variável está configurada no EasyPanel
- Certifique-se de que o nome está correto: `API_BACKEND_URL`

### Erro: "Configuração do nginx inválida"
- Verifique se a URL do backend está acessível
- Certifique-se de que a URL termina com `/`

### Requisições ainda falham
- Verifique se o backend está rodando
- Confirme se a URL do backend está correta
- Verifique os logs do container

## 📝 Exemplo Completo

### EasyPanel Configuration:
```
API_BACKEND_URL=https://sky-money-ai-skymoneyback2.dq4298.easypanel.host/
```

### Frontend Request:
```typescript
// Frontend faz requisição para:
fetch('/api/auth/login', { ... })

// Nginx redireciona para:
// https://sky-money-ai-skymoneyback2.dq4298.easypanel.host/auth/login
```

### Resultado:
- ✅ Sem erro CORS
- ✅ Requisição bem-sucedida
- ✅ Login funciona perfeitamente

---

**Última atualização**: Dezembro 2024
**Versão**: 2.0.0
**Status**: ✅ Implementado
