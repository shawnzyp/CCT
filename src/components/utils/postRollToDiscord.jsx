import { base44 } from '@/api/base44Client';

/**
 * Posts a dice roll result to Discord via the notifyDiscord backend function.
 * @param {object} opts
 * @param {string} opts.characterName - Who rolled
 * @param {string} opts.diceLabel    - e.g. "2×d20", "d6"
 * @param {number[]} opts.rolls      - Individual roll values (kept only)
 * @param {number}  opts.modifier    - Numeric modifier
 * @param {number}  opts.total       - Final total
 * @param {string}  [opts.label]     - Optional context label (e.g. skill name)
 * @param {boolean} [opts.isCrit]
 * @param {boolean} [opts.isFail]
 * @param {boolean} [opts.advantage]
 * @param {boolean} [opts.disadvantage]
 */
export async function postRollToDiscord(opts) {
  const {
    characterName = 'Unknown',
    diceLabel,
    rolls,
    modifier = 0,
    total,
    label = '',
    isCrit = false,
    isFail = false,
    advantage = false,
    disadvantage = false,
  } = opts;

  const rollStr = rolls.join(', ');
  const modStr = modifier !== 0 ? ` ${modifier >= 0 ? '+' : ''}${modifier}` : '';
  const advStr = advantage ? ' *(Advantage)*' : disadvantage ? ' *(Disadvantage)*' : '';
  const contextStr = label ? ` — *${label}*` : '';

  let title = `🎲 ${characterName} rolled ${diceLabel}${contextStr}`;
  let color = 0x8b5cf6; // violet default

  if (isCrit) {
    title = `✨ CRITICAL HIT! ${characterName} rolled ${diceLabel}${contextStr}`;
    color = 0xf59e0b; // amber
  } else if (isFail) {
    title = `💀 CRITICAL FAIL! ${characterName} rolled ${diceLabel}${contextStr}`;
    color = 0xef4444; // red
  }

  const embed = {
    title,
    color,
    fields: [
      { name: 'Rolls', value: `[${rollStr}]${modStr}${advStr}`, inline: true },
      { name: 'Total', value: `**${total}**`, inline: true },
    ],
    timestamp: new Date().toISOString(),
    footer: { text: 'Catalyst Core • Dice Roller' },
  };

  try {
    await base44.functions.invoke('notifyDiscord', {
      event_type: 'dice_roll',
      embed,
    });
  } catch {
    // Non-critical — silently fail so it never breaks the UI
  }
}