const { Client, GatewayIntentBits } = require('discord.js');
const readline = require('readline');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class BotSetup {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers
      ]
    });
  }

  async setup() {
    console.log('🚀 Assistant de configuration du bot Discord IncognitoMarket\n');
    
    // Vérifier le token
    const token = process.env.DISCORD_BOT_TOKEN;
    if (!token) {
      console.error('❌ Token Discord manquant dans le fichier .env');
      console.log('1. Créez un bot sur https://discord.com/developers/applications');
      console.log('2. Copiez le token dans DISCORD_BOT_TOKEN dans votre fichier .env');
      process.exit(1);
    }

    try {
      console.log('🔐 Connexion avec le token Discord...');
      await this.client.login(token);
      
      console.log(`✅ Connecté en tant que ${this.client.user.tag}`);
      
      // Lister les serveurs
      console.log('\n📋 Serveurs Discord disponibles:');
      this.client.guilds.cache.forEach((guild, index) => {
        console.log(`${index + 1}. ${guild.name} (ID: ${guild.id})`);
      });

      // Demander le serveur à utiliser
      const guildId = await this.askQuestion('\n🏠 ID du serveur à utiliser pour les notifications: ');
      const guild = this.client.guilds.cache.get(guildId);
      
      if (!guild) {
        console.error('❌ Serveur introuvable');
        process.exit(1);
      }

      console.log(`✅ Serveur sélectionné: ${guild.name}`);

      // Lister les salons
      console.log('\n📺 Salons texte disponibles:');
      guild.channels.cache
        .filter(channel => channel.type === 0) // GUILD_TEXT
        .forEach((channel, index) => {
          console.log(`${index + 1}. #${channel.name} (ID: ${channel.id})`);
        });

      // Demander le salon pour les notifications
      const channelId = await this.askQuestion('\n📢 ID du salon pour les notifications de commandes: ');
      const channel = guild.channels.cache.get(channelId);
      
      if (!channel) {
        console.error('❌ Salon introuvable');
        process.exit(1);
      }

      console.log(`✅ Salon sélectionné: #${channel.name}`);

      // Test d'envoi
      console.log('\n🧪 Test d\'envoi d\'un message...');
      
      try {
        const testMessage = await channel.send({
          embeds: [{
            title: '🎉 Configuration réussie !',
            description: 'Le bot Discord IncognitoMarket est maintenant configuré et opérationnel.',
            color: 0x00ff00,
            timestamp: new Date().toISOString(),
            footer: {
              text: 'IncognitoMarket Discord Bot',
              icon_url: this.client.user.displayAvatarURL()
            }
          }]
        });

        console.log('✅ Message de test envoyé avec succès !');
        console.log(`🔗 Lien: https://discord.com/channels/${guild.id}/${channel.id}/${testMessage.id}`);

        // Résumé de la configuration
        console.log('\n🎯 Configuration terminée !');
        console.log('=====================================');
        console.log(`Bot: ${this.client.user.tag}`);
        console.log(`Serveur: ${guild.name} (${guild.id})`);
        console.log(`Salon: #${channel.name} (${channel.id})`);
        console.log('=====================================');
        
        console.log('\n📝 Ajoutez ces informations à votre fichier .env:');
        console.log(`DISCORD_GUILD_ID=${guild.id}`);
        console.log(`DISCORD_CHANNEL_ID=${channel.id}`);

      } catch (error) {
        console.error('❌ Erreur lors du test:', error.message);
        console.log('Vérifiez que le bot a les permissions pour écrire dans ce salon');
      }

      this.client.destroy();
      rl.close();

    } catch (error) {
      console.error('❌ Erreur de connexion:', error.message);
      console.log('Vérifiez votre token Discord');
      process.exit(1);
    }
  }

  askQuestion(question) {
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }
}

// Lancer le setup
new BotSetup().setup();