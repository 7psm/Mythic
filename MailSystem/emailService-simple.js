// =============================================
// SERVICE D'ENVOI D'EMAILS - MythicMarket
// =============================================

import nodemailer from 'nodemailer';
import { getSmtpConfig, getFromConfig, validateConfig } from './config.js';
import { 
  getOrderConfirmationTemplate, 
  getOrderStatusTemplate, 
  getContactFormTemplate,
  getContactConfirmationTemplate
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
      paymentMethod,
      discountCode,
      discountAmount
    } = orderData;

    if (!customerEmail || !customerName || !orderNumber) {
      return {
        success: false,
        error: 'Données manquantes pour l\'email de confirmation'
      };
    }

    // Vérifier que le transporter est initialisé
    if (!this.transporter || !this.isInitialized) {
      console.warn('⚠️ Transporteur non initialisé, tentative d\'initialisation...');
      await this.initializeTransporter();
      if (!this.transporter || !this.isInitialized) {
        console.error('❌ Impossible d\'initialiser le service email. Vérifiez votre configuration SMTP dans le fichier .env');
        return {
          success: false,
          error: 'Service email non initialisé. Vérifiez votre configuration SMTP dans le fichier .env'
        };
      }
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
        paymentMethod,
        discountCode,
        discountAmount
      });
      
      const fromConfig = getFromConfig();
      const mailOptions = {
        from: `"${fromConfig.name}" <${fromConfig.email}>`,
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

  /**
   * Envoie un email de mise à jour de statut de commande
   * @param {Object} orderData - Données de la commande
   * @returns {Promise<Object>} Résultat de l'envoi
   */
  async sendOrderStatusUpdate(orderData) {
    const {
      customerEmail,
      customerName,
      orderNumber,
      status,
      trackingNumber,
      estimatedDelivery
    } = orderData;

    if (!customerEmail || !orderNumber || !status) {
      return {
        success: false,
        error: 'Données manquantes pour l\'email de mise à jour'
      };
    }

    if (!this.transporter || !this.isInitialized) {
      console.warn('⚠️ Transporteur non initialisé, tentative d\'initialisation...');
      await this.initializeTransporter();
      if (!this.transporter || !this.isInitialized) {
        return {
          success: false,
          error: 'Service email non initialisé'
        };
      }
    }

    try {
      console.log(`📧 Envoi email mise à jour statut: ${orderNumber}`);
      
      const htmlContent = getOrderStatusTemplate({
        customerName,
        orderNumber,
        status,
        trackingNumber,
        estimatedDelivery
      });
      
      const fromConfig = getFromConfig();
      const mailOptions = {
        from: `"${fromConfig.name}" <${fromConfig.email}>`,
        to: customerEmail,
        subject: `Mise à jour de commande #${orderNumber} - MythicMarket`,
        html: htmlContent,
        text: `Mise à jour de commande #${orderNumber} - Nouveau statut: ${status}`
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log(`✅ Email mise à jour statut envoyé - Message ID: ${result.messageId}`);
      
      return {
        success: true,
        messageId: result.messageId,
        response: result.response
      };

    } catch (error) {
      console.error(`❌ Erreur envoi email mise à jour:`, error.message);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  /**
   * Envoie un email depuis le formulaire de contact (à l'équipe)
   * @param {Object} contactData - Données du formulaire
   * @returns {Promise<Object>} Résultat de l'envoi
   */
  async sendContactFormEmail(contactData) {
    const { name, email, subject, message } = contactData;

    if (!email || !message) {
      return {
        success: false,
        error: 'Email et message requis'
      };
    }

    if (!this.transporter || !this.isInitialized) {
      console.warn('⚠️ Transporteur non initialisé, tentative d\'initialisation...');
      await this.initializeTransporter();
      if (!this.transporter || !this.isInitialized) {
        return {
          success: false,
          error: 'Service email non initialisé'
        };
      }
    }

    try {
      console.log(`📧 Envoi email formulaire de contact de: ${email}`);
      
      const htmlContent = getContactFormTemplate({
        name,
        email,
        subject,
        message
      });
      
      const fromConfig = getFromConfig();
      const mailOptions = {
        from: `"${fromConfig.name}" <${fromConfig.email}>`,
        to: fromConfig.email, // Envoyé à l'équipe
        replyTo: email, // Pour pouvoir répondre directement au client
        subject: `[Contact] ${subject || 'Nouveau message'}`,
        html: htmlContent,
        text: `Nouveau message de ${name} (${email}): ${message}`
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log(`✅ Email formulaire de contact envoyé - Message ID: ${result.messageId}`);
      
      return {
        success: true,
        messageId: result.messageId,
        response: result.response
      };

    } catch (error) {
      console.error(`❌ Erreur envoi email formulaire:`, error.message);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  /**
   * Envoie un email de confirmation au client après soumission du formulaire
   * @param {Object} contactData - Données du formulaire
   * @returns {Promise<Object>} Résultat de l'envoi
   */
  async sendContactConfirmation(contactData) {
    const { name, email, subject } = contactData;

    if (!email) {
      return {
        success: false,
        error: 'Email requis'
      };
    }

    if (!this.transporter || !this.isInitialized) {
      console.warn('⚠️ Transporteur non initialisé, tentative d\'initialisation...');
      await this.initializeTransporter();
      if (!this.transporter || !this.isInitialized) {
        return {
          success: false,
          error: 'Service email non initialisé'
        };
      }
    }

    try {
      console.log(`📧 Envoi email confirmation contact à: ${email}`);
      
      const htmlContent = getContactConfirmationTemplate({
        name,
        email,
        subject
      });
      
      const fromConfig = getFromConfig();
      const mailOptions = {
        from: `"${fromConfig.name}" <${fromConfig.email}>`,
        to: email,
        subject: 'Confirmation de réception de votre message - MythicMarket',
        html: htmlContent,
        text: `Bonjour ${name}, nous avons bien reçu votre message concernant "${subject}". Nous vous répondrons dans les 24-48 heures.`
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log(`✅ Email confirmation contact envoyé - Message ID: ${result.messageId}`);
      
      return {
        success: true,
        messageId: result.messageId,
        response: result.response
      };

    } catch (error) {
      console.error(`❌ Erreur envoi email confirmation contact:`, error.message);
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