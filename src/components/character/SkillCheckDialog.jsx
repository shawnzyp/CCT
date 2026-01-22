import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Dices, TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const DIFFICULTY_CLASSES = [
  { label: 'Easy', dc: 10, color: 'text-green-400' },
  { label: 'Medium', dc: 15, color: 'text-yellow-400' },
  { label: 'Hard', dc: 20, color: 'text-orange-400' },
  { label: 'Very Hard', dc: 25, color: 'text-red-400' },
];

export default function SkillCheckDialog({ skill, bonus, character, onClose }) {
  const [result, setResult] = useState(null);
  const [rolling, setRolling] = useState(false);
  
  const sendToDiscord = async (d20, total, isCritSuccess, isCritFail) => {
    try {
      await base44.functions.invoke('notifyDiscord', {
        eventType: 'skill_check',
        data: {
          message: `${character.name} rolled ${skill.label}`,
          character: character.name,
          skill: skill.label,
          d20,
          total,
          bonus,
          isCritSuccess,
          isCritFail
        }
      });
    } catch (error) {
      console.error('Failed to send skill check to Discord:', error);
    }
  };
  
  const rollCheck = () => {
    setRolling(true);
    setResult(null);
    
    // Play sound
    const audio = new Audio('https://cdn.freesound.org/previews/703/703980_9014050-lq.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {});
    
    setTimeout(() => {
      const d20 = Math.floor(Math.random() * 20) + 1;
      const total = d20 + bonus;
      const isCritSuccess = d20 === 20;
      const isCritFail = d20 === 1;
      
      setResult({ d20, total, isCritSuccess, isCritFail });
      setRolling(false);
      
      // Play success/fail sound
      if (isCritSuccess) {
        const successAudio = new Audio('https://cdn.freesound.org/previews/541/541319_6174968-lq.mp3');
        successAudio.volume = 0.4;
        successAudio.play().catch(() => {});
      } else if (isCritFail) {
        const failAudio = new Audio('https://cdn.freesound.org/previews/519/519400_5647833-lq.mp3');
        failAudio.volume = 0.3;
        failAudio.play().catch(() => {});
      }
      
      // Send to Discord
      sendToDiscord(d20, total, isCritSuccess, isCritFail);
    }, 600);
  };
  
  const getDifficultyResult = (dc) => {
    if (!result) return null;
    if (result.isCritSuccess) return 'success';
    if (result.isCritFail) return 'fail';
    return result.total >= dc ? 'success' : 'fail';
  };
  
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-violet-500 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Dices className="h-5 w-5 text-violet-400" />
            {skill.label} Check
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Skill Info */}
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-semibold text-white">{skill.label}</div>
                <div className="text-sm text-slate-400">{skill.description}</div>
              </div>
              <Badge variant="outline" className="text-lg font-bold">
                {bonus >= 0 ? '+' : ''}{bonus}
              </Badge>
            </div>
            <div className="text-xs text-slate-500">
              Based on {skill.ability} ({character.ability_scores?.[skill.ability] || 10}) + Proficiency
            </div>
          </div>
          
          {/* Roll Button */}
          <Button
            onClick={rollCheck}
            disabled={rolling}
            className="w-full h-16 text-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
          >
            {rolling ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
              >
                <Dices className="h-6 w-6" />
              </motion.div>
            ) : (
              <>
                <Dices className="h-5 w-5 mr-2" />
                Roll d20 {bonus >= 0 ? '+' : ''}{bonus}
              </>
            )}
          </Button>
          
          {/* Result */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "p-6 rounded-xl border-2 text-center",
                  result.isCritSuccess && "border-amber-500 bg-amber-500/10",
                  result.isCritFail && "border-red-500 bg-red-500/10",
                  !result.isCritSuccess && !result.isCritFail && "border-violet-500 bg-violet-500/10"
                )}
              >
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="text-sm text-slate-400">
                    d20: {result.d20}
                  </div>
                  <div className="text-4xl font-bold text-white">
                    {result.total}
                  </div>
                </div>
                
                {result.isCritSuccess && (
                  <div className="flex items-center justify-center gap-1 text-amber-400 font-semibold">
                    <Sparkles className="h-4 w-4" />
                    Critical Success!
                  </div>
                )}
                {result.isCritFail && (
                  <div className="text-red-400 font-semibold">Critical Failure!</div>
                )}
                
                {/* Difficulty Comparison */}
                <div className="mt-4 space-y-1">
                  {DIFFICULTY_CLASSES.map(diff => {
                    const diffResult = getDifficultyResult(diff.dc);
                    return (
                      <div key={diff.dc} className="flex items-center justify-between text-sm">
                        <span className={diff.color}>{diff.label} (DC {diff.dc})</span>
                        {diffResult === 'success' ? (
                          <TrendingUp className="h-4 w-4 text-green-400" />
                        ) : diffResult === 'fail' ? (
                          <TrendingDown className="h-4 w-4 text-red-400" />
                        ) : (
                          <Minus className="h-4 w-4 text-slate-600" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full border-slate-600"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}