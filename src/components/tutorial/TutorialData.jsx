export const TUTORIALS = {
  CHARACTER_CREATION: {
    id: 'character_creation',
    name: 'Character Creation',
    steps: [
      {
        title: 'Welcome to Catalyst Core!',
        description: 'Let\'s create your first superhero character. This guide will walk you through each step of the character creation process.',
        position: 'center',
        icon: 'sparkles',
        tips: ['Take your time and read each option', 'You can always edit your character later']
      },
      {
        title: 'Identity & Appearance',
        description: 'Start by choosing your vigilante name and appearance. Your vigilante name is what you\'ll be known as in the field. Customize your look to match your heroic persona.',
        target: '[data-tutorial="identity-step"]',
        position: 'right',
        action: 'Fill in your vigilante name and choose your appearance options'
      },
      {
        title: 'Classification',
        description: 'Your Classification determines how you got your powers. Each option grants a unique perk that will benefit your playstyle.',
        target: '[data-tutorial="classification-step"]',
        position: 'right',
        tips: ['Read each perk carefully', 'Consider how it fits your character concept']
      },
      {
        title: 'Power Styles',
        description: 'Choose up to 2 power styles that define your abilities. Your primary style grants an additional perk. Mix and match to create unique combinations!',
        target: '[data-tutorial="power-styles-step"]',
        position: 'right',
        tips: ['Physical Powerhouse is great for melee combat', 'Energy Manipulator excels at ranged attacks', 'Speedster gets bonus movement and TC']
      },
      {
        title: 'Origin Story',
        description: 'Your Origin Story defines your backstory and grants another perk. This is the event that changed your life forever.',
        target: '[data-tutorial="origin-step"]',
        position: 'right'
      },
      {
        title: 'Ability Scores',
        description: 'Distribute points across your six core stats. These determine your modifiers for attacks, saves, and skill checks. Hover over each stat to see what it affects.',
        target: '[data-tutorial="abilities-step"]',
        position: 'right',
        tips: ['STR: Melee attacks, Athletics', 'DEX: Ranged attacks, TC, Initiative', 'CON: HP, SP, Stamina', 'INT: Investigation, Technology', 'WIS: Perception, Insight, Saves', 'CHA: Persuasion, Deception']
      },
      {
        title: 'Heroic Tier',
        description: 'Your tier determines your power level. Rookies (Tier 5) are just starting out, while Legends (Tier 0) are world-class heroes.',
        target: '[data-tutorial="tier-step"]',
        position: 'right',
        tips: ['Starting tier affects HP and power scale', 'You\'ll progress through tiers as you level up']
      },
      {
        title: 'Alignment',
        description: 'Choose your moral compass. Alignment affects roleplaying and grants situational perks based on your character\'s philosophy.',
        target: '[data-tutorial="alignment-step"]',
        position: 'right'
      },
      {
        title: 'Review & Create',
        description: 'Review your choices and see your calculated stats. When you\'re ready, create your hero and start your journey!',
        target: '[data-tutorial="review-step"]',
        position: 'center',
        tips: ['Check your HP, TC, and modifiers', 'You can edit everything later except Classification and Origin']
      }
    ]
  },

  COMBAT_TRACKER: {
    id: 'combat_tracker',
    name: 'Combat Tracker Basics',
    steps: [
      {
        title: 'Combat Overview',
        description: 'The Combat Tracker manages turn-based superhero battles. It handles initiative, action economy, HP/SP tracking, and environmental effects.',
        position: 'center',
        icon: 'sparkles'
      },
      {
        title: 'Initiative Tracker',
        description: 'This shows turn order based on initiative rolls. The active combatant is highlighted. Click on characters to see their details.',
        target: '[data-tutorial="initiative-tracker"]',
        position: 'bottom',
        tips: ['Initiative = d20 + DEX modifier', 'Turn order is sorted highest to lowest']
      },
      {
        title: 'Action Economy',
        description: 'Each turn you have: 1 Action, 1 Movement, 1 Bonus Action, and 1 Reaction. Check off actions as you use them.',
        target: '[data-tutorial="action-economy"]',
        position: 'bottom',
        tips: ['Actions reset at the start of your next turn', 'Movement is your Speed in feet']
      },
      {
        title: 'Actions Tab',
        description: 'Your available combat actions appear here. Attack enemies, use powers, defend, or move on the tactical grid.',
        target: '[data-tutorial="actions-tab"]',
        position: 'bottom',
        action: 'Click to see your available actions'
      },
      {
        title: 'Powers in Combat',
        description: 'Use your powers by spending SP (Stamina Points). Each power has an SP cost and may have a cooldown. SP regenerates each round.',
        position: 'center',
        tips: ['Check SP cost before using powers', 'Ultimates (5 SP) have 10-turn cooldowns', 'Signature Moves define your combat style']
      },
      {
        title: 'Environmental Effects',
        description: 'GMs can add hazards like fire, toxic gas, or difficult terrain. These affect all combatants in the area.',
        target: '[data-tutorial="environment-tab"]',
        position: 'bottom',
        action: 'Check the Environment tab to add effects'
      },
      {
        title: 'Death Saves',
        description: 'If you drop to 0 HP, you become unconscious and must roll death saves. Roll d20: 10+ is a success, under 10 is a failure. 3 successes = stable, 3 failures = death.',
        position: 'center',
        tips: ['Natural 20: Regain 1 HP instantly!', 'Natural 1: Counts as 2 failures', 'Receiving healing wakes you up']
      }
    ]
  },

  POWER_CUSTOMIZATION: {
    id: 'power_customization',
    name: 'Power Customization',
    steps: [
      {
        title: 'Creating Powers',
        description: 'Design custom superpowers for your character. Each power can have unique effects, damage types, and strategic uses.',
        position: 'center',
        icon: 'sparkles'
      },
      {
        title: 'Basics Tab',
        description: 'Set your power\'s name, SP cost, range, and effect description. SP cost determines power level (1 = basic, 5 = ultimate).',
        target: '[data-tutorial="power-basics"]',
        position: 'right',
        tips: ['Clear names help in combat', 'Effect description tells the GM what happens']
      },
      {
        title: 'Effects & Tags',
        description: 'Add status effects like Burn, Stun, or Freeze. Choose damage types for elemental powers. Mix and match for unique combinations!',
        target: '[data-tutorial="power-effects"]',
        position: 'right',
        tips: ['Multiple effect tags increase versatility', 'Damage type affects weaknesses/resistances']
      },
      {
        title: 'Advanced Options',
        description: 'Set saving throws (enemies roll to avoid effects), cooldowns, and concentration requirements.',
        target: '[data-tutorial="power-advanced"]',
        position: 'right',
        tips: ['Concentration powers cost +1 SP/round to maintain', 'Higher DC = harder to resist']
      },
      {
        title: 'Signature Moves',
        description: 'Mark your iconic power as a Signature Move. This is your go-to ability that defines your combat style.',
        target: '[data-tutorial="power-signature"]',
        position: 'right',
        action: 'Check "Mark as Signature Move" for your main power'
      },
      {
        title: 'Thematic Links',
        description: 'Link powers to your Origin or Power Style for narrative consistency. Thematically-linked powers may receive GM bonuses!',
        target: '[data-tutorial="power-theming"]',
        position: 'right',
        tips: ['Origin-linked powers reflect your backstory', 'Style-linked powers fit your power set']
      }
    ]
  },

  INVENTORY_MANAGEMENT: {
    id: 'inventory_management',
    name: 'Inventory Management',
    steps: [
      {
        title: 'Managing Your Gear',
        description: 'Your character carries weapons, armor, and gadgets. Proper gear management improves your combat effectiveness.',
        position: 'center',
        icon: 'sparkles'
      },
      {
        title: 'Equipment Slots',
        description: 'You have limited equipment slots. Equip your best gear to get bonuses. Each equipped item provides stat boosts or special effects.',
        target: '[data-tutorial="equipment-slots"]',
        position: 'bottom',
        tips: ['Weapons increase attack damage', 'Armor increases TC (Toughness Class)', 'Gadgets provide unique abilities']
      },
      {
        title: 'Item Rarity',
        description: 'Items have rarity levels: Common < Uncommon < Rare < Epic < Legendary. Rarer items are more powerful.',
        target: '[data-tutorial="item-rarity"]',
        position: 'bottom',
        tips: ['Find rare items in missions', 'Higher rarity = better bonuses', 'Legendary items are game-changers']
      },
      {
        title: 'Inventory vs Equipment',
        description: 'Inventory holds everything you carry. Only equipped items give bonuses. Swap items in and out as needed.',
        target: '[data-tutorial="inventory-panel"]',
        position: 'bottom',
        action: 'Drag items from inventory to equipment slots to equip them'
      },
      {
        title: 'Consumables',
        description: 'Healing potions, stat boosters, and one-time use items. Use them from your inventory during missions or rest.',
        target: '[data-tutorial="consumables"]',
        position: 'bottom',
        tips: ['Healing items restore HP instantly', 'Stat boosters last for the current session', 'Some items have special effects']
      },
      {
        title: 'Trading',
        description: 'Trade items with other characters or sell unwanted gear for credits. Use credits to buy better equipment.',
        target: '[data-tutorial="trading-panel"]',
        position: 'bottom',
        action: 'Visit the Economy tab to trade with teammates'
      }
    ]
  },

  FIRST_SESSION: {
    id: 'first_session',
    name: 'Your First Session',
    steps: [
      {
        title: 'Ready to Play!',
        description: 'Your character is created! Here\'s what you need to know for your first session.',
        position: 'center',
        icon: 'sparkles'
      },
      {
        title: 'Character Sheet',
        description: 'Access your character sheet anytime to view stats, use powers, manage inventory, and track progression.',
        position: 'center',
        tips: ['Stats tab: View ability scores and skills', 'Powers tab: Create and manage your abilities', 'Equipment tab: Manage gear and items']
      },
      {
        title: 'HP and SP',
        description: 'HP (Hit Points) is your health. SP (Stamina Points) fuels your powers. SP regenerates each combat round, HP requires rest or healing.',
        position: 'center',
        tips: ['Don\'t be afraid to use SP - it comes back!', 'Save healing items for emergencies']
      },
      {
        title: 'Combat Flow',
        description: 'Combat is turn-based. On your turn: check action economy, choose targets, use powers or attack, then move if needed.',
        position: 'center',
        tips: ['Communicate with your team', 'Use cover and positioning', 'Save your Ultimate for crucial moments']
      },
      {
        title: 'AEGIS Assistant',
        description: 'Need tactical advice? The AEGIS AI assistant can suggest optimal actions based on the combat situation.',
        position: 'center',
        action: 'Look for the A.E.G.I.S. tab in combat'
      }
    ]
  }
};

