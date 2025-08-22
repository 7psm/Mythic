import sgMail from '@sendgrid/mail';

class EmailConfig {
  constructor() {
    this.validateEnvironment();
    this.initializeService();
  }

  validateEnvironment() {
    const required = ['SENDGRID_API_KEY', 'EMAIL_FROM'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Variables manquantes: ${missing.join(', ')}`);
    }
  }

  initializeService() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    console.log('✅ Service email initialisé');
  }

  getTransporter() {
    return sgMail;
  }

  getFromAddress() {
    return {
      email: process.env.EMAIL_FROM,
      name: process.env.EMAIL_FROM_NAME || 'MythicMarket'
    };
  }
}

export default new EmailConfig();