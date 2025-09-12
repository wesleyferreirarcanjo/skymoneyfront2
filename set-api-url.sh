#!/bin/bash

# Script simples para configurar a URL da API externa
# Uso: ./set-api-url.sh https://sua-api-externa.com

set -e

if [ $# -eq 0 ]; then
    echo "❌ Erro: URL da API não fornecida"
    echo "Uso: $0 https://sua-api-externa.com"
    echo ""
    echo "Exemplo:"
    echo "  $0 https://api.skymoney.com"
    exit 1
fi

API_URL=$1

echo "🔧 Configurando API: $API_URL"

# Limpar a URL (remover barras finais)
CLEAN_URL="${API_URL%/}"

# Substituir no docker-compose.yml
sed -i.bak "s|API_BACKEND_URL: https://.*|API_BACKEND_URL: $CLEAN_URL|g" docker-compose.yml

# Substituir no nginx.conf
sed -i.bak "s|SUA_URL_EXTERNA_AQUI|$CLEAN_URL|g" nginx.conf

echo "✅ Configuração atualizada!"
echo ""
echo "🚀 Execute:"
echo "  docker-compose up --build"
echo ""
echo "🔍 Teste:"
echo "  curl http://localhost:3000/api/health"
