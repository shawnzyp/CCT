import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    // This function is triggered by entity automation on Campaign updates
    // Check if a quest was marked as completed
    if (event.type !== 'update' || !data.quests) {
      return Response.json({ success: false, message: 'Not a quest update' });
    }

    const campaign = data;
    
    // Find newly completed quests by comparing with old_data if available
    const completedQuests = campaign.quests?.filter(q => q.status === 'completed') || [];
    
    if (completedQuests.length === 0) {
      return Response.json({ success: false, message: 'No completed quests' });
    }

    // Get all pending rewards for this campaign with auto_quest_complete distribution
    const rewards = await base44.asServiceRole.entities.QuestReward.filter({
      campaign_id: campaign.id,
      distribution_type: 'auto_quest_complete',
      distributed: false
    });

    const distributedRewards = [];

    for (const reward of rewards) {
      // Check if this reward is tied to a completed quest
      if (reward.quest_id) {
        const questCompleted = completedQuests.some(q => q.id === reward.quest_id);
        if (!questCompleted) continue;
      }

      // Distribute the reward
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
      }

      // Mark reward as distributed
      await base44.asServiceRole.entities.QuestReward.update(reward.id, {
        distributed: true,
        distributed_at: new Date().toISOString(),
        distributed_by: 'auto_quest_complete'
      });

      distributedRewards.push(reward.reward_name);

      // Send Discord notification
      try {
        await base44.asServiceRole.functions.invoke('notifyDiscord', {
          eventType: 'reward_distributed',
          data: {
            reward_name: reward.reward_name,
            reward_type: reward.reward_type,
            trigger: 'quest_completion'
          }
        });
      } catch (e) {
        console.log('Discord notification failed:', e.message);
      }
    }

    return Response.json({ 
      success: true, 
      distributed_rewards: distributedRewards 
    });

  } catch (error) {
    console.error('Error auto-distributing rewards:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});