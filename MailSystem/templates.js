

function getBaseTemplate(content, title) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    /* Mobile Responsive Styles */
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        padding: 10px !important;
      }
      
      .email-content {
        width: 100% !important;
        max-width: 100% !important;
        padding: 15px !important;
      }
      
      .mobile-stack {
        display: block !important;
        width: 100% !important;
      }
      
      .mobile-stack td {
        display: block !important;
        width: 100% !important;
        padding: 8px 0 !important;
      }
      
      .mobile-stack .info-card {
        margin: 8px 0 !important;
        margin-right: 0 !important;
        margin-left: 0 !important;
      }
      
      .mobile-center {
        text-align: center !important;
      }
      
      .mobile-padding {
        padding: 15px !important;
      }
      
      .mobile-font-large {
        font-size: 1.4rem !important;
      }
      
      .mobile-font-medium {
        font-size: 1rem !important;
      }
      
      .mobile-font-small {
        font-size: 0.85rem !important;
      }
    }
  </style>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #0B0B0B; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #ffffff; font-size: 14px; line-height: 1.5;">
  <!--[if mso]>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
  <tr>
  <td style="background-color: #0B0B0B;">
  <![endif]-->
  
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0B0B0B; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 20px 0;" class="email-container">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #1A1A1A; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3); border: 1px solid #333333;" class="email-content">
          
          <!-- HEADER -->
          <tr>
            <td style="background: linear-gradient(135deg, #FFD76A, #C9A94D); text-align: center; padding: 30px 20px;" class="mobile-padding">
              <h1 style="font-size: 1.8rem; font-weight: 800; color: #0B0B0B; margin: 0 0 6px 0; letter-spacing: -0.02em;" class="mobile-font-large">MythicMarket</h1>
              <p style="font-size: 0.9rem; color: rgba(11,11,11,0.9); margin: 0;" class="mobile-font-small">Votre boutique de confiance</p>
            </td>
          </tr>
          
          <!-- CONTENT -->
          <tr>
            <td style="padding: 25px; background-color: #1A1A1A;" class="mobile-padding">
              ${content}
            </td>
          </tr>
          
          <!-- FOOTER -->
          <tr>
            <td style="background-color: #222222; text-align: center; padding: 20px; border-top: 1px solid #333333;" class="mobile-padding">
              <p style="font-size: 0.8rem; color: #C9A94D; margin: 0 0 6px 0;" class="mobile-font-small">Merci de votre confiance</p>
              <div style="font-weight: 800; font-size: 1rem; color: #FFD76A; margin: 10px 0;" class="mobile-font-medium">MythicMarket</div>
              <p style="font-size: 0.8rem; color: #C9A94D; margin: 6px 0 0 0;" class="mobile-font-small">© 2024 MythicMarket. Tous droits réservés.</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
  
  <!--[if mso]>
  </td>
  </tr>
  </table>
  <![endif]-->
