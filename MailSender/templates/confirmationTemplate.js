export function generateConfirmationEmail(orderData) {
  const { 
    orderNumber, 
    customerInfo, 
    orderItems, 
    shippingMethod, 
    paymentMethod,
    orderDate 
  } = orderData;

  // Calculs
  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = shippingMethod.price || 0;
  const total = subtotal + shipping;

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmation de Commande - ${orderNumber}</title>
      <style>
        body { 
          font-family: 'Inter', Arial, sans-serif; 
          background: #f8f9fa; 
          margin: 0; 
          padding: 20px; 
        }
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white; 
          border-radius: 12px; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.1); 
        }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          padding: 30px; 
          border-radius: 12px 12px 0 0; 
          text-align: center; 
        }
        .content { padding: 30px; }
        .order-info { 
          background: #f8f9fa; 
          padding: 20px; 
          border-radius: 8px; 
          margin: 20px 0; 
        }
        .order-items { margin: 20px 0; }
        .item { 
          display: flex; 
          justify-content: space-between; 
          padding: 10px 0; 
          border-bottom: 1px solid #eee; 
        }
        .total-section { 
          background: #e8f5e8; 
          padding: 20px; 
          border-radius: 8px; 
          margin-top: 20px; 
        }
        .total-row { 
          display: flex; 
          justify-content: space-between; 
          margin: 5px 0; 
        }
        .total-final { 
          font-weight: bold; 
          font-size: 1.2em; 
          border-top: 2px solid #28a745; 
          padding-top: 10px; 
        }
        .footer { 
          text-align: center; 
          color: #666; 
          padding: 20px; 
          font-size: 0.9em; 
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin: 15px 0;
        }
        .info-group h4 {
          margin: 0 0 5px 0;
          color: #333;
          font-weight: 600;
        }
        .info-group p {
          margin: 0;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>✅ Confirmation de Commande</h1>
          <p>Merci pour votre achat chez MythicMarket !</p>
        </div>

        <div class="content">
          <div class="order-info">
            <h2>📋 Détails de la Commande</h2>
            <div class="info-grid">
              <div class="info-group">
                <h4>Numéro de Commande</h4>
                <p>${orderNumber}</p>
              </div>
              <div class="info-group">
                <h4>Date</h4>
                <p>${new Date(orderDate).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
          </div>

          <div class="order-info">
            <h3>👤 Informations Client</h3>
            <div class="info-grid">
              <div class="info-group">
                <h4>Nom</h4>
                <p>${customerInfo.name}</p>
              </div>
              <div class="info-group">
                <h4>Email</h4>
                <p>${customerInfo.email}</p>
              </div>
              ${customerInfo.phone ? `
              <div class="info-group">
                <h4>Téléphone</h4>
                <p>${customerInfo.phone}</p>
              </div>
              ` : ''}
              ${customerInfo.discord ? `
              <div class="info-group">
                <h4>Discord</h4>
                <p>${customerInfo.discord}</p>
              </div>
              ` : ''}
            </div>
          </div>

          <h3>🛍️ Articles Commandés</h3>
          <div class="order-items">
            ${orderItems.map(item => `
              <div class="item">
                <span><strong>${item.name}</strong> x${item.quantity}</span>
                <span>€${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>

          <div class="total-section">
            <div class="total-row">
              <span>Sous-total :</span>
              <span>€${subtotal.toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span>Livraison (${shippingMethod.name}) :</span>
              <span>${shipping > 0 ? `€${shipping.toFixed(2)}` : 'Gratuit'}</span>
            </div>
            <div class="total-row total-final">
              <span>Total :</span>
              <span>€${total.toFixed(2)}</span>
            </div>
          </div>

          <div class="order-info">
            <h3>🚚 Livraison & Paiement</h3>
            <div class="info-grid">
              <div class="info-group">
                <h4>Méthode de Livraison</h4>
                <p>${shippingMethod.name}</p>
              </div>
              <div class="info-group">
                <h4>Délai Estimé</h4>
                <p>${shippingMethod.delivery}</p>
              </div>
              <div class="info-group">
                <h4>Paiement</h4>
                <p>${paymentMethod}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>📧 Cet email de confirmation a été généré automatiquement.</p>
          <p>💬 Pour toute question, contactez-nous sur Discord ou par email.</p>
          <p>🔒 Vos données sont sécurisées et chiffrées.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 0.8em; color: #999;">
            © ${new Date().getFullYear()} MythicMarket - Tous droits réservés
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}