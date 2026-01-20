import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { TrendingUp, Plus, Zap, Heart, Shield, Star, BookOpen, Sparkles, Award } from "lucide-react";
import { getLevelInfo, getGainsForLevel, AUGMENTS } from './ProgressionData';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const STATS = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

export default function EnhancedLevelUpDialog({ character, onConfirm, onClose }) {
  const newLevel = (character.level || 1) + 1;
  const levelInfo = getLevelInfo(newLevel);
  const gains = getGainsForLevel(newLevel);
  
  const [selectedStat, setSelectedStat] = useState(null);
  const [selectedAugment, setSelectedAugment] = useState(null);
  const [augmentCategory, setAugmentCategory] = useState('control');
  
  const needsStat = gains.some(g => g.type === 'stat');
  const needsAugment = gains.some(g => g.type === 'augment');
  const hpGain = gains.find(g => g.type === 'hp')?.value || 0;
  const spGain = gains.find(g => g.type === 'sp')?.value || 0;
  
  React.useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8b5cf6', '#a78bfa', '#c4b5fd']
    });
  }, []);
  
  const handleConfirm = () => {
    if (needsStat && !selectedStat) return;
    if (needsAugment && !selectedAugment) return;
    
    const updates = {
      level: newLevel,
      tier: levelInfo.tier,
      current_xp: character.current_xp - levelInfo.xpRequired,
    };
    
    if (hpGain > 0) {
      updates.max_hp = (character.max_hp || 30) + hpGain;
      updates.current_hp = (character.current_hp || character.max_hp) + hpGain;
    }
    
    if (spGain > 0) {
      updates.max_sp = (character.max_sp || 5) + spGain;
      updates.current_sp = (character.current_sp || character.max_sp) + spGain;
    }
    
    if (selectedStat) {
      updates.ability_scores = {
        ...character.ability_scores,
        [selectedStat]: (character.ability_scores[selectedStat] || 10) + 1
      };
    }
    
    if (selectedAugment) {
      updates.augments = [...(character.augments || []), selectedAugment];
    }
    
    updates.milestones = [
      ...(character.milestones || []),
      {
        level: newLevel,
        tier: levelInfo.tier,
        description: `Reached Level ${newLevel} (${levelInfo.tierBeat || `Tier ${levelInfo.tier}`})`,
        timestamp: new Date().toISOString()
      }
    ];
    
    onConfirm(updates);
  };
  
  const canConfirm = (!needsStat || selectedStat) && (!needsAugment || selectedAugment);
  
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-violet-500 max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-white flex items-center gap-3 text-xl">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center"
            >
              <TrendingUp className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <div>Level Up!</div>
              <div className="text-sm text-slate-400 font-normal">
                {levelInfo.tierBeat || `Tier ${levelInfo.tier}${levelInfo.subTier}`}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 overflow-auto">
          <div className="space-y-3 pr-4 pb-4">
            {/* Level Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-4 bg-gradient-to-br from-violet-900/30 to-purple-900/30 rounded-xl border border-violet-500/30"
            >
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400">
                {character.level || 1} → {newLevel}
              </div>
              <p className="text-slate-300 text-xs mt-1">{levelInfo.gains}</p>
            </motion.div>
            
            <Separator className="bg-slate-700" />
            
            {/* Automatic Benefits */}
            <div>
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-400" />
                Automatic Benefits
              </h3>
              <div className="grid gap-2">
                {hpGain > 0 && (
                  <div className="flex items-center gap-3 bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                    <Heart className="h-5 w-5 text-red-400" />
                    <span className="text-white font-medium">+{hpGain} Maximum HP</span>
                  </div>
                )}
                {spGain > 0 && (
                  <div className="flex items-center gap-3 bg-violet-900/20 border border-violet-500/30 rounded-lg p-3">
                    <Zap className="h-5 w-5 text-violet-400" />
                    <span className="text-white font-medium">+{spGain} Maximum SP</span>
                  </div>
                )}
                {gains.some(g => g.type === 'power') && (
                  <div className="flex items-center gap-3 bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
                    <Sparkles className="h-5 w-5 text-purple-400" />
                    <span className="text-white font-medium">Power Evolution Available</span>
                  </div>
                )}
                {gains.some(g => g.type === 'legendary_gear') && (
                  <div className="flex items-center gap-3 bg-amber-900/20 border border-amber-500/30 rounded-lg p-3">
                    <Shield className="h-5 w-5 text-amber-400" />
                    <span className="text-white font-medium">Legendary Gear Access Unlocked</span>
                  </div>
                )}
              </div>
            </div>
            
            {needsStat && (
              <>
                <Separator className="bg-slate-700" />
                <div>
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Plus className="h-5 w-5 text-violet-400" />
                    Choose Ability Score to Increase
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {STATS.map(stat => (
                      <button
                        key={stat}
                        onClick={() => setSelectedStat(stat)}
                        className={cn(
                          "p-3 rounded-lg border-2 transition-all",
                          selectedStat === stat
                            ? "border-violet-500 bg-violet-500/20 scale-105"
                            : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                        )}
                      >
                        <div className="text-xs text-slate-400">{stat}</div>
                        <div className="text-xl font-bold text-white">
                          {character.ability_scores?.[stat] || 10}
                        </div>
                        {selectedStat === stat && (
                          <Badge className="bg-violet-500 text-white text-xs mt-1">+1</Badge>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
            
            {needsAugment && (
              <>
                <Separator className="bg-slate-700" />
                <div>
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Award className="h-5 w-5 text-amber-400" />
                    Choose New Augment (Feat)
                  </h3>
                  <Tabs value={augmentCategory} onValueChange={setAugmentCategory}>
                    <TabsList className="bg-slate-800 grid grid-cols-4 mb-3">
                      <TabsTrigger value="control">Control</TabsTrigger>
                      <TabsTrigger value="protection">Protection</TabsTrigger>
                      <TabsTrigger value="aggression">Aggression</TabsTrigger>
                      <TabsTrigger value="transcendence">Transcend</TabsTrigger>
                    </TabsList>
                    {Object.keys(AUGMENTS).map(category => (
                      <TabsContent key={category} value={category} className="space-y-2 max-h-60 overflow-y-auto">
                        {AUGMENTS[category].map((augment, i) => {
                          const isSelected = selectedAugment?.name === augment.name;
                          const alreadyHas = (character.augments || []).some(a => a.name === augment.name);
                          return (
                            <button
                              key={i}
                              onClick={() => !alreadyHas && setSelectedAugment(augment)}
                              disabled={alreadyHas}
                              className={cn(
                                "w-full p-3 rounded-lg border-2 text-left transition-all",
                                alreadyHas ? "opacity-50 cursor-not-allowed border-slate-700 bg-slate-800/30" :
                                isSelected
                                  ? "border-amber-500 bg-amber-500/20"
                                  : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                              )}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="font-semibold text-white mb-1">{augment.name}</div>
                                  {augment.description && (
                                    <div className="text-xs text-slate-400 mb-2 italic">{augment.description}</div>
                                  )}
                                  <ul className="text-xs text-slate-300 space-y-1">
                                    {augment.benefits.map((benefit, j) => (
                                      <li key={j} className="flex items-start gap-1">
                                        <span className="text-violet-400">•</span>
                                        <span>{benefit}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                {alreadyHas && (
                                  <Badge variant="outline" className="text-xs">Owned</Badge>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
        
        <div className="flex gap-3 pt-3 border-t border-slate-700 flex-shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-slate-600"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:opacity-50"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Confirm Level Up
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}