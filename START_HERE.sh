#!/bin/bash
# KÄYNNISTÄ CONVERTO - Helppo tapa!

echo "🚀 Converto Business OS - Käynnistin"
echo "====================================="
echo ""

cd "/Users/mxjlh/Documents/converto-business-os-quantum-mvp (1)"

# 1. Tarkista että .env on olemassa
if [ ! -f .env ]; then
    echo "⚠️  .env tiedosto puuttuu!"
    echo ""
    echo "Luo .env tiedosto:"
    echo "cat > .env << 'EOF'"
    echo "DATABASE_URL=sqlite:///./converto.db"
    echo "OPENAI_API_KEY=SINUN_AVAIN_TÄHÄN"
    echo "JWT_SECRET=dev-secret"
    echo "ADMIN_TOKEN=test123"
    echo "EOF"
    echo ""
    exit 1
fi

# 2. Käynnistä backend
echo "📡 Käynnistetään backend (port 8000)..."
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

# 3. Käynnistä frontend
echo "🎨 Käynnistetään frontend (port 3001)..."
cd frontend
npm run dev &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"
cd ..

echo ""
echo "✅ Palvelut käynnistetty!"
echo ""
echo "Odota 10-15 sekuntia, sitten avaa:"
echo "  📊 Dashboard:  http://localhost:3001/dashboard"
echo "  📸 OCR:        http://localhost:3001/selko/ocr"
echo "  💳 Billing:    http://localhost:3001/billing"
echo "  ⚙️  Admin:      http://localhost:3001/admin/economy"
echo ""
echo "Pysäytä palvelut:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "🎉 Onnea matkaan!"
