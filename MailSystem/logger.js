// Système de logging avancé pour le système de mail
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Logger {
  constructor() {
    this.logLevels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
    
    this.currentLevel = this.logLevels[config.logging.level] || this.logLevels.info;
    this.logDir = path.join(__dirname, 'logs');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  getTimestamp() {
    return new Date().toISOString();
  }

  getLogFileName() {
    const date = new Date().toISOString().split('T')[0];
    return `email-system-${date}.log`;
  }

  formatMessage(level, message, data = null) {
    const timestamp = this.getTimestamp();
    const levelUpper = level.toUpperCase().padEnd(5);
    let formattedMessage = `[${timestamp}] ${levelUpper} ${message}`;
    
    if (data) {
      if (typeof data === 'object') {
        formattedMessage += `\n${JSON.stringify(data, null, 2)}`;
      } else {
        formattedMessage += ` | ${data}`;
      }
    }
    
    return formattedMessage;
  }

  writeToFile(message) {
    if (!config.logging.logToFile) return;
    
    try {
      const logFile = path.join(this.logDir, this.getLogFileName());
      const logEntry = message + '\n';
      
      fs.appendFileSync(logFile, logEntry, 'utf8');
    } catch (error) {
      console.error('❌ Erreur écriture log:', error);
    }
  }

  log(level, message, data = null) {
    if (this.logLevels[level] > this.currentLevel) return;
    
    const formattedMessage = this.formatMessage(level, message, data);
    
    // Affichage console avec couleurs
    const colors = {
      error: '\x1b[31m', // Rouge
      warn: '\x1b[33m',  // Jaune
      info: '\x1b[36m',  // Cyan
      debug: '\x1b[35m'  // Magenta
    };
    
    const reset = '\x1b[0m';
    const emoji = {
      error: '❌',
      warn: '⚠️',
      info: 'ℹ️',
      debug: '🔍'
    };
    
    console.log(`${colors[level]}${emoji[level]} ${formattedMessage}${reset}`);
    
    // Écriture dans le fichier
    this.writeToFile(formattedMessage);
  }

  error(message, data = null) {
    this.log('error', message, data);
  }

  warn(message, data = null) {
    this.log('warn', message, data);
  }

  info(message, data = null) {
    this.log('info', message, data);
  }

  debug(message, data = null) {
    this.log('debug', message, data);
  }

  // Log spécifique aux emails
  emailSent(to, orderNumber, success = true) {
    const status = success ? 'envoyé' : 'échoué';
    const emoji = success ? '✅' : '❌';
    this.info(`${emoji} Email ${status} vers ${to} pour la commande ${orderNumber}`);
  }

  emailBatch(batchSize, successCount, totalCount) {
    this.info(`📧 Lot d'emails traité: ${successCount}/${totalCount} réussis (taille: ${batchSize})`);
  }

  connectionStatus(status, details = null) {
    const message = status ? 'Connexion email établie' : 'Connexion email échouée';
    this.info(message, details);
  }

  performance(operation, duration, details = null) {
    this.debug(`⚡ Performance ${operation}: ${duration}ms`, details);
  }

  // Log des erreurs avec contexte
  emailError(error, context = {}) {
    this.error('Erreur envoi email', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: this.getTimestamp()
    });
  }

  // Log des statistiques
  stats(stats) {
    this.info('📊 Statistiques du système', stats);
  }

  // Nettoyage des anciens logs
  cleanupOldLogs(daysToKeep = 30) {
    try {
      const files = fs.readdirSync(this.logDir);
      const now = new Date();
      
      files.forEach(file => {
        if (file.startsWith('email-system-') && file.endsWith('.log')) {
          const filePath = path.join(this.logDir, file);
          const stats = fs.statSync(filePath);
          const daysOld = (now - stats.mtime) / (1000 * 60 * 60 * 24);
          
          if (daysOld > daysToKeep) {
            fs.unlinkSync(filePath);
            this.info(`🗑️ Ancien log supprimé: ${file}`);
          }
        }
      });
    } catch (error) {
      this.error('Erreur nettoyage logs', error);
    }
  }

  // Rotation des logs
  rotateLogs() {
    try {
      const currentLog = path.join(this.logDir, this.getLogFileName());
      if (fs.existsSync(currentLog)) {
        const stats = fs.statSync(currentLog);
        const sizeInMB = stats.size / (1024 * 1024);
        
        if (sizeInMB > 10) { // Rotation si > 10MB
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const newName = `email-system-${timestamp}.log`;
          const newPath = path.join(this.logDir, newName);
          
          fs.renameSync(currentLog, newPath);
          this.info(`🔄 Log roté: ${newName}`);
        }
      }
    } catch (error) {
      this.error('Erreur rotation logs', error);
    }
  }

  // Obtenir les logs récents
  getRecentLogs(lines = 50) {
    try {
      const logFile = path.join(this.logDir, this.getLogFileName());
      if (!fs.existsSync(logFile)) return [];
      
      const content = fs.readFileSync(logFile, 'utf8');
      const linesArray = content.split('\n').filter(line => line.trim());
      return linesArray.slice(-lines);
    } catch (error) {
      this.error('Erreur lecture logs récents', error);
      return [];
    }
  }

  // Recherche dans les logs
  searchLogs(query, days = 7) {
    try {
      const results = [];
      const files = fs.readdirSync(this.logDir);
      const now = new Date();
      
      files.forEach(file => {
        if (file.startsWith('email-system-') && file.endsWith('.log')) {
          const filePath = path.join(this.logDir, file);
          const stats = fs.statSync(filePath);
          const daysOld = (now - stats.mtime) / (1000 * 60 * 60 * 24);
          
          if (daysOld <= days) {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            
            lines.forEach((line, index) => {
              if (line.toLowerCase().includes(query.toLowerCase())) {
                results.push({
                  file,
                  line: index + 1,
                  content: line,
                  date: stats.mtime
                });
              }
            });
          }
        }
      });
      
      return results;
    } catch (error) {
      this.error('Erreur recherche logs', error);
      return [];
    }
  }
}

// Instance singleton
const logger = new Logger();

export default logger;
