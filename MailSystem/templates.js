

function getBaseTemplate(content, title) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
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
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #1A1A1A; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3); border: 1px solid #333333;">
          
          <!-- HEADER -->
          <tr>
            <td style="background: linear-gradient(135deg, #FFD76A, #C9A94D); text-align: center; padding: 30px 20px;">
              <h1 style="font-size: 1.8rem; font-weight: 800; color: #0B0B0B; margin: 0 0 6px 0; letter-spacing: -0.02em;">MythicMarket</h1>
              <p style="font-size: 0.9rem; color: rgba(11,11,11,0.9); margin: 0;">Votre boutique de confiance</p>
            </td>
          </tr>
          
          <!-- CONTENT -->
          <tr>
            <td style="padding: 25px; background-color: #1A1A1A;">
              ${content}
            </td>
          </tr>
          
          <!-- FOOTER -->
          <tr>
            <td style="background-color: #222222; text-align: center; padding: 20px; border-top: 1px solid #333333;">
              <p style="font-size: 0.8rem; color: #C9A94D; margin: 0 0 6px 0;">Merci de votre confiance</p>
              <div style="font-weight: 800; font-size: 1rem; color: #FFD76A; margin: 10px 0;">MythicMarket</div>
              <p style="font-size: 0.8rem; color: #C9A94D; margin: 6px 0 0 0;">© 2024 MythicMarket. Tous droits réservés.</p>
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
        <td style="text-align: center;">
          <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #FFD76A, #C9A94D); border-radius: 50%; display: inline-block; line-height: 60px; font-size: 1.5rem; color: #0B0B0B; margin-bottom: 15px;">✓</div>
          <h1 style="font-size: 1.6rem; font-weight: 700; margin: 0 0 8px 0; color: #FFD76A;">Commande confirmée !</h1>
          <p style="font-size: 1rem; color: #C9A94D; margin: 0;">Merci pour votre commande, ${customerName} !</p>
        </td>
      </tr>
    </table>
    
    <!-- ORDER DETAILS -->
    <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 25px;">
      <tr>
        <td>
          <h3 style="font-size: 1.2rem; margin: 0 0 15px 0; color: #FFD76A; font-weight: 700;">Détails de la commande</h3>
          
          <table width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td style="width: 50%; padding: 8px 0;">
                <div style="background-color: #222222; border-radius: 8px; padding: 12px; margin-right: 8px;">
                  <div style="font-size: 0.75rem; text-transform: uppercase; color: #C9A94D; margin-bottom: 4px; font-weight: 600;">Numéro de commande</div>
                  <div style="font-size: 0.95rem; font-weight: 600; color: #ffffff;">${orderNumber}</div>
                </div>
              </td>
              <td style="width: 50%; padding: 8px 0;">
                <div style="background-color: #222222; border-radius: 8px; padding: 12px; margin-left: 8px;">
                  <div style="font-size: 0.75rem; text-transform: uppercase; color: #C9A94D; margin-bottom: 4px; font-weight: 600;">Date</div>
                  <div style="font-size: 0.95rem; font-weight: 600; color: #ffffff;">${new Date().toLocaleDateString('fr-FR')}</div>
                </div>
              </td>
            </tr>
            <tr>
              <td style="width: 50%; padding: 8px 0;">
                <div style="background-color: #222222; border-radius: 8px; padding: 12px; margin-right: 8px;">
                  <div style="font-size: 0.75rem; text-transform: uppercase; color: #C9A94D; margin-bottom: 4px; font-weight: 600;">Livraison</div>
                  <div style="font-size: 0.95rem; font-weight: 600; color: #ffffff;">${shippingMethod || 'Standard'}</div>
                </div>
              </td>
              <td style="width: 50%; padding: 8px 0;">
                <div style="background-color: #222222; border-radius: 8px; padding: 12px; margin-left: 8px;">
                  <div style="font-size: 0.75rem; text-transform: uppercase; color: #C9A94D; margin-bottom: 4px; font-weight: 600;">Paiement</div>
                  <div style="font-size: 0.95rem; font-weight: 600; color: #ffffff;">${paymentMethod || 'Non spécifié'}</div>
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
          <h3 style="font-size: 1.2rem; margin: 0 0 15px 0; color: #FFD76A; font-weight: 700;">Articles commandés</h3>
          
          <div style="background-color: #222222; border-radius: 8px; padding: 15px;">
            <table width="100%" cellspacing="0" cellpadding="0" border="0">
              ${itemsHtml || '<tr><td style="text-align: center; color: #C9A94D; padding: 20px;">Aucun article spécifié</td></tr>'}
            </table>
          </div>
        </td>
      </tr>
    </table>
    
    <!-- ORDER SUMMARY -->
    <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 25px;">
      <tr>
        <td>
          <h3 style="font-size: 1.2rem; margin: 0 0 15px 0; color: #FFD76A; font-weight: 700;">Résumé de commande</h3>
          
          <div style="background-color: #222222; border-radius: 8px; padding: 15px;">
            <table width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td style="padding: 8px 0; color: #ffffff; font-size: 0.9rem;">Sous-total</td>
                <td style="text-align: right; padding: 8px 0; color: #ffffff; font-size: 0.9rem;">${(totalAmount - (shippingCost || 0)).toFixed(2)} €</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #ffffff; font-size: 0.9rem;">Livraison</td>
                <td style="text-align: right; padding: 8px 0; color: #ffffff; font-size: 0.9rem;">${shippingCost ? shippingCost + ' €' : 'Gratuit'}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0 0 0; border-top: 1px solid #333333; font-weight: 800; color: #ffffff; font-size: 1rem;">Total</td>
                <td style="text-align: right; padding: 12px 0 0 0; border-top: 1px solid #333333; font-weight: 800; color: #ffffff; font-size: 1rem;">${totalAmount || 0} €</td>
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
        <td style="text-align: center;">
          <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #FFD76A, #C9A94D); border-radius: 50%; display: inline-block; line-height: 60px; font-size: 1.5rem; color: #0B0B0B; margin-bottom: 15px;">📦</div>
          <h1 style="font-size: 1.6rem; font-weight: 700; margin: 0 0 8px 0; color: #FFD76A;">Statut mis à jour</h1>
          <p style="font-size: 1rem; color: #C9A94D; margin: 0;">Commande ${orderNumber}</p>
        </td>
      </tr>
    </table>
    
    <!-- STATUS DETAILS -->
    <table width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td>
          <h3 style="font-size: 1.2rem; margin: 0 0 15px 0; color: #FFD76A; font-weight: 700;">Statut de votre commande</h3>
          
          <table width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td style="width: 50%; padding: 8px 0;">
                <div style="background-color: #222222; border-radius: 8px; padding: 12px; margin-right: 8px;">
                  <div style="font-size: 0.75rem; text-transform: uppercase; color: #C9A94D; margin-bottom: 4px; font-weight: 600;">Numéro de commande</div>
                  <div style="font-size: 0.95rem; font-weight: 600; color: #ffffff;">${orderNumber}</div>
                </div>
              </td>
              <td style="width: 50%; padding: 8px 0;">
                <div style="background-color: #222222; border-radius: 8px; padding: 12px; margin-left: 8px;">
                  <div style="font-size: 0.75rem; text-transform: uppercase; color: #C9A94D; margin-bottom: 4px; font-weight: 600;">Nouveau statut</div>
                  <div style="font-size: 0.95rem; font-weight: 600; color: #ffffff;">${status}</div>
                </div>
              </td>
            </tr>
            ${trackingNumber ? `
            <tr>
              <td style="width: 50%; padding: 8px 0;">
                <div style="background-color: #222222; border-radius: 8px; padding: 12px; margin-right: 8px;">
                  <div style="font-size: 0.75rem; text-transform: uppercase; color: #C9A94D; margin-bottom: 4px; font-weight: 600;">Numéro de suivi</div>
                  <div style="font-size: 0.95rem; font-weight: 600; color: #ffffff;">${trackingNumber}</div>
                </div>
              </td>
              <td style="width: 50%; padding: 8px 0;"></td>
            </tr>
            ` : ''}
            ${estimatedDelivery ? `
            <tr>
              <td style="width: 50%; padding: 8px 0;">
                <div style="background-color: #222222; border-radius: 8px; padding: 12px; margin-right: 8px;">
                  <div style="font-size: 0.75rem; text-transform: uppercase; color: #C9A94D; margin-bottom: 4px; font-weight: 600;">Livraison estimée</div>
                  <div style="font-size: 0.95rem; font-weight: 600; color: #ffffff;">${estimatedDelivery}</div>
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
        <td style="text-align: center;">
          <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #FFD76A, #C9A94D); border-radius: 50%; display: inline-block; line-height: 60px; font-size: 1.5rem; color: #0B0B0B; margin-bottom: 15px;">📧</div>
          <h1 style="font-size: 1.6rem; font-weight: 700; margin: 0 0 8px 0; color: #FFD76A;">Nouveau message</h1>
          <p style="font-size: 1rem; color: #C9A94D; margin: 0;">Formulaire de contact</p>
        </td>
      </tr>
    </table>
    
    <!-- CONTACT INFO -->
    <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 25px;">
      <tr>
        <td>
          <h3 style="font-size: 1.2rem; margin: 0 0 15px 0; color: #FFD76A; font-weight: 700;">Informations du contact</h3>
          
          <table width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td style="width: 50%; padding: 8px 0;">
                <div style="background-color: #222222; border-radius: 8px; padding: 12px; margin-right: 8px;">
                  <div style="font-size: 0.75rem; text-transform: uppercase; color: #C9A94D; margin-bottom: 4px; font-weight: 600;">Nom</div>
                  <div style="font-size: 0.95rem; font-weight: 600; color: #ffffff;">${name}</div>
                </div>
              </td>
              <td style="width: 50%; padding: 8px 0;">
                <div style="background-color: #222222; border-radius: 8px; padding: 12px; margin-left: 8px;">
                  <div style="font-size: 0.75rem; text-transform: uppercase; color: #C9A94D; margin-bottom: 4px; font-weight: 600;">Email</div>
                  <div style="font-size: 0.95rem; font-weight: 600; color: #ffffff;">${email}</div>
                </div>
              </td>
            </tr>
            ${phone ? `
            <tr>
              <td style="width: 50%; padding: 8px 0;">
                <div style="background-color: #222222; border-radius: 8px; padding: 12px; margin-right: 8px;">
                  <div style="font-size: 0.75rem; text-transform: uppercase; color: #C9A94D; margin-bottom: 4px; font-weight: 600;">Téléphone</div>
                  <div style="font-size: 0.95rem; font-weight: 600; color: #ffffff;">${phone}</div>
                </div>
              </td>
              <td style="width: 50%; padding: 8px 0;"></td>
            </tr>
            ` : ''}
            <tr>
              <td style="width: 100%; padding: 8px 0;">
                <div style="background-color: #222222; border-radius: 8px; padding: 12px;">
                  <div style="font-size: 0.75rem; text-transform: uppercase; color: #C9A94D; margin-bottom: 4px; font-weight: 600;">Sujet</div>
                  <div style="font-size: 0.95rem; font-weight: 600; color: #ffffff;">${subject}</div>
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
          <h3 style="font-size: 1.2rem; margin: 0 0 15px 0; color: #FFD76A; font-weight: 700;">Message</h3>
          <div style="background-color: #222222; border-radius: 8px; padding: 15px;">
            <p style="white-space: pre-wrap; margin: 0; color: #ffffff; line-height: 1.5; font-size: 0.9rem;">${message}</p>
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
        <td style="text-align: center;">
          <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #FFD76A, #C9A94D); border-radius: 50%; display: inline-block; line-height: 60px; font-size: 1.5rem; color: #0B0B0B; margin-bottom: 15px;">🧪</div>
          <h1 style="font-size: 1.6rem; font-weight: 700; margin: 0 0 8px 0; color: #FFD76A;">Test réussi !</h1>
          <p style="font-size: 1rem; color: #C9A94D; margin: 0;">${message || 'Test du système d\'email'}</p>
        </td>
      </tr>
    </table>
    
    <!-- TEST DETAILS -->
    <table width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td>
          <h3 style="font-size: 1.2rem; margin: 0 0 15px 0; color: #FFD76A; font-weight: 700;">Détails du test</h3>
          
          <table width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td style="width: 50%; padding: 8px 0;">
                <div style="background-color: #222222; border-radius: 8px; padding: 12px; margin-right: 8px;">
                  <div style="font-size: 0.75rem; text-transform: uppercase; color: #C9A94D; margin-bottom: 4px; font-weight: 600;">Date et heure</div>
                  <div style="font-size: 0.95rem; font-weight: 600; color: #ffffff;">${new Date().toLocaleString('fr-FR')}</div>
                </div>
              </td>
              <td style="width: 50%; padding: 8px 0;">
                <div style="background-color: #222222; border-radius: 8px; padding: 12px; margin-left: 8px;">
                  <div style="font-size: 0.75rem; text-transform: uppercase; color: #C9A94D; margin-bottom: 4px; font-weight: 600;">Statut</div>
                  <div style="font-size: 0.95rem; font-weight: 600; color: #ffffff;">Système opérationnel</div>
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
