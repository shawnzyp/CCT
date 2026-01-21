import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

export default async function notifyDiscord(req) {
  const base44 = createClientFromRequest(req);
  const { eventType, data, webhookUrl, botUsername, embedColor, avatarUrl } = await req.json();
  
  // Get settings from database if not provided
  let finalWebhookUrl = webhookUrl;
  let finalBotUsername = botUsername || 'O.M.N.I. S.C. REPORT';
  let finalEmbedColor = embedColor || '#8B5CF6';
  let finalAvatarUrl = avatarUrl;
  
  if (!webhookUrl) {
    const settings = await base44.asServiceRole.entities.DiscordSettings.list();
    if (settings.length === 0) {
      // Fallback to environment variable
      finalWebhookUrl = Deno.env.get('DISCORD_WEBHOOK_URL');
      if (!finalWebhookUrl) {
        return Response.json({ success: false, error: 'No Discord settings configured' });
      }
    } else {
      const setting = settings[0];
      if (!setting.enabled) {
        return Response.json({ success: false, error: 'Discord integration is disabled' });
      }
      
      if (!setting.enabled_events?.includes(eventType)) {
        return Response.json({ success: false, error: 'Event type not enabled in settings' });
      }
      
      finalWebhookUrl = setting.webhook_url;
      finalBotUsername = setting.bot_username || finalBotUsername;
      finalEmbedColor = setting.embed_color || finalEmbedColor;
      finalAvatarUrl = setting.avatar_url;
    }
  }
  
  const hexToDecimal = (hex) => parseInt(hex.replace('#', ''), 16);
  
  let embed = {};
  
  switch (eventType) {
    case 'combat_start':
      embed = {
        title: "⚔️ Combat Initiated",
        description: `**${data.campaignName}**\n${data.encounterName || 'Combat encounter'} has begun!`,
        color: 0xFF4444,
        fields: [
          { name: "Heroes", value: data.heroes.join(', '), inline: true },
          { name: "Enemies", value: `${data.enemyCount} hostiles`, inline: true }
        ],
        timestamp: new Date().toISOString()
      };
      break;
      
    case 'combat_end':
      embed = {
        title: "✅ Combat Complete",
        description: `**${data.campaignName}**\nVictory achieved!`,
        color: 0x00FF00,
        fields: [
          { name: "Duration", value: `${data.rounds} rounds`, inline: true },
          { name: "Survivors", value: data.survivors.join(', '), inline: false }
        ],
        timestamp: new Date().toISOString()
      };
      break;
      
    case 'character_death':
      embed = {
        title: "💀 Hero Down",
        description: `**${data.characterName}** has fallen in combat!`,
        color: 0x000000,
        fields: [
          { name: "Campaign", value: data.campaignName, inline: true },
          { name: "Cause", value: data.cause || 'Unknown', inline: true }
        ],
        timestamp: new Date().toISOString()
      };
      break;
      
    case 'level_up':
      embed = {
        title: "⬆️ Level Up!",
        description: `**${data.characterName}** has reached level ${data.newLevel}!`,
        color: 0xFFD700,
        fields: [
          { name: "Campaign", value: data.campaignName, inline: true },
          { name: "New Level", value: `${data.newLevel}`, inline: true }
        ],
        timestamp: new Date().toISOString()
      };
      break;
      
    case 'quest_complete':
      embed = {
        title: "📜 Quest Completed",
        description: `**${data.questTitle}**`,
        color: 0x00AAFF,
        fields: [
          { name: "Campaign", value: data.campaignName, inline: true },
          { name: "Completed By", value: data.completedBy || 'Party', inline: true }
        ],
        timestamp: new Date().toISOString()
      };
      break;
      
    case 'critical_roll':
      embed = {
        title: data.isCrit ? "🎯 CRITICAL HIT!" : "💥 CRITICAL FAIL!",
        description: `**${data.characterName}** rolled a natural ${data.roll}!`,
        color: data.isCrit ? 0xFFAA00 : 0xFF0000,
        fields: [
          { name: "Roll Type", value: data.rollType || 'Attack', inline: true },
          { name: "Campaign", value: data.campaignName, inline: true }
        ],
        timestamp: new Date().toISOString()
      };
      break;
      
    case 'adventure_complete':
      embed = {
        title: "📖 Adventure Completed",
        description: `**${data.adventureTitle}**\n${data.characterName} has completed the adventure!`,
        color: 0x8B5CF6,
        fields: [
          { name: "Rewards", value: `+${data.rewards.xp} XP, +${data.rewards.gold} Gold`, inline: false }
        ],
        timestamp: new Date().toISOString()
      };
      break;
      
    case 'deck_draw':
      embed = {
        title: "🃏 Deck of Fates",
        description: `**${data.characterName}** drew: **${data.cardName}**`,
        color: 0xA855F7,
        fields: [
          { name: "Effect", value: data.effect, inline: false },
          { name: "Campaign", value: data.campaignName, inline: true }
        ],
        timestamp: new Date().toISOString()
      };
      break;
      
    case 'achievement_unlocked':
      embed = {
        title: "🏆 Achievement Unlocked",
        description: `**${data.characterName}** earned: **${data.achievementName}**`,
        color: 0xFBBF24,
        fields: [
          { name: "Description", value: data.description || 'New achievement!', inline: false },
          { name: "Campaign", value: data.campaignName, inline: true }
        ],
        timestamp: new Date().toISOString()
      };
      break;
      
    case 'item_acquired':
      embed = {
        title: "📦 Legendary Item Acquired",
        description: `**${data.characterName}** obtained: **${data.itemName}**`,
        color: 0xF97316,
        fields: [
          { name: "Rarity", value: data.rarity || 'Legendary', inline: true },
          { name: "Campaign", value: data.campaignName, inline: true }
        ],
        timestamp: new Date().toISOString()
      };
      break;
      
    case 'party_wipe':
      embed = {
        title: "💀 PARTY WIPE",
        description: `All heroes have fallen in **${data.campaignName}**`,
        color: 0xDC2626,
        fields: [
          { name: "Encounter", value: data.encounterName || 'Unknown threat', inline: false },
          { name: "Fallen Heroes", value: data.characters?.join(', ') || 'All', inline: false }
        ],
        timestamp: new Date().toISOString()
      };
      break;
      
    case 'test':
      embed = {
        title: "✅ Discord Webhook Test",
        description: data.message || 'Test message from Catalyst Core',
        color: hexToDecimal(finalEmbedColor),
        fields: [
          { name: "Status", value: "Connection successful!", inline: true },
          { name: "Time", value: new Date().toLocaleString(), inline: true }
        ],
        timestamp: new Date().toISOString()
      };
      break;
      
    default:
      embed = {
        title: "🎲 Game Event",
        description: data.message || 'An event occurred',
        color: hexToDecimal(finalEmbedColor),
        timestamp: new Date().toISOString()
      };
  }
  
  const payload = {
    username: finalBotUsername,
    embeds: [embed]
  };
  
  if (finalAvatarUrl) {
    payload.avatar_url = finalAvatarUrl;
  }
  
  try {
    const response = await fetch(finalWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Discord webhook failed: ${response.status} - ${errorText}`);
    }
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Discord notification error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

Deno.serve(notifyDiscord);