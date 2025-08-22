import nodemailer from 'nodemailer';
import { generateConfirmationEmail } from './templates/confirmationTemplate.js';

class SimpleEmailService {
  constructor() {
    this.initializeGmail();
  }

  initializeGmail() {
    // Configuration Gmail simple
    this.transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || 'votre-email@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD || 'xxxx-xxxx-xxxx-xxxx'
      }
    });
    console.log('✅ Gmail configuré');
  }

  // Validation email simple
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Nettoyage basique des données
  cleanData(orderData) {
    return {
      ...orderData,
      customerInfo: {
        ...orderData.customerInfo,
        name: (orderData.customerInfo.name || '').replace(/[<>]/g, '').trim(),
        email: (orderData.customerInfo.email || '').toLowerCase().trim()
      }
    };
  }

  // Envoi d'email simplifié
  async sendConfirmationEmail(orderData) {
    try {
      // 1. Validation de base
      if (!this.isValidEmail(orderData.customerInfo.email)) {
        throw new Error('Email invalide');
      }

      // 2. Nettoyage des données
      const cleanData = this.cleanData(orderData);

      // 3. Génération du HTML
      const emailHTML = generateConfirmationEmail(cleanData);

      // 4. Envoi simple
      const result = await this.transporter.sendMail({
        from: `"MythicMarket" <${process.env.GMAIL_USER}>`,
        to: cleanData.customerInfo.email,
        subject: `✅ Confirmation de commande - ${cleanData.orderNumber}`,
        html: emailHTML
      });

      console.log(`✅ Email envoyé à ${this.maskEmail(cleanData.customerInfo.email)}`);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('❌ Erreur email:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Masquer l'email pour les logs
  maskEmail(email) {
    if (!email) return '***';
    const [local, domain] = email.split('@');
    return `${local.substring(0, 2)}***@${domain}`;
  }

  // Test simple
  async testEmail() {
    try {
      await this.transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: process.env.GMAIL_USER,
        subject: '🧪 Test MythicMarket',
        html: '<h1>✅ Email fonctionne !</h1>'
      });
      console.log('✅ Test email réussi');
      return true;
    } catch (error) {
      console.error('❌ Test échoué:', error.message);
      return false;
    }
  }
}

export default new SimpleEmailService();