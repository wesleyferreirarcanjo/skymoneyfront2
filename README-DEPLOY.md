# Deploy no EasyPanel

Este projeto está configurado para ser deployado no EasyPanel usando variáveis de ambiente.

## Configuração

### Variável de Ambiente Obrigatória

Defina a seguinte variável de ambiente no EasyPanel:

```
API_BACKEND_URL=https://seu-backend.com
```

**Importante:** A URL deve terminar com `/` (barra final).

### Exemplos de URLs válidas:
- `https://api.exemplo.com/`
- `https://backend.exemplo.com/api/`
- `https://sky-money-ai-skymoneyback2.dq4298.easypanel.host/`

## Como funciona

1. **Build**: A aplicação React é compilada e empacotada
2. **Runtime**: O script `start.sh` processa o template do nginx
3. **Proxy**: O nginx redireciona `/api/*` para `${API_BACKEND_URL}*`

## Estrutura de arquivos

- `Dockerfile` - Configuração do container
- `nginx.conf.template` - Template do nginx com placeholder
- `start.sh` - Script de inicialização que processa o template
- `src/lib/api.ts` - Frontend configurado para usar `/api`

## Logs

O container mostra logs úteis durante a inicialização:
- ✅ Configuração válida
- 🔗 URL do backend configurada
- ❌ Erros de configuração

## Troubleshooting

### Erro: "Variável de ambiente API_BACKEND_URL não está definida"
- Verifique se a variável está definida no EasyPanel
- Certifique-se de que o nome está correto: `API_BACKEND_URL`

### Erro: "Configuração do nginx inválida"
- Verifique se a URL do backend está acessível
- Certifique-se de que a URL termina com `/`

### Requisições retornam 405 Method Not Allowed
- Verifique se o backend está rodando
- Confirme se a URL do backend está correta
- Verifique os logs do container para ver a URL configurada
