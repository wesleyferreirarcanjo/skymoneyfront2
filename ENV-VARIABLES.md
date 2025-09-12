# Variáveis de Ambiente

## Desenvolvimento Local

Crie um arquivo `.env.local` na raiz do projeto com:

```env
VITE_API_URL=https://sky-money-ai-skymoneyback2.dq4298.easypanel.host
```

## Produção (EasyPanel)

Configure a variável de ambiente no EasyPanel:

```
VITE_API_URL=https://seu-backend.com
```

## Como funciona

- **Desenvolvimento**: Usa `.env.local` ou `.env`
- **Produção**: Usa variável de ambiente do EasyPanel
- **Fallback**: Se não definida, usa a URL padrão do backend

## Exemplo de uso

```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```
