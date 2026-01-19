// Comprehensive rules data for Catalyst Core TTRPG

export const CLASSIFICATIONS = {
  mutant: {
    label: 'Mutant',
    description: 'Born with or developed powers through genetic mutation',
    perk: 'Reroll one failed saving throw per long rest',
    resistant: 'Radiation, Psychic',
    vulnerable: 'Necrotic, Force'
  },
  enhanced_human: {
    label: 'Enhanced Human',
    description: 'Augmented through science, training, or technology',
    perk: 'Advantage on all Technology-related checks',
    resistant: 'Piercing, Fire',
    vulnerable: 'Psychic, Radiation'
  },
  magic_user: {
    label: 'Magic User',
    description: 'Wielder of mystical forces and arcane power',
    perk: 'Cast one minor magical effect (prestidigitation) per long rest',
    resistant: 'Force, Necrotic',
    vulnerable: 'Confusion, Radiation'
  },
  alien: {
    label: 'Alien/Extraterrestrial',
    description: 'Being from another world or dimension',
    perk: 'Immune to environmental hazards and no penalty to movement in rough terrain',
    resistant: 'Cold, Acid, Lightning',
    vulnerable: 'Radiant, Emotion'
  },
  mystical_being: {
    label: 'Mystical Being',
    description: 'Entity of pure magical or divine essence',
    perk: '+2 to Persuasion or Intimidation checks',
    resistant: 'Radiant, Psychic',
    vulnerable: 'Corruption, Radiation'
  }
};

export const POWER_STYLES = {
  physical_powerhouse: {
    label: 'Physical Powerhouse',
    description: 'Overwhelming strength and durability',
    perk: 'Cut one attack by half once per combat encounter'
  },
  energy_manipulator: {
    label: 'Energy Manipulator',
    description: 'Control and project various forms of energy',
    perk: 'Reroll 1s once per turn'
  },
  speedster: {
    label: 'Speedster',
    description: 'Superhuman speed and reflexes',
    perk: '+10 ft movement and +1 AC while moving 20+ ft'
  },
  telekinetic_psychic: {
    label: 'Telekinetic/Psychic',
    description: 'Mental powers and mind manipulation',
    perk: 'For one turn, force enemies to reroll all rolls above 17 once per rest'
  },
  illusionist: {
    label: 'Illusionist',
    description: 'Master of deception and false images',
    perk: 'Create a 1-minute decoy illusion once per combat encounter'
  },
  shape_shifter: {
    label: 'Shape-shifter',
    description: 'Transform appearance and form',
    perk: 'Advantage on Deception, disguise freely'
  },
  elemental_controller: {
    label: 'Elemental Controller',
    description: 'Command the forces of nature',
    perk: '+2 to hit and +5 to damage once per turn when using elemental powers'
  }
};

export const ORIGIN_STORIES = {
  the_accident: {
    label: 'The Accident',
    description: 'A freak accident granted you powers',
    perk: 'Resistance to one damage type'
  },
  the_experiment: {
    label: 'The Experiment',
    description: 'You were subjected to scientific testing',
    perk: 'Reroll a failed CON or INT save once per long rest'
  },
  the_legacy: {
    label: 'The Legacy',
    description: 'Powers passed down through bloodline',
    perk: 'Use the powers of one other character you\'ve met or are related to once per long rest'
  },
  the_awakening: {
    label: 'The Awakening',
    description: 'Your dormant powers suddenly manifested',
    perk: '+5 to hit and +10 to damage when below 1/2 HP'
  },
  the_pact: {
    label: 'The Pact',
    description: 'You made a deal for power',
    perk: 'Auto-success on one save or +10 to any roll once per long rest'
  },
  the_lost_time: {
    label: 'The Lost Time',
    description: 'You have gaps in memory when powers emerged',
    perk: 'Once per combat when using a power, roll d20 (DC 17). On success: Skill Move - costs no SP and gains +1d6 bonus'
  },
  the_exposure: {
    label: 'The Exposure',
    description: 'Contact with strange energy changed you',
    perk: '+5 elemental damage once per round'
  },
  the_rebirth: {
    label: 'The Rebirth',
    description: 'You died and came back different',
    perk: 'If knocked out, stand up with 1 HP and gain resistance to all damage for 1 round'
  },
  the_vigil: {
    label: 'The Vigil',
    description: 'You took an oath to protect',
    perk: 'Once per combat, create a shield reducing incoming damage for all allies to zero for one turn'
  },
  the_redemption: {
    label: 'The Redemption',
    description: 'Seeking to atone for past sins',
    perk: 'Once per day, take damage for ally in movement range; they heal 1d6 HP and gain advantage. After combat, you gain advantage on all saves until dawn'
  }
};

