import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skull, Heart, Dices, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import useSoundEffects from '@/components/sounds/useSoundEffects';

export default function DeathSaveRoller({ character, onStabilize, onDie, onUpdate }) {
  const [successes, setSuccesses] = useState(character.death_save_successes || 0);
  const [failures, setFailures] = useState(character.death_save_failures || 0);
  const [rolling, setRolling] = useState(false);
  const [lastRoll, setLastRoll] = useState(null);
  const { play } = useSoundEffects();

  const rollDeathSave = () => {
    setRolling(true);
    play('dice', 0.5);

    setTimeout(() => {
      const roll = Math.floor(Math.random() * 20) + 1;
      setLastRoll(roll);

      if (roll === 20) {
        // Natural 20: Regain 1 HP
        toast.success("Natural 20!", {
          description: "You regain 1 HP and stabilize!"
        });
        play('success', 0.7);
        onStabilize();
      } else if (roll === 1) {
        // Natural 1: Two failures
        const newFailures = Math.min(failures + 2, 3);
        setFailures(newFailures);
        play('error', 0.6);
        
        if (newFailures >= 3) {
          toast.error("Death", {
            description: "You have died..."
          });
          onDie();
        } else {
          toast.error("Critical Failure", {
            description: "Natural 1! Two death save failures."
          });
        }
      } else if (roll >= 10) {
        // Success
        const newSuccesses = successes + 1;
        setSuccesses(newSuccesses);
        play('success', 0.4);
        
        if (newSuccesses >= 3) {
          toast.success("Stabilized!", {
            description: "You are stable but unconscious at 0 HP."
          });
          onStabilize();
        } else {
          toast.success("Death Save Success", {
            description: `${newSuccesses}/3 successes`
          });
        }
      } else {
        // Failure
        const newFailures = failures + 1;
        setFailures(newFailures);
        play('error', 0.4);
        
        if (newFailures >= 3) {
          toast.error("Death", {
            description: "You have died..."
          });
          onDie();
        } else {
          toast.error("Death Save Failure", {
            description: `${newFailures}/3 failures`
          });
        }
      }

      onUpdate?.({ death_save_successes: successes, death_save_failures: failures });
      setRolling(false);
    }, 800);
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
    >
      <Card className="bg-gradient-to-br from-red-900/50 to-slate-900 border-red-500/50 shadow-2xl shadow-red-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Skull className="h-5 w-5 text-red-400 animate-pulse" />
            Death Saves
            <Badge className="bg-red-500/20 text-red-300 border-red-500/50 ml-auto">
              {character.name}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status */}
          <div className="bg-red-950/50 rounded-lg p-4 border border-red-500/30">
            <p className="text-red-200 text-sm font-medium mb-2">
              You are unconscious at 0 HP. Roll death saves at the start of your turn.
            </p>
            <p className="text-xs text-red-300/70">
              • Roll d20: 10+ is a success, &lt;10 is a failure<br/>
              • Natural 20: Regain 1 HP and wake up<br/>
              • Natural 1: Counts as two failures<br/>
              • 3 successes: Stable (unconscious, no more rolls)<br/>
              • 3 failures: Death
            </p>
          </div>

          {/* Last Roll Display */}
          <AnimatePresence>
            {lastRoll && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                className={cn(
                  "flex items-center justify-center p-6 rounded-lg border-2",
                  lastRoll === 20 ? "bg-green-500/20 border-green-500" :
                  lastRoll === 1 ? "bg-red-500/20 border-red-500" :
                  lastRoll >= 10 ? "bg-blue-500/20 border-blue-500" :
                  "bg-orange-500/20 border-orange-500"
                )}
              >
                <div className="text-center">
                  <div className={cn(
                    "text-6xl font-bold font-mono mb-2",
                    lastRoll === 20 ? "text-green-400" :
                    lastRoll === 1 ? "text-red-400" :
                    lastRoll >= 10 ? "text-blue-400" :
                    "text-orange-400"
                  )}>
                    {lastRoll}
                  </div>
                  <div className="text-sm font-medium text-white">
                    {lastRoll === 20 ? "Natural 20!" :
                     lastRoll === 1 ? "Critical Failure!" :
                     lastRoll >= 10 ? "Success" : "Failure"}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Successes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-400 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Successes
              </span>
              <span className="text-white font-mono font-bold">{successes}/3</span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className={cn(
                    "flex-1 h-3 rounded-full border-2 transition-all",
                    i <= successes 
                      ? "bg-green-500 border-green-400" 
                      : "bg-slate-800 border-slate-700"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Failures */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-red-400 flex items-center gap-1">
                <XCircle className="h-4 w-4" />
                Failures
              </span>
              <span className="text-white font-mono font-bold">{failures}/3</span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className={cn(
                    "flex-1 h-3 rounded-full border-2 transition-all",
                    i <= failures 
                      ? "bg-red-500 border-red-400 animate-pulse" 
                      : "bg-slate-800 border-slate-700"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Roll Button */}
          <Button
            onClick={rollDeathSave}
            disabled={rolling || successes >= 3 || failures >= 3}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-lg py-6"
          >
            <Dices className={cn("h-5 w-5 mr-2", rolling && "animate-spin")} />
            {rolling ? "Rolling..." : "Roll Death Save"}
          </Button>

          {/* Stabilized message */}
          {successes >= 3 && (
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3 text-center">
              <p className="text-blue-300 text-sm font-medium">
                Stabilized! You remain unconscious at 0 HP until healed.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}