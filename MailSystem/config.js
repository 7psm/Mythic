// =============================================
// CONFIGURATION DU SYSTÈME DE MAIL
// =============================================
// Ce fichier gère la configuration sécurisée du système d'envoi d'emails
// Il utilise les variables d'environnement pour la sécurité

import dotenv from 'dotenv';

// Chargement des variables d'environnement
dotenv.config();

// Configuration par défaut pour le développement
const defaultConfig = {
  // Configuration SMTP (Gmail, Outlook, etc.)
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true pour 465, false pour les autres ports
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  },
  
  // Configuration de l'expéditeur
  from: {
    name: process.env.FROM_NAME || 'MythicMarket',
    email: process.env.FROM_EMAIL || process.env.SMTP_USER || ''
  },
  
  // Configuration de sécurité
  security: {
    maxRetries: parseInt(process.env.MAX_RETRIES) || 3,
    timeout: parseInt(process.env.EMAIL_TIMEOUT) || 10000, // 10 secondes
    rateLimit: {
      maxEmailsPerHour: parseInt(process.env.MAX_EMAILS_PER_HOUR) || 100,
      maxEmailsPerMinute: parseInt(process.env.MAX_EMAILS_PER_MINUTE) || 10
    }
  },
  
  // Configuration des templates
  templates: {
    orderConfirmation: {
      subject: process.env.ORDER_CONFIRMATION_SUBJECT || 'Confirmation de commande - MythicMarket',
      template: 'orderConfirmation'
    },
    orderStatus: {
      subject: process.env.ORDER_STATUS_SUBJECT || 'Mise à jour de votre commande - MythicMarket',
      template: 'orderStatus'
    },
    contactForm: {
      subject: process.env.CONTACT_FORM_SUBJECT || 'Nouveau message de contact - MythicMarket',
      template: 'contactForm'
    }
  }
};

/**
 * Valide la configuration email
 * @returns {Object} Résultat de la validation
 */
export function validateConfig() {
  const requiredVars = ['SMTP_USER', 'SMTP_PASS'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`⚠️ Variables d'environnement manquantes: ${missingVars.join(', ')}`);
    return {
      isValid: false,
      missing: missingVars,
      message: 'Configuration email incomplète - emails désactivés'
    };
  }
  
  return {
    isValid: true,
    message: 'Configuration email valide'
  };
}

/**
 * Obtient la configuration email
 * @returns {Object} Configuration complète
 */
export function getConfig() {
  return defaultConfig;
}

/**
 * Obtient la configuration SMTP
 * @returns {Object} Configuration SMTP
 */
export function getSmtpConfig() {
  return defaultConfig.smtp;
}

/**
 * Obtient les informations de l'expéditeur
 * @returns {Object} Informations de l'expéditeur
 */
export function getFromConfig() {
  return defaultConfig.from;
}

export default defaultConfig;



