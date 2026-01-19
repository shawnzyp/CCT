// Automatic bonus calculation system for Catalyst Core
import { CLASSIFICATIONS, POWER_STYLES, ORIGIN_STORIES, ALIGNMENTS } from '@/components/rules/RulesData';

export const calculateAllBonuses = (character) => {
  const bonuses = {
    tc: 0,
    initiative: 0,
    speed: 0,
    saves: { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 },
    skills: {},
    damage: 0,
    toHit: 0,
    special: []
  };

  if (!character) return bonuses;

  // Base DEX modifier to TC
  const dexMod = Math.floor(((character.ability_scores?.DEX || 10) - 10) / 2);
  bonuses.tc += 10 + dexMod;

  // Armor bonus
  if (character.armor_bonus) {
    bonuses.tc += character.armor_bonus;
  }

  // Equipment bonuses
  character.equipment?.forEach(item => {
    if (item.equipped && item.bonus) {
      const bonusMatch = item.bonus.match(/\+(\d+)\s*(TC|to hit|damage|Initiative|Speed)/i);
      if (bonusMatch) {
        const value = parseInt(bonusMatch[1]);
        const type = bonusMatch[2].toLowerCase();
        if (type === 'tc') bonuses.tc += value;
        if (type === 'to hit') bonuses.toHit += value;
        if (type === 'damage') bonuses.damage += value;
        if (type === 'initiative') bonuses.initiative += value;
        if (type === 'speed') bonuses.speed += value;
      }
    }
  });

  // Classification perks (stored for reference, many are situational)
  if (character.classification) {
    const classData = CLASSIFICATIONS[character.classification];
    if (classData) {
      bonuses.special.push({
        source: 'Classification',
        name: classData.label,
        perk: classData.perk
      });
    }
  }

  // Power Style bonuses
  if (character.primary_power_style) {
    const styleData = POWER_STYLES[character.primary_power_style];
    if (styleData) {
      bonuses.special.push({
        source: 'Power Style',
        name: styleData.label,
        perk: styleData.perk
      });
      
      // Speedster: +10 ft and +1 TC while moving
      if (character.primary_power_style === 'speedster') {
        bonuses.special.push({
          source: 'Speedster',
          condition: 'When moving 20+ ft',
          tcBonus: 1,
          speedBonus: 10
        });
      }
    }
  }

  // Origin Story bonuses
  if (character.origin_story) {
    const originData = ORIGIN_STORIES[character.origin_story];
    if (originData) {
      bonuses.special.push({
        source: 'Origin',
        name: originData.label,
        perk: originData.perk
      });

      // The Awakening: +5 to hit, +10 damage when below 1/2 HP
      if (character.origin_story === 'the_awakening') {
        const currentHP = character.current_hp || character.max_hp;
        if (currentHP < (character.max_hp / 2)) {
          bonuses.toHit += 5;
          bonuses.damage += 10;
          bonuses.special.push({
            source: 'The Awakening',
            active: true,
            toHit: 5,
            damage: 10
          });
        }
      }

      // The Exposure: +5 elemental damage per round
      if (character.origin_story === 'the_exposure') {
        bonuses.special.push({
          source: 'The Exposure',
          elementalDamage: 5,
          perRound: true
        });
      }
    }
  }

  // Alignment bonuses (mostly situational, stored for reference)
  if (character.alignment) {
    const alignData = ALIGNMENTS[character.alignment];
    if (alignData) {
      bonuses.special.push({
        source: 'Alignment',
        name: alignData.label,
        perk: alignData.perk
      });

      // Sentinel: +1 to saves when following orders
      if (character.alignment === 'sentinel') {
        bonuses.special.push({
          source: 'Sentinel',
          condition: 'When following orders',
          saveBonus: 1
        });
      }
    }
  }

  // Active conditions
  character.active_conditions?.forEach(condition => {
    if (condition.name === 'Dodge') {
      bonuses.tc += 2;
    }
    if (condition.name === 'Burning' || condition.name === 'Poisoned') {
      bonuses.special.push({
        source: 'Condition',
        name: condition.name,
        effect: condition.description
      });
    }
  });

  // Initiative modifier
  bonuses.initiative += dexMod;

  // Speed
  bonuses.speed += character.speed || 30;

  return bonuses;
};

export const getBonusDescription = (bonus) => {
  const parts = [];
  
  if (bonus.toHit) parts.push(`+${bonus.toHit} to hit`);
  if (bonus.damage) parts.push(`+${bonus.damage} damage`);
  if (bonus.tcBonus) parts.push(`+${bonus.tcBonus} TC`);
  if (bonus.speedBonus) parts.push(`+${bonus.speedBonus} ft speed`);
  if (bonus.saveBonus) parts.push(`+${bonus.saveBonus} to saves`);
  if (bonus.elementalDamage) parts.push(`+${bonus.elementalDamage} elemental damage`);
  
  if (parts.length > 0) {
    return `${parts.join(', ')}${bonus.condition ? ` (${bonus.condition})` : ''}`;
  }
  
  return bonus.perk || bonus.effect || '';
};

export const getActiveToHitBonus = (character) => {
  const bonuses = calculateAllBonuses(character);
  return bonuses.toHit;
};

export const getActiveDamageBonus = (character) => {
  const bonuses = calculateAllBonuses(character);
  return bonuses.damage;
};

export const getActiveTCBonus = (character) => {
  const bonuses = calculateAllBonuses(character);
  return bonuses.tc;
};