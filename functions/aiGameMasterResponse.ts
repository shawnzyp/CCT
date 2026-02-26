import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * AI Game Master Response Handler
 * Generates GM responses, encounters, narration, and NPC dialogue
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { session_id, player_message, recipient_id, channel, action_type } = payload;

    // Fetch session and campaign context
    const session = await base44.entities.AIGameSession.filter({ id: session_id });
    if (!session.length) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    const sessionData = session[0];
    const campaign = await base44.entities.Campaign.filter({ id: sessionData.campaign_id });
    const campaignData = campaign[0] || {};

    // Fetch character data for context
    const characters = await base44.entities.Character.filter({
      id: { $in: sessionData.character_ids || [] }
    });

    // Fetch existing NPCs for reference
    const npcs = await base44.entities.NPC.filter({ campaign_id: sessionData.campaign_id });

    // Build AI context
    const systemPrompt = buildSystemPrompt(sessionData, campaignData, characters, npcs);
    const userPrompt = buildUserPrompt(player_message, action_type, recipient_id, channel);

    // Call LLM for response
    const llmResponse = await base44.integrations.Core.InvokeLLM({
      prompt: userPrompt,
      add_context_from_internet: false,
      response_json_schema: {
        type: "object",
        properties: {
          message: { type: "string" },
          action: { type: "string" },
          narrative: { type: "string" },
          combat_action: { type: "object" },
          npc_response: { type: "object" }
        }
      }
    });

    // Save the AI response as a message
    const aiMessage = await base44.entities.AIGameMessage.create({
      session_id,
      campaign_id: sessionData.campaign_id,
      sender_id: 'AI_GM',
      sender_name: 'Game Master',
      sender_type: 'ai_gm',
      message_type: action_type || 'narration',
      content: llmResponse.message || llmResponse.narrative || '',
      channel,
      recipient_id: channel === 'private' ? recipient_id : null,
      context_data: llmResponse,
      ai_context_used: true
    });

    return Response.json({
      success: true,
      message_id: aiMessage.id,
      gm_response: llmResponse
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function buildSystemPrompt(session, campaign, characters, npcs) {
  const characterSummary = characters
    .map(c => `${c.name} (Level ${c.level}, ${c.classification})`)
    .join(', ');

  const npcSummary = npcs
    .slice(0, 5)
    .map(n => `${n.name} (${n.role}): ${n.description}`)
    .join('\n');

  return `You are an AI Game Master running a TTRPG session for a superhero campaign called "${campaign.name}".

Campaign Setting: ${campaign.description || 'A world of superheroes and danger.'}

Active Characters: ${characterSummary}

Key NPCs:
${npcSummary}

Current Session: ${session.session_name}
Difficulty: ${session.difficulty}
Context: ${session.session_context || 'An exciting adventure awaits.'}

Your role:
1. Respond to player actions narratively and engagingly
2. Control NPCs and enemies with realistic personalities
3. Adjudicate combat fairly but dramatically
4. Present moral dilemmas and consequences
5. Adapt difficulty based on party power level
6. Drive the narrative forward with compelling hooks

Always respond in second person when addressing the party. Be descriptive, dramatic, and fair.`;
}

function buildUserPrompt(playerMessage, actionType, recipientId, channel) {
  const typeText = actionType === 'action' ? 'The player attempts: ' :
                   actionType === 'dialogue' ? 'The player says: ' :
                   actionType === 'combat' ? 'Combat action: ' : '';

  const channelText = channel === 'private' ? `[PRIVATE MESSAGE to you as GM]` : '[CAMPAIGN CHAT - All players see this]';

  return `${channelText}

${typeText}${playerMessage}

Respond with:
1. A narrative description of what happens (1-3 sentences)
2. Any mechanical results (skill checks, damage, etc.)
3. How the scene evolves
4. Any NPC reactions or dialogue

Keep responses dramatic but fair. If this is a private DM, address only the specific player.`;
}