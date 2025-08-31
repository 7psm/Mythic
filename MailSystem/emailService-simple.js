// =============================================
// SERVICE D'ENVOI D'EMAILS SIMPLIFIÉ - MythicMarket
// =============================================
// Version simplifiée du service d'envoi d'emails pour les tests et la production
// Utilise nodemailer pour l'envoi et inclut les templates personnalisés

import nodemailer from 'nodemailer';
import { getSmtpConfig, getFromConfig, validateConfig } from './config.js';
import { 
  getOrderConfirmationTemplate, 
  getOrderStatusTemplate, 
  getContactFormTemplate,
  getTestEmailTemplate 
} from './templates.js';

class EmailService {
  constructor() {
    this.transporter = null;
    this.isInitialized = false;
    console.log('EmailService constructor appelé');
  }

  async initializeTransporter() {
    try {
      console.log('Initialisation du transporteur...');
      const configValidation = validateConfig();
      if (!configValidation.isValid) {
        console.warn('Configuration email invalide:', configValidation.message);
        this.isInitialized = false;
        return;
      }

      const smtpConfig = getSmtpConfig();
      console.log('Configuration SMTP récupérée');
      
      this.transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        auth: {
          user: smtpConfig.auth.user,
          pass: smtpConfig.auth.pass
        }
      });

      console.log('Transporteur créé');
      this.isInitialized = true;
      console.log('✅ Service email initialisé avec succès');
      
    } catch (error) {
      console.error('❌ Erreur initialisation service email:', error.message);
      this.isInitialized = false;
    }
  }

  /**
   * Envoie un email de test avec le nouveau template
   * @param {string} testEmail - Email de destination
   * @param {string} message - Message de test personnalisé
   * @returns {Promise<Object>} Résultat de l'envoi
   */
  async sendTestEmail(testEmail, message = 'Test du système d\'email') {
    if (!testEmail) {
      return {
        success: false,
        error: 'Email de destination requis'
      };
    }

    try {
      console.log(`📧 Envoi email de test à: ${testEmail}`);
      
      // Génération du template HTML avec le nouveau style
      const htmlContent = getTestEmailTemplate({ message });
      
      const mailOptions = {
        to: testEmail,
        subject: 'Test du système d\'email - MythicMarket',
        html: htmlContent,
        text: `Test du système d'email - ${message}`
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log(`✅ Email de test envoyé avec succès - Message ID: ${result.messageId}`);
      
      return {
        success: true,
        messageId: result.messageId,
        response: result.response
      };

    } catch (error) {
      console.error(`❌ Erreur envoi email de test:`, error.message);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  /**
   * Envoie un email de confirmation de commande avec le nouveau template
   * @param {Object} orderData - Données de la commande
   * @returns {Promise<Object>} Résultat de l'envoi
   */
  async sendOrderConfirmation(orderData) {
    const {
      customerEmail,
      customerName,
      orderNumber,
      totalAmount,
      items = [],
      shippingMethod,
      shippingCost,
      paymentMethod
    } = orderData;

    if (!customerEmail || !customerName || !orderNumber) {
      return {
        success: false,
        error: 'Données manquantes pour l\'email de confirmation'
      };
    }

    try {
      console.log(`📧 Envoi email confirmation commande: ${orderNumber}`);
      
      // Génération du template HTML avec le nouveau style
      const htmlContent = getOrderConfirmationTemplate({
        customerName,
        orderNumber,
        totalAmount,
        items,
        shippingMethod,
        shippingCost,
        paymentMethod
      });
      
      const mailOptions = {
        to: customerEmail,
        subject: `Confirmation de commande #${orderNumber} - MythicMarket`,
        html: htmlContent,
        text: `Confirmation de commande #${orderNumber} - Merci pour votre commande, ${customerName}!`
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log(`✅ Email confirmation commande envoyé - Message ID: ${result.messageId}`);
      
      return {
        success: true,
        messageId: result.messageId,
        response: result.response
      };

    } catch (error) {
      console.error(`❌ Erreur envoi email confirmation:`, error.message);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  getStatus() {
    return {
      isInitialized: this.isInitialized,
      hasTransporter: !!this.transporter,
      configValid: validateConfig().isValid
    };
  }
}

const emailService = new EmailService();
export default emailService;
