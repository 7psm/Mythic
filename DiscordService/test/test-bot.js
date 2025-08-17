/**
 * SCRIPT DE TEST COMPLET (test/test-bot.js)
 * Teste toutes les fonctionnalités du bot Discord
 */

const discordBot = require('../bot/discordService.js');
const axios = require('axios');
require('dotenv').config();

class TesteurBotDiscord {
  constructor() {
    this.resultats = {
      tests: 0,
      succes: 0,
      echecs: 0,
      details: []
    };
  }

  /**
   * Lance tous les tests
   */
  async lancerTests() {
    console.log('🧪 === SUITE DE TESTS BOT DISCORD ===\n');
    
    try {
      // Attendre que le bot soit prêt
      await this.attendreBotPret();
      
      // Tests de base
      await this.testerConnexionBot();
      await this.testerConfigurationBot();
      
      // Tests fonctionnels
      await this.testerRechercheUtilisateur();
      await this.testerCreationEmbeds();
      await this.testerTraitementCommande();
      
      // Tests API (si disponible)
      await this.testerAPI();
      
      // Résumé final
      this.afficherResume();
      
    } catch (error) {
      console.error('❌ Erreur critique lors des tests:', error);
      process.exit(1);
    }
  }

  /**
   * Attend que le bot soit prêt
   */
  async attendreBotPret() {
    return new Promise((resolve, reject) => {
      if (discordBot.client.isReady()) {
        resolve();
      } else {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout : Bot non prêt après 30s'));
        }, 30000);

        discordBot.client.once('ready', () => {
          clearTimeout(timeout);
          resolve();
        });
      }
    });
  }

  /**
   * Test de connexion du bot
   */
  async testerConnexionBot() {
    console.log('🔌 Test de connexion du bot...');
    
    try {
      const estPret = discordBot.client.isReady();
      const utilisateur = discordBot.client.user;
      const ping = discordBot.client.ws.ping;

      this.enregistrerTest('Connexion bot', estPret, {
        utilisateur: utilisateur?.tag,
        ping: ping + 'ms',
        statut: estPret ? 'Connecté' : 'Déconnecté'
      });

    } catch (error) {
      this.enregistrerTest('Connexion bot', false, { erreur: error.message });
    }
  }

  /**
   * Test de configuration du bot
   */
  async testerConfigurationBot() {
    console.log('⚙️ Test de configuration...');
    
    try {
      const config = discordBot.config;
      const serveur = discordBot.client.guilds.cache.get(config.guildId);
      const salon = discordBot.client.channels.cache.get(config.channelId);

      const configValide = !!(config.token && config.guildId && config.channelId);
      const serveurTrouve = !!serveur;
      const salonTrouve = !!salon;

      this.enregistrerTest('Configuration', configValide, {
        serveur: serveurTrouve ? serveur.name : 'Introuvable',
        salon: salonTrouve ? '#' + salon.name : 'Introuvable',
        permissions: salonTrouve ? 'OK' : 'Vérifier'
      });

    } catch (error) {
      this.enregistrerTest('Configuration', false, { erreur: error.message });
    }
  }

  /**
   * Test de recherche d'utilisateur
   */
  async testerRechercheUtilisateur() {
    console.log('👤 Test de recherche d\'utilisateur...');
    
    try {
      // Test avec votre propre pseudo (changez-le !)
      const pseudoTest = process.env.TEST_DISCORD_USERNAME || 'votrepseudo';
      const utilisateur = await discordBot.trouverUtilisateurParPseudo(pseudoTest);

      const trouve = !!utilisateur;
      this.enregistrerTest('Recherche utilisateur', trouve, {
        pseudo: pseudoTest,
        utilisateur: trouve ? utilisateur.tag : 'Non trouvé',
        conseil: !trouve ? 'Changez TEST_DISCORD_USERNAME dans .env' : 'OK'
      });

    } catch (error) {
      this.enregistrerTest('Recherche utilisateur', false, { erreur: error.message });
    }
  }

  /**
   * Test de création d'embeds
   */
  async testerCreationEmbeds() {
    console.log('🎨 Test de création d\'embeds...');
    
    try {
      const donneesTest = this.obtenirDonneesCommandeTest();
      
      // Test embed client
      const embedClient = discordBot.creerEmbedConfirmationClient(donneesTest);
      const embedClientValide = !!(embedClient.data && embedClient.data.title);

      // Test embed admin
      const embedAdmin = discordBot.creerEmbedNotificationAdmin(donneesTest);
      const embedAdminValide = !!(embedAdmin.data && embedAdmin.data.title);

      this.enregistrerTest('Création embeds', embedClientValide && embedAdminValide, {
        embedClient: embedClientValide ? 'Créé' : 'Échec',
        embedAdmin: embedAdminValide ? 'Créé' : 'Échec',
        couleurClient: embedClient.data?.color || 'Aucune',
        couleurAdmin: embedAdmin.data?.color || 'Aucune'
      });

    } catch (error) {
      this.enregistrerTest('Création embeds', false, { erreur: error.message });
    }
  }

  /**
   * Test de traitement de commande complète
   */
  async testerTraitementCommande() {
    console.log('📦 Test de traitement de commande...');
    
    try {
      const donneesTest = this.obtenirDonneesCommandeTest();
      
      console.log('   📤 Envoi de la commande de test...');
      const resultats = await discordBot.traiterNouvelleCommande(donneesTest);

      const succes = !!(resultats.numeroCommande && resultats.timestamp);
      
      this.enregistrerTest('Traitement commande', succes, {
        numeroCommande: resultats.numeroCommande,
        confirmationClient: resultats.confirmationClient ? '✅' : '❌',
        notificationAdmin: resultats.notificationAdmin ? '✅' : '❌',
        erreur: resultats.error || 'Aucune'
      });

    } catch (error) {
      this.enregistrerTest('Traitement commande', false, { erreur: error.message });
    }
  }

  /**
   * Test de l'API Discord
   */
  async testerAPI() {
    console.log('🌐 Test de l\'API Discord...');
    
    try {
      const port = process.env.PORT || 3000;
      const apiSecret = process.env.API_SECRET || 'default_secret_change_me';
      const baseUrl = `http://localhost:${port}`;

      // Test health check
      try {
        const healthResponse = await axios.get(`${baseUrl}/health`, { timeout: 5000 });
        const apiDisponible = healthResponse.status === 200;

        if (apiDisponible) {
          // Test endpoint protégé
          try {
            const testResponse = await axios.post(`${baseUrl}/api/discord/test`, {
              pseudoDiscord: 'testuser'
            }, {
              headers: {
                'Authorization': `Bearer ${apiSecret}`,
                'Content-Type': 'application/json'
              },
              timeout: 10000
            });

            this.enregistrerTest('API Discord', true, {
              health: '✅ Disponible',
              auth: testResponse.status === 200 ? '✅ OK' : '❌ Échec',
              port: port,
              url: baseUrl
            });

          } catch (authError) {
            this.enregistrerTest('API Discord', false, {
              health: '✅ Disponible',
              auth: '❌ Authentification échouée',
              erreur: authError.response?.data?.error || authError.message
            });
          }

        } else {
          this.enregistrerTest('API Discord', false, {
            statut: 'API non disponible',
            conseil: 'Lancez l\'API avec: npm run server'
          });
        }

      } catch (healthError) {
        this.enregistrerTest('API Discord', false, {
          statut: 'API non accessible',
          erreur: healthError.message,
          conseil: 'Lancez l\'API avec: npm run server'
        });
      }

    } catch (error) {
      this.enregistrerTest('API Discord', false, { erreur: error.message });
    }
  }

  /**
   * Obtient des données de commande de test
   */
  obtenirDonneesCommandeTest() {
    return {
      numeroCommande: 'TEST-' + Date.now(),
      nom: 'Client Test',
      email: 'test@incognitomarket.com',
      pseudoDiscord: process.env.TEST_DISCORD_USERNAME || 'votrepseudo',
      telephone: '+33123456789',
      adresse: '123 Rue de Test',
      ville: 'Paris',
      codePostal: '75001',
      pays: 'France',
      articles: [
        { nom: '20 Euro Prop Bills', quantite: 1, prix: 100 },
        { nom: '50 Euro Prop Bills', quantite: 2, prix: 150 }
      ],
      methodeLivraison: 'Livraison Express',
      delaiLivraison: '15-20min',
      fraisLivraison: 2.50,
      methodePaiement: 'PayPal',
      dateCommande: new Date().toISOString()
    };
  }

  /**
   * Enregistre un résultat de test
   */
  enregistrerTest(nom, succes, details = {}) {
    this.resultats.tests++;
    
    if (succes) {
      this.resultats.succes++;
      console.log(`   ✅ ${nom}`);
    } else {
      this.resultats.echecs++;
      console.log(`   ❌ ${nom}`);
    }

    // Afficher les détails
    Object.entries(details).forEach(([cle, valeur]) => {
      console.log(`      ${cle}: ${valeur}`);
    });

    this.resultats.details.push({
      nom,
      succes,
      details,
      timestamp: new Date().toISOString()
    });

    console.log(''); // Ligne vide pour la lisibilité
  }

  /**
   * Affiche le résumé final des tests
   */
  afficherResume() {
    console.log('='.repeat(50));
    console.log('📊 RÉSUMÉ DES TESTS');
    console.log('='.repeat(50));
    
    console.log(`Tests exécutés: ${this.resultats.tests}`);
    console.log(`Succès: ${this.resultats.succes} ✅`);
    console.log(`Échecs: ${this.resultats.echecs} ❌`);
    
    const pourcentage = Math.round((this.resultats.succes / this.resultats.tests) * 100);
    console.log(`Taux de réussite: ${pourcentage}%`);

    if (this.resultats.echecs > 0) {
      console.log('\n⚠️ TESTS ÉCHOUÉS:');
      this.resultats.details
        .filter(test => !test.succes)
        .forEach(test => {
          console.log(`• ${test.nom}`);
          if (test.details.erreur) {
            console.log(`  Erreur: ${test.details.erreur}`);
          }
          if (test.details.conseil) {
            console.log(`  Conseil: ${test.details.conseil}`);
          }
        });
    }

    console.log('\n🎯 PROCHAINES ÉTAPES:');
    
    if (pourcentage === 100) {
      console.log('✅ Tous les tests réussis ! Votre bot est prêt.');
      console.log('✅ Vous pouvez démarrer en production avec: npm start');
    } else if (pourcentage >= 80) {
      console.log('⚠️ La plupart des tests réussis, vérifiez les échecs ci-dessus.');
      console.log('🔧 Corrigez les problèmes puis relancez: npm run test');
    } else {
      console.log('❌ Plusieurs tests échoués, vérifiez votre configuration.');
      console.log('📖 Consultez la documentation et le fichier .env');
    }

    console.log('\n📁 Logs détaillés sauvegardés dans: ./test-results.json');
    
    // Sauvegarder les résultats
    const fs = require('fs');
    fs.writeFileSync('./test-results.json', JSON.stringify(this.resultats, null, 2));

    // Code de sortie
    process.exit(this.resultats.echecs > 0 ? 1 : 0);
  }
}

