export default async function notifyDiscord(params, context) {
  const { eventType, data } = params;
  
  const WEBHOOK_URL = "https://discord.com/api/webhooks/1452048819985580279/aZa0V23lM0XSbVad4iP5j9yU8RnOFjpvYkbhTo_UGXWD6NBrPNv8Rny7VndJLPhaonae";
  
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
      
    default:
      embed = {
        title: "🎲 Game Event",
        description: data.message || 'An event occurred',
        color: 0x8B5CF6,
        timestamp: new Date().toISOString()
      };
  }
  
  const payload = {
    username: "O.M.N.I. S.C. REPORT",
    embeds: [embed]
  };
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.status}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Discord notification error:', error);
    return { success: false, error: error.message };
  }
}