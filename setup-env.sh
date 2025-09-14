#!/bin/bash

# Script para configurar variáveis de ambiente do frontend
# Uso: ./setup-env.sh [backend-url]

set -e

# URL padrão do backend
DEFAULT_BACKEND_URL="http://localhost:3000"
BACKEND_URL=${1:-$DEFAULT_BACKEND_URL}

echo "🔧 Configurando ambiente do frontend..."
echo "📡 Backend URL: $BACKEND_URL"

# Criar arquivo .env.local
cat > .env.local << EOF
# Environment variables for local development
# Backend API URL
VITE_API_URL=$BACKEND_URL

# Development mode
VITE_DEV=true
EOF

echo "✅ Arquivo .env.local criado com sucesso!"
echo ""
echo "📋 Conteúdo do arquivo:"
cat .env.local
echo ""
echo "🚀 Para aplicar as configurações, execute:"
echo "   npm run dev"
echo ""
echo "🔍 Para verificar se está funcionando:"
echo "   - Abra o DevTools do navegador"
echo "   - Vá para Console"
echo "   - Procure por: '🔗 API Base URL: $BACKEND_URL'"