export const TOOLTIP_CONTENT = {
  // Combat
  SP: 'Stamina Points (SP) fuel your powers. You have 5 + CON modifier SP, which fully regenerates at the start of each combat round.',
  TC: 'Toughness Class (TC) = 10 + DEX modifier + armor bonus. Enemies must roll equal or higher to hit you.',
  INITIATIVE: 'Initiative determines turn order in combat. Roll d20 + DEX modifier at the start of combat.',
  DEATH_SAVES: 'When you drop to 0 HP, roll d20 at the start of your turn. 10+ = success, <10 = failure. 3 successes = stable, 3 failures = death.',
  
  // Powers
  COOLDOWN: 'After using a power with a cooldown, you must wait this many turns before using it again.',
  CONCENTRATION: 'Concentration powers require focus. They cost +1 SP per round to maintain and break if you take damage or are distracted.',
  SIGNATURE_MOVE: 'Your signature move is your most iconic power, typically a 2-3 SP ability that defines your combat style.',
  ULTIMATE: 'Ultimates cost 5 SP and have a 10-turn cooldown. Save these for crucial moments!',
  
  // Character Creation
  CLASSIFICATION: 'Your classification determines how you got your powers and grants a unique perk.',
  POWER_STYLE: 'Power styles define your abilities. Choose up to 2, with your primary granting an extra perk.',
  ORIGIN: 'Your origin story grants a perk and defines the event that gave you powers.',
  ALIGNMENT: 'Alignment affects roleplaying and grants situational perks based on your philosophy.',
  TIER: 'Your heroic tier determines your power level. You progress from Rookie (5) to Legend (0).',
  
  // Stats
  STR: 'Strength affects melee attacks, Athletics checks, and carrying capacity.',
  DEX: 'Dexterity affects ranged attacks, TC, Initiative, Stealth, and Acrobatics.',
  CON: 'Constitution determines HP, SP, and resistance to fatigue/poison.',
  INT: 'Intelligence affects Investigation, Technology, and arcane knowledge.',
  WIS: 'Wisdom affects Perception, Insight, and mental saves.',
  CHA: 'Charisma affects Persuasion, Deception, and Intimidation.',
  
  // Skills
  PROFICIENCY: 'Proficient: Add +2 to checks. Expert: Add +4 to checks.',
  
  // Equipment
  EQUIPMENT_SLOTS: 'You can equip weapons, armor, and gadgets. Each equipped item may provide bonuses.',
  RARITY: 'Rarity affects item power: Common < Uncommon < Rare < Epic < Legendary'
};