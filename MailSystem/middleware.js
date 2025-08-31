// =============================================
// MIDDLEWARE POUR LE SYSTÈME D'EMAIL
// =============================================
// Ce fichier contient les middlewares pour sécuriser l'envoi d'emails
// Il inclut la limitation de débit et la validation des données

import emailRateLimiter from './rateLimiter.js';
import { validateConfig } from './config.js';

/**
 * Middleware pour vérifier la configuration email
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction suivante
 */
export function checkEmailConfig(req, res, next) {
  const configValidation = validateConfig();
  
  if (!configValidation.isValid) {
    return res.status(503).json({
      success: false,
      error: 'Service email temporairement indisponible',
      message: configValidation.message
    });
  }
  
  next();
}

/**
 * Middleware pour la limitation de débit des emails
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction suivante
 */
export function emailRateLimit(req, res, next) {
  // Récupération de l'IP du client
  const clientIP = req.ip || 
                   req.connection.remoteAddress || 
                   req.socket.remoteAddress ||
                   (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
                   req.headers['x-forwarded-for']?.split(',')[0] ||
                   'unknown';

  // Vérification de la limitation de débit
  const limitCheck = emailRateLimiter.checkLimit(clientIP);
  
  if (!limitCheck.allowed) {
    return res.status(429).json({
      success: false,
      error: 'Limite de débit dépassée',
      message: limitCheck.message,
      retryAfter: limitCheck.retryAfter,
      reason: limitCheck.reason
    });
  }

  // Ajout des informations de limitation à la requête
  req.emailRateLimit = {
    clientIP,
    stats: emailRateLimiter.getStats(clientIP)
  };

  next();
}

/**
 * Middleware pour valider les données d'email
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction suivante
 */
export function validateEmailData(req, res, next) {
  const { email, customerEmail } = req.body;
  const targetEmail = email || customerEmail;

  if (!targetEmail) {
    return res.status(400).json({
      success: false,
      error: 'Adresse email requise'
    });
  }

  // Validation basique du format email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(targetEmail)) {
    return res.status(400).json({
      success: false,
      error: 'Format d\'adresse email invalide'
    });
  }

  // Vérification de la longueur de l'email
  if (targetEmail.length > 254) {
    return res.status(400).json({
      success: false,
      error: 'Adresse email trop longue'
    });
  }

  next();
}

/**
 * Middleware pour valider les données de commande
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction suivante
 */
export function validateOrderData(req, res, next) {
  const { customerName, orderNumber, totalAmount } = req.body;

  const errors = [];

  if (!customerName || customerName.trim().length === 0) {
    errors.push('Nom du client requis');
  }

  if (!orderNumber || orderNumber.trim().length === 0) {
    errors.push('Numéro de commande requis');
  }

  if (!totalAmount || isNaN(parseFloat(totalAmount)) || parseFloat(totalAmount) <= 0) {
    errors.push('Montant total invalide');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Données de commande invalides',
      details: errors
    });
  }

  next();
}

/**
 * Middleware pour valider les données de contact
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction suivante
 */
export function validateContactData(req, res, next) {
  const { name, email, subject, message } = req.body;

  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push('Nom requis');
  }

  if (!email || email.trim().length === 0) {
    errors.push('Email requis');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Format d\'email invalide');
    }
  }

  if (!subject || subject.trim().length === 0) {
    errors.push('Sujet requis');
  }

  if (!message || message.trim().length === 0) {
    errors.push('Message requis');
  }

  // Limitation de la longueur des champs
  if (name && name.length > 100) {
    errors.push('Nom trop long (max 100 caractères)');
  }

  if (subject && subject.length > 200) {
    errors.push('Sujet trop long (max 200 caractères)');
  }

  if (message && message.length > 5000) {
    errors.push('Message trop long (max 5000 caractères)');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Données de contact invalides',
      details: errors
    });
  }

  next();
}

/**
 * Middleware pour logger les tentatives d'envoi d'email
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction suivante
 */
export function logEmailAttempt(req, res, next) {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const { method, path } = req;
  const userAgent = req.headers['user-agent'] || 'unknown';

  console.log(`📧 Tentative d'envoi d'email - IP: ${clientIP}, Méthode: ${method}, Chemin: ${path}, User-Agent: ${userAgent}`);

  // Interception de la réponse pour logger le résultat
  const originalSend = res.send;
  res.send = function(data) {
    try {
      const responseData = JSON.parse(data);
      if (responseData.success) {
        console.log(`✅ Email envoyé avec succès - IP: ${clientIP}`);
      } else {
        console.log(`❌ Échec envoi email - IP: ${clientIP}, Erreur: ${responseData.error}`);
      }
    } catch (e) {
      // Si ce n'est pas du JSON, on ne fait rien
    }
    
    originalSend.call(this, data);
  };

  next();
}

/**
 * Middleware combiné pour les routes d'email
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction suivante
 */
export function emailMiddleware(req, res, next) {
  // Application des middlewares dans l'ordre
  checkEmailConfig(req, res, (err) => {
    if (err) return next(err);
    
    emailRateLimit(req, res, (err) => {
      if (err) return next(err);
      
      validateEmailData(req, res, (err) => {
        if (err) return next(err);
        
        logEmailAttempt(req, res, next);
      });
    });
  });
}

export default {
  checkEmailConfig,
  emailRateLimit,
  validateEmailData,
  validateOrderData,
  validateContactData,
  logEmailAttempt,
  emailMiddleware
};



