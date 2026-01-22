import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { 
      eventType, 
      data = {}, 
      embedColor, 
      embedTitle, 
      embedDescription, 
      embedThumbnail, 
      embedImage 
    } = await req.json();
    
    // Always use environment variable for webhook URL
    const webhookUrl = Deno.env.get('DISCORD_WEBHOOK_URL');
    
    if (!webhookUrl) {
      return Response.json({ 
        success: false, 
        error: 'DISCORD_WEBHOOK_URL not configured in environment variables' 
      }, { status: 400 });
    }
    
    const finalEmbedColor = embedColor || '#8B5CF6';
    const customTitle = embedTitle;
    const customDescription = embedDescription;
    const customThumbnail = embedThumbnail;
    const customImage = embedImage;
    
    const hexToDecimal = (hex) => parseInt(hex.replace('#', ''), 16);
    
    // Build embed based on event type
    let embed = {
      color: hexToDecimal(finalEmbedColor),
      footer: { text: "A.E.G.I.S. VERIFIED" },
      timestamp: new Date().toISOString()
    };
    
    const eventEmojis = {
      test: '✅',
      skill_check: '🎯',
      attack_roll: '⚔️',
      critical_roll: '✨',
      dice_roll: '🎲',
      combat_start: '⚔️',
      combat_end: '🎉',
      character_death: '💀',
      party_wipe: '☠️',
      enemy_defeated: '👊',
      healing_performed: '❤️',
      level_up: '⬆️',
      achievement_unlocked: '🏆',
      xp_gained: '⭐',
      power_unlocked: '⚡',
      quest_complete: '✓',
      adventure_complete: '🎊',
      quest_started: '📜',
      npc_interaction: '👥',
      item_acquired: '📦',
      credits_gained: '💰',
      trade_completed: '🔄',
      vendor_purchase: '🏪',
      deck_draw: '🃏',
      echo_event: '📡',
      shard_drawn: '✨',
      character_created: '✨',
      session_start: '🎬',
      session_end: '🛑',
      rest_taken: '😴'
    };
    
    const eventTitles = {
      test: 'Discord Webhook Test',
      skill_check: 'Skill Check',
      attack_roll: 'Attack Roll',
      critical_roll: 'Critical Roll',
      dice_roll: 'Dice Roll',
      combat_start: 'Combat Started',
      combat_end: 'Combat Ended',
      character_death: 'Character Death',
      party_wipe: 'Party Wipe',
      enemy_defeated: 'Enemy Defeated',
      healing_performed: 'Healing Performed',
      level_up: 'Level Up',
      achievement_unlocked: 'Achievement Unlocked',
      xp_gained: 'XP Gained',
      power_unlocked: 'Power Unlocked',
      quest_complete: 'Quest Completed',
      adventure_complete: 'Adventure Completed',
      quest_started: 'Quest Started',
      npc_interaction: 'NPC Interaction',
      item_acquired: 'Legendary Item Acquired',
      credits_gained: 'Credits Gained',
      trade_completed: 'Trade Completed',
      vendor_purchase: 'Vendor Purchase',
      deck_draw: 'Deck of Fates Draw',
      echo_event: 'Echo Event',
      shard_drawn: 'Shard of Many Fates',
      character_created: 'Character Created',
      session_start: 'Session Started',
      session_end: 'Session Ended',
      rest_taken: 'Rest Taken'
    };
    
    const emoji = eventEmojis[eventType] || '🎲';
    const titleBase = eventTitles[eventType] || 'Game Event';
    
    if (eventType === 'test') {
      embed.title = customTitle || `${emoji} ${titleBase}`;
      embed.description = customDescription || data.message || 'Test message from Catalyst Core';
      embed.fields = [
        { name: "Status", value: "Connection successful!", inline: true },
        { name: "Time", value: new Date().toLocaleString(), inline: true }
      ];
    } else {
      embed.title = customTitle || `${emoji} ${titleBase}`;
      embed.description = customDescription || data.message || 'An event occurred';
      
      // Add event-specific fields
      if (data.character) {
        embed.fields = embed.fields || [];
        embed.fields.push({ name: "Character", value: data.character, inline: true });
      }
      if (data.skill) {
        embed.fields = embed.fields || [];
        embed.fields.push({ name: "Skill", value: data.skill, inline: true });
      }
      if (data.d20 !== undefined) {
        embed.fields = embed.fields || [];
        embed.fields.push({ name: "d20 Roll", value: String(data.d20), inline: true });
      }
      if (data.total !== undefined) {
        embed.fields = embed.fields || [];
        embed.fields.push({ name: "Total", value: String(data.total), inline: true });
      }
      if (data.bonus !== undefined) {
        embed.fields = embed.fields || [];
        embed.fields.push({ name: "Bonus", value: String(data.bonus), inline: true });
      }
    }
    
    if (customThumbnail) embed.thumbnail = { url: customThumbnail };
    if (customImage) embed.image = { url: customImage };
    
    const payload = {
      embeds: [embed]
    };
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return Response.json({ 
        success: false, 
        error: `Discord webhook failed: ${response.status} - ${errorText}` 
      }, { status: 500 });
    }
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Discord notification error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});