// Comprehensive rules data for Catalyst Core TTRPG

export const CLASSIFICATIONS = {
  mutant: {
    label: 'Mutant',
    description: 'Born with or developed powers through genetic mutation',
    perk: 'Reroll one failed saving throw per long rest'
  },
  enhanced_human: {
    label: 'Enhanced Human',
    description: 'Augmented through science, training, or technology',
    perk: 'Advantage on all Technology-related checks'
  },
  magic_user: {
    label: 'Magic User',
    description: 'Wielder of mystical forces and arcane power',
    perk: 'Cast one minor magical effect (prestidigitation) per long rest'
  },
  alien: {
    label: 'Alien/Extraterrestrial',
    description: 'Being from another world or dimension',
    perk: 'Immune to environmental hazards and no penalty to movement in rough terrain'
  },
  mystical_being: {
    label: 'Mystical Being',
    description: 'Entity of pure magical or divine essence',
    perk: '+2 to Persuasion or Intimidation checks'
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
    perk: 'Auto-succeed 1 CHA check with civilians/allies per session'
  },
  guardian: {
    label: 'Guardian',
    moral: 'light',
    discipline: 'neutral',
    perk: 'Bonus action: restore 1d6 HP or 1 SP to an ally once per session'
  },
  vigilante: {
    label: 'Vigilante',
    moral: 'light',
    discipline: 'chaotic',
    perk: 'Ignore opportunity attacks when moving toward a threat'
  },
  // Neutral alignments
  sentinel: {
    label: 'Sentinel',
    moral: 'neutral',
    discipline: 'lawful',
    perk: '+1 to all saves while following orders/protocols'
  },
  outsider: {
    label: 'Outsider',
    moral: 'neutral',
    discipline: 'neutral',
    perk: 'Once per session, reroll any one roll or remove 1 condition from yourself'
  },
  wildcard: {
    label: 'Wildcard',
    moral: 'neutral',
    discipline: 'chaotic',
    perk: 'Advantage on Initiative and Deception once per combat'
  },
  // Shadow alignments
  inquisitor: {
    label: 'Inquisitor',
    moral: 'shadow',
    discipline: 'lawful',
    perk: 'Deal max damage to a criminal once per session'
  },
  anti_hero: {
    label: 'Anti-Hero',
    moral: 'shadow',
    discipline: 'neutral',
    perk: 'Heal 1d6 HP when you defeat an enemy with no allies adjacent'
  },
  renegade: {
    label: 'Renegade',
    moral: 'shadow',
    discipline: 'chaotic',
    perk: '+1d6 damage on an attack from stealth or surprise (once per combat)'
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
    label: 'Action (sometimes Bonus)',
    scope: 'Minor effect, single target',
    buys: 'Basic damage or small rider',
    saveDC: '12-13',
    examples: ['Energy bolt', 'Short dash + strike', 'Boost (+1d4 to any roll)']
  },
  2: {
    label: 'Action',
    scope: 'Signature move, single target plus rider',
    buys: 'Damage plus condition or mobility/buff',
    saveDC: '13-14',
    examples: ['Burning strike (Burn)', 'Pull/push 10-20 ft', 'Mark/taunt']
  },
  3: {
    label: 'Action',
    scope: 'Area or enhanced action',
    buys: 'Small/medium AoE or strong ally buff/shield',
    saveDC: '14-15',
    examples: ['15-ft cone blast', 'Party barrier', 'Group cleanse']
  },
  4: {
    label: 'Action (often Concentration)',
    scope: 'Strong control or field warp',
    buys: 'Lockdown, terrain change, hard control',
    saveDC: '15-16',
    examples: ['Stun wave', 'Gravity well', 'Wall/zone creation']
  },
  5: {
    label: 'Action + cooldown',
    scope: 'Ultimate (once per big scene)',
    buys: 'Fight-defining effect, huge AoE or multi-rider',
    saveDC: '16-17',
    limiter: '10-turn cooldown',
    examples: ['Meteor storm', 'Mass time-stop pulse', 'Team-wide overcharge']
  }
};

export const XP_THRESHOLDS = {
  minor_henchmen: { xp: 50, description: 'Minor henchmen skirmish' },
  elite_foe: { xp: 250, description: 'Elite foe or lieutenant', range: '250-500' },
  boss_fight: { xp: 1000, description: 'Boss fight or setpiece encounter', range: '1,000-2,000' },
  apocalyptic: { xp: 5000, description: 'Apocalyptic threat or multiphase boss', range: '5,000+' }
};

export const IDENTITY_QUESTIONS = [
  'Who are you behind the mask?',
  'What does justice mean to you?',
  'What is your biggest fear or unresolved trauma?',
  'What legacy do you want to leave behind?'
];

export const ACTION_ECONOMY = {
  perTurn: [
    { name: '1 Action', description: 'Attack, power use, or major action' },
    { name: '1 Movement', description: 'Move up to your speed' },
    { name: '1 Reaction', description: 'Per round, not per turn' },
    { name: '1 Bonus Action', description: 'Only if an ability explicitly grants one' }
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
    twoSucceed: 'Remain conscious and stabilize at 1 HP, prone and critical. Must be healed before continuing to fight.',
    twoFail: 'Fall unconscious and must be healed before fight ends or remain in critical condition and possibly die.'
  }
};