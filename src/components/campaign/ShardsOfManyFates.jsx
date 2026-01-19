import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, AlertTriangle, Flame, ShieldOff, Lock, Minus, Clock, Crown, EyeOff, Zap, Eye, Shuffle, Power } from "lucide-react";
import useSoundEffects from '@/components/sounds/useSoundEffects';
import { toast } from "sonner";

const SHARD_CATEGORIES = [
  {
    id: 'ascent',
    name: 'Shard of Ascent',
    icon: Flame,
    color: 'orange',
    theme: 'Power gained faster than wisdom',
    description: 'Accelerates growth at a cost',
    effects: [
      'Immediate Tier advancement or power evolution',
      'Permanent stat mutation (+2 to any ability score)',
      'Unlock Transcendent-tier access early'
    ],
    hiddenCost: [
      'Increased scrutiny from O.M.N.I., Conclave, or Morvox',
      'Future choices narrow instead of expand',
      'Disadvantage on social checks with normal civilians'
    ],
    question: 'What if you were ready before you were stable?'
  },
  {
    id: 'fracture',
    name: 'Shard of Fracture',
    icon: ShieldOff,
    color: 'red',
    theme: 'Internal division',
    description: 'Splits identity, loyalty, or memory',
    effects: [
      'Personality schism - two conflicting drives',
      'Memory edits or false recollections implanted',
      'Power manifestation becomes unpredictable'
    ],
    hiddenCost: [
      'Disadvantage on alignment-driven decisions',
      'Long-term instability in powers or SP usage',
      'Allies question your reliability'
    ],
    question: 'What if the enemy didn\'t need to convince you, only wait?'
  },
  {
    id: 'anchor',
    name: 'Shard of Anchor',
    icon: Lock,
    color: 'slate',
    theme: 'Binding',
    description: 'Locks something in place permanently',
    effects: [
      'A relationship, location, or role becomes unchangeable',
      'Bound to protect, obey, or remain in one place',
      'Removes an exit option forever'
    ],
    hiddenCost: [
      'Loss of narrative mobility',
      'Sacrifice of future escape routes',
      'Cannot refuse calls for aid from bound entity'
    ],
    question: 'What if staying was the price of surviving?'
  },
  {
    id: 'loss',
    name: 'Shard of Loss',
    icon: Minus,
    color: 'gray',
    theme: 'Subtraction',
    description: 'Something vital is taken, not killed',
    effects: [
      'Loss of a power, augment, or contact',
      'A future event is erased from timeline',
      'A safety net vanishes permanently'
    ],
    hiddenCost: [
      'None. This shard is honest.',
      'The loss is immediate and irreversible'
    ],
    question: 'What do you become when something essential is gone?'
  },
  {
    id: 'echo',
    name: 'Shard of Echo',
    icon: Clock,
    color: 'blue',
    theme: 'Consequences arriving early',
    description: 'Pulls future fallout into the present',
    effects: [
      'An unresolved choice detonates now',
      'A future enemy manifests early',
      'A rumor becomes truth immediately'
    ],
    hiddenCost: [
      'Campaign clock accelerates',
      'City instability increases by 2 levels',
      'Players lose preparation time'
    ],
    question: 'What if tomorrow stopped waiting?'
  },
  {
    id: 'command',
    name: 'Shard of Command',
    icon: Crown,
    color: 'yellow',
    theme: 'Control',
    description: 'Grants authority that cannot be cleanly refused',
    effects: [
      'Leadership forced onto the character',
      'Civilians or operatives begin obeying automatically',
      'O.M.N.I. or PFV elevation without consent'
    ],
    hiddenCost: [
      'Moral responsibility becomes enforceable',
      'Failure now harms others directly',
      'Cannot delegate critical decisions'
    ],
    question: 'What if people listened when you spoke?'
  },
  {
    id: 'silence',
    name: 'Shard of Silence',
    icon: EyeOff,
    color: 'indigo',
    theme: 'Erasure',
    description: 'Removes visibility, record, or acknowledgment',
    effects: [
      'Character becomes unrecorded in systems',
      'Public memory of you fades over time',
      'Victories go uncredited'
    ],
    hiddenCost: [
      'Allies struggle to find or trust you',
      'Legacy becomes impossible',
      'No reputation bonuses or recognition'
    ],
    question: 'What if saving the city meant being forgotten by it?'
  },
  {
    id: 'transcendence',
    name: 'Shard of Transcendence',
    icon: Zap,
    color: 'purple',
    theme: 'Beyond humanity',
    description: 'Pushes a character out of the human frame',
    effects: [
      'Unlock Transcendent Trait access',
      'Alters biology, time perception, or causality',
      'Draws attention from cosmic forces'
    ],
    hiddenCost: [
      'Loss of normal emotional anchors',
      'Difficulty relating to civilians',
      'Morvox becomes aware of you'
    ],
    question: 'What if you stopped being one of them?'
  },
  {
    id: 'revelation',
    name: 'Shard of Revelation',
    icon: Eye,
    color: 'emerald',
    theme: 'Truth',
    description: 'Forces knowledge that cannot be unlearned',
    effects: [
      'Exposure of Morvox\'s indirect hand',
      'Discovery of O.M.N.I. suppression protocols',
      'A lie collapses publicly'
    ],
    hiddenCost: [
      'Safety evaporates',
      'Enemies gain clarity too',
      'Cannot return to ignorance'
    ],
    question: 'What if knowing made things worse?'
  }
];

