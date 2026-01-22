import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

export default async function notifyDiscord(req) {
  const base44 = createClientFromRequest(req);
  const { 
    eventType, 
    data, 
    embedColor, 
    embedTitle, 
    embedDescription, 
    embedThumbnail, 
    embedImage 
  } = await req.json();
  
  // Always use environment variable for webhook URL
  let finalWebhookUrl = Deno.env.get('DISCORD_WEBHOOK_URL');
  let finalEmbedColor = embedColor || '#8B5CF6';
  let customTitle = embedTitle;
  let customDescription = embedDescription;
  let customThumbnail = embedThumbnail;
  let customImage = embedImage;
  
  // If not a test, check database settings
  if (eventType !== 'test') {
    const settings = await base44.asServiceRole.entities.DiscordSettings.list();
    if (settings.length > 0) {
      const setting = settings[0];
      if (!setting.enabled) {
        return Response.json({ success: false, error: 'Discord integration is disabled' });
      }
      
      if (!setting.enabled_events?.includes(eventType)) {
        return Response.json({ success: false, error: 'Event type not enabled in settings' });
      }
      
      finalEmbedColor = setting.embed_color || finalEmbedColor;
      customTitle = setting.embed_title || customTitle;
      customDescription = setting.embed_description || customDescription;
      customThumbnail = setting.embed_thumbnail || customThumbnail;
      customImage = setting.embed_image || customImage;
    }
  }
  
  if (!finalWebhookUrl) {
    return Response.json({ success: false, error: 'DISCORD_WEBHOOK_URL not configured in environment variables' });
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
      
    case 'reward_distributed':
      embed = {
        title: '🎁 Rewards Distributed!',
        description: data.trigger 
          ? `Rewards automatically distributed: **${data.trigger}**`
          : `The DM has distributed rewards to the party!`,
        color: 0x10B981,
        fields: [
          { name: 'Reward', value: data.reward_name, inline: true },
          { name: 'Type', value: data.reward_type, inline: true },
          ...(data.recipients ? [{ name: 'Recipients', value: data.recipients }] : [])
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
        title: customTitle || "✅ Discord Webhook Test",
        description: customDescription || data.message || 'Test message from Catalyst Core',
        color: hexToDecimal(finalEmbedColor),
        fields: [
          { name: "Status", value: "Connection successful!", inline: true },
          { name: "Time", value: new Date().toLocaleString(), inline: true }
        ],
        footer: {
          text: "A.E.G.I.S. VERIFIED"
        },
        timestamp: new Date().toISOString()
      };
      if (customThumbnail) embed.thumbnail = { url: customThumbnail };
      if (customImage) embed.image = { url: customImage };
      break;
      
    default:
      embed = {
        title: customTitle || "🎲 Game Event",
        description: customDescription || data.message || 'An event occurred',
        color: hexToDecimal(finalEmbedColor),
        footer: {
          text: "A.E.G.I.S. VERIFIED"
        },
        timestamp: new Date().toISOString()
      };
      if (customThumbnail) embed.thumbnail = { url: customThumbnail };
      if (customImage) embed.image = { url: customImage };
  }
  
  // Add footer to all embeds if not already set
  if (!embed.footer) {
    embed.footer = { text: "A.E.G.I.S. VERIFIED" };
  }
  
  // Apply custom overrides if set
  if (customTitle && eventType !== 'test') embed.title = customTitle;
  if (customDescription && eventType !== 'test') embed.description = customDescription;
  if (customThumbnail && eventType !== 'test') embed.thumbnail = { url: customThumbnail };
  if (customImage && eventType !== 'test') embed.image = { url: customImage };
  
  const payload = {
    embeds: [embed]
  };
  
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