/**
 * FONCTION DE LANCEMENT PRINCIPALE
 */
async function main() {
  console.log('🚀 Démarrage des tests du bot Discord IncognitoMarket\n');
  
  // Vérification des prérequis
  if (!process.env.DISCORD_BOT_TOKEN) {
    console.error('❌ DISCORD_BOT_TOKEN manquant dans .env');
    process.exit(1);
  }

  if (!process.env.DISCORD_GUILD_ID) {
    console.error('❌ DISCORD_GUILD_ID manquant dans .env');
    process.exit(1);
  }

  if (!process.env.DISCORD_CHANNEL_ID) {
    console.error('❌ DISCORD_CHANNEL_ID manquant dans .env');
    process.exit(1);
  }

  console.log('✅ Variables d\'environnement trouvées');
  console.log(`🤖 Token bot: ${process.env.DISCORD_BOT_TOKEN.slice(0, 20)}...`);
  console.log(`🏠 Serveur ID: ${process.env.DISCORD_GUILD_ID}`);
  console.log(`📢 Salon ID: ${process.env.DISCORD_CHANNEL_ID}\n`);

  // Lancer les tests
  const testeur = new TesteurBotDiscord();
  await testeur.lancerTests();
}

// Gestion des erreurs non capturées
process.on('unhandledRejection', (error) => {
  console.error('❌ Erreur non gérée:', error);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Tests interrompus par l\'utilisateur');
  process.exit(0);
});

// Lancer les tests
main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});