# FileConvert - Application de Conversion de Fichiers

Application web moderne permettant la conversion de fichiers avec paiement Stripe (1€ par conversion).

## ✨ Fonctionnalités

- 🖼️ **Images**: PNG, JPG, WEBP, GIF, BMP, TIFF, SVG
- 📄 **Documents**: PDF, DOCX, TXT, HTML, MD
- 🎵 **Audio**: MP3, WAV, OGG, FLAC, M4A
- 🎬 **Vidéo**: MP4, AVI, MKV, MOV, WEBM
- 💳 **Paiement sécurisé** via Stripe (1€)
- 🎨 **Interface moderne** et responsive
- ⚡ **Conversion rapide**

## 🚀 Installation

### Prérequis

- Node.js 18+ et npm
- Compte Stripe (pour les paiements)

### Backend

```bash
cd backend
npm install
```

Créer un fichier `.env` :

```env
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete
STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publique
CLIENT_URL=http://localhost:3000
PORT=3001
```

### Frontend

Pas d'installation nécessaire (HTML/CSS/JS vanilla).

Modifier `app.js` ligne 2-3 avec vos clés Stripe :

```javascript
const API_URL = 'http://localhost:3001/api';
const STRIPE_PUBLISHABLE_KEY = 'pk_test_votre_cle_publique';
```

## 🎯 Lancement

### Démarrer le backend

```bash
cd backend
npm start
```

Le serveur démarre sur `http://localhost:3001`

### Démarrer le frontend

Ouvrir `frontend/index.html` dans un navigateur, ou utiliser un serveur local :

```bash
cd frontend
python3 -m http.server 3000
# ou
npx serve
```

Le site sera accessible sur `http://localhost:3000`

## 🔑 Configuration Stripe

1. Créer un compte sur [Stripe](https://stripe.com)
2. Obtenir les clés API dans [Dashboard > Developers > API keys](https://dashboard.stripe.com/apikeys)
3. **Mode test** : Utiliser les clés commençant par `sk_test_` et `pk_test_`
4. **Mode production** : Remplacer par les clés live `sk_live_` et `pk_live_`

### Cartes de test Stripe

En mode test, utiliser ces numéros de carte :

- **Succès**: `4242 4242 4242 4242`
- **Refusé**: `4000 0000 0000 0002`
- Date d'expiration : n'importe quelle date future
- CVC : n'importe quels 3 chiffres

## 📦 Déploiement

### Backend (Heroku, Railway, Render)

1. Créer une app sur la plateforme
2. Configurer les variables d'environnement
3. Déployer depuis GitHub ou via CLI

### Frontend (Vercel, Netlify, GitHub Pages)

1. Pousser le dossier `frontend` sur GitHub
2. Connecter à Vercel/Netlify
3. Mettre à jour `API_URL` dans `app.js` avec l'URL du backend

## 🛠️ Structure du projet

```
file-converter-app/
├── backend/
│   ├── server.js          # Serveur Express
│   ├── converters.js      # Logique de conversion
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── index.html         # Page principale
    ├── style.css          # Styles
    └── app.js             # JavaScript
```

## 🔧 Développement

### Ajouter un nouveau format

1. Dans `backend/converters.js`, ajouter la logique de conversion
2. Dans `backend/server.js`, ajouter le format à la route `/api/formats`
3. Le frontend détectera automatiquement les nouveaux formats

### Modifier le prix

Dans `backend/server.js`, ligne 40 :

```javascript
unit_amount: 100, // 1€ = 100 centimes
```

## 📝 TODO / Améliorations

- [ ] Ajouter plus de formats (archives ZIP, etc.)
- [ ] Batch conversion (plusieurs fichiers)
- [ ] Compression d'images
- [ ] Preview avant/après conversion
- [ ] Historique des conversions
- [ ] Système d'abonnement (conversions illimitées)
- [ ] API publique pour développeurs

## 🐛 Dépannage

### Le paiement ne fonctionne pas

- Vérifier que les clés Stripe sont correctes
- S'assurer d'être en mode test
- Consulter les logs Stripe Dashboard

### La conversion échoue

- Vérifier que ffmpeg est installé (pour audio/vidéo)
- Augmenter la limite de taille de fichier si nécessaire
- Consulter les logs du serveur

## 📄 Licence

MIT

## 👤 Auteur

Développé pour Ulrich (uniGO, Comind, maisonFacile)
