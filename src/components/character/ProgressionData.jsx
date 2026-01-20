// Catalyst Core Progression Data from Player Guide Chapter 30

export const LEVEL_TABLE = [
  { level: 1, tier: 5, subTier: 'A', xpRequired: 0, tierBeat: 'Tier 5 – Rookie', gains: 'Character creation' },
  { level: 2, tier: 5, subTier: 'B', xpRequired: 300, tierBeat: '', gains: '+5 HP and Power Evolution' },
  { level: 3, tier: 5, subTier: 'C', xpRequired: 900, tierBeat: '', gains: 'Augment 1' },
  { level: 4, tier: 5, subTier: 'D', xpRequired: 2700, tierBeat: 'Tier 4 Begins (+1 Stat)', gains: 'Signature Move Evolution and +1 SP Max' },
  { level: 5, tier: 4, subTier: 'A', xpRequired: 6500, tierBeat: '', gains: '+5 HP and Power Evolution' },
  { level: 6, tier: 4, subTier: 'B', xpRequired: 14000, tierBeat: '', gains: 'Augment 2' },
  { level: 7, tier: 4, subTier: 'C', xpRequired: 23000, tierBeat: '', gains: '+1 SP Max and Power Evolution' },
  { level: 8, tier: 4, subTier: 'D', xpRequired: 34000, tierBeat: 'Tier 3 Begins (+1 Stat)', gains: 'Power or Signature Move Evolution' },
  { level: 9, tier: 3, subTier: 'A', xpRequired: 48000, tierBeat: '', gains: 'Augment 3' },
  { level: 10, tier: 3, subTier: 'B', xpRequired: 64000, tierBeat: '', gains: '+5 HP and Power Evolution' },
  { level: 11, tier: 3, subTier: 'C', xpRequired: 85000, tierBeat: '', gains: '+1 SP Max' },
  { level: 12, tier: 3, subTier: 'D', xpRequired: 100000, tierBeat: 'Tier 2 Begins (+1 Stat)', gains: 'Augment 4' },
  { level: 13, tier: 2, subTier: 'A', xpRequired: 120000, tierBeat: '', gains: '+5 HP and Power Evolution' },
  { level: 14, tier: 2, subTier: 'B', xpRequired: 140000, tierBeat: '', gains: '+1 SP Max' },
  { level: 15, tier: 2, subTier: 'C', xpRequired: 165000, tierBeat: '', gains: 'Augment 5' },
  { level: 16, tier: 2, subTier: 'D', xpRequired: 195000, tierBeat: 'Tier 1 Begins (+1 Stat)', gains: 'Legendary Gear Access' },
  { level: 17, tier: 1, subTier: 'A', xpRequired: 225000, tierBeat: '', gains: '+5 HP and Power Evolution' },
  { level: 18, tier: 1, subTier: 'B', xpRequired: 265000, tierBeat: '', gains: '+1 SP Max' },
  { level: 19, tier: 1, subTier: 'C', xpRequired: 305000, tierBeat: '', gains: 'Augment 6' },
  { level: 20, tier: 0, subTier: 'D (Ω)', xpRequired: 355000, tierBeat: 'Ascendant Tier (+1 Stat)', gains: 'Transcendent Trait' },
];

export const XP_AWARDS = {
  minor: 50,           // Minor henchmen skirmish
  elite: 350,          // Elite foe or lieutenant (250-500 average)
  boss: 1500,          // Boss fight or setpiece (1000-2000 average)
  apocalyptic: 5000,   // Apocalyptic threat
};

