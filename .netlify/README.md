# 📁 Dossier .netlify - Configuration Déploiement

Ce dossier contient tous les fichiers de configuration nécessaires pour le déploiement automatique de **MythicMarket**.

## 🗂️ Contenu du Dossier

### 📋 **netlify.toml**
- Configuration principale pour le déploiement sur Netlify
- Paramètres de build, redirections et en-têtes de sécurité
- Configuration des variables d'environnement

### 🔄 **_redirects**
- Fichier de redirection pour le routage côté client (SPA)
- Assure que toutes les routes pointent vers `index.html`
- Configuration du routage pour une Single Page Application

### 🚀 **render.yaml**
- Configuration pour le déploiement du backend sur Render.com
- Définition du service web, variables d'environnement
- Configuration des ressources et de la santé du service

### ⚡ **deploy.bat**
- Script automatisé pour le déploiement
- Installation des dépendances, tests, commit et push Git
- Automatisation complète du processus de déploiement

## 🌐 **Architecture de Déploiement**

```
┌─────────────────┐    ┌─────────────────┐
│   FRONTEND      │    │    BACKEND      │
│   (Netlify)     │◄──►│   (Render.com)  │
│                 │    │                 │
│ • HTML/CSS/JS   │    │ • API Express   │
│ • Pages statiques│    │ • Système mail  │
│ • Routage SPA   │    │ • Base données  │
└─────────────────┘    └─────────────────┘
```

## 🚀 **Processus de Déploiement**

### 1. **Frontend (Netlify)**
- Déploiement automatique lors du push GitHub
- Configuration via `netlify.toml`
- Redirections via `_redirects`

### 2. **Backend (Render.com)**
- Déploiement via `render.yaml`
- Configuration des variables d'environnement
- Service web avec health checks

### 3. **Automatisation**
- Script `deploy.bat` pour tout automatiser
- Tests locaux avant déploiement
- Commit et push automatiques

## ⚙️ **Configuration Requise**

### **Variables d'Environnement (Render.com)**
```env
GMAIL_USER=votre-email@gmail.com
GMAIL_APP_PASSWORD=votre-mot-de-passe-app
CORS_ORIGIN=https://votre-site.netlify.app
NODE_ENV=production
PORT=10000
```

### **Configuration Netlify**
- Connecter le repository GitHub
- Le déploiement se fera automatiquement
- Configuration détectée via `netlify.toml`

## 🔧 **Utilisation**

### **Déploiement Automatique**
```bash
# Exécuter le script de déploiement
.netlify/deploy.bat
```

### **Déploiement Manuel**
1. Push vers GitHub
2. Netlify déploie automatiquement le frontend
3. Render.com déploie le backend via `render.yaml`

## 📚 **Documentation Complète**

- **README.md** (racine) - Vue d'ensemble du projet
- **CHANGELOG.md** - Historique des versions
- **DEPLOIEMENT_NETLIFY.md** - Guide détaillé de déploiement
- **RESUME_FINAL.md** - Résumé des fonctionnalités

## 🎯 **Avantages de cette Organisation**

✅ **Séparation claire** des configurations  
✅ **Déploiement automatisé** et fiable  
✅ **Configuration centralisée** dans un dossier dédié  
✅ **Documentation complète** pour chaque composant  
✅ **Maintenance facilitée** et organisation claire  

---

**MythicMarket** - Configuration de déploiement professionnelle et automatisée ! 🚀
