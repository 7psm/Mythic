import nodemailer from 'nodemailer';
import config from './config.js';

class EmailService {
  constructor() {
    this.transporter = null;
    this.emailQueue = [];
    this.isProcessing = false;
    this.stats = {
      sent: 0,
      failed: 0,
      total: 0
    };
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        service: config.email.service,
        auth: {
          user: config.email.user,
          pass: config.email.password
        },
        port: config.email.port,
        secure: config.email.secure,
        tls: config.email.tls,
        pool: config.email.pool,
        maxConnections: config.email.maxConnections,
        maxMessages: config.email.maxMessages,
        rateLimit: config.email.rateLimit,
        rateDelta: config.email.rateDelta
      });

      // Vérifier la connexion
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('❌ Erreur vérification connexion email:', error);
        } else {
          console.log('✅ Service email initialisé et connecté avec succès');
        }
      });

    } catch (error) {
      console.error('❌ Erreur initialisation service email:', error);
    }
  }

  // Validation des données de commande
  validateOrderData(orderData) {
    const required = ['orderNumber', 'name', 'email', 'orderItems'];
    const missing = required.filter(field => !orderData[field]);
    
    if (missing.length > 0) {
      throw new Error(`Champs manquants: ${missing.join(', ')}`);
    }

    if (!orderData.email.includes('@')) {
      throw new Error('Adresse email invalide');
    }

    if (!Array.isArray(orderData.orderItems) || orderData.orderItems.length === 0) {
      throw new Error('Aucun article dans la commande');
    }

    return true;
  }

  // Envoi d'email avec gestion des erreurs avancée
  async sendConfirmationEmail(orderData) {
    if (!this.transporter) {
      console.error('❌ Transporter email non initialisé');
      return false;
    }

    try {
      // Validation des données
      this.validateOrderData(orderData);

      const {
        orderNumber,
        name,
        email,
        orderItems,
        shippingMethod,
        paymentMethod,
        total
      } = orderData;

      // Calculer le total avec validation
      const subtotal = orderItems.reduce((sum, item) => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 1;
        return sum + (price * quantity);
      }, 0);
      
      const shippingCost = parseFloat(shippingMethod?.price) || 0;
      const totalAmount = subtotal + shippingCost;

      // Validation du total
      if (isNaN(totalAmount) || totalAmount < 0) {
        throw new Error('Total de commande invalide');
      }

      // Créer le contenu HTML du mail
      const emailHTML = this.generateEmailHTML({
        orderNumber,
        customerName: name,
        orderItems,
        shippingMethod,
        paymentMethod,
        subtotal,
        shippingCost,
        totalAmount
      });

      const mailOptions = {
        from: `"MythicMarket" <${config.email.from}>`,
        to: email,
        subject: `✅ Confirmation de commande ${orderNumber} - MythicMarket`,
        html: emailHTML,
        text: this.generateEmailText({
          orderNumber,
          customerName: name,
          orderItems,
          totalAmount
        }),
        priority: 'high',
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High'
        }
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      // Mise à jour des statistiques
      this.stats.sent++;
      this.stats.total++;
      
      console.log(`✅ Email de confirmation envoyé à ${email} pour la commande ${orderNumber}`);
      console.log(`📊 Statistiques: ${this.stats.sent}/${this.stats.total} emails envoyés`);
      
      return true;
    } catch (error) {
      this.stats.failed++;
      this.stats.total++;
      
      console.error('❌ Erreur envoi email:', error.message);
      
      // Log détaillé en mode développement
      if (config.server.nodeEnv === 'development') {
        console.error('Détails de l\'erreur:', error);
      }
      
      return false;
    }
  }

  // Envoi d'email en lot (batch)
  async sendBatchEmails(orders) {
    if (!Array.isArray(orders) || orders.length === 0) {
      throw new Error('Aucune commande à traiter');
    }

    console.log(`📧 Envoi en lot de ${orders.length} emails...`);
    
    const results = [];
    const batchSize = 5; // Limite pour éviter le spam
    
    for (let i = 0; i < orders.length; i += batchSize) {
      const batch = orders.slice(i, i + batchSize);
      const batchPromises = batch.map(order => this.sendConfirmationEmail(order));
      
      try {
        const batchResults = await Promise.allSettled(batchPromises);
        results.push(...batchResults);
        
        // Pause entre les lots pour respecter les limites
        if (i + batchSize < orders.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`❌ Erreur lot ${Math.floor(i / batchSize) + 1}:`, error);
      }
    }

    const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
    console.log(`📊 Résultats du lot: ${successCount}/${results.length} emails envoyés avec succès`);
    
    return results;
  }

  // Test de connexion
  async testConnection() {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('❌ Test de connexion échoué:', error);
      return false;
    }
  }

  // Obtenir les statistiques
  getStats() {
    return {
      ...this.stats,
      successRate: this.stats.total > 0 ? (this.stats.sent / this.stats.total * 100).toFixed(2) : 0
    };
  }

  // Réinitialiser les statistiques
  resetStats() {
    this.stats = { sent: 0, failed: 0, total: 0 };
    console.log('📊 Statistiques réinitialisées');
  }

  // Fermer la connexion
  async closeConnection() {
    if (this.transporter) {
      await this.transporter.close();
      console.log('🔌 Connexion email fermée');
    }
  }

  generateEmailHTML(data) {
    const {
      orderNumber,
      customerName,
      orderItems,
      shippingMethod,
      paymentMethod,
      subtotal,
      shippingCost,
      totalAmount
    } = data;

    const itemsHTML = orderItems.map(item => `
      <tr>
        <td style="padding: 15px; border-bottom: 1px solid rgba(212, 175, 55, 0.15); background: rgba(10, 10, 14, 0.3);">
          <strong style="color: #e0e0e0; font-size: 0.95rem; font-weight: 600;">${item.name}</strong>
          ${item.quantity > 1 ? `<span style="background: linear-gradient(135deg, #f9e79f, #d4af37); color: #0a0a0e; font-size: 0.7rem; padding: 3px 8px; border-radius: 12px; margin-left: 8px; font-weight: 700; box-shadow: 0 2px 6px rgba(212, 175, 55, 0.3);">x${item.quantity}</span>` : ''}
        </td>
        <td style="padding: 15px; border-bottom: 1px solid rgba(212, 175, 55, 0.15); background: rgba(10, 10, 14, 0.3); text-align: right; color: #d4af37; font-weight: 700; font-size: 0.9rem; text-shadow: 0 1px 3px rgba(212, 175, 55, 0.3);">
          ${(item.price * (item.quantity || 1)).toFixed(2)} €
        </td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmation de commande ${orderNumber}</title>
        <style>
          /* Variables CSS du thème MythicMarket */
          :root {
            --gold-light: #f9e79f;
            --gold-primary: #d4af37;
            --gold-dark: #b8860b;
            --text-white: #ffffff;
            --text-light: #e0e0e0;
            --text-gray: #999999;
            --background-dark: #0a0a0e;
          }
          
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: var(--text-light); 
            background: var(--background-dark);
            margin: 0;
            padding: 0;
          }
          
          .container { 
            max-width: 650px; 
            margin: 0 auto; 
            padding: 20px; 
            background: var(--background-dark);
          }
          
          .header { 
            background: linear-gradient(145deg, rgba(22, 22, 32, 0.9), rgba(10, 10, 14, 0.95)); 
            color: var(--text-white); 
            padding: 40px; 
            text-align: center; 
            border-radius: 15px 15px 0 0; 
            border: 2px solid rgba(212, 175, 55, 0.2);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(212, 175, 55, 0.1);
          }
          
          .header h1 { 
            margin: 0; 
            font-size: 2.2rem; 
            font-weight: 800; 
            background: linear-gradient(135deg, var(--gold-light) 0%, var(--gold-primary) 50%, var(--gold-dark) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-shadow: 0 2px 10px rgba(212, 175, 55, 0.3);
          }
          
          .header p { 
            margin: 10px 0 0 0; 
            font-size: 1.1rem; 
            color: var(--text-light);
            opacity: 0.9;
          }
          
          .content { 
            background: linear-gradient(145deg, rgba(22, 22, 32, 0.9), rgba(10, 10, 14, 0.95)); 
            padding: 40px; 
            border-radius: 0 0 15px 15px; 
            border: 2px solid rgba(212, 175, 55, 0.2);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(212, 175, 55, 0.1);
          }
          
          .order-number { 
            background: linear-gradient(90deg, rgba(212, 175, 55, 0.05), rgba(184, 134, 11, 0.05)); 
            color: var(--gold-primary); 
            padding: 25px; 
            border-radius: 10px; 
            margin: 25px 0; 
            text-align: center; 
            border: 2px solid rgba(212, 175, 55, 0.2);
            box-shadow: 0 4px 15px rgba(212, 175, 55, 0.1);
          }
          
          .order-number h2 { 
            margin: 0 0 15px 0; 
            font-size: 1.3rem; 
            color: var(--gold-primary);
            font-weight: 700;
            text-shadow: 0 1px 3px rgba(212, 175, 55, 0.3);
          }
          
          .order-number p {
            color: var(--text-light);
            margin: 0;
            font-size: 0.9rem;
          }
          
          .section-title {
            color: var(--gold-primary);
            margin: 25px 0 15px 0;
            font-size: 1.1rem;
            border-bottom: 2px solid rgba(212, 175, 55, 0.3);
            padding-bottom: 8px;
            font-weight: 600;
            text-shadow: 0 1px 3px rgba(212, 175, 55, 0.2);
          }
          
          .items-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 25px 0; 
            border-radius: 10px; 
            overflow: hidden; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            border: 1px solid rgba(212, 175, 55, 0.2);
          }
          
          .items-table th { 
            background: linear-gradient(90deg, rgba(212, 175, 55, 0.05), rgba(184, 134, 11, 0.05)); 
            color: var(--gold-primary); 
            padding: 15px; 
            text-align: left; 
            font-weight: 600;
            border-bottom: 2px solid rgba(212, 175, 55, 0.2);
          }
          
          .items-table td { 
            padding: 15px; 
            border-bottom: 1px solid rgba(212, 175, 55, 0.15); 
            background: rgba(10, 10, 14, 0.3);
            transition: all 0.2s ease;
          }
          
          .items-table tr:last-child td { 
            border-bottom: none; 
          }
          
          .summary { 
            background: linear-gradient(90deg, rgba(212, 175, 55, 0.05), rgba(184, 134, 11, 0.05)); 
            color: var(--text-light); 
            padding: 25px; 
            border-radius: 10px; 
            margin: 25px 0; 
            border: 2px solid rgba(212, 175, 55, 0.2);
            box-shadow: 0 4px 15px rgba(212, 175, 55, 0.1);
          }
          
          .summary h3 { 
            margin: 0 0 15px 0; 
            font-size: 1.2rem; 
            color: var(--gold-primary);
            font-weight: 600;
            text-shadow: 0 1px 3px rgba(212, 175, 55, 0.2);
          }
          
          .summary p { 
            margin: 8px 0; 
            font-size: 0.9rem; 
            color: var(--text-light);
          }
          
          .total { 
            font-size: 1.3rem; 
            font-weight: 800; 
            color: var(--gold-primary); 
            text-shadow: 0 2px 6px rgba(212, 175, 55, 0.4);
            border-top: 2px solid rgba(212, 175, 55, 0.3);
            padding-top: 15px;
          }
          
          .steps { 
            background: linear-gradient(90deg, rgba(212, 175, 55, 0.05), rgba(184, 134, 11, 0.05)); 
            color: var(--text-light); 
            padding: 25px; 
            border-radius: 10px; 
            margin: 25px 0; 
            border: 2px solid rgba(212, 175, 55, 0.2);
            box-shadow: 0 4px 15px rgba(212, 175, 55, 0.1);
          }
          
          .steps h3 { 
            margin: 0 0 15px 0; 
            font-size: 1.2rem; 
            color: var(--gold-primary);
            font-weight: 600;
            text-shadow: 0 1px 3px rgba(212, 175, 55, 0.2);
          }
          
          .steps ol { 
            margin: 0; 
            padding-left: 20px; 
          }
          
          .steps li { 
            margin: 8px 0; 
            font-size: 0.9rem; 
            color: var(--text-light);
          }
          
          .important { 
            background: linear-gradient(90deg, rgba(212, 175, 55, 0.05), rgba(184, 134, 11, 0.05)); 
            color: var(--text-light); 
            padding: 25px; 
            border-radius: 10px; 
            margin: 25px 0; 
            border: 2px solid rgba(212, 175, 55, 0.2);
            box-shadow: 0 4px 15px rgba(212, 175, 55, 0.1);
          }
          
          .important h3 { 
            margin: 0 0 15px 0; 
            font-size: 1.2rem; 
            color: var(--gold-primary);
            font-weight: 600;
            text-shadow: 0 1px 3px rgba(212, 175, 55, 0.2);
          }
          
          .important p {
            margin: 8px 0;
            font-size: 0.9rem;
            color: var(--text-light);
          }
          
          .footer { 
            text-align: center; 
            margin-top: 30px; 
            color: var(--text-gray); 
            font-size: 0.85rem; 
            border-top: 1px solid rgba(212, 175, 55, 0.1);
            padding-top: 20px;
          }
          
          .footer a { 
            color: var(--gold-primary); 
            text-decoration: none; 
            font-weight: 600;
          }
          
          .footer a:hover { 
            text-decoration: underline; 
            color: var(--gold-light);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Commande Confirmée !</h1>
            <p>Merci pour votre commande sur MythicMarket</p>
          </div>
          
          <div class="content">
            <div class="order-number">
              <h2>Commande #${orderNumber}</h2>
              <p>Date: ${new Date().toLocaleDateString('fr-FR')}</p>
            </div>
            
            <h3 class="section-title">Détails de la commande</h3>
            
            <table class="items-table">
              <thead>
                <tr>
                  <th>Article</th>
                  <th style="text-align: right;">Prix</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>
            
            <div class="summary">
              <h3>Récapitulatif</h3>
              <p><strong>Sous-total:</strong> ${subtotal.toFixed(2)} €</p>
              <p><strong>Livraison (${shippingMethod?.name || 'Standard'}):</strong> ${shippingCost.toFixed(2)} €</p>
              <p class="total"><strong>TOTAL: ${totalAmount.toFixed(2)} €</strong></p>
            </div>
            
            <div class="steps">
              <h3>Prochaines étapes</h3>
              <ol>
                <li>Votre commande est en cours de traitement</li>
                <li>Vous recevrez un email de suivi dans les prochaines heures</li>
                <li>Livraison estimée: ${shippingMethod?.delivery || '2-4 jours ouvrables'}</li>
              </ol>
            </div>
            
            <div class="important">
              <h3>⚠️ Informations importantes</h3>
              <p>• Gardez ce numéro de commande précieusement</p>
              <p>• Vérifiez votre boîte mail régulièrement</p>
              <p>• En cas de question, contactez notre support</p>
            </div>
            
            <div class="footer">
              <p>Merci de votre confiance !</p>
              <p><a href="https://mythicmarket.netlify.app">MythicMarket</a> - Votre boutique de confiance</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateEmailText(data) {
    const { orderNumber, customerName, orderItems, totalAmount } = data;
    
    const itemsText = orderItems.map(item => 
      `- ${item.name} (x${item.quantity || 1}): ${(item.price * (item.quantity || 1)).toFixed(2)} €`
    ).join('\n');

    return `
Confirmation de commande ${orderNumber}

Bonjour ${customerName},

Votre commande a été confirmée avec succès !

Articles commandés:
${itemsText}

Total: ${totalAmount.toFixed(2)} €

Prochaines étapes:
1. Votre commande est en cours de traitement
2. Vous recevrez un email de suivi
3. Livraison estimée: 2-4 jours ouvrables

Merci de votre confiance !
MythicMarket
    `.trim();
  }
}

export default EmailService;