export const AUGMENTS = {
  control: [
    {
      name: 'Tactical Genius',
      description: 'You read probability like a language.',
      benefits: ['Once per combat, reorder initiative of all allies', 'All allies gain +1 to attack rolls until start of your next turn']
    },
    {
      name: 'Adaptive Armor Protocol',
      description: 'Nanoweave plating learns from every hit.',
      benefits: ['At start of combat, choose one damage type', 'Gain resistance to that type until combat ends']
    },
    {
      name: 'Resilient Soul',
      description: 'Even on your knees, you fight on.',
      benefits: ['When reduced to 0 HP, remain conscious until end of next turn', 'Can still act, but collapse if not healed']
    },
    {
      name: 'Overwatch Specialist',
      description: 'Nothing escapes your aim.',
      benefits: ['Reaction: when ally within 30 ft is attacked, make one ranged attack against attacker', 'Once per round']
    },
    {
      name: 'Protocol Override',
      description: 'You command the field itself.',
      benefits: ['Once per session: all allies gain advantage on Tech/Investigation checks for 1 minute', 'All enemies within 30 ft suffer disadvantage on Stealth']
    }
  ],
  protection: [
    {
      name: 'Inspire Resolve',
      description: 'Your courage radiates like a beacon.',
      benefits: ['Once per session, all allies within 30 ft gain +1d4 to all rolls for one round', '+1 to CHA saves permanently']
    },
    {
      name: "Protector's Vow",
      description: 'You always take the hit meant for another.',
      benefits: ['Reaction: when ally within 15 ft is hit, halve damage and take remainder', 'Once per round']
    },
    {
      name: 'Field Medic',
      description: 'A calm hand in the chaos.',
      benefits: ['Spend 1 SP as bonus action to heal adjacent ally for 1d6 HP', 'Once per ally per combat']
    },
    {
      name: 'Public Icon',
      description: 'Your name alone changes hearts.',
      benefits: ['+2 to Persuasion checks with civilians/sponsors', 'Once per session, reroll failed Persuasion']
    },
    {
      name: "Defender's Rally",
      description: 'When others fall, you rise higher.',
      benefits: ['First time ally drops to 0 HP each combat: regain 1d6 SP', 'All allies gain +2 TC until end of next round']
    }
  ],
  aggression: [
    {
      name: 'Adrenal Surge',
      description: 'You metabolize adrenaline into firepower.',
      benefits: ['When you drop enemy to 0 HP, regain 1d6 SP', 'Once per turn']
    },
    {
      name: "Assassin's Veil",
      description: 'Vanishing is second nature.',
      benefits: ['After disabling enemy, become invisible until start of next turn']
    },
    {
      name: 'Power Syphon',
      description: 'You feed on the backlash.',
      benefits: ['When hit by energy attack, regain 1 SP', 'If attack misses, attacker loses 1 SP']
    },
    {
      name: 'Suppressive Fire',
      description: 'Fear is a weapon.',
      benefits: ['Ranged powers impose disadvantage on enemy attack rolls until your next turn']
    },
    {
      name: 'Nullpulse Reflex',
      description: 'Pain makes you faster.',
      benefits: ['When you fail saving throw, immediately make melee attack or cast 1 SP power as reaction']
    }
  ],
  transcendence: [
    {
      name: 'Chrono Anchor',
      description: 'You exist slightly out of sync.',
      benefits: ['Once per session, rewind one round of your personal actions', 'Restore SP and HP to previous state']
    },
    {
      name: 'Reality Fracture',
      description: 'The world hesitates around you.',
      benefits: ['Once per day, impose disadvantage on any d20 roll after seeing result']
    },
    {
      name: 'Catalyst Conduit',
      description: 'Your body becomes the prism.',
      benefits: ['Once per session, when reduced below half SP, instantly restore all SP']
    },
    {
      name: 'Astral Step',
      description: 'You move between photons.',
      benefits: ['Teleport up to 10 ft as bonus action each round if you have line of sight']
    },
    {
      name: 'Mind Fortress',
      description: 'A perfect mind under cosmic symmetry.',
      benefits: ['Gain advantage on WIS and INT saves vs psychic or illusion effects']
    }
  ],
  customization: [
    {
      name: 'Battle Hardened',
      benefits: ['+1 to STR and CON saves', 'Once per day, reduce damage from one physical attack to 0']
    },
    {
      name: 'Evasive Footwork',
      benefits: ['+1 TC while moving 20+ ft during turn']
    },
    {
      name: 'Overcharge Matrix',
      benefits: ['Once per combat, double damage dice of one power (costs +1 SP)']
    },
    {
      name: 'Telepathic Coordination',
      benefits: ['Allies within 30 ft may reroll a single 1 on attack or save once per combat']
    },
    {
      name: 'Luck Vector',
      benefits: ['Once per session, reroll any die (must keep new result)']
    },
    {
      name: 'Quickdraw',
      benefits: ['Automatically act first in first combat round unless surprised']
    },
    {
      name: 'Empathic Resonator',
      benefits: ['When ally within 10 ft takes damage, may take half and gain +1 SP']
    },
    {
      name: 'Elemental Amplifier',
      benefits: ['Choose one damage type', 'Once per combat, power of that type deals +1 damage die']
    },
    {
      name: 'Legend in Motion',
      benefits: ['Once per session, perform cinematic stunt that automatically succeeds (within reason)']
    },
    {
      name: 'Versatile Mind',
      benefits: ['Gain proficiency in one new skill and one new language']
    }
  ]
};

export function getLevelInfo(level) {
  return LEVEL_TABLE.find(l => l.level === level) || LEVEL_TABLE[0];
}

export function getXPForNextLevel(currentLevel) {
  const nextLevelData = LEVEL_TABLE.find(l => l.level === currentLevel + 1);
  return nextLevelData?.xpRequired || 999999;
}

export function canLevelUp(character) {
  const currentLevel = character.level || 1;
  const currentXP = character.current_xp || 0;
  const nextLevelXP = getXPForNextLevel(currentLevel);
  return currentXP >= nextLevelXP && currentLevel < 20;
}

export function getAugmentLevels() {
  return [3, 6, 9, 12, 15, 19];
}

export function shouldGetAugment(newLevel) {
  return getAugmentLevels().includes(newLevel);
}

export function shouldGetStatIncrease(newLevel) {
  // Stat increases at tier transitions: levels 4, 8, 12, 16, 20
  return [4, 8, 12, 16, 20].includes(newLevel);
}

export function getGainsForLevel(newLevel) {
  const levelData = getLevelInfo(newLevel);
  const gains = [];
  
  if (levelData.gains.includes('+5 HP')) gains.push({ type: 'hp', value: 5 });
  if (levelData.gains.includes('+1 SP Max')) gains.push({ type: 'sp', value: 1 });
  if (levelData.gains.includes('Augment')) gains.push({ type: 'augment' });
  if (levelData.tierBeat.includes('+1 Stat')) gains.push({ type: 'stat' });
  if (levelData.gains.includes('Power Evolution')) gains.push({ type: 'power' });
  if (levelData.gains.includes('Legendary Gear')) gains.push({ type: 'legendary_gear' });
  if (levelData.gains.includes('Transcendent')) gains.push({ type: 'transcendent' });
  
  return gains;
}