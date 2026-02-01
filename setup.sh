#!/bin/bash

echo "🚀 FileConvert - Installation"
echo "=============================="
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js n'est pas installé${NC}"
    echo "Installer Node.js depuis: https://nodejs.org"
    exit 1
fi

echo -e "${GREEN}✓ Node.js détecté: $(node --version)${NC}"

# Installer les dépendances backend
echo ""
echo "📦 Installation des dépendances backend..."
cd backend
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dépendances backend installées${NC}"
else
    echo -e "${RED}❌ Erreur lors de l'installation${NC}"
    exit 1
fi

# Créer le fichier .env si inexistant
if [ ! -f .env ]; then
    echo ""
    echo -e "${YELLOW}⚙️  Configuration Stripe${NC}"
    echo ""
    read -p "Clé secrète Stripe (sk_test_...): " stripe_secret
    read -p "Clé publique Stripe (pk_test_...): " stripe_public
    
    cat > .env << EOF
STRIPE_SECRET_KEY=$stripe_secret
STRIPE_PUBLISHABLE_KEY=$stripe_public
CLIENT_URL=http://localhost:3000
PORT=3001
MAX_FILE_SIZE=52428800
EOF
    
    echo -e "${GREEN}✓ Fichier .env créé${NC}"
else
    echo -e "${YELLOW}⚠️  Fichier .env existe déjà${NC}"
fi

# Mettre à jour le frontend avec la clé publique Stripe
cd ../frontend
if [ -n "$stripe_public" ]; then
    sed -i "s/pk_test_your_key_here/$stripe_public/g" app.js
    echo -e "${GREEN}✓ Frontend configuré${NC}"
fi

cd ..

echo ""
echo -e "${GREEN}✅ Installation terminée !${NC}"
echo ""
echo "Pour démarrer l'application :"
echo ""
echo "  Terminal 1 (Backend) :"
echo "  $ cd backend && npm start"
echo ""
echo "  Terminal 2 (Frontend) :"
echo "  $ cd frontend && python3 -m http.server 3000"
echo ""
echo "  Puis ouvrir: http://localhost:3000"
echo ""
