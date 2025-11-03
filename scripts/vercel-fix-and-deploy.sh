#!/bin/bash
# Vercel Fix & Deploy - Automaattinen korjaus ja deployment
# Käyttö: ./scripts/vercel-fix-and-deploy.sh

set -e  # Pysähtyy virheeseen

echo "🚀 Vercel Fix & Deploy - Aloitetaan..."
echo ""

# Värit outputille
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Tarkista että olemme oikeassa hakemistossa
if [ ! -d "frontend" ]; then
    echo -e "${RED}❌ frontend/ hakemistoa ei löydy!${NC}"
    exit 1
fi

# 2. Tarkista git status
echo -e "${YELLOW}📋 Tarkistetaan git status...${NC}"
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Löytyi muutoksia jotka eivät ole commitoitu:${NC}"
    git status --short
    echo ""
    read -p "Haluatko commitoida ja pushata muutokset? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add -A
        git commit -m "fix: auto-fix and deploy to Vercel"
        git push origin main
        echo -e "${GREEN}✅ Muutokset pushattu GitHubiin${NC}"
    else
        echo -e "${YELLOW}⚠️  Jätetään muutokset commitointia vaille${NC}"
    fi
else
    echo -e "${GREEN}✅ Git tyhjä - kaikki muutokset commitoitu${NC}"
fi

echo ""

# 3. Tarkista Vercel CLI
echo -e "${YELLOW}🔍 Tarkistetaan Vercel CLI...${NC}"
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI ei ole asennettuna. Asennetaan...${NC}"
    npm install -g vercel
else
    echo -e "${GREEN}✅ Vercel CLI löytyi${NC}"
fi

echo ""

# 4. Siirry frontend-hakemistoon
cd frontend

# 5. Tarkista että npm-paketit ovat asennettuna
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules puuttuu. Asennetaan paketit...${NC}"
    npm install
fi

# 6. Testaa build paikallisesti (valinnainen)
echo -e "${YELLOW}🔨 Testataan build paikallisesti...${NC}"
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build onnistui!${NC}"
else
    echo -e "${RED}❌ Build epäonnistui!${NC}"
    echo "Tarkista virheet:"
    npm run build
    exit 1
fi

echo ""

# 7. Deployaa Verceliin
echo -e "${YELLOW}🚀 Deployataan Verceliin...${NC}"
echo ""

# Jos VERCEL_TOKEN on asetettu, käytä sitä
if [ -n "$VERCEL_TOKEN" ]; then
    echo -e "${GREEN}✅ VERCEL_TOKEN löytyi${NC}"
    vercel --prod --yes --token="$VERCEL_TOKEN"
else
    echo -e "${YELLOW}⚠️  VERCEL_TOKEN ei ole asetettu${NC}"
    echo "Deployataan interaktiivisesti..."
    vercel --prod
fi

echo ""
echo -e "${GREEN}✅ Deployment valmis!${NC}"
echo ""
echo "🌐 Tarkista deployment: https://converto.fi"
echo ""

# 8. Odota hetki ja tarkista deployment
echo -e "${YELLOW}⏳ Odotetaan 10 sekuntia ja tarkistetaan deployment...${NC}"
sleep 10

# Tarkista että sivu vastaa
if curl -s -o /dev/null -w "%{http_code}" https://converto.fi | grep -q "200"; then
    echo -e "${GREEN}✅ Sivu vastaa! (HTTP 200)${NC}"
else
    echo -e "${YELLOW}⚠️  Sivu ei vielä vastaa. Odota hetki ja tarkista manuaalisesti.${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Valmis!${NC}"
echo ""
echo "📊 Seuraavat askeleet:"
echo "1. Tarkista Vercel-dashboard: https://vercel.com/dashboard"
echo "2. Testaa sivu: https://converto.fi"
echo "3. Tarkista build-lokit jos ongelmia"