export const ALIGNMENTS = {
  // Light alignments
  paragon: {
    label: 'Paragon',
    moral: 'light',
    discipline: 'lawful',
    description: 'A beacon of order and morality, upholds law and virtue at all costs',
    perk: 'Once per session, auto-succeed a Charisma check with civilians or allies'
  },
  guardian: {
    label: 'Guardian',
    moral: 'light',
    discipline: 'neutral',
    description: 'Fights for good, but flexible on rules and tactics',
    perk: 'Once per session, restore 1d6 HP or 1 SP to an ally as a bonus action'
  },
  vigilante: {
    label: 'Vigilante',
    moral: 'light',
    discipline: 'chaotic',
    description: 'Pursues justice on their own terms, breaks rules to save lives',
    perk: 'Ignore opportunity attacks when moving toward a threat or hostage'
  },
  // Neutral alignments
  sentinel: {
    label: 'Sentinel',
    moral: 'neutral',
    discipline: 'lawful',
    description: 'Loyal to institutions, systems, or a code, even without emotional drive',
    perk: '+1 to all saving throws when acting on orders or directives'
  },
  outsider: {
    label: 'Outsider',
    moral: 'neutral',
    discipline: 'neutral',
    description: 'Keeps balance, avoids attachments to either law or chaos',
    perk: 'Once per session, reroll any roll OR remove one condition from yourself'
  },
  wildcard: {
    label: 'Wildcard',
    moral: 'neutral',
    discipline: 'chaotic',
    description: 'Acts on instinct, freedom, or self-interest - unpredictable but not evil',
    perk: 'Advantage on Initiative and Deception once per combat'
  },
  // Shadow alignments
  inquisitor: {
    label: 'Inquisitor',
    moral: 'shadow',
    discipline: 'lawful',
    description: 'Uses control, fear, and authority to impose brutal justice',
    perk: 'Once per session, deal maximum damage to enemies labeled "criminal" by GM'
  },
  anti_hero: {
    label: 'Anti-Hero',
    moral: 'shadow',
    discipline: 'neutral',
    description: 'Walks the line between savior and destroyer, does what must be done',
    perk: 'Heal 1d6 HP when defeating an enemy while no allies are within 10 ft'
  },
  renegade: {
    label: 'Renegade',
    moral: 'shadow',
    discipline: 'chaotic',
    description: 'Operates from impulse, vengeance, or desire - morally gray or villainous',
    perk: 'Once per combat, add +1d6 damage when attacking from stealth or surprise'
  }
};

export const SP_COSTS = {
  0: {
    label: 'Free/Incidental',
    scope: 'Cantrip-tier flair',
    buys: 'Flavor or tiny utility, no damage',
    examples: ['Spark a light', 'Minor hologram', 'Ping a sensor']
  },
  1: {
    label: 'Basic Attack',
    type: 'Basic attack, minor effect',
    examples: 'Energy blast, melee strike, shove, trip'
  },
  2: {
    label: 'Signature Power',
    type: 'Core ability or status effect',
    examples: 'Firebolt + Burn, Ice Slash + Slow, Force Push'
  },
  3: {
    label: 'AoE or Status Power',
    type: 'Area of Effect (AoE), enhanced status, heal',
    examples: 'Cone of Lightning, Stun Wave, Group Buff'
  },
  4: {
    label: 'Strong Control',
    type: 'Strong AoE, hard crowd control',
    examples: 'Paralyze Zone, Mind Trap, Gravity Crush'
  },
  5: {
    label: 'Ultimate Power',
    type: 'Ultimate ability (10-round cooldown)',
    examples: 'Meteor Storm, Time Freeze, Rebirth, Mass Heal',
    cooldown: 10
  }
};

