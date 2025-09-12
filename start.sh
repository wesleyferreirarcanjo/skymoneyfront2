#!/bin/sh

# Script de inicialização para processar template do nginx
# e iniciar o nginx com a configuração correta

echo "🚀 Iniciando aplicação..."

# Verificar se a variável de ambiente está definida
if [ -z "$API_BACKEND_URL" ]; then
    echo "❌ ERRO: Variável de ambiente API_BACKEND_URL não está definida!"
    echo "   Defina a variável API_BACKEND_URL com a URL do seu backend"
    echo "   Exemplo: API_BACKEND_URL=https://seu-backend.com"
    exit 1
fi

# Garantir que a URL termine com /
API_BACKEND_URL=$(echo "$API_BACKEND_URL" | sed 's|/*$|/|')

echo "🔗 Configurando proxy para: $API_BACKEND_URL"

# Substituir a variável no template do nginx
envsubst '${API_BACKEND_URL}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

echo "✅ Configuração do nginx atualizada"

# Testar configuração do nginx
echo "🧪 Testando configuração do nginx..."
nginx -t

if [ $? -ne 0 ]; then
    echo "❌ ERRO: Configuração do nginx inválida!"
    exit 1
fi

echo "✅ Configuração do nginx válida"

# Iniciar nginx
echo "🌐 Iniciando nginx..."
exec nginx -g "daemon off;"
