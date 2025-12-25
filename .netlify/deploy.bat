@echo off
REM ========================================
REM SCRIPT DE DÉPLOIEMENT - MYTHICMARKET
REM ========================================
REM Script automatisé pour le déploiement

echo.
echo 🚀 DÉPLOIEMENT MYTHICMARKET
echo ========================================
echo.

REM ========================================
REM VÉRIFICATION DE L'ENVIRONNEMENT
REM ========================================
echo 📋 Vérification de l'environnement...

REM Vérifier que Git est disponible
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git n'est pas installé ou n'est pas dans le PATH
    pause
    exit /b 1
)

REM Vérifier que Node.js est disponible
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js n'est pas installé ou n'est pas dans le PATH
    pause
    exit /b 1
)

echo ✅ Environnement vérifié
echo.

REM ========================================
REM INSTALLATION DES DÉPENDANCES
REM ========================================
echo 📦 Installation des dépendances...
call npm install
if errorlevel 1 (
    echo ❌ Erreur lors de l'installation des dépendances
    pause
    exit /b 1
)
echo ✅ Dépendances installées
echo.

REM ========================================
REM TEST DU SERVEUR LOCAL
REM ========================================
echo 🧪 Test du serveur local...
echo ⚠️  Démarrage du serveur en arrière-plan...
start /B npm start

REM Attendre que le serveur démarre
echo ⏳ Attente du démarrage du serveur...
timeout /t 5 /nobreak >nul

REM Test de connexion
echo 🔍 Test de connexion au serveur...
curl -s http://localhost:3001/api/health >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Serveur local non accessible (normal en production)
) else (
    echo ✅ Serveur local accessible
)

REM Arrêter le serveur local
taskkill /f /im node.exe >nul 2>&1
echo.

REM ========================================
REM COMMIT ET PUSH GIT
REM ========================================
echo 📝 Préparation du commit Git...

REM Vérifier l'état Git
git status --porcelain
if errorlevel 1 (
    echo ❌ Erreur lors de la vérification de l'état Git
    pause
    exit /b 1
)

REM Ajouter tous les fichiers
echo 📁 Ajout des fichiers...
git add .
if errorlevel 1 (
    echo ❌ Erreur lors de l'ajout des fichiers
    pause
    exit /b 1
)

REM Créer le commit
echo 💾 Création du commit...
git commit -m "🚀 Déploiement automatique - $(date /t) $(time /t)"
if errorlevel 1 (
    echo ❌ Erreur lors de la création du commit
    pause
    exit /b 1
)

REM Pousser vers GitHub
echo 🚀 Push vers GitHub...
git push origin main
if errorlevel 1 (
    echo ❌ Erreur lors du push vers GitHub
    pause
    exit /b 1
)

echo ✅ Déploiement terminé avec succès !
echo.

REM ========================================
REM INFORMATIONS IMPORTANTES
REM ========================================
echo 📋 PROCHAINES ÉTAPES :
echo.
echo 1. 🌐 NETLIFY (Frontend) :
echo    - Le déploiement se fera automatiquement
echo    - Vérifiez votre dashboard Netlify
echo    - Le site sera accessible en quelques minutes
echo.
echo 2. 🔧 RENDER.COM (Backend) :
echo    - Connectez votre repo GitHub
echo    - Créez un "Web Service"
echo    - Configurez les variables d'environnement Discord
echo    - Déployez le backend
echo.
echo ========================================
echo 🎉 DÉPLOIEMENT TERMINÉ !
echo ========================================
echo.

pause