export const SPECIAL_SP_COSTS = {
  boost_roll: { cost: 1, effect: 'Add +1d4 to any roll' },
  concentrate: { cost: '+1 SP/round', effect: 'Maintain mental powers' }
};

export const XP_THRESHOLDS = {
  minor_henchmen: { xp: 50, description: 'Minor henchmen skirmish' },
  elite_foe: { xp: 250, description: 'Elite foe or lieutenant', range: '250-500' },
  boss_fight: { xp: 1000, description: 'Boss fight or setpiece encounter', range: '1,000-2,000' },
  apocalyptic: { xp: 5000, description: 'Apocalyptic threat or multiphase boss', range: '5,000+' }
};

export const DEEP_CHARACTER_QUESTIONS = [
  'Who are you behind the mask?',
  'What does justice mean to you?',
  'What is your biggest fear or unresolved trauma?',
  'What legacy do you want to leave behind?',
  'What moment first defined your sense of power - was it thrilling, terrifying, or tragic?',
  'What does your Origin Story mean to you now?',
  'What was your life like before you had powers or before you remembered having them?',
  'What is one way your powers scare even you?',
  'What is your signature move or ability, and how does it reflect who you are?',
  'What happens to your powers when you are emotionally compromised?',
  'What line will you never cross even if the world burns around you?',
  'Which Alignment do you identify with, and which do you fear becoming?',
  'Whose opinion matters more to you - civilians, teammates, or your faction superiors? Why?',
  'What drives you to fight - justice, guilt, revenge, legacy, redemption, or something else?',
  'What would make you walk away from this life for good?',
  'What is one major secret you are keeping from the rest of the team?',
  'What situation leaves you the most vulnerable - physically, emotionally, or strategically?',
  'Which teammate do you admire the most and what do they have that you lack?',
  'If you lost your powers tomorrow, who would you still be?'
];

export const ACTION_ECONOMY = {
  perTurn: [
    { name: '1 Action', description: 'Attack, power use, or major action' },
    { name: '1 Movement', description: 'Move up to your speed' },
    { name: '1 Reaction', description: 'Per round, not per turn - triggered by events' },
    { name: '1 Bonus Action', description: 'Ready attack/power for next turn (only 1 per turn)' }
  ],
  cinematicPoints: {
    perSession: 1,
    uses: [
      'Automatically succeed on a roll',
      'Interrupt initiative order',
      'Use a flashback to gain +5 to a roll',
      'Redirect damage or rescue an ally at the last second'
    ]
  }
};

export const HP_DEATH_SAVES = {
  atZeroHP: {
    saves: 3,
    dc: 13,
    twoSucceed: 'Remain conscious and stabilize at 1 HP, remaining prone and in critical condition. Must be healed before continuing to fight.',
    twoFail: 'Fall unconscious and must be healed before fight ends or remain in critical condition and possibly die.'
  }
};

export const DOWNTIME_ACTIVITIES = [
  { name: 'Media Control', modifier: 'CHA', benefit: 'Improve or damage public trust' },
  { name: 'Research', modifier: 'INT/WIS', benefit: 'Discover weaknesses in next threat' },
  { name: 'Train or Tinker', modifier: 'STR/INT', benefit: 'Next session +1 SP or minor upgrade' },
  { name: 'Gather Intel', modifier: 'CHA/WIS', benefit: 'Learn secrets or avoid traps' },
  { name: 'Personal Time', modifier: 'WIS/CHA', benefit: 'Refresh mind; reroll one save next session' }
];

