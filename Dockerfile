# Production Dockerfile - Otimizado para deployment em produção

# Stage 1: Build stage
FROM node:20-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências primeiro para aproveitar cache do Docker
COPY package*.json ./

# Instalar apenas dependências de produção para reduzir tamanho da imagem
RUN npm ci --only=production --no-audit --no-fund --prefer-offline && \
    npm cache clean --force

# Instalar devDependencies necessárias apenas para o build
RUN npm install --only=dev --no-audit --no-fund --prefer-offline

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build && \
    npm cache clean --force

# Stage 2: Production stage
FROM nginx:alpine AS production

# Instalar ferramentas necessárias para produção
RUN apk add --no-cache gettext curl && \
    rm -rf /var/cache/apk/*

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Copiar arquivos de build para o nginx
COPY --from=builder --chown=appuser:appgroup /app/dist /usr/share/nginx/html

# Copiar configurações do nginx
COPY --chown=nginx:nginx nginx.conf.template /etc/nginx/nginx.conf.template
COPY --chown=root:root start.sh /start.sh

# Tornar script executável
RUN chmod +x /start.sh

# Configurar permissões adequadas
RUN chown -R appuser:appgroup /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown nginx:nginx /var/run/nginx.pid && \
    chmod 755 /usr/share/nginx/html

# Variável de ambiente para URL do backend
ENV API_BACKEND_URL=https://sky-money-ai-skymoneyback2.dq4298.easypanel.host

# Gerar configuração nginx antes de mudar para usuário não-root
RUN envsubst '${API_BACKEND_URL}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && \
    chown nginx:nginx /etc/nginx/nginx.conf

# Expor porta 80
EXPOSE 80

# Mudar para usuário não-root
USER nginx

# Comando de inicialização
CMD ["nginx", "-g", "daemon off;"]
