import { toast } from "sonner";

export const validateAction = (character, actionType = 'action') => {
  // Check if character is alive
  if ((character.current_hp || 0) <= 0) {
    toast.error("Cannot Act", {
      description: "You are unconscious! Roll death saves or receive healing."
    });
    return false;
  }

  // Check status effects that prevent actions
  const conditions = character.active_conditions || [];
  
  if (conditions.some(c => c.name === 'Stunned')) {
    toast.error("Stunned!", {
      description: "You cannot take actions while stunned."
    });
    return false;
  }

  if (conditions.some(c => c.name === 'Paralyzed')) {
    toast.error("Paralyzed!", {
      description: "You are paralyzed and cannot act."
    });
    return false;
  }

  if (conditions.some(c => c.name === 'Unconscious')) {
    toast.error("Unconscious!", {
      description: "You are unconscious. Roll death saves!"
    });
    return false;
  }

  return true;
};

export const validatePowerUse = (character, power) => {
  // Basic action check
  if (!validateAction(character)) return false;

  // Check SP cost
  const currentSP = character.current_sp || 0;
  const cost = power.sp_cost || 0;

  if (currentSP < cost) {
    toast.error("Insufficient SP", {
      description: `Need ${cost} SP but only have ${currentSP}. Rest to recover SP.`
    });
    return false;
  }

  // Check cooldown
  if ((power.current_cooldown || 0) > 0) {
    toast.warning("Power on Cooldown", {
      description: `${power.name} will be ready in ${power.current_cooldown} turns.`
    });
    return false;
  }

  // Check concentration
  const conditions = character.active_conditions || [];
  const hasConcentration = conditions.some(c => c.name === 'Concentrating');
  
  if (power.requires_concentration && hasConcentration) {
    toast.warning("Already Concentrating", {
      description: "You must break concentration on your current power first."
    });
    return false;
  }

  // Check silence
  if (conditions.some(c => c.name === 'Silenced')) {
    toast.error("Silenced!", {
      description: "You cannot use powers while silenced."
    });
    return false;
  }

  return true;
};

export const validateMovement = (character, distance) => {
  if (!validateAction(character)) return false;

  const speed = character.speed || 30;
  const conditions = character.active_conditions || [];
  
  // Check restrained
  if (conditions.some(c => c.name === 'Restrained')) {
    toast.error("Restrained!", {
      description: "You cannot move while restrained."
    });
    return false;
  }

  // Check movement reduction conditions
  const isFrozen = conditions.some(c => c.name === 'Frozen');
  const isSlowed = conditions.some(c => c.name === 'Slow');
  
  const effectiveSpeed = isSlowed ? speed / 2 : speed;
  
  if (distance > effectiveSpeed) {
    toast.warning("Movement Limited", {
      description: `You can only move ${effectiveSpeed} ft this turn${isSlowed ? ' (slowed)' : ''}.`
    });
    return false;
  }

  return true;
};

export const validateSPCost = (character, cost) => {
  const currentSP = character.current_sp || 0;
  
  if (currentSP < cost) {
    toast.error("Not Enough SP", {
      description: `Need ${cost} SP but only have ${currentSP}.`
    });
    return false;
  }
  
  if (currentSP - cost < 0) {
    toast.error("Cannot Overspend", {
      description: "This would bring you below 0 SP."
    });
    return false;
  }

  return true;
};

export const getActionAvailability = (character, usedActions = []) => {
  const isDead = (character.current_hp || 0) <= 0;
  const conditions = character.active_conditions || [];
  const isIncapacitated = conditions.some(c => 
    ['Stunned', 'Paralyzed', 'Unconscious'].includes(c.name)
  );

  return {
    canAct: !isDead && !isIncapacitated,
    canMove: !isDead && !isIncapacitated && !conditions.some(c => c.name === 'Restrained'),
    canBonus: !isDead && !isIncapacitated && !usedActions.includes('bonus_action'),
    canReaction: !isDead && !isIncapacitated && !usedActions.includes('reaction'),
    hasAction: !usedActions.includes('action'),
    hasMovement: !usedActions.includes('movement'),
    isDead,
    isIncapacitated
  };
};