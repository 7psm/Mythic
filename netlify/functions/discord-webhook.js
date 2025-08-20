const https = require('https');

// Validation et nettoyage des données
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return String(input);
  return input
    .replace(/[`*_~|\\]/g, '\\$&')
    .replace(/@/g, '@\u200b')
    .trim()
    .substring(0, 1000);
};

const validateDiscordId = (id) => {
  if (!id) return false;
  const discordIdRegex = /^\d{17,19}$/;
  return discordIdRegex.test(id);
};

const validateAndSanitizePayload = (body) => {
  try {
    const data = typeof body === 'string' ? JSON.parse(body) : body;
    
    if (data.userId && !validateDiscordId(data.userId)) {
      throw new Error('Invalid user ID format');
    }
    
    if (data.channelId && !validateDiscordId(data.channelId)) {
      throw new Error('Invalid channel ID format');
    }

    // Validation de l'embed
    if (!data.embed || typeof data.embed !== 'object') {
      throw new Error('Invalid embed format');
    }

    return {
      embed: data.embed,
      userId: data.userId,
      channelId: data.channelId
    };
  } catch (error) {
    throw new Error(`Invalid payload: ${error.message}`);
  }
};

const makeDiscordRequest = (options, data) => {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = body ? JSON.parse(body) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(response);
          } else {
            reject(new Error(`Discord API error: ${res.statusCode} - ${response.message || body}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse Discord response: ${body}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timeout after 15 seconds'));
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
};

exports.handler = async (event, context) => {
  // Headers CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS OK' })
    };
  }

  // Vérification de la méthode
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Method not allowed. Use POST.' 
      })
    };
  }

  try {
    // Validation du token bot
    const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
    if (!BOT_TOKEN) {
      console.error('Discord bot token not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Server configuration error' 
        })
      };
    }

    // Validation et nettoyage des données
    const { embed, userId, channelId } = validateAndSanitizePayload(event.body);

    const results = [];
    let hasError = false;

    console.log(`Processing Discord notification for user: ${userId}, channel: ${channelId}`);

    // Envoi du MP à l'utilisateur (si spécifié)
    if (userId) {
      try {
        console.log(`Sending DM to user: ${userId}`);
        
        // Créer un channel DM
        const dmChannelOptions = {
          hostname: 'discord.com',
          path: '/api/v10/users/@me/channels',
          method: 'POST',
          headers: {
            'Authorization': `Bot ${BOT_TOKEN}`,
            'Content-Type': 'application/json',
            'User-Agent': 'DiscordBot (https://github.com/discord/discord-api-docs, 1.0)'
          }
        };

        const dmChannel = await makeDiscordRequest(dmChannelOptions, {
          recipient_id: userId
        });

        console.log(`DM Channel created: ${dmChannel.id}`);

        // Envoyer le message dans le DM
        const dmMessageOptions = {
          hostname: 'discord.com',
          path: `/api/v10/channels/${dmChannel.id}/messages`,
          method: 'POST',
          headers: {
            'Authorization': `Bot ${BOT_TOKEN}`,
            'Content-Type': 'application/json',
            'User-Agent': 'DiscordBot (https://github.com/discord/discord-api-docs, 1.0)'
          }
        };

        await makeDiscordRequest(dmMessageOptions, {
          embeds: [embed]
        });

        console.log('DM sent successfully');
        results.push({ type: 'dm', success: true, message: 'DM sent successfully' });

      } catch (error) {
        console.error('Error sending DM:', error.message);
        results.push({ 
          type: 'dm', 
          success: false, 
          error: error.message 
        });
        hasError = true;
      }
    }

    // Envoi dans le canal (si spécifié)
    if (channelId) {
      try {
        console.log(`Sending message to channel: ${channelId}`);

        const channelMessageOptions = {
          hostname: 'discord.com',
          path: `/api/v10/channels/${channelId}/messages`,
          method: 'POST',
          headers: {
            'Authorization': `Bot ${BOT_TOKEN}`,
            'Content-Type': 'application/json',
            'User-Agent': 'DiscordBot (https://github.com/discord/discord-api-docs, 1.0)'
          }
        };

        await makeDiscordRequest(channelMessageOptions, {
          embeds: [embed]
        });

        console.log('Channel message sent successfully');
        results.push({ type: 'channel', success: true, message: 'Channel message sent successfully' });

      } catch (error) {
        console.error('Error sending channel message:', error.message);
        results.push({ 
          type: 'channel', 
          success: false, 
          error: error.message 
        });
        hasError = true;
      }
    }

    // Vérifier qu'au moins un envoi a été tenté
    if (results.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'No userId or channelId provided'
        })
      };
    }

    const statusCode = hasError ? 207 : 200; // 207 = Multi-Status (succès partiel)
    
    return {
      statusCode,
      headers,
      body: JSON.stringify({
        success: !hasError,
        results: results,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('General error in discord-webhook:', error.message);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};