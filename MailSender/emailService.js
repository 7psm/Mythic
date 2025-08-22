import sgMail from '@sendgrid/mail';
import { generateConfirmationEmail } from './templates/confirmationTemplate.js';
import crypto from 'crypto';

class SecureEmailService {
  constructor() {
    this.validateConfig();
    this.initializeService();
  }

  validateConfig() {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY manquant');
    }
    if (!process.env.EMAIL_FROM) {
      throw new Error('EMAIL_FROM manquant');
    }
  }

  initializeService() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  // Validation email sécurisée
  isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  // Sanitisation des données
  sanitizeOrderData(orderData) {
    return {
      ...orderData,
      customerInfo: {
        ...orderData.customerInfo,
        name: this.sanitizeString(orderData.customerInfo.name),
        email: orderData.customerInfo.email.toLowerCase().trim(),
        phone: this.sanitizeString(orderData.customerInfo.phone || ''),
        discord: this.sanitizeString(orderData.customerInfo.discord || '')
      },
      shippingInfo: {
        ...orderData.shippingInfo,
        address: this.sanitizeString(orderData.shippingInfo?.address || ''),
        city: this.sanitizeString(orderData.shippingInfo?.city || ''),
        country: this.sanitizeString(orderData.shippingInfo?.country || ''),
        postalCode: this.sanitizeString(orderData.shippingInfo?.postalCode || '')
      }
    };
  }

  sanitizeString(str) {
    if (!str) return '';
    return str.replace(/[<>\"'&]/g, '').trim().substring(0, 100);
  }

  // Chiffrement des données sensibles (optionnel)
  encryptSensitiveData(data) {
    const algorithm = 'aes-256-gcm';
    const secretKey = process.env.EMAIL_ENCRYPTION_KEY;
    
    if (!secretKey) return data;
    
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher(algorithm, secretKey);
      const encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
      return encrypted + cipher.final('hex');
    } catch (error) {
      console.error('Erreur chiffrement:', error);
      return data;
    }
  }

  // Méthode principale d'envoi
  async sendConfirmationEmail(orderData) {
    try {
      // 1. Validation
      if (!this.isValidEmail(orderData.customerInfo.email)) {
        throw new Error('Email invalide');
      }

      // 2. Sanitisation
      const cleanData = this.sanitizeOrderData(orderData);

      // 3. Génération du template
      const emailHTML = generateConfirmationEmail(cleanData);

      // 4. Configuration du mail
      const mailOptions = {
        to: cleanData.customerInfo.email,
        from: {
          email: process.env.EMAIL_FROM,
          name: process.env.EMAIL_FROM_NAME || 'MythicMarket'
        },
        subject: `✅ Confirmation de commande - ${cleanData.orderNumber}`,
        html: emailHTML,
        // Tracking et sécurité
        trackingSettings: {
          clickTracking: { enable: false },
          openTracking: { enable: false }
        },
        // Headers de sécurité
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'high'
        }
      };

      // 5. Envoi sécurisé
      const result = await sgMail.send(mailOptions);
      
      console.log(`✅ Email de confirmation envoyé à ${this.maskEmail(cleanData.customerInfo.email)}`);
      console.log(`📧 ID Message: ${result[0].headers['x-message-id']}`);
      
      return { 
        success: true, 
        messageId: result[0].headers['x-message-id'],
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Erreur envoi email:', error);
      
      // Log sécurisé (sans exposer l'email complet)
      const maskedEmail = this.maskEmail(orderData.customerInfo.email);
      console.error(`❌ Échec envoi pour ${maskedEmail}`);
      
      return { 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Masquer l'email pour les logs
  maskEmail(email) {
    if (!email || email.length < 3) return '***';
    const [local, domain] = email.split('@');
    const maskedLocal = local.substring(0, 2) + '*'.repeat(Math.max(0, local.length - 2));
    return `${maskedLocal}@${domain}`;
  }

  // Méthode pour tester la configuration
  async testEmailService() {
    try {
      const testMail = {
        to: process.env.EMAIL_FROM, // S'envoyer un test
        from: {
          email: process.env.EMAIL_FROM,
          name: process.env.EMAIL_FROM_NAME || 'MythicMarket'
        },
        subject: '🧪 Test MythicMarket Email Service',
        html: `
          <div style="padding: 20px; font-family: Arial, sans-serif;">
            <h1 style="color: #28a745;">✅ Service email fonctionnel !</h1>
            <p>Ce test confirme que votre configuration email fonctionne correctement.</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          </div>
        `
      };
      
      await sgMail.send(testMail);
      console.log('✅ Test email service réussi');
      return true;
    } catch (error) {
      console.error('❌ Test email service échoué:', error);
      return false;
    }
  }

  // Méthode pour envoyer des emails de notification admin (optionnel)
  async sendAdminNotification(orderData) {
    if (!process.env.ADMIN_EMAIL) return;

    try {
      const adminMail = {
        to: process.env.ADMIN_EMAIL,
        from: process.env.EMAIL_FROM,
        subject: `🔔 Nouvelle commande - ${orderData.orderNumber}`,
        html: `
          <h2>Nouvelle commande reçue</h2>
          <p><strong>Numéro:</strong> ${orderData.orderNumber}</p>
          <p><strong>Client:</strong> ${orderData.customerInfo.name}</p>
          <p><strong>Email:</strong> ${orderData.customerInfo.email}</p>
          <p><strong>Total:</strong> €${orderData.total}</p>
          <p><strong>Articles:</strong> ${orderData.orderItems.length}</p>
        `
      };
      
      await sgMail.send(adminMail);
      console.log('✅ Notification admin envoyée');
    } catch (error) {
      console.error('❌ Erreur notification admin:', error);
    }
  }
}

export default new SecureEmailService();