</body>
</html>`;
}

/**
 * Template pour la confirmation de commande
 * @param {Object} orderData - Données de la commande
 * @returns {string} HTML de l'email de confirmation
 */
export function getOrderConfirmationTemplate(orderData) {
  const {
    customerName,
    orderNumber,
    totalAmount,
    items = [],
    shippingMethod,
    shippingCost,
    paymentMethod
  } = orderData;

  // Génération de la liste des articles
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #333333;">
        <table width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="font-weight: 600; color: #ffffff; font-size: 0.95rem;">
              ${item.name || 'Produit'}
            </td>
            <td style="text-align: right; font-weight: 700; color: #ffffff; font-size: 0.95rem;">
              ${item.price || 0} €
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  const content = `
    <!-- HERO SECTION -->
    <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 25px;">
      <tr>
        <td style="text-align: center;" class="mobile-center">
          <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #FFD76A, #C9A94D); border-radius: 50%; display: inline-block; line-height: 60px; font-size: 1.5rem; color: #0B0B0B; margin-bottom: 15px;">✓</div>
          <h1 style="font-size: 1.6rem; font-weight: 700; margin: 0 0 8px 0; color: #FFD76A;" class="mobile-font-large">Commande confirmée !</h1>
          <p style="font-size: 1rem; color: #C9A94D; margin: 0;" class="mobile-font-medium">Merci pour votre commande, ${customerName} !</p>
        </td>
      </tr>
    </table>
    
    <!-- ORDER DETAILS -->
    <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 25px;">
      <tr>
        <td>
          <h3 style="font-size: 1.2rem; margin: 0 0 15px 0; color: #FFD76A; font-weight: 700;" class="mobile-font-medium">Détails de la commande</h3>
          
          <table width="100%" cellspacing="0" cellpadding="0" border="0" class="mobile-stack">
            <tr>
              <td style="width: 50%; padding: 8px 0;">
                <div style="background-color: #222222; border-radius: 8px; padding: 12px; margin-right: 8px;" class="info-card">
                  <div style="font-size: 0.75rem; text-transform: uppercase; color: #C9A94D; margin-bottom: 4px; font-weight: 600;" class="mobile-font-small">Numéro de commande</div>
                  <div style="font-size: 0.95rem; font-weight: 600; color: #ffffff;" class="mobile-font-medium">${orderNumber}</div>
                </div>
              </td>
              <td style="width: 50%; padding: 8px 0;">
                <div style="background-color: #222222; border-radius: 8px; padding: 12px; margin-left: 8px;" class="info-card">
                  <div style="font-size: 0.75rem; text-transform: uppercase; color: #C9A94D; margin-bottom: 4px; font-weight: 600;" class="mobile-font-small">Date</div>
                  <div style="font-size: 0.95rem; font-weight: 600; color: #ffffff;" class="mobile-font-medium">${new Date().toLocaleDateString('fr-FR')}</div>
                </div>
              </td>
            </tr>
            <tr>
              <td style="width: 50%; padding: 8px 0;">
                <div style="background-color: #222222; border-radius: 8px; padding: 12px; margin-right: 8px;" class="info-card">
                  <div style="font-size: 0.75rem; text-transform: uppercase; color: #C9A94D; margin-bottom: 4px; font-weight: 600;" class="mobile-font-small">Livraison</div>
                  <div style="font-size: 0.95rem; font-weight: 600; color: #ffffff;" class="mobile-font-medium">${shippingMethod || 'Standard'}</div>
                </div>
              </td>
              <td style="width: 50%; padding: 8px 0;">
                <div style="background-color: #222222; border-radius: 8px; padding: 12px; margin-left: 8px;" class="info-card">
                  <div style="font-size: 0.75rem; text-transform: uppercase; color: #C9A94D; margin-bottom: 4px; font-weight: 600;" class="mobile-font-small">Paiement</div>
                  <div style="font-size: 0.95rem; font-weight: 600; color: #ffffff;" class="mobile-font-medium">${paymentMethod || 'Non spécifié'}</div>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- ORDER ITEMS -->
    <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 25px;">
      <tr>
        <td>
          <h3 style="font-size: 1.2rem; margin: 0 0 15px 0; color: #FFD76A; font-weight: 700;" class="mobile-font-medium">Articles commandés</h3>
          
          <div style="background-color: #222222; border-radius: 8px; padding: 15px;" class="mobile-padding">
            <table width="100%" cellspacing="0" cellpadding="0" border="0">
              ${itemsHtml || '<tr><td style="text-align: center; color: #C9A94D; padding: 20px;" class="mobile-center mobile-font-medium">Aucun article spécifié</td></tr>'}
            </table>
          </div>
        </td>
      </tr>
    </table>
    
    <!-- ORDER SUMMARY -->
    <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 25px;">
      <tr>
        <td>
          <h3 style="font-size: 1.2rem; margin: 0 0 15px 0; color: #FFD76A; font-weight: 700;" class="mobile-font-medium">Résumé de commande</h3>
          
          <div style="background-color: #222222; border-radius: 8px; padding: 15px;" class="mobile-padding">
            <table width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td style="padding: 8px 0; color: #ffffff; font-size: 0.9rem;" class="mobile-font-small">Sous-total</td>
                <td style="text-align: right; padding: 8px 0; color: #ffffff; font-size: 0.9rem;" class="mobile-font-small">${(totalAmount - (shippingCost || 0)).toFixed(2)} €</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #ffffff; font-size: 0.9rem;" class="mobile-font-small">Livraison</td>
                <td style="text-align: right; padding: 8px 0; color: #ffffff; font-size: 0.9rem;" class="mobile-font-small">${shippingCost ? shippingCost + ' €' : 'Gratuit'}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0 0 0; border-top: 1px solid #333333; font-weight: 800; color: #ffffff; font-size: 1rem;" class="mobile-font-medium">Total</td>
                <td style="text-align: right; padding: 12px 0 0 0; border-top: 1px solid #333333; font-weight: 800; color: #ffffff; font-size: 1rem;" class="mobile-font-medium">${totalAmount || 0} €</td>
              </tr>
            </table>
          </div>
        </td>
      </tr>
    </table>
  `;

  return getBaseTemplate(content, `Confirmation de commande #${orderNumber}`);
}

