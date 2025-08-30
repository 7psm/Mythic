@echo off
echo =============================================
echo DEPLOIEMENT MYTHICMARKET - SCRIPT AUTOMATIQUE
echo =============================================
echo.

echo [1/5] Verification de l'environnement...
if not exist "package.json" (
    echo ❌ ERREUR: package.json non trouve
    echo Assurez-vous d'etre dans le dossier racine du projet
    pause
    exit /b 1
)

if not exist "API\server.js" (
    echo ❌ ERREUR: server.js non trouve
    echo Vérifiez que le dossier API existe
    pause
    exit /b 1
)

if not exist "MailSystem\emailService.js" (
    echo ❌ ERREUR: emailService.js non trouve
    echo Vérifiez que le dossier MailSystem existe
    pause
    exit /b 1
)

echo ✅ Environnement verifie
echo.

echo [2/5] Installation des dependances...
call npm install
if %errorlevel% neq 0 (
    echo ❌ ERREUR: Installation des dependances echouee
    pause
    exit /b 1
)
echo ✅ Dependances installees
echo.

echo [3/5] Test du serveur local...
echo Demarrage du serveur de test...
start /B cmd /c "npm start"
timeout /t 5 /nobreak >nul

echo Test de l'API...
curl -s http://localhost:3001/api/orders >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Serveur local fonctionne
) else (
    echo ⚠️ Serveur local non accessible (peut etre normal)
)

echo Arret du serveur de test...
taskkill /f /im node.exe >nul 2>&1
echo.

echo [4/5] Preparation du commit Git...
echo Ajout des fichiers...
git add .
if %errorlevel% neq 0 (
    echo ❌ ERREUR: Ajout Git echoue
    pause
    exit /b 1
)

echo Commit des modifications...
git commit -m "Deploiement automatique - Systeme de mail commente et optimise"
if %errorlevel% neq 0 (
    echo ❌ ERREUR: Commit Git echoue
    pause
    exit /b 1
)
echo ✅ Commit effectue
echo.

echo [5/5] Push vers GitHub...
echo Envoi vers GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo ❌ ERREUR: Push Git echoue
    pause
    exit /b 1
)
echo ✅ Push reussi
echo.

echo =============================================
echo DEPLOIEMENT TERMINE AVEC SUCCES !
echo =============================================
echo.
echo 📋 PROCHAINES ETAPES:
echo.
echo 1. Aller sur https://render.com
echo 2. Creer un compte et connecter votre repo GitHub
echo 3. Creer un nouveau "Web Service" avec:
echo    - Build Command: npm install
echo    - Start Command: npm start
echo    - Environment Variables:
echo      * GMAIL_USER=votre-email@gmail.com
echo      * GMAIL_APP_PASSWORD=votre-mot-de-passe-app
echo      * CORS_ORIGIN=https://mythicmarket.netlify.app
echo.
echo 4. Modifier les URLs dans le code:
echo    - src/js/Confirmation.js ligne 5
echo    - src/js/checkout.js ligne 150
echo.
echo 5. Redemarrer le deploy sur Netlify
echo.
echo 📖 Consultez DEPLOIEMENT_NETLIFY.md pour plus de details
echo.
pause
