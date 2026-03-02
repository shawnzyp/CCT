import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const missionTemplates = {
  rescue: {
    title: 'Rescue {target}',
    description: 'Someone is in danger and needs your help.',
    objective: 'Locate and rescue {target} before time runs out.'
  },
  investigation: {
    title: 'Investigate {location}',
    description: 'Strange occurrences have been reported. Investigate and uncover the truth.',
    objective: 'Discover the source of the disturbances in {location}.'
  },
  sabotage: {
    title: 'Stop the {enemy} Plan',
    description: '{enemy} is planning something dangerous. You must stop them.',
    objective: 'Sabotage {enemy} operations before they can execute their plan.'
  },
  heist: {
    title: 'Retrieve the {item}',
    description: 'A valuable item has been stolen or hidden. Your team needs it back.',
    objective: 'Acquire the {item} without getting caught.'
  },
  defense: {
    title: 'Defend {location}',
    description: 'Your allies need protection against incoming threats.',
    objective: 'Protect {location} from waves of enemies.'
  },
  exploration: {
    title: 'Explore {location}',
    description: 'An uncharted area is waiting to be discovered.',
    objective: 'Map {location} and uncover its secrets.'
  }
};

const rewardScales = {
  easy: { xp: 250, credits: 300 },
  medium: { xp: 500, credits: 750 },
  hard: { xp: 1000, credits: 1500 },
  deadly: { xp: 2000, credits: 3000 }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { theme, difficulty, setting } = await req.json();

    // Use LLM to generate a unique mission
    const prompt = `Generate a unique superhero mission with the following parameters:
Theme: ${theme}
Difficulty: ${difficulty}
Setting: ${setting}

Return a JSON object with: title, description, objective, story_hook (2-3 sentences), location, time_limit (optional).
Make it narrative-driven and interesting for a superhero campaign.`;

    const aiMission = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          objective: { type: 'string' },
          story_hook: { type: 'string' },
          location: { type: 'string' },
          time_limit: { type: 'string' }
        }
      }
    });

    const rewards = rewardScales[difficulty] || rewardScales.medium;

    // Create mission in database
    const mission = await base44.asServiceRole.entities.Mission.create({
      title: aiMission.title,
      description: aiMission.description,
      objective: aiMission.objective,
      location: aiMission.location || setting,
      difficulty,
      status: 'available',
      reward_xp: rewards.xp,
      reward_credits: rewards.credits,
      max_players: Math.floor(Math.random() * 2) + 2,
      time_limit: aiMission.time_limit,
      generated_by_ai: true,
      ai_mission_data: aiMission
    });

    return Response.json({
      success: true,
      mission
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});