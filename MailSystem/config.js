import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtenir le chemin du dossier MailSystem
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement depuis le dossier MailSystem
dotenv.config({ path: path.join(__dirname, '.env') });

// Configuration par défaut avec validation des types
const config = {
  // Configuration Email
  email: {
    user: process.env.GMAIL_USER || 'votre-email@gmail.com',
    password: process.env.GMAIL_APP_PASSWORD || 'xxxx-xxxx-xxxx-xxxx',
    from: process.env.GMAIL_USER || 'votre-email@gmail.com',
    service: 'gmail',
    port: 587,
    secure: false,
    tls: {
      rejectUnauthorized: false
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateLimit: 14, // emails par seconde (limite Gmail)
    rateDelta: 1000 // millisecondes
  },
  
  // Configuration Serveur
  server: {
    port: parseInt(process.env.PORT) || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
    host: process.env.HOST || 'localhost',
    timeout: parseInt(process.env.SERVER_TIMEOUT) || 30000
  },
  
  // Configuration CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'https://mythicmarket.netlify.app',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  },
  
  // Configuration Email Templates
  templates: {
    cache: process.env.EMAIL_TEMPLATE_CACHE === 'true',
    maxCacheSize: parseInt(process.env.EMAIL_CACHE_SIZE) || 100,
    defaultLanguage: process.env.DEFAULT_LANGUAGE || 'fr'
  },
  
  // Configuration Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    emailLogs: process.env.EMAIL_LOGS === 'true',
    logToFile: process.env.LOG_TO_FILE === 'true'
  }
};

// Validation avancée de la configuration
function validateConfig() {
  const errors = [];
  const warnings = [];
  
  // Validation des champs requis
  const requiredFields = [
    'email.user',
    'email.password'
  ];
  
  requiredFields.forEach(field => {
    const value = field.split('.').reduce((obj, key) => obj?.[key], config);
    if (!value || value.includes('votre-') || value.includes('xxxx-')) {
      errors.push(field);
    }
  });
  
  // Validation des formats
  if (config.email.user && !config.email.user.includes('@')) {
    errors.push('email.user doit être une adresse email valide');
  }
  
  if (config.email.password && config.email.password.length < 10) {
    warnings.push('email.password semble trop court');
  }
  
  // Validation des ports
  if (config.server.port < 1024 || config.server.port > 65535) {
    errors.push('server.port doit être entre 1024 et 65535');
  }
  
  // Validation des timeouts
  if (config.server.timeout < 1000 || config.server.timeout > 300000) {
    warnings.push('server.timeout devrait être entre 1000ms et 300000ms');
  }
  
  // Affichage des erreurs et avertissements
  if (errors.length > 0) {
    console.error('❌ Erreurs de configuration:', errors);
    console.error('📧 Pour configurer l\'email, créez un fichier .env avec:');
    console.error('GMAIL_USER=votre-vraie-email@gmail.com');
    console.error('GMAIL_APP_PASSWORD=votre-mot-de-passe-app');
    return false;
  }
  
  if (warnings.length > 0) {
    console.warn('⚠️ Avertissements de configuration:', warnings);
  }
  
  console.log('✅ Configuration validée avec succès');
  return true;
}

// Fonction pour obtenir la configuration d'un environnement spécifique
function getConfigForEnv(environment = 'development') {
  const envConfig = { ...config };
  
  if (environment === 'production') {
    envConfig.email.secure = true;
    envConfig.email.tls.rejectUnauthorized = true;
    envConfig.logging.level = 'warn';
  }
  
  return envConfig;
}

// Fonction pour valider une configuration spécifique
function validateEmailConfig() {
  const emailConfig = config.email;
  const errors = [];
  
  if (!emailConfig.user || emailConfig.user.includes('votre-')) {
    errors.push('Adresse email non configurée');
  }
  
  if (!emailConfig.password || emailConfig.password.includes('xxxx-')) {
    errors.push('Mot de passe d\'application non configuré');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export { config, validateConfig, getConfigForEnv, validateEmailConfig };
export default config;
