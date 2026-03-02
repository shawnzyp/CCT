import React, { useState } from 'react';
import PageWrapper from '@/components/utils/PageWrapper';
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
import { Shield, Lock, Unlock, Dices, Users, Scroll, Zap, Eye, ScrollText, Milestone, Globe, Map, Settings, Swords, TrendingUp, Award, Cog } from 'lucide-react';
import QuestTracker from '@/components/campaign/QuestTracker';
import StoryArcTracker from '@/components/campaign/StoryArcTracker';
import WorldEventsManager from '@/components/campaign/WorldEventsManager';
import WorldBuilder from '@/components/campaign/WorldBuilder';
import NPCGenerator from '@/components/dm/NPCGenerator';
import LootGenerator from '@/components/dm/LootGenerator';
import PINSettings from '@/components/dm/PINSettings';
import AchievementsManager from '@/components/dm/AchievementsManager';
import GameSettings from '@/components/dm/GameSettings';
import CombatTracker from '@/components/combat/CombatTracker';

export default function DMTools() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [rollResult, setRollResult] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [currentPIN, setCurrentPIN] = useState(() => localStorage.getItem('dm_pin') || '1234');
  const [showPINSettings, setShowPINSettings] = useState(false);
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
    if (pin === currentPIN) {
      setIsAuthenticated(true);
      setError('');
      setPin('');
    } else {
      setError('Invalid PIN. Try again.');
      setPin('');
    }
  };

  const handlePINChange = (newPIN) => {
    setCurrentPIN(newPIN);
    localStorage.setItem('dm_pin', newPIN);
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
      <PageWrapper className="flex items-center justify-center px-4">
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
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
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
          <div className="flex items-center gap-2">
            <Badge className="bg-green-500/20 text-green-400 border-green-500">
              <Eye className="h-3 w-3 mr-1" />
              Authenticated
            </Badge>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setShowPINSettings(true)}
              className="gap-2"
            >
              <Settings className="h-3 w-3" />
              Change PIN
            </Button>
          </div>
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

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-slate-800/50 border border-slate-700 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-1 p-1 h-auto">
            <TabsTrigger value="overview" className="data-[state=active]:bg-violet-500/20">
              <Shield className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="combat" className="data-[state=active]:bg-violet-500/20" disabled={!selectedCampaign}>
              <Swords className="h-4 w-4 mr-2" />
              Combat
            </TabsTrigger>
            <TabsTrigger value="quests" className="data-[state=active]:bg-violet-500/20" disabled={!selectedCampaign}>
              <ScrollText className="h-4 w-4 mr-2" />
              Quests
            </TabsTrigger>
            <TabsTrigger value="world" className="data-[state=active]:bg-violet-500/20" disabled={!selectedCampaign}>
              <Map className="h-4 w-4 mr-2" />
              World
            </TabsTrigger>
            <TabsTrigger value="generators" className="data-[state=active]:bg-violet-500/20">
              <Zap className="h-4 w-4 mr-2" />
              Generators
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-violet-500/20" disabled={!selectedCampaign}>
              <Cog className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Dices className="h-5 w-5 text-violet-400" />
                    Quick Dice Roller
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-4 gap-2">
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
                        size="sm"
                        className="border-violet-500/50 hover:bg-violet-500/20 text-white"
                      >
                        {dice.label}
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
                        className="bg-gradient-to-br from-violet-900/30 to-purple-900/30 border border-violet-500 rounded-lg p-4 text-center"
                      >
                        <div className="text-xs text-violet-400 mb-1">{rollResult.dice}</div>
                        <div className="text-3xl font-bold text-white">{rollResult.total}</div>
                        {rollResult.rolls.length > 1 && (
                          <div className="text-xs text-slate-400 mt-1">
                            {rollResult.rolls.join(' + ')}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>

              {selectedCampaign && campaign && (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-violet-400" />
                      Campaign Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Sessions</span>
                        <Badge className="bg-violet-500/20 text-violet-400">{campaign.session_count || 0}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Quests</span>
                        <Badge className="bg-blue-500/20 text-blue-400">{(campaign.quests || []).length}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Story Arcs</span>
                        <Badge className="bg-purple-500/20 text-purple-400">{(campaign.story_arcs || []).length}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">World Events</span>
                        <Badge className="bg-amber-500/20 text-amber-400">{(campaign.world_events || []).length}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="combat">
            {campaign ? (
              <CombatTracker campaignId={selectedCampaign} />
            ) : (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="py-12 text-center">
                  <Swords className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                  <p className="text-slate-400">Select a campaign to manage combat</p>
                </CardContent>
              </Card>
            )}
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

          <TabsContent value="world">
            {campaign ? (
              <Tabs defaultValue="locations" className="space-y-4">
                <TabsList className="bg-slate-700/50">
                  <TabsTrigger value="locations">Locations</TabsTrigger>
                  <TabsTrigger value="npcs">NPCs</TabsTrigger>
                  <TabsTrigger value="events">Events</TabsTrigger>
                  <TabsTrigger value="arcs">Story Arcs</TabsTrigger>
                </TabsList>
                <TabsContent value="locations">
                  <WorldBuilder 
                    campaign={campaign}
                    onUpdate={(data) => updateCampaign.mutate(data)}
                  />
                </TabsContent>
                <TabsContent value="npcs">
                  <WorldBuilder 
                    campaign={campaign}
                    onUpdate={(data) => updateCampaign.mutate(data)}
                  />
                </TabsContent>
                <TabsContent value="events">
                  <WorldEventsManager 
                    campaign={campaign}
                    onUpdate={(data) => updateCampaign.mutate(data)}
                  />
                </TabsContent>
                <TabsContent value="arcs">
                  <StoryArcTracker 
                    storyArcs={campaign.story_arcs || []} 
                    onUpdate={(story_arcs) => updateCampaign.mutate({ story_arcs })}
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="py-12 text-center">
                  <Map className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                  <p className="text-slate-400">Select a campaign to manage world content</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="generators">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <NPCGenerator />
              </div>
              <div>
                <LootGenerator />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            {campaign ? (
              <div className="space-y-4">
                <GameSettings 
                  campaign={campaign}
                  onUpdate={(data) => updateCampaign.mutate(data)}
                />
                <AchievementsManager 
                  campaign={campaign}
                  onUpdate={(data) => updateCampaign.mutate(data)}
                />
              </div>
            ) : (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="py-12 text-center">
                  <Cog className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                  <p className="text-slate-400">Select a campaign to manage settings</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <PINSettings 
          currentPIN={currentPIN}
          onPINChange={handlePINChange}
          open={showPINSettings}
          onOpenChange={setShowPINSettings}
        />
      </div>
    </PageWrapper>
  );
}