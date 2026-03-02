import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Users, Sparkles, Plus, Eye, EyeOff, Trash2, Edit, FileText, Loader2, Zap, Swords, Heart, BookOpen, Radio } from "lucide-react";
import { base44 } from '@/api/base44Client';
import { toast } from "sonner";
import useSoundEffects from '@/components/sounds/useSoundEffects';
import DeckOfFatesDeployment from './DeckOfFatesDeployment';
import NPCRelationshipManager from './NPCRelationshipManager';
import AdventureModuleDeployment from './AdventureModuleDeployment';
import ShardsOfManyFates from './ShardsOfManyFates';
import PINSettings from '../dm/PINSettings';
import EchoEventsDeployment from './EchoEventsDeployment';
import GameSettings from '../dm/GameSettings';
import AchievementsManager from '../dm/AchievementsManager';
import { Shield, DollarSign, Settings as SettingsIcon, Trophy } from 'lucide-react';
import CampaignEconomyPanel from '../economy/CampaignEconomyPanel';

export default function GMToolsPanel({ campaign, characters, onUpdate }) {
  const [npcs, setNpcs] = useState(campaign.gm_npcs || []);
  const [gmNotes, setGmNotes] = useState(campaign.gm_notes || '');
  const [showNPCDialog, setShowNPCDialog] = useState(false);
  const [editingNPC, setEditingNPC] = useState(null);
  const [generating, setGenerating] = useState(false);
  const { play } = useSoundEffects();
  const [showPINSettings, setShowPINSettings] = useState(false);
  const [currentPIN, setCurrentPIN] = useState(localStorage.getItem('dm_pin') || '0000');

  const [npcForm, setNpcForm] = useState({
    name: '',
    alias: '',
    role: '',
    personality: '',
    appearance: '',
    motivation: '',
    relationship: '',
    stats: {
      hp: 50,
      tc: 12,
      initiative_mod: 0
    },
    abilities: '',
    secret: '',
    visible_to_players: false
  });

  const resetNPCForm = () => {
    setNpcForm({
      name: '',
      alias: '',
      role: '',
      personality: '',
      appearance: '',
      motivation: '',
      relationship: '',
      stats: { hp: 50, tc: 12, initiative_mod: 0 },
      abilities: '',
      secret: '',
      visible_to_players: false
    });
    setEditingNPC(null);
  };

  const saveNPC = () => {
    let updatedNPCs;
    if (editingNPC) {
      updatedNPCs = npcs.map(n => n.id === editingNPC.id ? { ...npcForm, id: editingNPC.id } : n);
    } else {
      const newNPC = { ...npcForm, id: `npc_${Date.now()}` };
      updatedNPCs = [...npcs, newNPC];
    }
    
    setNpcs(updatedNPCs);
    onUpdate({ gm_npcs: updatedNPCs });
    setShowNPCDialog(false);
    resetNPCForm();
    play('success', 0.3);
    toast.success(editingNPC ? 'NPC updated' : 'NPC created');
  };

  const deleteNPC = (id) => {
    const updatedNPCs = npcs.filter(n => n.id !== id);
    setNpcs(updatedNPCs);
    onUpdate({ gm_npcs: updatedNPCs });
    play('error', 0.2);
    toast.success('NPC deleted');
  };

  const toggleNPCVisibility = (id) => {
    const updatedNPCs = npcs.map(n => 
      n.id === id ? { ...n, visible_to_players: !n.visible_to_players } : n
    );
    setNpcs(updatedNPCs);
    onUpdate({ gm_npcs: updatedNPCs });
    play('click', 0.1);
  };

  const editNPC = (npc) => {
    setNpcForm(npc);
    setEditingNPC(npc);
    setShowNPCDialog(true);
  };

  const generateNPC = async () => {
    setGenerating(true);
    try {
      const context = {
        campaign_name: campaign.name,
        campaign_description: campaign.description,
        existing_npcs: npcs.map(n => n.name).join(', '),
        recent_events: campaign.world_events?.slice(-3).map(e => e.name).join(', ')
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a compelling NPC for the campaign "${context.campaign_name}".
        
Campaign context: ${context.campaign_description || 'superhero campaign'}
Existing NPCs: ${context.existing_npcs || 'none'}
Recent events: ${context.recent_events || 'none'}

Create an NPC that fits this campaign with:
- Name and alias (if powered/vigilante)
- Role/occupation
- Personality traits (2-3 sentences)
- Physical appearance
- Motivation and goals
- Relationship to heroes/campaign
- Notable abilities or resources
- A compelling secret or hook
- Basic combat stats (HP: 30-80, TC: 10-16, Initiative: -2 to +4)`,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            alias: { type: "string" },
            role: { type: "string" },
            personality: { type: "string" },
            appearance: { type: "string" },
            motivation: { type: "string" },
            relationship: { type: "string" },
            abilities: { type: "string" },
            secret: { type: "string" },
            hp: { type: "number" },
            tc: { type: "number" },
            initiative_mod: { type: "number" }
          }
        }
      });

      setNpcForm({
        name: result.name,
        alias: result.alias || '',
        role: result.role,
        personality: result.personality,
        appearance: result.appearance,
        motivation: result.motivation,
        relationship: result.relationship,
        stats: {
          hp: result.hp,
          tc: result.tc,
          initiative_mod: result.initiative_mod
        },
        abilities: result.abilities,
        secret: result.secret,
        visible_to_players: false
      });
      
      setShowNPCDialog(true);
      play('success', 0.3);
      toast.success('NPC generated!');
    } catch (error) {
      toast.error('Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const generateEncounter = async () => {
    setGenerating(true);
    try {
      const context = {
        campaign_name: campaign.name,
        characters_count: campaign.characters?.length || 0,
        recent_events: campaign.world_events?.slice(-3).map(e => e.name).join(', '),
        active_quests: campaign.quests?.filter(q => q.status === 'active').map(q => q.title).join(', ')
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a random encounter or plot hook for "${context.campaign_name}".
        
Campaign context:
- Party size: ${context.characters_count} heroes
- Recent events: ${context.recent_events || 'none'}
- Active quests: ${context.active_quests || 'none'}

Create an encounter with:
- Title/name
- Setup/description (what the heroes encounter)
- 2-3 complications or challenges
- Possible outcomes
- Connections to ongoing story (if relevant)
- Suggested difficulty tier (0-5)`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            complications: { type: "array", items: { type: "string" } },
            outcomes: { type: "array", items: { type: "string" } },
            story_connections: { type: "string" },
            difficulty: { type: "number" }
          }
        }
      });

      // Add to GM notes
      const encounterText = `\n\n=== GENERATED ENCOUNTER: ${result.title} ===
Difficulty: Tier ${result.difficulty}

${result.description}

COMPLICATIONS:
${result.complications.map((c, i) => `${i + 1}. ${c}`).join('\n')}

POSSIBLE OUTCOMES:
${result.outcomes.map((o, i) => `${i + 1}. ${o}`).join('\n')}

STORY CONNECTIONS:
${result.story_connections}

Generated: ${new Date().toLocaleString()}
===`;

      const updatedNotes = gmNotes + encounterText;
      setGmNotes(updatedNotes);
      onUpdate({ gm_notes: updatedNotes });
      play('success', 0.3);
      toast.success('Encounter added to notes!');
    } catch (error) {
      toast.error('Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const saveNotes = () => {
    onUpdate({ gm_notes: gmNotes });
    play('click', 0.1);
    toast.success('Notes saved');
  };

  const handlePINChange = (newPIN) => {
    setCurrentPIN(newPIN);
    localStorage.setItem('dm_pin', newPIN);
  };

  const handleCreditsAdjust = async (charId, currentCredits, charName) => {
    const amount = prompt('Credits to add/subtract (negative to subtract):');
    if (amount) {
      const newCredits = (currentCredits || 0) + parseInt(amount);
      await base44.entities.Character.update(charId, { credits: Math.max(0, newCredits) });
      toast.success(`Updated ${charName}'s credits`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap mb-4">
        <Button
          onClick={() => setShowPINSettings(true)}
          variant="outline"
          size="sm"
          className="border-violet-500/30 text-violet-400 hover:bg-violet-500/20"
        >
          <Shield className="h-4 w-4 mr-2" />
          Change PIN
        </Button>
      </div>

      <Tabs defaultValue="npcs" className="w-full">
        <TabsList className="bg-slate-800 border border-slate-700 grid grid-cols-5 md:grid-cols-10 w-full gap-1 p-1">
          <TabsTrigger value="npcs" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-slate-300 text-xs">
            <Users className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="relationships" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-slate-300 text-xs">
            <Heart className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="encounters" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-slate-300 text-xs">
            <Swords className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="adventures" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-slate-300 text-xs">
            <BookOpen className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="deck" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-slate-300 text-xs">
            <Sparkles className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="shards" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-slate-300 text-xs">
            <Zap className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="echo" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-slate-300 text-xs">
            <Radio className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="achievements" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-slate-300 text-xs">
            <Trophy className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="credits" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-slate-300 text-xs">
            <DollarSign className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-slate-300 text-xs">
            <SettingsIcon className="h-4 w-4" />
          </TabsTrigger>
        </TabsList>

        {/* NPCs Tab */}
        <TabsContent value="npcs" className="space-y-3">
          <div className="flex gap-2">
            <Button
              onClick={() => {
                resetNPCForm();
                setShowNPCDialog(true);
              }}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add NPC
            </Button>
            <Button
              onClick={generateNPC}
              disabled={generating}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Generate NPC
            </Button>
          </div>

          <ScrollArea className="h-[600px]">
            {npcs.length > 0 ? (
              <div className="space-y-3">
                {npcs.map((npc) => (
                  <Card key={npc.id} className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-white text-lg flex items-center gap-2">
                            {npc.name}
                            {npc.alias && <span className="text-violet-400 text-base">({npc.alias})</span>}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">{npc.role}</Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleNPCVisibility(npc.id)}
                              className={cn(
                                "h-6 px-2 text-xs",
                                npc.visible_to_players ? "text-green-400" : "text-slate-500"
                              )}
                            >
                              {npc.visible_to_players ? (
                                <><Eye className="h-3 w-3 mr-1" />Visible</>
                              ) : (
                                <><EyeOff className="h-3 w-3 mr-1" />Hidden</>
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => editNPC(npc)}
                            className="text-slate-400 hover:text-white"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteNPC(npc.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      {/* Stats */}
                      <div className="flex gap-4 p-2 bg-slate-900/50 rounded">
                        <div>
                          <span className="text-slate-400 text-xs">HP:</span>
                          <span className="text-white ml-1 font-mono">{npc.stats?.hp || 50}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-xs">TC:</span>
                          <span className="text-white ml-1 font-mono">{npc.stats?.tc || 12}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-xs">Initiative:</span>
                          <span className="text-white ml-1 font-mono">
                            {npc.stats?.initiative_mod >= 0 ? '+' : ''}{npc.stats?.initiative_mod || 0}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 uppercase text-xs">Personality:</span>
                        <p className="text-slate-300 mt-1">{npc.personality}</p>
                      </div>

                      {npc.appearance && (
                        <div>
                          <span className="text-slate-400 uppercase text-xs">Appearance:</span>
                          <p className="text-slate-300 mt-1">{npc.appearance}</p>
                        </div>
                      )}

                      {npc.motivation && (
                        <div>
                          <span className="text-slate-400 uppercase text-xs">Motivation:</span>
                          <p className="text-slate-300 mt-1">{npc.motivation}</p>
                        </div>
                      )}

                      {npc.abilities && (
                        <div>
                          <span className="text-slate-400 uppercase text-xs">Abilities:</span>
                          <p className="text-slate-300 mt-1">{npc.abilities}</p>
                        </div>
                      )}

                      {npc.secret && (
                        <div className="p-2 bg-red-900/20 border border-red-600/30 rounded">
                          <span className="text-red-400 uppercase text-xs flex items-center gap-1">
                            <EyeOff className="h-3 w-3" />
                            Secret:
                          </span>
                          <p className="text-slate-300 mt-1 text-xs">{npc.secret}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="py-12 text-center">
                  <Users className="h-16 w-16 mx-auto text-slate-600 mb-4" />
                  <p className="text-slate-400">No NPCs created yet</p>
                </CardContent>
              </Card>
            )}
          </ScrollArea>
        </TabsContent>

        {/* Relationships Tab */}
        <TabsContent value="relationships" className="space-y-3">
          <NPCRelationshipManager
            campaign={campaign}
            characters={characters}
            onUpdate={onUpdate}
          />
        </TabsContent>

        {/* Adventures Tab */}
        <TabsContent value="adventures" className="space-y-3">
          <AdventureModuleDeployment 
            campaign={campaign}
            onUpdate={onUpdate}
          />
        </TabsContent>

        {/* Encounters Tab */}
        <TabsContent value="encounters" className="space-y-3">
          <Button
            onClick={generateEncounter}
            disabled={generating}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white"
          >
            {generating ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</>
            ) : (
              <><Zap className="h-4 w-4 mr-2" />Generate Random Encounter</>
            )}
          </Button>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">Encounter Generator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <p>
                Generate random encounters and plot hooks based on your campaign context.
                Generated encounters will be added to your GM Notes below.
              </p>
              <div className="p-3 bg-violet-900/20 border border-violet-500/30 rounded">
                <p className="text-xs text-violet-300">
                  The generator considers your campaign's active quests, recent events,
                  and party composition to create relevant encounters.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deck Tab */}
        <TabsContent value="deck" className="space-y-3">
          <DeckOfFatesDeployment 
            campaign={campaign}
            characters={characters}
            onUpdate={onUpdate}
          />
        </TabsContent>

        {/* Shards Tab */}
        <TabsContent value="shards" className="space-y-3">
          <ShardsOfManyFates
            campaign={campaign}
            onUpdate={onUpdate}
            characterName="GM"
            isGM={true}
          />
        </TabsContent>

        {/* Echo Events Tab */}
        <TabsContent value="echo" className="space-y-3">
          <EchoEventsDeployment
            campaign={campaign}
            onUpdate={onUpdate}
          />
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-3">
          <AchievementsManager
            campaign={campaign}
            characters={characters}
            onUpdate={onUpdate}
          />
        </TabsContent>

        {/* Credits/Economy Tab */}
        <TabsContent value="credits" className="space-y-3">
          <CampaignEconomyPanel
            campaign={campaign}
            characters={characters}
            onUpdate={onUpdate}
          />
        </TabsContent>

        {/* GM Notes Tab */}
        <TabsContent value="notes" className="space-y-3">
          <Card className="bg-slate-800 border-2 border-red-600/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <EyeOff className="h-5 w-5 text-red-400" />
                Private GM Notes
              </CardTitle>
              <p className="text-xs text-slate-400">Only visible to you - players cannot see this</p>
            </CardHeader>
            <CardContent>
              <Textarea
                value={gmNotes}
                onChange={(e) => setGmNotes(e.target.value)}
                placeholder="Campaign secrets, plot twists, NPC motivations, future encounters..."
                className="bg-slate-900 border-slate-700 text-white min-h-[400px] font-mono text-sm"
              />
              <Button
                onClick={saveNotes}
                className="mt-3 w-full bg-violet-600 hover:bg-violet-700"
              >
                Save Notes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-3">
          <GameSettings
            campaign={campaign}
            onUpdate={onUpdate}
          />
        </TabsContent>
      </Tabs>

      {/* NPC Dialog */}
      <Dialog open={showNPCDialog} onOpenChange={setShowNPCDialog}>
        <DialogContent className="bg-slate-900 border-2 border-violet-500 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-violet-400">
              {editingNPC ? 'Edit NPC' : 'Create NPC'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 uppercase">Name *</label>
                <Input
                  value={npcForm.name}
                  onChange={(e) => setNpcForm({ ...npcForm, name: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase">Alias</label>
                <Input
                  value={npcForm.alias}
                  onChange={(e) => setNpcForm({ ...npcForm, alias: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white"
                  placeholder="e.g., The Shadow"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase">Role/Occupation *</label>
              <Input
                value={npcForm.role}
                onChange={(e) => setNpcForm({ ...npcForm, role: e.target.value })}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-slate-400 uppercase">HP</label>
                <Input
                  type="number"
                  value={npcForm.stats.hp}
                  onChange={(e) => setNpcForm({ ...npcForm, stats: { ...npcForm.stats, hp: parseInt(e.target.value) } })}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase">TC</label>
                <Input
                  type="number"
                  value={npcForm.stats.tc}
                  onChange={(e) => setNpcForm({ ...npcForm, stats: { ...npcForm.stats, tc: parseInt(e.target.value) } })}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase">Initiative</label>
                <Input
                  type="number"
                  value={npcForm.stats.initiative_mod}
                  onChange={(e) => setNpcForm({ ...npcForm, stats: { ...npcForm.stats, initiative_mod: parseInt(e.target.value) } })}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase">Personality</label>
              <Textarea
                value={npcForm.personality}
                onChange={(e) => setNpcForm({ ...npcForm, personality: e.target.value })}
                className="bg-slate-800 border-slate-600 text-white h-20"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase">Appearance</label>
              <Textarea
                value={npcForm.appearance}
                onChange={(e) => setNpcForm({ ...npcForm, appearance: e.target.value })}
                className="bg-slate-800 border-slate-600 text-white h-20"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase">Motivation</label>
              <Textarea
                value={npcForm.motivation}
                onChange={(e) => setNpcForm({ ...npcForm, motivation: e.target.value })}
                className="bg-slate-800 border-slate-600 text-white h-20"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase">Abilities/Resources</label>
              <Textarea
                value={npcForm.abilities}
                onChange={(e) => setNpcForm({ ...npcForm, abilities: e.target.value })}
                className="bg-slate-800 border-slate-600 text-white h-20"
              />
            </div>

            <div>
              <label className="text-xs text-red-400 uppercase flex items-center gap-1">
                <EyeOff className="h-3 w-3" />
                Secret/Hook (GM Only)
              </label>
              <Textarea
                value={npcForm.secret}
                onChange={(e) => setNpcForm({ ...npcForm, secret: e.target.value })}
                className="bg-slate-800 border-red-600/50 text-white h-20"
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-slate-800 rounded">
              <input
                type="checkbox"
                checked={npcForm.visible_to_players}
                onChange={(e) => setNpcForm({ ...npcForm, visible_to_players: e.target.checked })}
                className="w-4 h-4"
              />
              <label className="text-sm text-slate-300">Make visible to players</label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => setShowNPCDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={saveNPC}
                disabled={!npcForm.name || !npcForm.role}
                className="flex-1 bg-violet-600 hover:bg-violet-700"
              >
                {editingNPC ? 'Update' : 'Create'} NPC
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <PINSettings
        currentPIN={currentPIN}
        onPINChange={handlePINChange}
        open={showPINSettings}
        onOpenChange={setShowPINSettings}
      />
    </div>
  );
}