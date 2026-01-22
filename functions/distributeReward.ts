import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: GM access required' }, { status: 403 });
    }

    const { reward_id } = await req.json();

    if (!reward_id) {
      return Response.json({ error: 'reward_id is required' }, { status: 400 });
    }

    // Get the reward
    const rewards = await base44.asServiceRole.entities.QuestReward.filter({ id: reward_id });
    if (rewards.length === 0) {
      return Response.json({ error: 'Reward not found' }, { status: 404 });
    }

    const reward = rewards[0];

    if (reward.distributed) {
      return Response.json({ error: 'Reward already distributed' }, { status: 400 });
    }

    // Distribute to each character
    const results = [];
    for (const charId of reward.recipient_character_ids) {
      const characters = await base44.asServiceRole.entities.Character.filter({ id: charId });
      if (characters.length === 0) continue;

      const character = characters[0];
      let updateData = {};

      switch (reward.reward_type) {
        case 'xp':
          updateData.current_xp = (character.current_xp || 0) + (reward.reward_data.amount || 0);
          break;

        case 'credits':
          updateData.credits = (character.credits || 0) + (reward.reward_data.amount || 0);
          break;

        case 'item':
        case 'custom_item':
          const inventory = character.inventory || [];
          inventory.push(reward.reward_data.item);
          updateData.inventory = inventory;
          break;

        case 'equipment':
          const equipment = character.equipment || [];
          equipment.push(reward.reward_data.equipment);
          updateData.equipment = equipment;
          break;
      }

      await base44.asServiceRole.entities.Character.update(charId, updateData);
      results.push({ character_id: charId, character_name: character.name, success: true });
    }

    // Mark reward as distributed
    await base44.asServiceRole.entities.QuestReward.update(reward_id, {
      distributed: true,
      distributed_at: new Date().toISOString(),
      distributed_by: user.email
    });

    // Send Discord notification if enabled
    try {
      await base44.asServiceRole.functions.invoke('notifyDiscord', {
        eventType: 'reward_distributed',
        data: {
          reward_name: reward.reward_name,
          reward_type: reward.reward_type,
          recipients: results.map(r => r.character_name).join(', ')
        }
      });
    } catch (e) {
      console.log('Discord notification failed:', e.message);
    }

    return Response.json({ 
      success: true, 
      distributed_to: results,
      reward: reward.reward_name
    });

  } catch (error) {
    console.error('Error distributing reward:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});