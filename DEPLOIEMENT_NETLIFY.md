# 🚀 Guide de Déploiement sur Netlify - MythicMarket

## ⚠️ IMPORTANT : Problème de Déploiement Identifié

**Votre site actuel sur Netlify ne peut PAS fonctionner avec le système de mail et l'API car :**

1. **Netlify est un hébergeur de sites statiques** - il ne peut pas exécuter Node.js/Express
2. **Votre API `server.js` nécessite un serveur Node.js** qui n'est pas disponible sur Netlify
3. **Le système de mail nécessite un backend fonctionnel** pour traiter les commandes

## 🔧 Solutions Recommandées

### Option 1 : Hébergement Backend + Netlify Frontend (RECOMMANDÉ)

#### A. Héberger le Backend (API + Mail) sur :
- **Render.com** (gratuit) ✅
- **Railway.app** (gratuit) ✅
- **Heroku** (payant) ⚠️
- **DigitalOcean App Platform** (payant) ⚠️

#### B. Modifier les URLs dans le code :

```javascript
// Dans src/js/Confirmation.js - LIGNE 5
const API_URL = "https://votre-api.onrender.com"; // Remplacer par votre URL de backend

// Dans src/js/checkout.js - LIGNE 150
const response = await fetch("https://votre-api.onrender.com/api/order", {
  // ... reste du code
});
```

### Option 2 : Utiliser Netlify Functions (LIMITÉ)

Créer des fonctions serverless dans `netlify/functions/` mais avec des limitations :
- Pas de persistance de données (pas de `orders.json`)
- Limites de temps d'exécution
- Complexité pour l'envoi d'emails

## 📋 Étapes de Déploiement Recommandées

### 1. Héberger le Backend sur Render.com

```bash
# 1. Créer un compte sur render.com
# 2. Connecter votre repo GitHub
# 3. Créer un nouveau "Web Service"
# 4. Configurer :
#    - Build Command: npm install
#    - Start Command: npm start
#    - Environment Variables:
#      - GMAIL_USER=votre-email@gmail.com
#      - GMAIL_APP_PASSWORD=votre-mot-de-passe-app
#      - CORS_ORIGIN=https://mythicmarket.netlify.app
```

### 2. Modifier les URLs dans le Code

```javascript
// src/js/Confirmation.js - LIGNE 5
const API_URL = "https://votre-api.onrender.com";

// src/js/checkout.js - LIGNE 150
const response = await fetch("https://votre-api.onrender.com/api/order", {
```

### 3. Déployer le Frontend sur Netlify

```bash
# 1. Connecter votre repo GitHub à Netlify
# 2. Configurer :
#    - Build Command: (laisser vide)
#    - Publish Directory: .
# 3. Déployer
```

## 🔒 Variables d'Environnement Nécessaires

### Sur Render.com (Backend) :
```env
GMAIL_USER=votre-email@gmail.com
GMAIL_APP_PASSWORD=votre-mot-de-passe-app
CORS_ORIGIN=https://mythicmarket.netlify.app
NODE_ENV=production
PORT=10000
```

### Sur Netlify (Frontend) :
```env
REACT_APP_API_URL=https://votre-api.onrender.com
```

## 📁 Structure de Déploiement Finale

```
🌐 Frontend (Netlify)
├── index.html
├── src/
│   ├── js/
│   ├── styles/
│   └── pages/
└── public/

🔧 Backend (Render.com)
├── API/
│   ├── server.js
│   └── orders.json
└── MailSystem/
    ├── emailService.js
    ├── config.js
    └── .env
```

## 🚨 Problèmes Courants et Solutions

### 1. Erreur CORS
```javascript
// Dans server.js, vérifier que CORS_ORIGIN pointe vers votre domaine Netlify
origin: process.env.CORS_ORIGIN || "https://mythicmarket.netlify.app"
```

### 2. Emails qui ne s'envoient pas
- Vérifier les variables d'environnement sur Render.com
- Vérifier que le mot de passe d'application Gmail est correct
- Consulter les logs sur Render.com

### 3. Commandes qui ne se sauvegardent pas
- Vérifier que `orders.json` est accessible en écriture
- Consulter les logs d'erreur sur Render.com

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs sur Render.com
2. Vérifiez la console du navigateur
3. Testez l'API directement avec Postman ou Insomnia

## ✅ Checklist de Déploiement

- [ ] Backend déployé sur Render.com
- [ ] Variables d'environnement configurées
- [ ] URLs modifiées dans le code frontend
- [ ] Test de l'API avec Postman
- [ ] Test d'envoi d'email
- [ ] Frontend déployé sur Netlify
- [ ] Test complet du processus de commande

---

**Résumé : Votre site Netlify actuel ne peut pas fonctionner sans un backend hébergé ailleurs. Il faut soit héberger le backend sur Render.com, soit refactoriser complètement l'application pour utiliser uniquement des services serverless.**
