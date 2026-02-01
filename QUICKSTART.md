# 🚀 Démarrage Rapide - FileConvert

## Installation en 3 minutes

### 1. Configuration Stripe (2 min)

1. Va sur https://dashboard.stripe.com/register
2. Crée un compte (gratuit)
3. Va dans **Developers > API keys**
4. Copie :
   - **Secret key** (sk_test_...)
   - **Publishable key** (pk_test_...)

### 2. Installation automatique

```bash
cd file-converter-app
./setup.sh
```

Le script va te demander tes clés Stripe et tout configurer.

### 3. Lancement

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
python3 -m http.server 3000
```

**Ouvre:** http://localhost:3000

---

## 🧪 Test avec carte fictive

En mode test Stripe, utilise :

- **Numéro**: 4242 4242 4242 4242
- **Date**: n'importe quelle date future (ex: 12/34)
- **CVC**: n'importe quels 3 chiffres (ex: 123)

---

## 🌐 Mise en ligne (GRATUIT)

### Frontend sur Vercel

1. Crée un compte sur https://vercel.com
2. Clique "New Project"
3. Import le dossier `frontend`
4. Deploy (c'est automatique)

### Backend sur Railway

1. Crée un compte sur https://railway.app
2. "New Project" > "Deploy from GitHub repo"
3. Sélectionne le dossier `backend`
4. Ajoute les variables d'environnement :
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PUBLISHABLE_KEY`
   - `CLIENT_URL` (URL de ton frontend Vercel)
   - `PORT=3001`
5. Deploy

### Connecter frontend ↔ backend

Dans `frontend/app.js`, ligne 2 :
```javascript
const API_URL = 'https://ton-backend.railway.app/api';
```

---

## 💰 Passer en mode PRODUCTION

1. Dans Stripe Dashboard, active ton compte (vérification identité)
2. Récupère les clés **LIVE** (commencent par `sk_live_` et `pk_live_`)
3. Remplace dans le backend `.env` et frontend `app.js`
4. **C'est tout !** Les paiements réels fonctionnent

---

## ❓ Problèmes ?

### Le serveur ne démarre pas
```bash
cd backend
rm -rf node_modules
npm install
npm start
```

### Stripe ne fonctionne pas
- Vérifie que tu as copié les bonnes clés
- Regarde les logs dans Stripe Dashboard

### Conversion échoue
Pour audio/vidéo, installe ffmpeg :
```bash
# Ubuntu/Debian
sudo apt install ffmpeg

# macOS
brew install ffmpeg
```

---

## 📊 Analytics & Stats

Pour voir tes conversions et revenus :
- **Stripe Dashboard** : https://dashboard.stripe.com
- Section "Payments" pour voir tous les paiements

---

**Besoin d'aide ?** Check le `README.md` complet !
