# Système de Mail MythicMarket

## 📧 Vue d'ensemble

Ce système de mail est conçu pour l'e-commerce MythicMarket. Il offre un service d'envoi d'emails sécurisé, optimisé et facilement intégrable avec votre API Express existante.

## 🚀 Fonctionnalités

- ✅ **Envoi d'emails automatiques** pour les commandes
- ✅ **Templates HTML responsifs** et modernes
- ✅ **Limitation de débit** pour éviter les abus
- ✅ **Retry automatique** en cas d'erreur
- ✅ **Validation des données** complète
- ✅ **Logging détaillé** pour le debugging
- ✅ **Configuration sécurisée** via variables d'environnement
- ✅ **Compatibilité Render** et autres plateformes cloud

## 📁 Structure des fichiers

```
MailSystem/
├── config.js          # Configuration et validation
├── emailService.js    # Service principal d'envoi
├── templates.js       # Templates HTML des emails
├── rateLimiter.js     # Limitation de débit
├── middleware.js      # Middlewares Express
├── routes.js          # Routes API
└── README.md          # Documentation
```

## ⚙️ Configuration

### Variables d'environnement requises

Créez un fichier `.env` à la racine de votre projet :

```env
# Configuration SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-app

# Configuration expéditeur
FROM_NAME=MythicMarket
FROM_EMAIL=votre-email@gmail.com

# Configuration sécurité
MAX_RETRIES=3
EMAIL_TIMEOUT=10000
MAX_EMAILS_PER_HOUR=100
MAX_EMAILS_PER_MINUTE=10

# Sujets des emails (optionnel)
ORDER_CONFIRMATION_SUBJECT=Confirmation de commande - MythicMarket
ORDER_STATUS_SUBJECT=Mise à jour de votre commande - MythicMarket
CONTACT_FORM_SUBJECT=Nouveau message de contact - MythicMarket
```

### Configuration Gmail

Pour utiliser Gmail, vous devez :

1. Activer l'authentification à 2 facteurs
2. Générer un mot de passe d'application
3. Utiliser ce mot de passe dans `SMTP_PASS`

## 🔧 Intégration avec votre API

### 1. Mise à jour de votre server.js

Votre `server.js` est déjà configuré pour utiliser le système de mail. Les imports sont corrects :

```javascript
import emailService from '../MailSystem/emailService.js';
import { validateConfig } from '../MailSystem/config.js';
```

### 2. Ajout des routes email (optionnel)

Si vous voulez ajouter les routes dédiées au système de mail :

```javascript
import emailRoutes from '../MailSystem/routes.js';

// Ajoutez cette ligne après vos autres routes
app.use('/api/email', emailRoutes);
```

## 📧 Types d'emails supportés

### 1. Confirmation de commande

```javascript
// Dans votre route POST /api/order
const emailResult = await emailService.sendOrderConfirmation({
  customerEmail: order.email,
  customerName: order.customerName,
  orderNumber: order.orderNumber,
  totalAmount: order.totalAmount,
  items: order.items,
  shippingMethod: order.shippingMethod,
  shippingCost: order.shippingCost,
  paymentMethod: order.paymentMethod
});
```

### 2. Mise à jour de statut

```javascript
const emailResult = await emailService.sendOrderStatusUpdate({
  customerEmail: order.email,
  customerName: order.customerName,
  orderNumber: order.orderNumber,
  status: 'shipped',
  trackingNumber: 'TRK123456789',
  estimatedDelivery: '2024-01-15'
});
```

### 3. Formulaire de contact

```javascript
const emailResult = await emailService.sendContactForm({
  name: 'John Doe',
  email: 'john@example.com',
  subject: 'Question sur ma commande',
  message: 'Bonjour, j\'ai une question...',
  phone: '+33123456789' // optionnel
});
```

### 4. Email de test

```javascript
const emailResult = await emailService.sendTestEmail(
  'test@example.com',
  'Test du système d\'email'
);
```

## 🔒 Sécurité

### Limitation de débit

Le système limite automatiquement :
- **10 emails par minute** par IP
- **100 emails par heure** par IP

### Validation des données

- Validation du format email
- Limitation de la longueur des champs
- Protection contre les injections

### Configuration sécurisée

- Variables d'environnement pour les secrets
- Validation de la configuration au démarrage
- Timeout pour éviter les blocages

## 🛠️ API Endpoints

Si vous ajoutez les routes email, voici les endpoints disponibles :

### Test du système
```
POST /api/email/test
Body: { "email": "test@example.com", "message": "Test" }
```

### Confirmation de commande
```
POST /api/email/order-confirmation
Body: { "customerEmail": "...", "customerName": "...", ... }
```

### Mise à jour de statut
```
POST /api/email/order-status
Body: { "customerEmail": "...", "status": "...", ... }
```

### Formulaire de contact
```
POST /api/email/contact
Body: { "name": "...", "email": "...", "subject": "...", "message": "..." }
```

### Statut du service
```
GET /api/email/status
```

### Réinitialisation
```
POST /api/email/reset
```

## 🚀 Déploiement sur Render

### 1. Variables d'environnement sur Render

Ajoutez toutes les variables d'environnement dans votre dashboard Render :

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-app
FROM_NAME=MythicMarket
FROM_EMAIL=votre-email@gmail.com
```

### 2. Configuration du build

Votre `package.json` est déjà configuré correctement pour Render.

### 3. Vérification

Après le déploiement, testez le système :

```bash
curl -X POST https://votre-app.onrender.com/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","message":"Test"}'
```

## 🔍 Monitoring et Debugging

### Logs automatiques

Le système génère des logs détaillés :
- ✅ Succès d'envoi
- ❌ Erreurs d'envoi
- 📧 Tentatives d'envoi
- 🧹 Nettoyage des données
- 📊 Statistiques de débit

### Vérification du statut

```javascript
const status = emailService.getStatus();
console.log(status);
// {
//   isInitialized: true,
//   hasTransporter: true,
//   configValid: true
// }
```

## 🐛 Résolution des problèmes

### Erreur "Configuration email invalide"

Vérifiez vos variables d'environnement :
```bash
echo $SMTP_USER
echo $SMTP_PASS
```

### Erreur "Limite de débit dépassée"

Attendez ou réinitialisez les compteurs :
```bash
curl -X POST https://votre-app.onrender.com/api/email/rate-limit-reset/VOTRE_IP
```

### Erreur de connexion SMTP

1. Vérifiez vos identifiants Gmail
2. Assurez-vous que l'authentification à 2 facteurs est activée
3. Utilisez un mot de passe d'application

## 📈 Performance

### Optimisations incluses

- **Retry automatique** : 3 tentatives en cas d'erreur
- **Timeout configurable** : 10 secondes par défaut
- **Nettoyage automatique** : toutes les 5 minutes
- **Envoi non-bloquant** : utilisation de `setImmediate`

### Métriques

Le système peut gérer :
- **100 emails/heure** par défaut
- **10 emails/minute** par défaut
- **Retry automatique** sur erreurs temporaires

## 🤝 Support

Pour toute question ou problème :

1. Vérifiez les logs de votre application
2. Testez avec l'endpoint `/api/email/status`
3. Consultez la documentation des templates
4. Vérifiez votre configuration SMTP

---

**Version :** 1.0.0  
**Dernière mise à jour :** Janvier 2024  
**Compatibilité :** Node.js 18+, Express 4+, Render



