// =============================================
// SERVICE DE GESTION DES VERSIONS - MythicMarket
// =============================================
// But:
// - Détecter automatiquement qu'une nouvelle version de l'application est disponible
// - Purger les caches/stockages côté navigateur pour éviter d'anciennes ressources
// - Recharger la page avec un paramètre de bust (_bust) pour forcer le rafraîchissement
// Notes:
// - Ce module fonctionne côté client (navigateur). Il est tolérant aux erreurs et
//   n'interrompt jamais l'affichage en cas d'API non disponible (Cache API, storage, etc.).

// Version de l'application (mise à jour automatiquement par le script updater)
export const APP_VERSION = "1.1.0";

// Version de build (timestamp pour le cache busting)
export const BUILD_VERSION = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_BUILD_ID)
  ? process.env.REACT_APP_BUILD_ID
  : String(Date.now());

// Store the current version in local storage to detect changes
const STORAGE_KEY = 'mythic_version';

/**
 * Purge de façon défensive les caches et stockages navigateur.
 * Evite les exceptions en environnement restrictif (ex: privacy mode)
 */
function clearCachesAndStorage() {
  // localStorage / sessionStorage
  try { sessionStorage && sessionStorage.clear && sessionStorage.clear(); } catch (_) {}
  try { localStorage && localStorage.removeItem && localStorage.removeItem(STORAGE_KEY); } catch (_) {}
  // Cache API
  try {
    if ('caches' in window) {
      caches.keys().then((names) => { names.forEach((n) => caches.delete(n)); }).catch(() => {});
    }
  } catch (_) {}
  // Cookies (basique, domaine courant)
  try {
    document.cookie.split(';').forEach((cookie) => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    });
  } catch (_) {}
}

/**
 * Vérifie si la version a changé et force un rechargement propre si nécessaire.
 * En cas de nouvelle version, on purge les caches et on ajoute un paramètre _bust.
 */
export const checkForUpdates = () => {
  // Skip version checking in development mode
  if (process.env.NODE_ENV === 'development') {
    return;
  }
  
  // Skip if URL already contains _bust parameter (prevent infinite reloads)
  if (window.location.href.includes('_bust=')) {
    return;
  }
  
  let lastVersion = null;
  try { lastVersion = localStorage.getItem(STORAGE_KEY); } catch (_) {}
  
  if (lastVersion && lastVersion !== APP_VERSION) {
    // Version has changed, clear cache and reload
    try { localStorage.setItem(STORAGE_KEY, APP_VERSION); } catch (_) {}
    
    // Purge défensive des caches et stockages
    clearCachesAndStorage();
    
    // Create clean URL for reload by removing any existing _bust parameters
    let baseUrl = window.location.href.split('?')[0];
    let searchParams = new URLSearchParams(window.location.search);
    
    // Remove any existing _bust parameters
    searchParams.delete('_bust');
    
    // Add our new cache busting parameter
    searchParams.append('_bust', Date.now().toString());
    
    // Create the new URL with proper parameters
    const newSearch = searchParams.toString();
    const newUrl = newSearch ? `${baseUrl}?${newSearch}` : baseUrl;
    
    // Reload (replace évite d'empiler dans l'historique)
    try { window.location.replace(newUrl); } catch (_) { window.location.href = newUrl; }
  } else {
    // First load or same version, just update the stored version
    try { localStorage.setItem(STORAGE_KEY, APP_VERSION); } catch (_) {}
  }
};

/**
 * Initialize version checking on page load
 * Call this function when the page loads to automatically check for updates
 */
export const initializeVersionCheck = () => {
  console.log('🔍 Initialisation du service de gestion des versions...');
  console.log('📦 Version actuelle:', APP_VERSION);
  
  // Check for updates immediately
  checkForUpdates();
  
  console.log('✅ Service de gestion des versions initialisé');
};

/**
 * Get the current application version
 * @returns {string} The current application version
 */
export const getCurrentVersion = () => {
  return APP_VERSION;
};

/**
 * Get the last stored version from localStorage
 * @returns {string|null} The last stored version or null if not found
 */
export const getLastStoredVersion = () => {
  return localStorage.getItem(STORAGE_KEY);
};

/**
 * Force a version check and reload if needed
 * Useful for manual version checking
 */
export const forceVersionCheck = () => {
  console.log('🔄 Vérification forcée des versions...');
  checkForUpdates();
};

// Auto-initialize if this script is loaded directly
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeVersionCheck);
  } else {
    // DOM is already ready
    initializeVersionCheck();
  }
}