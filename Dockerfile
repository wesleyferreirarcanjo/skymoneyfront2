# Multi-stage build para otimizar o tamanho da imagem final

# Stage 1: Build stage
FROM node:20-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências primeiro (para melhor cache)
COPY package*.json ./

# Instalar dependências (incluindo devDependencies para o build)
# Usar --no-cache para evitar problemas de cache do npm
RUN npm ci --no-cache --only=production=false

# Copiar código fonte (após instalar dependências para melhor cache)
COPY . .

# Limpar cache do npm antes do build
RUN npm cache clean --force

# Build da aplicação
RUN npm run build

# Stage 2: Production stage
FROM nginx:alpine

# Instalar envsubst para substituição de variáveis de ambiente
RUN apk add --no-cache gettext

# Copiar arquivos de build para o nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar template do nginx e script de inicialização
COPY nginx.conf.template /etc/nginx/nginx.conf.template
COPY start.sh /start.sh

# Tornar script executável
RUN chmod +x /start.sh

# Variável de ambiente para URL do backend (será definida em runtime)
ENV API_BACKEND_URL=https://sky-money-ai-skymoneyback2.dq4298.easypanel.host

# Expor porta 80
EXPOSE 80

# Usar script de inicialização em vez do nginx direto
CMD ["/start.sh"]
