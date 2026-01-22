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
    
    const hexToDecimal = (hex) => parseInt(hex.replace('#', ''), 16);
    
    // Build embed based on event type
    let embed = {
      color: hexToDecimal(finalEmbedColor),
      footer: { text: "A.E.G.I.S. VERIFIED" },
      timestamp: new Date().toISOString()
    };
    
    if (eventType === 'test') {
      embed.title = customTitle || "✅ Discord Webhook Test";
      embed.description = customDescription || data.message || 'Test message from Catalyst Core';
      embed.fields = [
        { name: "Status", value: "Connection successful!", inline: true },
        { name: "Time", value: new Date().toLocaleString(), inline: true }
      ];
    } else {
      embed.title = customTitle || "🎲 Game Event";
      embed.description = customDescription || data.message || 'An event occurred';
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