/**
 * Template pour la mise à jour de statut de commande
 * @param {Object} orderData - Données de la commande
 * @returns {string} HTML de l'email de mise à jour
 */
export function getOrderStatusTemplate(orderData) {
  const {
    customerName,
    orderNumber,
    status,
    trackingNumber,
    estimatedDelivery
  } = orderData;

  const content = `
    <!-- HERO SECTION -->
    <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 25px;">
      <tr>
        <td style="text-align: center;" class="mobile-center">
          <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #FFD76A, #C9A94D); border-radius: 50%; display: inline-block; line-height: 60px; font-size: 1.5rem; color: #0B0B0B; margin-bottom: 15px;">📦</div>
          <h1 style="font-size: 1.6rem; font-weight: 700; margin: 0 0 8px 0; color: #FFD76A;" class="mobile-font-large">Statut mis à jour</h1>
          <p style="font-size: 1rem; color: #C9A94D; margin: 0;" class="mobile-font-medium">Commande ${orderNumber}</p>
        </td>
      </tr>
    </table>
    
    <!-- STATUS DETAILS -->
    <table width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td>
          <h3 style="font-size: 1.2rem; margin: 0 0 15px 0; color: #FFD76A; font-weight: 700;" class="mobile-font-medium">Statut de votre commande</h3>
          
          <table width="100%" cellspacing="0" cellpadding="0" border="0" class="mobile-stack">
            <tr>
              <td style="width: 50%; padding: 8px 0;">
                <div style="background-color: #222222; border-radius: 8px; padding: 12px; margin-right: 8px;" class="info-card">
                  <div style="font-size: 0.75rem; text-transform: uppercase; color: #C9A94D; margin-bottom: 4px; font-weight: 600;" class="mobile-font-small">Numéro de commande</div>
                  <div style="font-size: 0.95rem; font-weight: 600; color: #ffffff;" class="mobile-font-medium">${orderNumber}</div>
                </div>
              </td>
              <td style="width: 50%; padding: 8px 0;">
                <div style="background-color: #222222; border-radius: 8px; padding: 12px; margin-left: 8px;" class="info-card">
                  <div style="font-size: 0.75rem; text-transform: uppercase; color: #C9A94D; margin-bottom: 4px; font-weight: 600;" class="mobile-font-small">Nouveau statut</div>
                  <div style="font-size: 0.95rem; font-weight: 600; color: #ffffff;" class="mobile-font-medium">${status}</div>
                </div>
              </td>
            </tr>
            ${trackingNumber ? `
            <tr>
              <td style="width: 50%; padding: 8px 0;">
                <div style="background-color: #222222; border-radius: 8px; padding: 12px; margin-right: 8px;" class="info-card">
                  <div style="font-size: 0.75rem; text-transform: uppercase; color: #C9A94D; margin-bottom: 4px; font-weight: 600;" class="mobile-font-small">Numéro de suivi</div>
                  <div style="font-size: 0.95rem; font-weight: 600; color: #ffffff;" class="mobile-font-medium">${trackingNumber}</div>
                </div>
              </td>
              <td style="width: 50%; padding: 8px 0;"></td>
            </tr>
            ` : ''}
            ${estimatedDelivery ? `
            <tr>
              <td style="width: 50%; padding: 8px 0;">
                <div style="background-color: #222222; border-radius: 8px; padding: 12px; margin-right: 8px;" class="info-card">
                  <div style="font-size: 0.75rem; text-transform: uppercase; color: #C9A94D; margin-bottom: 4px; font-weight: 600;" class="mobile-font-small">Livraison estimée</div>
                  <div style="font-size: 0.95rem; font-weight: 600; color: #ffffff;" class="mobile-font-medium">${estimatedDelivery}</div>
                </div>
              </td>
              <td style="width: 50%; padding: 8px 0;"></td>
            </tr>
            ` : ''}
          </table>
        </td>
      </tr>
    </table>
  `;

  return getBaseTemplate(content, `Mise à jour commande #${orderNumber}`);
}

