// =============================================
// CONFIGURATION DE SÉCURITÉ - MythicMarket
// =============================================
// Ce fichier centralise toutes les constantes et helpers de sécurité
// utilisés par les scripts Node (updater, security-check) et, au besoin,
// par des outils de CI. L'objectif est d'avoir une source de vérité unique
// pour la validation des versions et des URLs de redirection.

export const SECURITY_CONFIG = {
    // Formats de version autorisés
    VERSION_PATTERNS: {
        // Format standard: 1.0.1, 2.1.0, etc.
        STANDARD: /^[0-9]+\.[0-9]+\.[0-9]+$/,
        // Format avec préfixe: v1.0.1, beta2.1, etc.
        PREFIXED: /^[a-zA-Z]+[0-9]+\.[0-9]+$/,
        // Format simple: 1.0, v2, beta3, etc.
        SIMPLE: /^[a-zA-Z]*[0-9]+(\.[0-9]+)?$/
    },
    
    // Caractères interdits pour les versions
    FORBIDDEN_CHARS: [
        '<', '>', '"', "'", '&', '|', ';', '(', ')', 
        '[', ']', '{', '}', '$', '`', '\\', '/', ':', 
        '*', '?', '!', '@', '#', '%', '^', '~', ' '
    ],
    
    // URLs autorisées pour les redirections (whitelist stricte)
    ALLOWED_REDIRECT_URLS: [
        '../index.html', './index.html', 'index.html', '/index.html',
        '../splash.html', './splash.html', 'splash.html', '/splash.html',
        '../Maintenance/VersionUpdater.html', './Maintenance/VersionUpdater.html',
        '/Maintenance/VersionUpdater.html'
    ],
    
    // Fichiers sensibles à surveiller
    SENSITIVE_FILES: [
        'src/services/versionService.js',
        'package.json',
        'Maintenance/VersionUpdater.html'
    ],
    
    // Limites de sécurité
    LIMITS: {
        MAX_VERSION_LENGTH: 10,
        MIN_VERSION_LENGTH: 1,
        MAX_REDIRECT_DELAY: 15000, // 15 secondes max
        MAX_CACHE_CLEAR_ATTEMPTS: 3
    }
};

// Empêche toute mutation accidentelle de la configuration à l'exécution
Object.freeze(SECURITY_CONFIG);

// Fonction de validation de version sécurisée
export function validateVersionSecure(version) {
    if (!version || typeof version !== 'string') {
        return { valid: false, reason: 'Version must be a non-empty string' };
    }
    
    // Vérifier la longueur
    if (version.length < SECURITY_CONFIG.LIMITS.MIN_VERSION_LENGTH || 
        version.length > SECURITY_CONFIG.LIMITS.MAX_VERSION_LENGTH) {
        return { valid: false, reason: 'Version length must be between 1 and 10 characters' };
    }
    
    // Vérifier les caractères interdits
    const hasForbiddenChars = SECURITY_CONFIG.FORBIDDEN_CHARS.some(char => version.includes(char));
    if (hasForbiddenChars) {
        return { valid: false, reason: 'Version contains forbidden characters' };
    }
    
    // Vérifier les points consécutifs
    if (version.includes('..')) {
        return { valid: false, reason: 'Version cannot contain consecutive dots' };
    }
    
    // Vérifier les points au début/fin
    if (version.startsWith('.') || version.endsWith('.')) {
        return { valid: false, reason: 'Version cannot start or end with a dot' };
    }
    
    return { valid: true, reason: 'Version is valid' };
}

// Fonction de validation d'URL de redirection
export function validateRedirectUrl(url) {
    if (!url || typeof url !== 'string') {
        return { valid: false, reason: 'URL must be a non-empty string' };
    }
    
    const baseUrl = url.split('?')[0];
    const isAllowed = SECURITY_CONFIG.ALLOWED_REDIRECT_URLS.includes(baseUrl);
    
    if (!isAllowed) {
        return { valid: false, reason: 'URL is not in the allowed list' };
    }
    
    return { valid: true, reason: 'URL is valid' };
}

// Fonction utilitaire: normalise une version (trim, supprime espaces
// superflus). N'altère pas la structure sémantique.
export function sanitizeVersion(version) {
    if (typeof version !== 'string') return version;
    return version.trim();
}


