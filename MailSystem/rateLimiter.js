// =============================================
// SYSTÈME DE LIMITATION DE DÉBIT
// =============================================
// Ce fichier gère la limitation de débit pour l'envoi d'emails
// Il empêche l'envoi massif d'emails et protège contre les abus

/**
 * Classe pour gérer la limitation de débit des emails
 */
class EmailRateLimiter {
  constructor() {
    // Stockage des tentatives d'envoi par IP et par minute/heure
    this.minuteAttempts = new Map();
    this.hourAttempts = new Map();
    
    // Configuration par défaut
    this.maxEmailsPerMinute = 10;
    this.maxEmailsPerHour = 100;
    
    // Nettoyage automatique des données expirées
    this.startCleanupInterval();
  }

  /**
   * Configure les limites de débit
   * @param {number} maxPerMinute - Nombre maximum d'emails par minute
   * @param {number} maxPerHour - Nombre maximum d'emails par heure
   */
  setLimits(maxPerMinute, maxPerHour) {
    this.maxEmailsPerMinute = maxPerMinute;
    this.maxEmailsPerHour = maxPerHour;
  }

  /**
   * Vérifie si l'envoi d'email est autorisé pour une IP donnée
   * @param {string} ip - Adresse IP du client
   * @returns {Object} Résultat de la vérification
   */
  checkLimit(ip) {
    const now = Date.now();
    const minuteKey = `${ip}:${Math.floor(now / 60000)}`; // Clé par minute
    const hourKey = `${ip}:${Math.floor(now / 3600000)}`; // Clé par heure

    // Récupération des tentatives actuelles
    const minuteAttempts = this.minuteAttempts.get(minuteKey) || 0;
    const hourAttempts = this.hourAttempts.get(hourKey) || 0;

    // Vérification des limites
    if (minuteAttempts >= this.maxEmailsPerMinute) {
      return {
        allowed: false,
        reason: 'minute_limit_exceeded',
        message: 'Limite de débit par minute dépassée',
        retryAfter: 60 - (Math.floor(now / 1000) % 60)
      };
    }

    if (hourAttempts >= this.maxEmailsPerHour) {
      return {
        allowed: false,
        reason: 'hour_limit_exceeded',
        message: 'Limite de débit par heure dépassée',
        retryAfter: 3600 - (Math.floor(now / 1000) % 3600)
      };
    }

    return {
      allowed: true,
      minuteAttempts: minuteAttempts + 1,
      hourAttempts: hourAttempts + 1
    };
  }

  /**
   * Enregistre une tentative d'envoi d'email
   * @param {string} ip - Adresse IP du client
   * @returns {boolean} True si l'envoi est autorisé
   */
  recordAttempt(ip) {
    const check = this.checkLimit(ip);
    
    if (!check.allowed) {
      return false;
    }

    const now = Date.now();
    const minuteKey = `${ip}:${Math.floor(now / 60000)}`;
    const hourKey = `${ip}:${Math.floor(now / 3600000)}`;

    // Mise à jour des compteurs
    this.minuteAttempts.set(minuteKey, check.minuteAttempts);
    this.hourAttempts.set(hourKey, check.hourAttempts);

    return true;
  }

  /**
   * Obtient les statistiques de débit pour une IP
   * @param {string} ip - Adresse IP du client
   * @returns {Object} Statistiques actuelles
   */
  getStats(ip) {
    const now = Date.now();
    const minuteKey = `${ip}:${Math.floor(now / 60000)}`;
    const hourKey = `${ip}:${Math.floor(now / 3600000)}`;

    return {
      minuteAttempts: this.minuteAttempts.get(minuteKey) || 0,
      hourAttempts: this.hourAttempts.get(hourKey) || 0,
      minuteLimit: this.maxEmailsPerMinute,
      hourLimit: this.maxEmailsPerHour
    };
  }

  /**
   * Démarre le nettoyage automatique des données expirées
   */
  startCleanupInterval() {
    // Nettoyage toutes les 5 minutes
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Nettoie les données expirées
   */
  cleanup() {
    const now = Date.now();
    const currentMinute = Math.floor(now / 60000);
    const currentHour = Math.floor(now / 3600000);

    // Nettoyage des tentatives par minute (garder seulement les 2 dernières minutes)
    for (const [key] of this.minuteAttempts) {
      const [, minute] = key.split(':');
      if (parseInt(minute) < currentMinute - 2) {
        this.minuteAttempts.delete(key);
      }
    }

    // Nettoyage des tentatives par heure (garder seulement les 2 dernières heures)
    for (const [key] of this.hourAttempts) {
      const [, hour] = key.split(':');
      if (parseInt(hour) < currentHour - 2) {
        this.hourAttempts.delete(key);
      }
    }

    console.log(`🧹 Nettoyage des données de limitation de débit - ${this.minuteAttempts.size} entrées minute, ${this.hourAttempts.size} entrées heure`);
  }

  /**
   * Réinitialise les compteurs pour une IP (utile pour les tests)
   * @param {string} ip - Adresse IP du client
   */
  resetCounters(ip) {
    const now = Date.now();
    const minuteKey = `${ip}:${Math.floor(now / 60000)}`;
    const hourKey = `${ip}:${Math.floor(now / 3600000)}`;

    this.minuteAttempts.delete(minuteKey);
    this.hourAttempts.delete(hourKey);
  }
}

// Instance singleton du rate limiter
const emailRateLimiter = new EmailRateLimiter();

export default emailRateLimiter;



