import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Unlock, Dices, Users, Scroll, Zap, Eye, ScrollText, Milestone, Globe, Map } from 'lucide-react';
import QuestTracker from '@/components/campaign/QuestTracker';
import StoryArcTracker from '@/components/campaign/StoryArcTracker';
import WorldEventsManager from '@/components/campaign/WorldEventsManager';
import WorldBuilder from '@/components/campaign/WorldBuilder';

const DEFAULT_PIN = '1234'; // In production, this should be stored securely

export default function DMTools() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [rollResult, setRollResult] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const queryClient = useQueryClient();
  
  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => base44.entities.Campaign.list('-created_date'),
    enabled: isAuthenticated
  });
  
  const { data: campaign } = useQuery({
    queryKey: ['campaign', selectedCampaign],
    queryFn: () => base44.entities.Campaign.filter({ id: selectedCampaign }),
    select: (data) => data[0],
    enabled: !!selectedCampaign && isAuthenticated
  });
  
  const updateCampaign = useMutation({
    mutationFn: (data) => base44.entities.Campaign.update(selectedCampaign, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', selectedCampaign] });
    },
  });

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin === DEFAULT_PIN) {
      setIsAuthenticated(true);
      setError('');
      setPin('');
    } else {
      setError('Invalid PIN. Try again.');
      setPin('');
    }
  };

  const rollDice = (sides, count = 1) => {
    const rolls = [];
    let total = 0;
    for (let i = 0; i < count; i++) {
      const roll = Math.floor(Math.random() * sides) + 1;
      rolls.push(roll);
      total += roll;
    }
    setRollResult({ rolls, total, dice: `${count}d${sides}` });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-slate-900/80 border-violet-500 max-w-md w-full">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"
                >
                  <Shield className="h-8 w-8 text-white" />
                </motion.div>
              </div>
              <CardTitle className="text-white text-center text-2xl">DM Tools Access</CardTitle>
              <p className="text-slate-400 text-center text-sm">Enter PIN to unlock game master utilities</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePinSubmit} className="space-y-4">
                <div>
                  <Label className="text-slate-300">PIN Code</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      type="password"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="Enter 4-digit PIN"
                      maxLength={4}
                      className="pl-10 bg-slate-800 border-slate-700 text-white text-center text-2xl tracking-widest"
                    />
                  </div>
                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-red-400 text-sm mt-2"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
                  <Unlock className="h-4 w-4 mr-2" />
                  Unlock
                </Button>
                <p className="text-xs text-slate-500 text-center">Default PIN: 1234</p>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">DM Tools</h1>
              <p className="text-slate-400">Game master utilities</p>
            </div>
          </div>
          <Badge className="bg-green-500/20 text-green-400 border-green-500">
            <Eye className="h-3 w-3 mr-1" />
            Authenticated
          </Badge>
        </motion.div>

        {/* Campaign Selector */}
        <Card className="bg-slate-800/50 border-slate-700 mb-4">
          <CardContent className="p-4">
            <Label className="text-slate-300 mb-2 block">Select Campaign to Manage</Label>
            <Select value={selectedCampaign || ''} onValueChange={setSelectedCampaign}>
              <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                <SelectValue placeholder="Choose a campaign..." />
              </SelectTrigger>
              <SelectContent>
                {campaigns.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Tabs defaultValue="dice" className="space-y-4">
          <TabsList className="bg-slate-800/50 border border-slate-700 flex-wrap h-auto">
            <TabsTrigger value="dice" className="data-[state=active]:bg-violet-500/20">
              <Dices className="h-4 w-4 mr-2" />
              Dice
            </TabsTrigger>
            <TabsTrigger value="quests" className="data-[state=active]:bg-violet-500/20" disabled={!selectedCampaign}>
              <ScrollText className="h-4 w-4 mr-2" />
              Quests
            </TabsTrigger>
            <TabsTrigger value="arcs" className="data-[state=active]:bg-violet-500/20" disabled={!selectedCampaign}>
              <Milestone className="h-4 w-4 mr-2" />
              Story Arcs
            </TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-violet-500/20" disabled={!selectedCampaign}>
              <Globe className="h-4 w-4 mr-2" />
              World Events
            </TabsTrigger>
            <TabsTrigger value="world" className="data-[state=active]:bg-violet-500/20" disabled={!selectedCampaign}>
              <Map className="h-4 w-4 mr-2" />
              World Builder
            </TabsTrigger>
            <TabsTrigger value="npc" className="data-[state=active]:bg-violet-500/20">
              <Users className="h-4 w-4 mr-2" />
              NPC Gen
            </TabsTrigger>
            <TabsTrigger value="loot" className="data-[state=active]:bg-violet-500/20">
              <Scroll className="h-4 w-4 mr-2" />
              Loot Gen
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dice">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Quick Dice Roller</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'd20', sides: 20 },
                    { label: 'd12', sides: 12 },
                    { label: 'd10', sides: 10 },
                    { label: 'd8', sides: 8 },
                    { label: 'd6', sides: 6 },
                    { label: 'd4', sides: 4 },
                    { label: '2d6', sides: 6, count: 2 },
                    { label: '3d6', sides: 6, count: 3 }
                  ].map((dice) => (
                    <Button
                      key={dice.label}
                      onClick={() => rollDice(dice.sides, dice.count || 1)}
                      variant="outline"
                      className="h-20 border-violet-500 hover:bg-violet-500/20"
                    >
                      <div className="text-center">
                        <Dices className="h-6 w-6 mx-auto mb-1 text-violet-400" />
                        <div className="text-white font-bold">{dice.label}</div>
                      </div>
                    </Button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {rollResult && (
                    <motion.div
                      key={rollResult.total}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="bg-gradient-to-br from-violet-900/30 to-purple-900/30 border-2 border-violet-500 rounded-xl p-6 text-center"
                    >
                      <div className="text-sm text-violet-400 mb-2">{rollResult.dice}</div>
                      <div className="text-5xl font-bold text-white mb-2">{rollResult.total}</div>
                      {rollResult.rolls.length > 1 && (
                        <div className="text-sm text-slate-400">
                          Rolls: {rollResult.rolls.join(' + ')}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quests">
            {campaign ? (
              <QuestTracker 
                quests={campaign.quests || []} 
                onUpdate={(quests) => updateCampaign.mutate({ quests })}
              />
            ) : (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="py-12 text-center">
                  <ScrollText className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                  <p className="text-slate-400">Select a campaign to manage quests</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="arcs">
            {campaign ? (
              <StoryArcTracker 
                storyArcs={campaign.story_arcs || []} 
                onUpdate={(story_arcs) => updateCampaign.mutate({ story_arcs })}
              />
            ) : (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="py-12 text-center">
                  <Milestone className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                  <p className="text-slate-400">Select a campaign to manage story arcs</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="events">
            {campaign ? (
              <WorldEventsManager 
                campaign={campaign}
                onUpdate={(data) => updateCampaign.mutate(data)}
              />
            ) : (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="py-12 text-center">
                  <Globe className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                  <p className="text-slate-400">Select a campaign to manage world events</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="world">
            {campaign ? (
              <WorldBuilder 
                campaign={campaign}
                onUpdate={(data) => updateCampaign.mutate(data)}
              />
            ) : (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="py-12 text-center">
                  <Map className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                  <p className="text-slate-400">Select a campaign to build the world</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="npc">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                <p className="text-slate-400">NPC Generator - Coming Soon</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="loot">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="py-12 text-center">
                <Scroll className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                <p className="text-slate-400">Loot Generator - Coming Soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}