export default function ShardsOfManyFates({ campaign, onUpdate, characterName, isGM = false }) {
  const [selectedShard, setSelectedShard] = useState(null);
  const [drawnShards, setDrawnShards] = useState(campaign.drawn_shards || []);
  const [shuffling, setShuffling] = useState(false);
  const [showDrawConfirm, setShowDrawConfirm] = useState(false);
  const [shardsEnabled, setShardsEnabled] = useState(campaign.shards_enabled || false);
  const { play } = useSoundEffects();

  const toggleShardsEnabled = () => {
    const newValue = !shardsEnabled;
    setShardsEnabled(newValue);
    onUpdate({ shards_enabled: newValue });
    toast.success(newValue ? 'Shards of Many Fates enabled' : 'Shards of Many Fates disabled');
  };

  if (!isGM && !shardsEnabled) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="py-12 text-center">
          <Lock className="h-16 w-16 mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400">The Shards of Many Fates system is not available</p>
          <p className="text-slate-500 text-sm mt-2">Your GM has not enabled this feature</p>
        </CardContent>
      </Card>
    );
  }

  const drawShard = () => {
    setShuffling(true);
    play('navigate', 0.3);

    setTimeout(() => {
      const randomShard = SHARD_CATEGORIES[Math.floor(Math.random() * SHARD_CATEGORIES.length)];
      const drawnRecord = {
        shard: randomShard,
        character: characterName,
        timestamp: new Date().toISOString(),
        id: `draw_${Date.now()}`
      };

      const updated = [...drawnShards, drawnRecord];
      setDrawnShards(updated);
      onUpdate({ drawn_shards: updated });
      setSelectedShard(randomShard);
      setShuffling(false);
      setShowDrawConfirm(false);
      play('error', 0.5); // Dramatic sound for shard draw
      toast.error(`${randomShard.name} drawn!`, {
        description: randomShard.theme
      });
    }, 2000);
  };

  const getColorClasses = (color) => {
    const colors = {
      orange: 'border-orange-500 bg-orange-500/10 text-orange-400',
      red: 'border-red-500 bg-red-500/10 text-red-400',
      slate: 'border-slate-500 bg-slate-500/10 text-slate-400',
      gray: 'border-gray-500 bg-gray-500/10 text-gray-400',
      blue: 'border-blue-500 bg-blue-500/10 text-blue-400',
      yellow: 'border-yellow-500 bg-yellow-500/10 text-yellow-400',
      indigo: 'border-indigo-500 bg-indigo-500/10 text-indigo-400',
      purple: 'border-purple-500 bg-purple-500/10 text-purple-400',
      emerald: 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
    };
    return colors[color] || colors.slate;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-br from-slate-900 to-purple-900/50 border-2 border-purple-500">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            The Shards of Many Fates
          </CardTitle>
          <p className="text-sm text-slate-300">Meta Narrative Intervention Tool</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-900/20 border-2 border-red-600/50 rounded-lg">
            <div className="flex items-start gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 font-semibold text-sm">GM Authority Tool</p>
                <p className="text-slate-300 text-sm mt-1">
                  The Shard of Many Fates is a controlled narrative destabilizer. 
                  Every draw is irreversible and reshapes the campaign.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm text-slate-300">
            <p className="flex items-center gap-2">
              <span className="text-purple-400">•</span>
              The Shard is invoked sparingly
            </p>
            <p className="flex items-center gap-2">
              <span className="text-purple-400">•</span>
              It is always a choice, never a punishment
            </p>
            <p className="flex items-center gap-2">
              <span className="text-purple-400">•</span>
              Once drawn, the effect must resolve. No retcons.
            </p>
          </div>

          {isGM && (
            <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2">
                <Power className={shardsEnabled ? "h-4 w-4 text-green-400" : "h-4 w-4 text-slate-500"} />
                <span className="text-sm text-slate-300">Enable for Players</span>
              </div>
              <Button
                onClick={toggleShardsEnabled}
                size="sm"
                variant={shardsEnabled ? "default" : "outline"}
                className={shardsEnabled ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {shardsEnabled ? "Enabled" : "Disabled"}
              </Button>
            </div>
          )}

          <Button
            onClick={() => setShowDrawConfirm(true)}
            disabled={shuffling}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold border-2 border-purple-500"
          >
            {shuffling ? (
              <>
                <Shuffle className="h-4 w-4 mr-2 animate-spin" />
                Drawing Shard...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Draw a Shard
              </>
            )}
          </Button>

          {drawnShards.length > 0 && (
            <div className="pt-2 border-t border-slate-700">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                Shards Drawn This Campaign: {drawnShards.length}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Shards Reference */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Shard Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {SHARD_CATEGORIES.map((shard) => {
                const Icon = shard.icon;
                return (
                  <motion.div
                    key={shard.id}
                    whileHover={{ scale: 1.02 }}
                    className={cn(
                      "p-4 rounded-lg border-2 cursor-pointer transition-all",
                      getColorClasses(shard.color),
                      selectedShard?.id === shard.id && "ring-2 ring-white"
                    )}
                    onClick={() => setSelectedShard(shard)}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 space-y-2">
                        <div>
                          <h4 className="font-bold">{shard.name}</h4>
                          <p className="text-xs opacity-80 italic">{shard.theme}</p>
                        </div>
                        <p className="text-xs">{shard.description}</p>
                        
                        {selectedShard?.id === shard.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-3 pt-2 border-t border-current/20"
                          >
                            <div>
                              <p className="text-xs font-semibold uppercase mb-1">Typical Effects:</p>
                              <ul className="text-xs space-y-1">
                                {shard.effects.map((effect, i) => (
                                  <li key={i} className="flex gap-2">
                                    <span>•</span>
                                    <span>{effect}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <p className="text-xs font-semibold uppercase mb-1 text-red-300">Hidden Cost:</p>
                              <ul className="text-xs space-y-1 text-red-200">
                                {shard.hiddenCost.map((cost, i) => (
                                  <li key={i} className="flex gap-2">
                                    <span>•</span>
                                    <span>{cost}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="pt-2 border-t border-current/20">
                              <p className="text-xs italic opacity-90">{shard.question}</p>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Draw History */}
      {drawnShards.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Draw History</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {drawnShards.slice().reverse().map((record) => {
                  const Icon = record.shard.icon;
                  return (
                    <div
                      key={record.id}
                      className={cn(
                        "p-3 rounded-lg border",
                        getColorClasses(record.shard.color)
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <Icon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-sm">{record.shard.name}</p>
                            <p className="text-xs opacity-80">
                              Drawn by {record.character}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {new Date(record.timestamp).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Draw Confirmation Dialog */}
      <Dialog open={showDrawConfirm} onOpenChange={setShowDrawConfirm}>
        <DialogContent className="bg-slate-900 border-2 border-red-500 text-white">
          <DialogHeader>
            <DialogTitle className="text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Confirm Shard Draw
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-slate-300">
              Drawing a Shard introduces irreversible narrative change. 
              This action cannot be undone.
            </p>
            <div className="p-3 bg-red-900/20 border border-red-600/50 rounded text-sm text-slate-300">
              <p className="font-semibold text-red-400 mb-2">Warning:</p>
              <ul className="space-y-1 text-xs">
                <li>• The effect resolves immediately</li>
                <li>• No retcons or reversals</li>
                <li>• The campaign will be permanently altered</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowDrawConfirm(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={drawShard}
                className="flex-1 bg-red-600 hover:bg-red-700 border-2 border-red-500"
              >
                Draw Shard
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}