# 🔧 Configuração de Ambiente - SkyMoney Frontend

## 📋 Variáveis de Ambiente Necessárias

Para conectar o frontend ao backend rodando em `localhost:3000`, você precisa criar os seguintes arquivos:

### 1. Arquivo `.env.local` (Recomendado para desenvolvimento)

Crie o arquivo `.env.local` na raiz do projeto com o seguinte conteúdo:

```env
# Environment variables for local development
# Backend API URL
VITE_API_URL=http://localhost:3000

# Development mode
VITE_DEV=true
```

### 2. Arquivo `.env` (Alternativa)

Se preferir, você pode criar um arquivo `.env` na raiz do projeto:

```env
# Environment variables for development
# Backend API URL
VITE_API_URL=http://localhost:3000

# Development mode
VITE_DEV=true
```

## 🚀 Como Aplicar

1. **Crie o arquivo de ambiente**:
   ```bash
   # Opção 1: .env.local (recomendado)
   echo "VITE_API_URL=http://localhost:3000" > .env.local
   echo "VITE_DEV=true" >> .env.local
   
   # Opção 2: .env
   echo "VITE_API_URL=http://localhost:3000" > .env
   echo "VITE_DEV=true" >> .env
   ```

2. **Reinicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

## 🔍 Verificação

Após configurar, você deve ver no console do navegador:
```
🔗 API Base URL: http://localhost:3000
🔗 Usando VITE_API_URL? true
```

## 📝 Notas Importantes

- O arquivo `.env.local` tem prioridade sobre `.env`
- As variáveis devem começar com `VITE_` para serem acessíveis no frontend
- Reinicie o servidor após alterar as variáveis de ambiente
- O backend deve estar rodando em `localhost:3000` para funcionar

## 🛠️ Troubleshooting

Se ainda houver problemas:

1. **Verifique se o backend está rodando**:
   ```bash
   curl http://localhost:3000/health
   ```

2. **Verifique se as variáveis estão sendo carregadas**:
   - Abra o DevTools do navegador
   - Vá para Console
   - Procure pelas mensagens de debug da API

3. **Limpe o cache do Vite**:
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```
