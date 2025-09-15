#!/bin/bash

# Deploy script para SkyMoney Frontend
set -e

echo "🚀 Iniciando deploy do SkyMoney Frontend..."

# Definir URL padrão se não estiver definida
API_BACKEND_URL=${API_BACKEND_URL:-https://sky-money-ai-skyback3.dq4298.easypanel.host}

echo "🔗 API Backend URL: $API_BACKEND_URL"

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose -f docker-compose.prod.yml down || true

# Limpar imagens antigas (opcional)
echo "🧹 Limpando cache do Docker..."
docker system prune -f

# Build e start com --build
echo "🔨 Fazendo build e iniciando containers..."
docker-compose -f docker-compose.prod.yml up --build -d

# Aguardar inicialização
echo "⏳ Aguardando inicialização..."
sleep 10

# Verificar se está rodando
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo "✅ Deploy concluído com sucesso!"
    echo "🌐 Frontend disponível em: http://localhost"
    echo "🔗 API Backend configurada para: $API_BACKEND_URL"
else
    echo "❌ Erro no deploy!"
    docker-compose -f docker-compose.prod.yml logs
    exit 1
fi