export const GLOSSARY = {
  gameMechanics: [
    { term: 'SP (Stamina Points)', definition: 'A resource used to fuel powers and abilities. Regenerates fully at the start of each combat round. SP = 5 + your Constitution modifier.' },
    { term: 'SP Cost', definition: 'The number of SP required to use a power. Ranges from 1 (basic attack) to 5 (ultimate power).' },
    { term: 'Combat Encounter', definition: 'A structured battle or skirmish where turn order and power use is tracked.' },
    { term: 'Per Session', definition: 'An ability or perk that may be used once during a full play session (not per combat).' },
    { term: 'Per Combat Encounter', definition: 'An ability or effect that resets or can be used again with each new combat.' },
    { term: 'Per Long Rest', definition: 'Equivalent to "per session" unless your GM uses longer campaigns with actual rest mechanics.' },
    { term: 'Cooldown', definition: 'The number of rounds that must pass before a specific power can be used again (e.g., 10-turn cooldown).' }
  ],
  characterCreation: [
    { term: 'Classification', definition: 'A character\'s origin or power source (e.g., Mutant, Magic User). Equivalent to race/species.' },
    { term: 'Power Style', definition: 'Your character\'s "class" or core combat role (e.g., Energy Manipulator, Speedster).' },
    { term: 'Origin Story', definition: 'A narrative-based background that grants a unique perk and defines how you gained your powers.' },
    { term: 'Signature Move', definition: 'Your character\'s most iconic power or combat action. Often a 2–3 SP custom power.' },
    { term: 'Skill Move', definition: '(in context of Lost Time Origin) A thematic term indicating a power used freely (no SP cost) with bonus effect. Treated like a cinematic, adrenaline-fueled moment.' }
  ],
  powerMechanics: [
    { term: 'Effect Tags', definition: 'Descriptive mechanics attached to powers (e.g., Burn, Stun, Push). Usually require a saving throw.' },
    { term: 'Saving Throw (Save)', definition: 'A roll (1d20 + modifier) to resist a harmful power or effect. E.g., "WIS Save DC 14" = Roll d20 + WIS modifier and beat 14 to avoid the effect.' },
    { term: 'Condition', definition: 'A lasting negative effect (e.g., Blinded, Charmed, Stunned) that alters combat behavior or stats.' },
    { term: 'Boost Roll', definition: 'Spend 1 SP to add +1d4 to any roll.' },
    { term: 'Concentration', definition: 'Some powers require ongoing focus. These cost an extra +1 SP per round and usually require the character to avoid taking damage or distractions.' }
  ],
  combatTerms: [
    { term: 'Action Economy', definition: 'Each turn in combat allows 1 Action, 1 Movement, and 1 Reaction. Some abilities may be used as Bonus Actions.' },
    { term: 'Reaction', definition: 'An action taken outside your turn, usually in response to a trigger (e.g., being hit).' },
    { term: 'Initiative', definition: 'The order of turns in combat, determined by rolling 1d20 + DEX modifier.' },
    { term: 'Attack Roll', definition: '1d20 + relevant modifiers used to determine if a power or weapon hits.' },
    { term: 'Critical Hit', definition: 'Roll a natural 20 on an attack. Double the damage dice.' },
    { term: 'Area of Effect (AoE)', definition: 'A power that targets multiple enemies in a specific area (cone, line, radius).' }
  ],
  narrative: [
    { term: 'Alignment', definition: 'Your moral and ethical stance. In Catalyst Core, defined by a Moral Axis (Light, Neutral, Shadow) and a Discipline Axis (Lawful, Neutral, Chaotic).' },
    { term: 'Faction Reputation', definition: 'A measure of how much your character is trusted or feared by major organizations.' },
    { term: 'Downtime Activity', definition: 'Non-combat scenes between missions where players pursue personal or strategic goals.' },
    { term: 'Cinematic Action Point', definition: 'A once-per-session narrative mechanic that allows a player to auto-succeed, flashback, interrupt initiative, or rescue an ally at the last second.' },
    { term: 'Narrative Trigger', definition: 'An event that influences public opinion, civilian behavior, or faction outcomes (e.g., saving a civilian, causing collateral damage).' },
    { term: 'Public Trust', definition: 'The team\'s reputation with the general population. Impacts story options, media coverage, and faction support.' }
  ]
};