/**
 * Template pour les formulaires de contact
 * @param {Object} contactData - Données du contact
 * @returns {string} HTML de l'email de contact
 */
export function getContactFormTemplate(contactData) {
  const {
    name,
    email,
    subject,
    message,
    phone
  } = contactData;

  const content = `
    <!-- HERO SECTION -->
    <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 25px;">
      <tr>
        <td style="text-align: center;" class="mobile-center">
          <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #FFD76A, #C9A94D); border-radius: 50%; display: inline-block; line-height: 60px; font-size: 1.5rem; color: #0B0B0B; margin-bottom: 15px;">📧</div>
          <h1 style="font-size: 1.6rem; font-weight: 700; margin: 0 0 8px 0; color: #FFD76A;" class="mobile-font-large">Nouveau message</h1>
          <p style="font-size: 1rem; color: #C9A94D; margin: 0;" class="mobile-font-medium">Formulaire de contact</p>
        </td>
      </tr>
    </table>
    
    <!-- CONTACT INFO -->
    <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 25px;">
      <tr>
        <td>
          <h3 style="font-size: 1.2rem; margin: 0 0 15px 0; color: #FFD76A; font-weight: 700;" class="mobile-font-medium">Informations du contact</h3>
          
          <table width="100%" cellspacing="0" cellpadding="0" border="0" class="mobile-stack">
            <tr>
              <td style="width: 50%; padding: 8px 0;">
                <div style="background-color: #222222; border-radius: 8px; padding: 12px; margin-right: 8px;" class="info-card">
                  <div style="font-size: 0.75rem; text-transform: uppercase; color: #C9A94D; margin-bottom: 4px; font-weight: 600;" class="mobile-font-small">Nom</div>
                  <div style="font-size: 0.95rem; font-weight: 600; color: #ffffff;" class="mobile-font-medium">${name}</div>
                </div>
              </td>
              <td style="width: 50%; padding: 8px 0;">
                <div style="background-color: #222222; border-radius: 8px; padding: 12px; margin-left: 8px;" class="info-card">
                  <div style="font-size: 0.75rem; text-transform: uppercase; color: #C9A94D; margin-bottom: 4px; font-weight: 600;" class="mobile-font-small">Email</div>
                  <div style="font-size: 0.95rem; font-weight: 600; color: #ffffff;" class="mobile-font-medium">${email}</div>
                </div>
              </td>
            </tr>
            ${phone ? `
            <tr>
              <td style="width: 50%; padding: 8px 0;">
                <div style="background-color: #222222; border-radius: 8px; padding: 12px; margin-right: 8px;" class="info-card">
                  <div style="font-size: 0.75rem; text-transform: uppercase; color: #C9A94D; margin-bottom: 4px; font-weight: 600;" class="mobile-font-small">Téléphone</div>
                  <div style="font-size: 0.95rem; font-weight: 600; color: #ffffff;" class="mobile-font-medium">${phone}</div>
                </div>
              </td>
              <td style="width: 50%; padding: 8px 0;"></td>
            </tr>
            ` : ''}
            <tr>
              <td style="width: 100%; padding: 8px 0;">
                <div style="background-color: #222222; border-radius: 8px; padding: 12px;" class="info-card">
                  <div style="font-size: 0.75rem; text-transform: uppercase; color: #C9A94D; margin-bottom: 4px; font-weight: 600;" class="mobile-font-small">Sujet</div>
                  <div style="font-size: 0.95rem; font-weight: 600; color: #ffffff;" class="mobile-font-medium">${subject}</div>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- MESSAGE -->
    <table width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td>
          <h3 style="font-size: 1.2rem; margin: 0 0 15px 0; color: #FFD76A; font-weight: 700;" class="mobile-font-medium">Message</h3>
          <div style="background-color: #222222; border-radius: 8px; padding: 15px;" class="mobile-padding">
            <p style="white-space: pre-wrap; margin: 0; color: #ffffff; line-height: 1.5; font-size: 0.9rem;" class="mobile-font-small">${message}</p>
          </div>
        </td>
      </tr>
    </table>
  `;

  return getBaseTemplate(content, `Nouveau message: ${subject}`);
}

