import React from 'react';
import TutorialTooltip from './TutorialTooltip';

/**
 * Reusable tutorial hint wrappers for common UI elements
 */
export const CombatHint = ({ children, type = 'action' }) => {
  const hints = {
    action: 'Click to perform this combat action. You have limited actions per turn.',
    power: 'Use your powers by spending SP (Stamina Points). They regenerate each round.',
    defense: 'Use defensive actions to improve your TC or dodge incoming attacks.',
    move: 'Move around the tactical grid to position yourself strategically.',
    hp: 'Your Hit Points (HP). Reach 0 HP and you must make death saves.',
    sp: 'Stamina Points (SP). Powers cost SP to use. SP regenerates each combat round.'
  };

  return (
    <TutorialTooltip content={hints[type] || hints.action}>
      {children}
    </TutorialTooltip>
  );
};

export const PowerHint = ({ children, type = 'basic' }) => {
  const hints = {
    basic: 'Create and customize your superpowers here. Each power needs a name, SP cost, and effect.',
    effects: 'Add status effects (Burn, Stun, etc.) and damage types to make powers more powerful.',
    signature: 'Your signature move is your iconic power. It defines your combat style.',
    cooldown: 'Powers with cooldowns must wait this many turns before being used again.',
    concentration: 'Concentration powers require focus and break if you take damage.',
    ultimate: 'Ultimate powers cost 5 SP and have 10-turn cooldowns. Save for crucial moments!'
  };

  return (
    <TutorialTooltip content={hints[type] || hints.basic}>
      {children}
    </TutorialTooltip>
  );
};

export const InventoryHint = ({ children, type = 'item' }) => {
  const hints = {
    item: 'Inventory items are things your character carries. Equip weapons and armor for bonuses.',
    rarity: 'Item rarity affects power: Common < Uncommon < Rare < Epic < Legendary.',
    equip: 'Equipped items provide bonuses. You have limited equipment slots.',
    trade: 'Trade items with other characters or sell them for credits.'
  };

  return (
    <TutorialTooltip content={hints[type] || hints.item}>
      {children}
    </TutorialTooltip>
  );
};

export const CharacterHint = ({ children, type = 'stats' }) => {
  const hints = {
    stats: 'Your core ability scores. Higher scores give better modifiers for checks and attacks.',
    hp: 'Hit Points determine your health. Reach 0 and you start making death saves.',
    tc: 'Toughness Class. Enemies must roll equal or higher to hit you.',
    level: 'Your current level. Gain XP through missions to level up and tier up.',
    xp: 'Experience Points. Earn XP from missions and combat to level up.',
    skills: 'Skills are trained abilities. Proficiency gives +2, expertise gives +4 to checks.'
  };

  return (
    <TutorialTooltip content={hints[type] || hints.stats}>
      {children}
    </TutorialTooltip>
  );
};