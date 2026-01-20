import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { 
  Heart, Zap, Shield, User, Target, BookOpen, Package, 
  CheckCircle, Clock, AlertTriangle, Sparkles, Gift, Scroll
} from "lucide-react";
import { getModifier, formatModifier } from "@/components/character/StatBlock";
import useSoundEffects from '@/components/sounds/useSoundEffects';
import { useHaptic } from '@/components/utils/useHaptic';

export default function PlayerDashboard({ campaign, currentCharacter }) {
  const { play } = useSoundEffects();
  const { haptic } = useHaptic();

  if (!currentCharacter) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="py-12 text-center">
          <User className="h-16 w-16 mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400">Please select a character to view your dashboard</p>
        </CardContent>
      </Card>
    );
  }

  const conMod = getModifier(currentCharacter.ability_scores?.CON || 10);
  const dexMod = getModifier(currentCharacter.ability_scores?.DEX || 10);
  const maxSP = 5 + conMod;
  const hpPercent = ((currentCharacter.current_hp || currentCharacter.max_hp) / currentCharacter.max_hp) * 100;

  // Get active quests
  const activeQuests = campaign.quests?.filter(q => q.status === 'active') || [];
  
  // Get active story arcs
  const activeArcs = campaign.story_arcs?.filter(arc => arc.status === 'in_progress') || [];

  // Get active adventure
  const activeAdventure = campaign.active_adventure;
  const hasCompletedAdventure = activeAdventure?.completed_by?.includes(currentCharacter.name);

  // Get active deck
  const activeDeck = campaign.active_deck;
  const myDeckTurn = activeDeck?.turn_order?.find(t => t.character_id === currentCharacter.id);

  // Get character journal entries
  const myJournalEntries = campaign.journal_entries?.filter(
    entry => entry.author === currentCharacter.name || entry.contributors?.includes(currentCharacter.name)
  ) || [];

  // Get equipped items
  const equippedItems = currentCharacter.equipment?.filter(item => item.equipped) || [];

  return (
    <div className="space-y-4">
      {/* Character Summary */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-violet-500/50">
        <CardHeader>
          <div className="flex items-center gap-4">
            {currentCharacter.portrait_url ? (
              <img 
                src={currentCharacter.portrait_url} 
                alt={currentCharacter.name}
                className="w-16 h-16 rounded-xl object-cover border-2 border-violet-500"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
            )}
            <div className="flex-1">
              <CardTitle className="text-white text-xl">{currentCharacter.name}</CardTitle>
              <div className="flex flex-wrap gap-2 mt-1">
                <Badge className="bg-violet-600">Level {currentCharacter.level || 1}</Badge>
                <Badge className="bg-slate-700">{currentCharacter.classification?.replace(/_/g, ' ')}</Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Vital Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-4 w-4 text-red-400" />
                <span className="text-xs text-slate-400 uppercase">HP</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">
                    {currentCharacter.current_hp || currentCharacter.max_hp}
                  </span>
                  <span className="text-slate-400">/ {currentCharacter.max_hp}</span>
                </div>
                <Progress value={hpPercent} className="h-2" />
              </div>
            </div>

            <div className="p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-violet-400" />
                <span className="text-xs text-slate-400 uppercase">SP</span>
              </div>
              <div className="text-2xl font-bold text-white">{maxSP}</div>
              <div className="text-xs text-slate-500">Per round</div>
            </div>

            <div className="p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-blue-400" />
                <span className="text-xs text-slate-400 uppercase">TC</span>
              </div>
              <div className="text-2xl font-bold text-white">{currentCharacter.toughness_class}</div>
              <div className="text-xs text-slate-500">Toughness Class</div>
            </div>
          </div>

          {/* Active Effects */}
          {currentCharacter.active_conditions && currentCharacter.active_conditions.length > 0 && (
            <div className="p-3 bg-orange-900/20 border border-orange-500/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-400" />
                <span className="text-sm font-semibold text-orange-300">Active Effects</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentCharacter.active_conditions.map((condition, idx) => (
                  <Badge key={idx} className="bg-orange-600">
                    {condition.name}
                    {condition.duration > 0 && ` (${condition.duration} rounds)`}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-6 gap-2">
            {['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map(stat => {
              const score = currentCharacter.ability_scores?.[stat] || 10;
              const mod = getModifier(score);
              return (
                <div key={stat} className="p-2 bg-slate-700/50 rounded text-center">
                  <div className="text-xs text-slate-400">{stat}</div>
                  <div className="text-lg font-bold text-white">{score}</div>
                  <div className={cn(
                    "text-xs font-semibold",
                    mod >= 0 ? "text-emerald-400" : "text-red-400"
                  )}>
                    {formatModifier(mod)}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Active Modules */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Active Adventure */}
        {activeAdventure?.active && (
          <Card className="bg-slate-800 border-blue-500">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-400" />
                Active Adventure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-white font-semibold">{activeAdventure.title}</div>
              <div className="text-sm text-slate-400">{activeAdventure.description}</div>
              {hasCompletedAdventure ? (
                <Badge className="bg-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              ) : (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="h-3 w-3" />
                  {Math.floor((new Date(activeAdventure.expires_at) - new Date()) / 60000)}m remaining
                </div>
              )}
              {!hasCompletedAdventure && activeAdventure.rewards && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {activeAdventure.rewards.xp > 0 && (
                    <Badge variant="outline" className="text-xs">+{activeAdventure.rewards.xp} XP</Badge>
                  )}
                  {activeAdventure.rewards.gold > 0 && (
                    <Badge variant="outline" className="text-xs">+{activeAdventure.rewards.gold} Gold</Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Active Deck */}
        {activeDeck?.active && myDeckTurn && (
          <Card className="bg-slate-800 border-purple-500">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                Deck of Fates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-white font-semibold">Your Turn Position: #{myDeckTurn.turn_position + 1}</div>
              {myDeckTurn.cards_declared ? (
                <div className="space-y-1">
                  <Badge className="bg-purple-600">Drawing {myDeckTurn.cards_to_draw} cards</Badge>
                  {myDeckTurn.completed && (
                    <Badge className="bg-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
              ) : (
                <div className="text-sm text-slate-400">Waiting to declare cards</div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quests & Story Arcs */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Active Quests */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-amber-400" />
              Active Quests ({activeQuests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeQuests.length > 0 ? (
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {activeQuests.map((quest, idx) => (
                    <div key={idx} className="p-3 bg-slate-700/50 rounded-lg">
                      <div className="font-semibold text-white text-sm mb-1">{quest.title}</div>
                      <div className="text-xs text-slate-400 mb-2">{quest.description}</div>
                      {quest.objectives && (
                        <div className="space-y-1">
                          {quest.objectives.map((obj, objIdx) => (
                            <div key={objIdx} className="flex items-center gap-2 text-xs">
                              {obj.completed ? (
                                <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0" />
                              ) : (
                                <div className="h-3 w-3 rounded-full border border-slate-500 flex-shrink-0" />
                              )}
                              <span className={cn(
                                obj.completed ? "text-slate-500 line-through" : "text-slate-300"
                              )}>
                                {obj.description}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8">
                <Target className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                <p className="text-slate-500 text-sm">No active quests</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Story Arcs */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Scroll className="h-4 w-4 text-violet-400" />
              Story Arcs ({activeArcs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeArcs.length > 0 ? (
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {activeArcs.map((arc, idx) => (
                    <div key={idx} className="p-3 bg-slate-700/50 rounded-lg">
                      <div className="font-semibold text-white text-sm mb-1">{arc.title}</div>
                      <div className="text-xs text-slate-400 mb-2">{arc.description}</div>
                      {arc.milestones && (
                        <div className="space-y-1">
                          {arc.milestones.map((milestone, mIdx) => (
                            <div key={mIdx} className="flex items-center gap-2 text-xs">
                              {milestone.completed ? (
                                <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0" />
                              ) : (
                                <div className="h-3 w-3 rounded-full border border-slate-500 flex-shrink-0" />
                              )}
                              <span className={cn(
                                milestone.completed ? "text-slate-500 line-through" : "text-slate-300"
                              )}>
                                {milestone.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8">
                <Scroll className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                <p className="text-slate-500 text-sm">No active story arcs</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Journal & Inventory */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Journal Entries */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-400" />
              My Journal Entries ({myJournalEntries.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {myJournalEntries.length > 0 ? (
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {myJournalEntries.slice(0, 5).map((entry, idx) => (
                    <div key={idx} className="p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">{entry.type}</Badge>
                        <div className="text-xs text-slate-500">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="font-semibold text-white text-sm">{entry.title}</div>
                      <div className="text-xs text-slate-400 mt-1 line-clamp-2">{entry.content}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                <p className="text-slate-500 text-sm">No journal entries yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Equipped Items */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Package className="h-4 w-4 text-green-400" />
              Equipped Items ({equippedItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {equippedItems.length > 0 ? (
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {equippedItems.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-semibold text-white text-sm">{item.name}</div>
                        <Badge variant="outline" className="text-xs">{item.type}</Badge>
                      </div>
                      {item.bonus && (
                        <div className="text-xs text-green-400">{item.bonus}</div>
                      )}
                      {item.description && (
                        <div className="text-xs text-slate-400 mt-1">{item.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8">
                <Package className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                <p className="text-slate-500 text-sm">No items equipped</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Experience & Gold */}
      <Card className="bg-gradient-to-br from-amber-900/20 to-slate-800 border-amber-500/50">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-slate-400 uppercase mb-1">Experience</div>
              <div className="text-2xl font-bold text-amber-400">{currentCharacter.current_xp || 0} XP</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase mb-1">Gold</div>
              <div className="text-2xl font-bold text-yellow-400">{currentCharacter.gold || 0}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}