/**
 * Template pour les emails de test
 * @param {Object} testData - Données de test
 * @returns {string} HTML de l'email de test
 */
export function getTestEmailTemplate(testData) {
  const { message } = testData;

  const content = `
    <!-- HERO SECTION -->
    <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 25px;">
      <tr>
        <td style="text-align: center;" class="mobile-center">
          <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #FFD76A, #C9A94D); border-radius: 50%; display: inline-block; line-height: 60px; font-size: 1.5rem; color: #0B0B0B; margin-bottom: 15px;">🧪</div>
          <h1 style="font-size: 1.6rem; font-weight: 700; margin: 0 0 8px 0; color: #FFD76A;" class="mobile-font-large">Test réussi !</h1>
          <p style="font-size: 1rem; color: #C9A94D; margin: 0;" class="mobile-font-medium">${message || 'Test du système d\'email'}</p>
        </td>
      </tr>
    </table>
    
    <!-- TEST DETAILS -->
    <table width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td>
          <h3 style="font-size: 1.2rem; margin: 0 0 15px 0; color: #FFD76A; font-weight: 700;" class="mobile-font-medium">Détails du test</h3>
          
          <table width="100%" cellspacing="0" cellpadding="0" border="0" class="mobile-stack">
            <tr>
              <td style="width: 50%; padding: 8px 0;">
                <div style="background-color: #222222; border-radius: 8px; padding: 12px; margin-right: 8px;" class="info-card">
                  <div style="font-size: 0.75rem; text-transform: uppercase; color: #C9A94D; margin-bottom: 4px; font-weight: 600;" class="mobile-font-small">Date et heure</div>
                  <div style="font-size: 0.95rem; font-weight: 600; color: #ffffff;" class="mobile-font-medium">${new Date().toLocaleString('fr-FR')}</div>
                </div>
              </td>
              <td style="width: 50%; padding: 8px 0;">
                <div style="background-color: #222222; border-radius: 8px; padding: 12px; margin-left: 8px;" class="info-card">
                  <div style="font-size: 0.75rem; text-transform: uppercase; color: #C9A94D; margin-bottom: 4px; font-weight: 600;" class="mobile-font-small">Statut</div>
                  <div style="font-size: 0.95rem; font-weight: 600; color: #ffffff;" class="mobile-font-medium">Système opérationnel</div>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  return getBaseTemplate(content, 'Test du système d\'email - MythicMarket');
}
