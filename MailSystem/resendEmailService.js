// =============================================
// SERVICE EMAIL AVEC RESEND API (No SMTP!)
// =============================================
// Resend = API HTTP qui fonctionne sur Render FREE
// 100 emails/jour GRATUIT - Parfait pour MythicMarket

import { Resend } from 'resend';

class ResendEmailService {
  constructor() {
    this.resend = null;
    this.isInitialized = false;
    console.log('📧 ResendEmailService initialisé');
  }

  async initialize() {
    try {
      const apiKey = process.env.RESEND_API_KEY;
      
      if (!apiKey) {
        console.warn('⚠️ RESEND_API_KEY manquante - Emails désactivés');
        this.isInitialized = false;
        return;
      }

      this.resend = new Resend(apiKey);
      this.isInitialized = true;
      console.log('✅ Service Resend initialisé avec succès');
      
    } catch (error) {
      console.error('❌ Erreur initialisation Resend:', error.message);
      this.isInitialized = false;
    }
  }

  /**
   * Envoie un email de confirmation de commande
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
      appliedDiscount = null,
      discountAmount = 0
    } = orderData;

    if (!customerEmail || !customerName || !orderNumber) {
      return {
        success: false,
        error: 'Données manquantes pour l\'email de confirmation'
      };
    }

    if (!this.isInitialized) {
      console.warn('⚠️ Service Resend non initialisé');
      await this.initialize();
      if (!this.isInitialized) {
        return {
          success: false,
          error: 'Service email non initialisé'
        };
      }
    }

    try {
      console.log(`📧 Envoi email via Resend: ${orderNumber}`);

      // Générer le HTML de l'email
      const htmlContent = this.generateOrderConfirmationHTML({
        customerName,
        orderNumber,
        totalAmount,
        items,
        shippingMethod,
        shippingCost,
        paymentMethod,
        appliedDiscount,
        discountAmount
      });

      // Envoi via API Resend (HTTP, pas SMTP!)
      const { data, error } = await this.resend.emails.send({
        from: 'MythicMarket <noreply@resend.dev>', // Email par défaut Resend
        to: [customerEmail],
        subject: `Confirmation de commande #${orderNumber} - MythicMarket`,
        html: htmlContent,
      });

      if (error) {
        console.error('❌ Erreur Resend:', error);
        return {
          success: false,
          error: error.message
        };
      }

      console.log(`✅ Email envoyé via Resend - ID: ${data.id}`);
      
      return {
        success: true,
        messageId: data.id,
        response: data
      };

    } catch (error) {
      console.error('❌ Erreur envoi email:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Génère le HTML de l'email
   */
  generateOrderConfirmationHTML(data) {
    const {
      customerName,
      orderNumber,
      items,
      totalAmount,
      appliedDiscount,
      discountAmount
    } = data;

    const itemsHTML = items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #333;">
          ${item.name} <strong>x${item.quantity}</strong>
        </td>
        <td style="padding: 10px; text-align: right; border-bottom: 1px solid #333;">
          €${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; background: #0B0B0B; color: #fff; }
          .container { max-width: 600px; margin: 0 auto; background: #1A1A1A; padding: 20px; }
          .header { background: linear-gradient(135deg, #FFD76A, #C9A94D); padding: 20px; text-align: center; }
          .content { padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; color: #0B0B0B;">MythicMarket</h1>
          </div>
          <div class="content">
            <h2>✅ Commande confirmée !</h2>
            <p>Merci pour votre commande, ${customerName} !</p>
            
            <h3>📦 Commande #${orderNumber}</h3>
            
            <table>
              <thead>
                <tr style="background: #222;">
                  <th style="padding: 10px; text-align: left;">Article</th>
                  <th style="padding: 10px; text-align: right;">Prix</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>

            ${appliedDiscount && discountAmount > 0 ? `
              <p style="color: #43E97B;">
                🎉 Vous avez économisé €${discountAmount.toFixed(2)} avec le code ${appliedDiscount.code} !
              </p>
            ` : ''}

            <h3>Total : €${totalAmount.toFixed(2)}</h3>

            <p style="color: #C9A94D;">Merci de votre confiance !</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getStatus() {
    return {
      isInitialized: this.isInitialized,
      provider: 'Resend API',
      method: 'HTTP (No SMTP)'
    };
  }
}

// Instance singleton
const resendEmailService = new ResendEmailService();
export default resendEmailService;