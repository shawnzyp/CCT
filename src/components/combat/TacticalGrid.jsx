import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Grid3x3, Move, Crosshair } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useSoundEffects from '@/components/sounds/useSoundEffects';

const GRID_SIZE = 10;
const CELL_SIZE = 40;

export default function TacticalGrid({ combatants = [], onPositionChange, highlightedPositions = [] }) {
  const [selectedCombatant, setSelectedCombatant] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);
  const { play } = useSoundEffects();
  
  const handleCellClick = (x, y) => {
    const combatantAtPos = getCombatantAtPosition(x, y);
    
    if (combatantAtPos) {
      setSelectedCombatant(combatantAtPos);
      play('click', 0.2);
    } else if (selectedCombatant && onPositionChange) {
      onPositionChange(selectedCombatant.id, { x, y });
      setSelectedCombatant(null);
      play('navigate', 0.3);
    }
  };
  
  const getCombatantAtPosition = (x, y) => {
    return combatants.find(c => c.position?.x === x && c.position?.y === y);
  };
  
  const isHighlighted = (x, y) => {
    return highlightedPositions.some(pos => pos.x === x && pos.y === y);
  };
  
  const getDistanceFromSelected = (x, y) => {
    if (!selectedCombatant?.position) return null;
    const dx = Math.abs(x - selectedCombatant.position.x);
    const dy = Math.abs(y - selectedCombatant.position.y);
    return Math.max(dx, dy);
  };
  
  return (
    <Card className="bg-slate-800/50 border-slate-700 corner-frame">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2 font-mono uppercase tracking-wider text-sm">
          <Grid3x3 className="h-4 w-4 text-violet-400" />
          Tactical Grid
          {selectedCombatant && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-violet-400 text-xs flex items-center gap-1"
            >
              <Move className="h-3 w-3" />
              Moving: {selectedCombatant.name}
            </motion.span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="inline-block bg-slate-950 p-2 rounded-lg border border-violet-500/20 relative overflow-hidden">
          {/* Grid scanline effect */}
          <motion.div
            animate={{ y: ['0%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-px bg-violet-500/20 pointer-events-none z-10"
          />
          
          <div 
            className="grid gap-px bg-slate-700/50"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
              gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`
            }}
          >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
              const x = i % GRID_SIZE;
              const y = Math.floor(i / GRID_SIZE);
              const combatant = getCombatantAtPosition(x, y);
              const highlighted = isHighlighted(x, y);
              const distance = getDistanceFromSelected(x, y);
              const isSelected = combatant?.id === selectedCombatant?.id;
              const isHovered = hoveredCell?.x === x && hoveredCell?.y === y;
              
              return (
                <motion.div
                  key={i}
                  onClick={() => handleCellClick(x, y)}
                  onMouseEnter={() => {
                    setHoveredCell({ x, y });
                    play('hover', 0.05);
                  }}
                  onMouseLeave={() => setHoveredCell(null)}
                  whileHover={{ scale: 1.05 }}
                  className={cn(
                    "bg-slate-900 hover:bg-slate-800 cursor-pointer transition-all flex items-center justify-center text-xs font-bold relative border border-slate-800",
                    combatant && "bg-slate-700",
                    highlighted && "bg-violet-500/20 border-violet-500/50",
                    isSelected && "ring-2 ring-violet-500",
                    isHovered && !combatant && selectedCombatant && "bg-violet-500/30",
                    distance !== null && distance <= 5 && !combatant && "bg-green-500/10"
                  )}
                >
                  {/* Grid coordinates */}
                  <div className="absolute top-0.5 left-0.5 text-[8px] text-slate-600 font-mono">
                    {x},{y}
                  </div>
                  
                  {combatant && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="relative"
                    >
                      <motion.div
                        animate={isSelected ? { 
                          boxShadow: [
                            '0 0 0 0 rgba(139, 92, 246, 0.4)',
                            '0 0 0 8px rgba(139, 92, 246, 0)',
                            '0 0 0 0 rgba(139, 92, 246, 0)'
                          ]
                        } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs border-2 font-bold relative",
                          combatant.isEnemy 
                            ? "bg-red-600 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" 
                            : "bg-blue-600 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                        )}
                        title={combatant.name}
                      >
                        {combatant.name.substring(0, 2).toUpperCase()}
                        
                        {/* HP indicator */}
                        {combatant.current_hp !== undefined && combatant.max_hp && (
                          <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-slate-900 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(combatant.current_hp / combatant.max_hp) * 100}%` }}
                              className={cn(
                                "h-full",
                                combatant.current_hp / combatant.max_hp > 0.5 ? "bg-green-500" :
                                combatant.current_hp / combatant.max_hp > 0.25 ? "bg-yellow-500" :
                                "bg-red-500"
                              )}
                            />
                          </div>
                        )}
                      </motion.div>
                      
                      {/* Active turn indicator */}
                      {combatant.isActiveTurn && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="absolute -top-1 -right-1"
                        >
                          <Crosshair className="h-3 w-3 text-violet-400" />
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                  
                  {/* Movement range indicator */}
                  {distance !== null && !combatant && distance <= 5 && (
                    <div className="absolute bottom-0.5 right-0.5 text-[8px] text-green-400 font-mono">
                      {distance}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
        
        <div className="mt-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4 text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.5)]" />
              <span>Heroes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-600 border-2 border-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
              <span>Enemies</span>
            </div>
          </div>
          {selectedCombatant && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setSelectedCombatant(null)}
              className="text-violet-400 hover:text-violet-300 font-mono"
            >
              Cancel Move
            </motion.button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}