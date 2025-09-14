#!/bin/sh

# Production startup script - Optimized for production deployment

echo "🚀 Starting SkyMoney IA 2.0 Production..."

# Check if backend URL environment variable is set
if [ -z "$API_BACKEND_URL" ]; then
    echo "❌ ERROR: API_BACKEND_URL environment variable is not set!"
    echo "   Please set API_BACKEND_URL to your backend URL"
    echo "   Example: API_BACKEND_URL=https://your-backend.com"
    exit 1
fi

# Ensure URL ends with /
API_BACKEND_URL=$(echo "$API_BACKEND_URL" | sed 's|/*$|/|')

echo "🔗 Configuring proxy to: $API_BACKEND_URL"

# Substitute environment variable in nginx template
envsubst '${API_BACKEND_URL}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

echo "✅ Nginx configuration updated"

# Test nginx configuration
echo "🧪 Testing nginx configuration..."
nginx -t

if [ $? -ne 0 ]; then
    echo "❌ ERROR: Invalid nginx configuration!"
    exit 1
fi

echo "✅ Nginx configuration is valid"

# Start nginx
echo "🌐 Starting nginx..."
exec nginx -g "daemon off;"