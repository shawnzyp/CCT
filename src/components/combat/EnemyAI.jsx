import { getModifier } from "@/components/character/StatBlock";

export class EnemyAI {
  constructor(enemy, targets, grid) {
    this.enemy = enemy;
    this.targets = targets;
    this.grid = grid;
  }
  
  // Calculate distance between two positions
  distance(pos1, pos2) {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
  }
  
  // Find nearest target
  findNearestTarget() {
    if (!this.targets.length) return null;
    
    let nearest = this.targets[0];
    let minDist = this.distance(this.enemy.position, nearest.position);
    
    this.targets.forEach(target => {
      const dist = this.distance(this.enemy.position, target.position);
      if (dist < minDist) {
        minDist = dist;
        nearest = target;
      }
    });
    
    return nearest;
  }
  
  // Find weakest target (lowest HP%)
  findWeakestTarget() {
    if (!this.targets.length) return null;
    
    return this.targets.reduce((weakest, target) => {
      const weakestHP = (weakest.current_hp || weakest.max_hp) / weakest.max_hp;
      const targetHP = (target.current_hp || target.max_hp) / target.max_hp;
      return targetHP < weakestHP ? target : weakest;
    });
  }
  
  // Decide action based on enemy state
  decideAction() {
    const hpPercent = (this.enemy.hp / this.enemy.max_hp) * 100;
    const hasAbilities = this.enemy.abilities && this.enemy.abilities.length > 0;
    
    // Low HP: try to retreat or use defensive ability
    if (hpPercent < 25) {
      return { type: 'defend', priority: 'high' };
    }
    
    // Medium HP: aggressive but strategic
    if (hpPercent < 60 && hasAbilities) {
      return { type: 'ability', priority: 'medium' };
    }
    
    // High HP: focus on damage
    return { type: 'attack', priority: 'high' };
  }
  
  // Choose target based on AI behavior
  chooseTarget() {
    const action = this.decideAction();
    
    // Different targeting strategies
    if (action.type === 'attack') {
      // Attack weakest to finish them off
      return this.findWeakestTarget();
    }
    
    // Default: nearest target
    return this.findNearestTarget();
  }
  
  // Calculate optimal movement
  calculateMovement(target, range = 5) {
    if (!target) return this.enemy.position;
    
    const currentDist = this.distance(this.enemy.position, target.position);
    
    // Already in range
    if (currentDist <= range) {
      return this.enemy.position;
    }
    
    // Move closer
    const dx = target.position.x - this.enemy.position.x;
    const dy = target.position.y - this.enemy.position.y;
    
    const moveX = dx !== 0 ? Math.sign(dx) : 0;
    const moveY = dy !== 0 ? Math.sign(dy) : 0;
    
    return {
      x: this.enemy.position.x + moveX,
      y: this.enemy.position.y + moveY
    };
  }
  
  // Select best ability to use
  selectAbility() {
    if (!this.enemy.abilities || this.enemy.abilities.length === 0) {
      return null;
    }
    
    // Simple: random ability
    return this.enemy.abilities[Math.floor(Math.random() * this.enemy.abilities.length)];
  }
  
  // Calculate attack roll
  rollAttack() {
    const modifier = this.enemy.attack_bonus || 2;
    const roll = Math.floor(Math.random() * 20) + 1;
    return { roll, total: roll + modifier, modifier };
  }
  
  // Calculate damage
  rollDamage(attack) {
    // Parse dice notation like "2d6"
    const match = attack?.match(/(\d+)d(\d+)/);
    if (!match) return Math.floor(Math.random() * 6) + 3;
    
    const [, numDice, diceSize] = match;
    let total = 0;
    for (let i = 0; i < parseInt(numDice); i++) {
      total += Math.floor(Math.random() * parseInt(diceSize)) + 1;
    }
    return total;
  }
  
  // Execute full turn
  executeTurn() {
    const action = this.decideAction();
    const target = this.chooseTarget();
    
    if (!target) {
      return { action: 'wait', description: `${this.enemy.name} looks around cautiously` };
    }
    
    // Move towards target
    const newPosition = this.calculateMovement(target, 1);
    const moved = newPosition.x !== this.enemy.position.x || newPosition.y !== this.enemy.position.y;
    
    // Check if in melee range (distance 1)
    const distance = this.distance(newPosition, target.position);
    
    if (distance <= 1) {
      // Attack!
      const attackRoll = this.rollAttack();
      const ability = this.selectAbility();
      const damage = this.rollDamage(ability);
      
      return {
        action: 'attack',
        target,
        position: newPosition,
        attackRoll,
        damage,
        ability,
        description: `${this.enemy.name} ${ability ? `uses ${ability}` : 'attacks'} ${target.name} (${attackRoll.total} vs TC)`
      };
    } else if (moved) {
      return {
        action: 'move',
        position: newPosition,
        description: `${this.enemy.name} moves toward ${target.name}`
      };
    }
    
    return {
      action: 'wait',
      description: `${this.enemy.name} prepares...`
    };
  }
}

export function executeEnemyAI(enemy, targets, onAction) {
  const ai = new EnemyAI(enemy, targets, null);
  const result = ai.executeTurn();
  
  if (onAction) {
    onAction(result);
  }
  
  return result;
}