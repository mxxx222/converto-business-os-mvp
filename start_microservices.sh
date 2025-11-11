#!/bin/bash

# Converto Business OS - Microservices Startup Script
echo "🚀 Starting Converto Business OS Microservices Architecture..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your actual API keys and configuration."
    echo "   Required: OPENAI_API_KEY, STRIPE_SECRET_KEY, JWT_SECRET_KEY"
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p monitoring/prometheus
mkdir -p monitoring/grafana/dashboards
mkdir -p monitoring/grafana/datasources
mkdir -p monitoring/logstash/pipeline
mkdir -p nginx/ssl
mkdir -p tessdata

# Build and start services
echo "🔨 Building and starting microservices..."
docker-compose -f docker-compose.microservices.yml up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🔍 Checking service health..."
services=("api-gateway:8000" "ai-gateway:8001" "ocr-service:8002" "vision-service:8003" "billing-service:8004" "auth-service:8005" "event-bus:8006")

for service in "${services[@]}"; do
    name=$(echo $service | cut -d: -f1)
    port=$(echo $service | cut -d: -f2)
    
    if curl -f -s "http://localhost:$port/health" > /dev/null; then
        echo "✅ $name is healthy"
    else
        echo "❌ $name is not responding"
    fi
done

echo ""
echo "🎉 Converto Business OS Microservices are starting up!"
echo ""
echo "📊 Service URLs:"
echo "   🌐 API Gateway:     http://localhost:8000"
echo "   🤖 AI Gateway:      http://localhost:8001"
echo "   📄 OCR Service:     http://localhost:8002"
echo "   👁️  Vision Service:  http://localhost:8003"
echo "   💳 Billing Service: http://localhost:8004"
echo "   🔐 Auth Service:    http://localhost:8005"
echo "   📡 Event Bus:       http://localhost:8006"
echo ""
echo "📈 Monitoring:"
echo "   📊 Prometheus:      http://localhost:9090"
echo "   📈 Grafana:         http://localhost:3000 (admin/admin)"
echo "   🔍 Kibana:          http://localhost:5601"
echo ""
echo "🗄️  Databases:"
echo "   🐘 PostgreSQL:      localhost:5432"
echo "   📦 Redis:           localhost:6379"
echo "   📨 Kafka:           localhost:9092"
echo ""
echo "🔧 Management Commands:"
echo "   📋 View logs:       docker-compose -f docker-compose.microservices.yml logs -f"
echo "   🛑 Stop services:   docker-compose -f docker-compose.microservices.yml down"
echo "   🔄 Restart:         docker-compose -f docker-compose.microservices.yml restart"
echo ""
echo "📚 Documentation:"
echo "   📖 API Docs:        http://localhost:8000/docs"
echo "   🔧 Health Check:    http://localhost:8000/services/health"
echo "   📊 Gateway Stats:   http://localhost:8000/stats"
echo ""
echo "✨ Happy coding with Converto Business OS!"
