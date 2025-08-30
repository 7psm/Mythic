# 🚀 MythicMarket - E-commerce Discord Service

## 📖 Description

**MythicMarket** est une plateforme e-commerce moderne et sécurisée spécialement conçue pour les services Discord. Le projet comprend un frontend statique et un backend API avec système d'envoi d'emails automatique.

## ✨ Fonctionnalités

- 🛒 **Gestion de panier avancée** avec localStorage
- 💳 **Processus de checkout sécurisé** avec chiffrement des données
- 📧 **Système d'emails automatique** pour les confirmations de commande
- 🔐 **API sécurisée** avec validation des données
- 📱 **Interface responsive** et moderne
- 🎨 **Thème personnalisable** avec variables CSS

## 🏗️ Architecture

```
🌐 Frontend (Netlify)
├── Interface utilisateur (HTML/CSS/JS)
├── Gestion du panier
├── Processus de checkout
└── Pages de confirmation

🔧 Backend (Render.com)
├── API Express.js
├── Système d'envoi d'emails
├── Stockage des commandes
└── Validation des données
```

## 🚀 Installation et Déploiement

### Prérequis
- Node.js 18+
- Compte Gmail avec mot de passe d'application
- Comptes Render.com et Netlify

### 1. Installation Locale
```bash
# Cloner le repository
git clone https://github.com/AimbotBabyalone/Mythic.git
cd Mythic

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp env-example.txt .env
# Éditer .env avec vos vraies valeurs

# Démarrer le serveur local
npm start
```

### 2. Configuration des Variables d'Environnement
Créez un fichier `.env` basé sur `env-example.txt` :

```env
GMAIL_USER=votre-email@gmail.com
GMAIL_APP_PASSWORD=votre-mot-de-passe-app
CORS_ORIGIN=http://localhost:3001
NODE_ENV=development
PORT=3001
```

### 3. Déploiement Backend (Render.com)
1. Créer un compte sur [Render.com](https://render.com)
2. Connecter votre repo GitHub
3. Créer un "Web Service" avec :
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**: Configurer selon `env-production-example.txt`

### 4. Déploiement Frontend (Netlify)
1. Connecter votre repo GitHub à Netlify
2. Configurer le déploiement automatique
3. Le site sera accessible sur votre domaine Netlify

## 📁 Structure du Projet

```
Mythic/
├── API/                    # Backend API
│   ├── server.js          # Serveur principal
│   └── orders.json        # Stockage des commandes
├── MailSystem/            # Système d'emails
│   ├── emailService.js    # Service d'envoi d'emails
│   ├── config.js          # Configuration email
│   └── logger.js          # Système de logging
├── src/                   # Code source frontend
│   ├── js/               # JavaScript
│   ├── styles/           # CSS et styles
│   └── pages/            # Pages HTML
├── public/                # Assets statiques
├── netlify.toml          # Configuration Netlify
├── render.yaml            # Configuration Render.com
└── package.json           # Dépendances Node.js
```

## 🔧 Configuration

### Variables d'Environnement Production
```env
GMAIL_USER=votre-email@gmail.com
GMAIL_APP_PASSWORD=votre-mot-de-passe-app
CORS_ORIGIN=https://votre-site.netlify.app
NODE_ENV=production
PORT=10000
```

### Configuration CORS
Le serveur est configuré pour accepter les requêtes depuis votre domaine Netlify. Modifiez `CORS_ORIGIN` dans vos variables d'environnement.

## 📧 Système d'Emails

Le système utilise **Nodemailer** avec Gmail pour envoyer automatiquement :
- Confirmations de commande
- Notifications de statut
- Emails de suivi

### Configuration Gmail
1. Activer l'authentification à 2 facteurs
2. Générer un mot de passe d'application
3. Utiliser ces informations dans `.env`

## 🛡️ Sécurité

- **Chiffrement des données** sensibles
- **Validation des entrées** côté serveur
- **Protection CORS** configurée
- **Variables d'environnement** pour les secrets
- **Logging sécurisé** sans exposition de données sensibles

## 🐛 Dépannage

### Problèmes Courants

1. **Site Netlify ne trouve pas index.html**
   - Vérifier la configuration `netlify.toml`
   - S'assurer que le fichier `_redirects` est présent

2. **Emails ne s'envoient pas**
   - Vérifier les variables d'environnement sur Render.com
   - Vérifier le mot de passe d'application Gmail

3. **Erreurs CORS**
   - Vérifier que `CORS_ORIGIN` pointe vers votre domaine Netlify

### Logs et Debug
- Consulter les logs sur Render.com
- Vérifier la console du navigateur
- Utiliser les outils de développement

## 📚 Documentation

- `DEPLOIEMENT_NETLIFY.md` - Guide complet de déploiement
- `RESUME_FINAL.md` - Résumé des fonctionnalités
- `env-production-example.txt` - Variables d'environnement production

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :
1. Consulter la documentation
2. Vérifier les issues GitHub
3. Contacter l'équipe de développement

---

**MythicMarket** - Votre solution e-commerce moderne et sécurisée pour Discord ! 🚀
