import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, X, AlertCircle, Zap, Flame, Droplet, Eye, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import useSoundEffects from '@/components/sounds/useSoundEffects';

const COMMON_CONDITIONS = [
  { name: 'Stunned', description: 'Cannot take actions', icon: Zap, color: 'yellow' },
  { name: 'Blinded', description: 'Disadvantage on attacks', icon: Eye, color: 'gray' },
  { name: 'Poisoned', description: 'Taking poison damage', icon: Droplet, color: 'green' },
  { name: 'Frightened', description: 'Disadvantage, cannot approach source', icon: AlertCircle, color: 'purple' },
  { name: 'Charmed', description: 'Cannot harm charmer', icon: Brain, color: 'pink' },
  { name: 'Paralyzed', description: 'Cannot move or act', icon: Zap, color: 'blue' },
  { name: 'Prone', description: 'Disadvantage on attacks', icon: AlertCircle, color: 'slate' },
  { name: 'Restrained', description: 'Speed 0, disadvantage on attacks', icon: AlertCircle, color: 'red' },
  { name: 'Invisible', description: 'Advantage on attacks', icon: Eye, color: 'cyan' },
  { name: 'Concentrating', description: 'Maintaining a power', icon: Brain, color: 'violet' },
  { name: 'Burning', description: 'Taking fire damage each turn', icon: Flame, color: 'orange' }
];

const getConditionColor = (name) => {
  const condition = COMMON_CONDITIONS.find(c => c.name.toLowerCase() === name.toLowerCase());
  const colorMap = {
    yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    gray: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
    green: 'bg-green-500/20 text-green-400 border-green-500/50',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
    pink: 'bg-pink-500/20 text-pink-400 border-pink-500/50',
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    slate: 'bg-slate-500/20 text-slate-400 border-slate-500/50',
    red: 'bg-red-500/20 text-red-400 border-red-500/50',
    cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50',
    violet: 'bg-violet-500/20 text-violet-400 border-violet-500/50',
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/50'
  };
  return condition ? colorMap[condition.color] : 'bg-amber-500/20 text-amber-300 border-amber-500/50';
};

const getConditionIcon = (name) => {
  const condition = COMMON_CONDITIONS.find(c => c.name.toLowerCase() === name.toLowerCase());
  return condition?.icon || AlertCircle;
};

export default function ConditionManager({ character, onUpdate }) {
  const [showPopover, setShowPopover] = useState(false);
  const [customName, setCustomName] = useState('');
  const [duration, setDuration] = useState(1);
  const { play } = useSoundEffects();
  
  const conditions = character.active_conditions || [];
  
  const addCondition = (name, desc = '') => {
    const newCondition = {
      name,
      duration,
      description: desc
    };
    onUpdate([...conditions, newCondition]);
    setShowPopover(false);
    setCustomName('');
    setDuration(1);
    play('error', 0.2); // Debuff sound
  };
  
  const removeCondition = (index) => {
    onUpdate(conditions.filter((_, i) => i !== index));
    play('success', 0.2); // Recovery sound
  };
  
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <AnimatePresence>
        {conditions.map((condition, index) => {
          const Icon = getConditionIcon(condition.name);
          const colorClass = getConditionColor(condition.name);
          
          return (
            <motion.div
              key={index}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              layout
            >
              <Badge 
                variant="outline" 
                className={cn(
                  "pl-2 pr-1 gap-1 font-mono text-xs relative overflow-hidden",
                  colorClass
                )}
                title={condition.description}
              >
                {/* Animated background */}
                <motion.div
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-current to-transparent opacity-10"
                />
                
                <Icon className="h-3 w-3 relative z-10" />
                <span className="relative z-10">{condition.name}</span>
                {condition.duration > 0 && (
                  <motion.span 
                    key={condition.duration}
                    initial={{ scale: 1.5 }}
                    animate={{ scale: 1 }}
                    className="relative z-10 font-bold"
                  >
                    ({condition.duration})
                  </motion.span>
                )}
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => removeCondition(index)}
                  className="ml-1 hover:text-white relative z-10"
                >
                  <X className="h-3 w-3" />
                </motion.button>
              </Badge>
            </motion.div>
          );
        })}
      </AnimatePresence>
      
      <Popover open={showPopover} onOpenChange={setShowPopover}>
        <PopoverTrigger asChild>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-6 border-slate-600 hover:border-violet-500/50 text-slate-400"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </motion.div>
        </PopoverTrigger>
        <PopoverContent className="bg-slate-900 border-slate-700 text-white w-80">
          <div className="space-y-3">
            <div className="text-sm font-medium font-mono uppercase tracking-wider">Add Condition</div>
            
            <div className="space-y-2">
              <div className="text-xs text-slate-500 uppercase tracking-wider font-mono">Common</div>
              <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto pr-1">
                {COMMON_CONDITIONS.map(cond => {
                  const Icon = cond.icon;
                  return (
                    <motion.div key={cond.name} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs w-full justify-start gap-1 border-slate-700 hover:bg-slate-800"
                        onClick={() => addCondition(cond.name, cond.description)}
                      >
                        <Icon className="h-3 w-3" />
                        {cond.name}
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-xs text-slate-500 uppercase tracking-wider font-mono">Custom</div>
              <Input
                placeholder="Condition name..."
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white h-8 text-sm font-mono"
              />
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={1}
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                  className="bg-slate-800 border-slate-700 text-white h-8 text-sm w-20 font-mono"
                  placeholder="Turns"
                />
                <Button
                  size="sm"
                  onClick={() => customName.trim() && addCondition(customName.trim())}
                  disabled={!customName.trim()}
                  className="flex-1 h-8 bg-violet-600 hover:bg-violet-700"
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}