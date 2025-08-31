// =============================================
// ROUTES API POUR LE SYSTÈME D'EMAIL
// =============================================
// Ce fichier contient toutes les routes API pour l'envoi d'emails
// Il inclut la validation, la limitation de débit et la gestion d'erreurs

import express from 'express';
import emailService from './emailService-simple.js';
import { 
  emailMiddleware, 
  validateOrderData, 
  validateContactData 
} from './middleware.js';
import { validateConfig } from './config.js';

const router = express.Router();

// =============================================
// ROUTE DE TEST DU SYSTÈME D'EMAIL
// =============================================
router.post('/test', emailMiddleware, async (req, res) => {
  try {
    const { email, message } = req.body;

    console.log('🧪 Test du système d\'email demandé pour:', email);

    const result = await emailService.sendTestEmail(email, message);

    if (result.success) {
      console.log('✅ Test email envoyé avec succès');
      res.json({
        success: true,
        message: 'Email de test envoyé avec succès',
        messageId: result.messageId
      });
    } else {
      console.error('❌ Échec envoi email de test:', result.error);
      res.status(500).json({
        success: false,
        error: 'Échec de l\'envoi de l\'email de test',
        details: result.error
      });
    }

  } catch (error) {
    console.error('❌ Erreur lors du test email:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// =============================================
// ROUTE POUR L'ENVOI D'EMAIL DE CONFIRMATION DE COMMANDE
// =============================================
router.post('/order-confirmation', emailMiddleware, validateOrderData, async (req, res) => {
  try {
    const {
      customerEmail,
      customerName,
      orderNumber,
      totalAmount,
      items,
      shippingMethod,
      shippingCost,
      paymentMethod
    } = req.body;

    console.log('📧 Envoi email confirmation commande:', orderNumber);

    const result = await emailService.sendOrderConfirmation({
      customerEmail,
      customerName,
      orderNumber,
      totalAmount,
      items,
      shippingMethod,
      shippingCost,
      paymentMethod
    });

    if (result.success) {
      console.log('✅ Email confirmation commande envoyé:', orderNumber);
      res.json({
        success: true,
        message: 'Email de confirmation envoyé avec succès',
        messageId: result.messageId,
        orderNumber
      });
    } else {
      console.error('❌ Échec envoi email confirmation:', result.error);
      res.status(500).json({
        success: false,
        error: 'Échec de l\'envoi de l\'email de confirmation',
        details: result.error
      });
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi email confirmation:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// =============================================
// ROUTE POUR L'ENVOI D'EMAIL DE MISE À JOUR DE STATUT
// =============================================
router.post('/order-status', emailMiddleware, validateOrderData, async (req, res) => {
  try {
    const {
      customerEmail,
      customerName,
      orderNumber,
      status,
      trackingNumber,
      estimatedDelivery
    } = req.body;

    // Validation supplémentaire pour le statut
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Statut de commande requis'
      });
    }

    console.log('📧 Envoi email mise à jour statut:', orderNumber, status);

    const result = await emailService.sendOrderStatusUpdate({
      customerEmail,
      customerName,
      orderNumber,
      status,
      trackingNumber,
      estimatedDelivery
    });

    if (result.success) {
      console.log('✅ Email mise à jour statut envoyé:', orderNumber);
      res.json({
        success: true,
        message: 'Email de mise à jour envoyé avec succès',
        messageId: result.messageId,
        orderNumber,
        status
      });
    } else {
      console.error('❌ Échec envoi email mise à jour:', result.error);
      res.status(500).json({
        success: false,
        error: 'Échec de l\'envoi de l\'email de mise à jour',
        details: result.error
      });
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi email mise à jour:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// =============================================
// ROUTE POUR L'ENVOI D'EMAIL DE CONTACT
// =============================================
router.post('/contact', emailMiddleware, validateContactData, async (req, res) => {
  try {
    const {
      name,
      email,
      subject,
      message,
      phone
    } = req.body;

    console.log('📧 Envoi email contact de:', name, `(${email})`);

    const result = await emailService.sendContactForm({
      name,
      email,
      subject,
      message,
      phone
    });

    if (result.success) {
      console.log('✅ Email contact envoyé pour:', name);
      res.json({
        success: true,
        message: 'Message de contact envoyé avec succès',
        messageId: result.messageId
      });
    } else {
      console.error('❌ Échec envoi email contact:', result.error);
      res.status(500).json({
        success: false,
        error: 'Échec de l\'envoi du message de contact',
        details: result.error
      });
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi email contact:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// =============================================
// ROUTE POUR VÉRIFIER LE STATUT DU SERVICE
// =============================================
router.get('/status', (req, res) => {
  try {
    const serviceStatus = emailService.getStatus();
    const configValidation = validateConfig();

    const status = {
      service: serviceStatus,
      config: configValidation,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };

    console.log('📊 Statut du service email consulté');

    res.json({
      success: true,
      status
    });

  } catch (error) {
    console.error('❌ Erreur lors de la vérification du statut:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la vérification du statut'
    });
  }
});

// =============================================
// ROUTE POUR RÉINITIALISER LE SERVICE
// =============================================
router.post('/reset', async (req, res) => {
  try {
    console.log('🔄 Réinitialisation du service email demandée');

    await emailService.reset();

    console.log('✅ Service email réinitialisé avec succès');

    res.json({
      success: true,
      message: 'Service email réinitialisé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la réinitialisation du service'
    });
  }
});

// =============================================
// ROUTE POUR OBTENIR LES STATISTIQUES DE DÉBIT
// =============================================
router.get('/rate-limit-stats/:ip', (req, res) => {
  try {
    const { ip } = req.params;
    
    if (!ip || ip === 'unknown') {
      return res.status(400).json({
        success: false,
        error: 'Adresse IP requise'
      });
    }

    // Import dynamique pour éviter les dépendances circulaires
    import('./rateLimiter.js').then(({ default: emailRateLimiter }) => {
      const stats = emailRateLimiter.getStats(ip);

      console.log(`📊 Statistiques de débit consultées pour IP: ${ip}`);

      res.json({
        success: true,
        ip,
        stats
      });
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques'
    });
  }
});

// =============================================
// ROUTE POUR RÉINITIALISER LES COMPTEURS DE DÉBIT
// =============================================
router.post('/rate-limit-reset/:ip', (req, res) => {
  try {
    const { ip } = req.params;
    
    if (!ip || ip === 'unknown') {
      return res.status(400).json({
        success: false,
        error: 'Adresse IP requise'
      });
    }

    // Import dynamique pour éviter les dépendances circulaires
    import('./rateLimiter.js').then(({ default: emailRateLimiter }) => {
      emailRateLimiter.resetCounters(ip);

      console.log(`🔄 Compteurs de débit réinitialisés pour IP: ${ip}`);

      res.json({
        success: true,
        message: 'Compteurs de débit réinitialisés avec succès',
        ip
      });
    });

  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation des compteurs:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la réinitialisation des compteurs'
    });
  }
});

// =============================================
// ROUTE DE SANTÉ (HEALTH CHECK)
// =============================================
router.get('/health', (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Email Service',
    version: '1.0.0'
  };

  res.json(health);
});

export default router;
