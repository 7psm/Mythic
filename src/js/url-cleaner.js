/**
 * URL Cleaner - Nettoie l'URL et met à jour le titre
 * Supprime tous les paramètres d'URL et affiche seulement le nom de la page
 */

// Fonction pour nettoyer l'URL
function cleanURL() {
    try {
        console.log('🔧 Début du nettoyage URL...');
        
        // Obtenir l'URL actuelle
        const currentUrl = new URL(window.location.href);
        console.log('📍 URL actuelle:', currentUrl.href);
        
        // Vérifier s'il y a des paramètres ou fragments à nettoyer
        if (currentUrl.search || currentUrl.hash) {
            // Créer une URL propre (sans paramètres ni fragments)
            const cleanUrl = currentUrl.origin + currentUrl.pathname;
            
            // Remplacer l'URL dans l'historique (sans recharger la page)
            window.history.replaceState({}, document.title, cleanUrl);
            
            console.log('✅ URL nettoyée:', cleanUrl);
        } else {
            console.log('ℹ️ Aucun paramètre à nettoyer');
        }
        
        // Mettre à jour le titre de la page
        updatePageTitle();
        
    } catch (error) {
        console.error('❌ Erreur lors du nettoyage de l\'URL:', error);
    }
}

// Fonction pour mettre à jour le titre de la page
function updatePageTitle() {
    try {
        const pathname = window.location.pathname;
        let pageName = '';
        
        console.log('📄 Chemin de la page:', pathname);
        
        // Extraire le nom de la page depuis le chemin
        if (pathname.includes('/src/pages/')) {
            // Pour les pages dans src/pages/
            const fileName = pathname.split('/').pop();
            pageName = fileName.replace('.html', '');
        } else if (pathname.includes('/Maintenance/')) {
            // Pour les pages de maintenance
            const fileName = pathname.split('/').pop();
            pageName = fileName.replace('.html', '');
        } else if (pathname === '/' || pathname === '/index.html') {
            // Page d'accueil
            pageName = 'Accueil';
        } else {
            // Fallback - utiliser le nom du fichier
            const fileName = pathname.split('/').pop();
            pageName = fileName ? fileName.replace('.html', '') : 'Page';
        }
        
        // Capitaliser la première lettre
        pageName = pageName.charAt(0).toUpperCase() + pageName.slice(1);
        
        // Mettre à jour le titre
        const newTitle = `${pageName} | Mythic Market`;
        document.title = newTitle;
        
        console.log('✅ Titre mis à jour:', newTitle);
        
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour du titre:', error);
    }
}

// Exécuter immédiatement
cleanURL();

// Exécuter aussi quand la page est chargée (au cas où)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cleanURL);
} else {
    // La page est déjà chargée
    cleanURL();
}
