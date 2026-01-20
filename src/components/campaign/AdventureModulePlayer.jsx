import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Clock, Gift, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import useSoundEffects from '@/components/sounds/useSoundEffects';
import { base44 } from "@/api/base44Client";

export default function AdventureModulePlayer({ campaign, currentCharacter, onUpdate }) {
  const [currentStageId, setCurrentStageId] = useState(null);
  const [storyPath, setStoryPath] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const { play } = useSoundEffects();

  const activeAdventure = campaign.active_adventure;

  useEffect(() => {
    if (!activeAdventure?.active) return;

    // Initialize player progress
    const myProgress = activeAdventure.player_progress?.[currentCharacter?.id];
    if (myProgress) {
      setCurrentStageId(myProgress.current_stage);
      setStoryPath(myProgress.path || []);
    } else if (activeAdventure.stages.length > 0) {
      setCurrentStageId(activeAdventure.stages[0].id);
      setStoryPath([]);
    }

    // Timer
    const updateTimer = () => {
      const remaining = new Date(activeAdventure.expires_at) - new Date();
      setTimeLeft(Math.max(0, remaining));
      
      if (remaining <= 0 && !hasCompleted) {
        toast.error('Adventure time expired!');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeAdventure, currentCharacter]);

  if (!activeAdventure?.active) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="py-12 text-center">
          <BookOpen className="h-16 w-16 mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400">No active adventure</p>
          <p className="text-slate-500 text-sm mt-2">Waiting for GM to deploy an adventure module</p>
        </CardContent>
      </Card>
    );
  }

  const hasCompleted = activeAdventure.completed_by?.includes(currentCharacter?.name);
  const hasExpired = timeLeft <= 0;
  const currentStage = activeAdventure.stages.find(s => s.id === currentStageId);
  const minutesLeft = Math.floor(timeLeft / 60000);
  const secondsLeft = Math.floor((timeLeft % 60000) / 1000);

  const makeChoice = async (choice) => {
    if (hasCompleted || hasExpired) return;

    const newPath = [...storyPath, { stage_id: currentStageId, choice: choice.text }];

    if (choice.next_stage) {
      // Continue to next stage
      const updatedProgress = {
        ...activeAdventure.player_progress,
        [currentCharacter.id]: {
          current_stage: choice.next_stage,
          path: newPath,
          last_updated: new Date().toISOString()
        }
      };

      onUpdate({
        active_adventure: {
          ...activeAdventure,
          player_progress: updatedProgress
        }
      });

      setCurrentStageId(choice.next_stage);
      setStoryPath(newPath);
      play('navigate', 0.3);
    } else {
      // Adventure complete!
      const updatedProgress = {
        ...activeAdventure.player_progress,
        [currentCharacter.id]: {
          current_stage: null,
          path: newPath,
          completed: true,
          completed_at: new Date().toISOString()
        }
      };

      const completedBy = [...(activeAdventure.completed_by || []), currentCharacter.name];

      onUpdate({
        active_adventure: {
          ...activeAdventure,
          player_progress: updatedProgress,
          completed_by: completedBy
        }
      });

      setCurrentStageId(null);
      setStoryPath(newPath);
      play('success', 0.8);
      toast.success('Adventure completed! Rewards granted!', {
        description: `+${activeAdventure.rewards.xp} XP, +${activeAdventure.rewards.gold} Gold`
      });
      
      // Notify Discord
      try {
        await base44.functions.notifyDiscord({
          eventType: 'adventure_complete',
          data: {
            adventureTitle: activeAdventure.title,
            characterName: currentCharacter.name,
            rewards: activeAdventure.rewards
          }
        });
      } catch (e) {
        console.error('Discord notification failed:', e);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-br from-blue-950 to-slate-900 border-2 border-blue-500">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-400" />
            {activeAdventure.title}
          </CardTitle>
          <p className="text-sm text-slate-300">{activeAdventure.description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-800/50 rounded">
              <div className="text-xs text-slate-400 uppercase">Time Remaining</div>
              <div className={cn(
                "text-xl font-bold flex items-center gap-2",
                minutesLeft < 5 ? "text-red-400" : "text-white"
              )}>
                <Clock className="h-4 w-4" />
                {minutesLeft}:{secondsLeft.toString().padStart(2, '0')}
              </div>
            </div>
            <div className="p-3 bg-slate-800/50 rounded">
              <div className="text-xs text-slate-400 uppercase">Status</div>
              <div className="text-lg font-bold">
                {hasCompleted ? (
                  <Badge className="bg-green-600">Complete</Badge>
                ) : hasExpired ? (
                  <Badge className="bg-red-600">Expired</Badge>
                ) : (
                  <Badge className="bg-blue-600">In Progress</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Rewards Preview */}
          {!hasCompleted && (
            <div className="p-3 bg-blue-900/20 border border-blue-500/50 rounded">
              <div className="text-xs text-blue-300 mb-2 font-semibold">Complete to earn:</div>
              <div className="flex flex-wrap gap-2 text-sm">
                {activeAdventure.rewards.xp > 0 && (
                  <Badge className="bg-blue-500/20 text-blue-300">
                    +{activeAdventure.rewards.xp} XP
                  </Badge>
                )}
                {activeAdventure.rewards.gold > 0 && (
                  <Badge className="bg-yellow-500/20 text-yellow-300">
                    +{activeAdventure.rewards.gold} Gold
                  </Badge>
                )}
                {activeAdventure.rewards.items.map((item, idx) => (
                  <Badge key={idx} className="bg-green-500/20 text-green-300">
                    <Gift className="h-3 w-3 mr-1" />
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Stage */}
      {currentStage && !hasCompleted && !hasExpired && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStageId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">{currentStage.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-300 leading-relaxed">{currentStage.description}</p>

                <div className="space-y-2">
                  <div className="text-sm font-semibold text-slate-400 uppercase">Choose your action:</div>
                  {currentStage.choices.map((choice, idx) => (
                    <Button
                      key={idx}
                      onClick={() => makeChoice(choice)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start h-auto py-3 text-left"
                    >
                      <span className="font-semibold mr-2">{String.fromCharCode(65 + idx)}.</span>
                      {choice.text}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Completion */}
      {hasCompleted && (
        <Card className="bg-green-900/20 border-2 border-green-500">
          <CardContent className="py-8 text-center">
            <CheckCircle className="h-16 w-16 mx-auto text-green-400 mb-4" />
            <div className="text-green-400 font-bold text-xl mb-2">Adventure Complete!</div>
            <p className="text-slate-300 mb-4">You have received your rewards</p>
            <div className="flex flex-wrap justify-center gap-2">
              {activeAdventure.rewards.xp > 0 && (
                <Badge className="bg-blue-500">+{activeAdventure.rewards.xp} XP</Badge>
              )}
              {activeAdventure.rewards.gold > 0 && (
                <Badge className="bg-yellow-500">+{activeAdventure.rewards.gold} Gold</Badge>
              )}
              {activeAdventure.rewards.items.map((item, idx) => (
                <Badge key={idx} className="bg-green-500">{item}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expired */}
      {hasExpired && !hasCompleted && (
        <Card className="bg-red-900/20 border-2 border-red-500">
          <CardContent className="py-8 text-center">
            <AlertTriangle className="h-16 w-16 mx-auto text-red-400 mb-4" />
            <div className="text-red-400 font-bold text-xl mb-2">Time Expired</div>
            <p className="text-slate-300">This adventure is no longer available</p>
          </CardContent>
        </Card>
      )}

      {/* Story Path */}
      {storyPath.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Your Journey</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {storyPath.map((step, idx) => {
                  const stage = activeAdventure.stages.find(s => s.id === step.stage_id);
                  return (
                    <div key={idx} className="p-2 bg-slate-700/50 rounded text-sm">
                      <div className="text-slate-400 text-xs">{stage?.title}</div>
                      <div className="text-slate-300">→ {step.choice}</div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}