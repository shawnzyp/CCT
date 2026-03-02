import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BookOpen, Shield, Zap, Swords, Users, AlertCircle, Download, FileText } from "lucide-react";
import AskAIButton from "@/components/aegis/AskAIButton";

export default function Rules() {
  const [activeTab, setActiveTab] = useState('rulebook');
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Catalyst Core Rules</h1>
            <p className="text-slate-400">Complete game mechanics reference</p>
          </div>
        </div>

        <Tabs value={activeTab} className="space-y-4">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rulebook">📖 Player Guide</SelectItem>
              <SelectItem value="creation">✨ Character Creation</SelectItem>
              <SelectItem value="combat">⚔️ Combat</SelectItem>
              <SelectItem value="powers">⚡ Powers & SP</SelectItem>
              <SelectItem value="elements">🔥 Elements</SelectItem>
              <SelectItem value="downtime">💤 Downtime</SelectItem>
              <SelectItem value="glossary">📚 Glossary</SelectItem>
            </SelectContent>
          </Select>

          <TabsContent value="rulebook" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-violet-400" />
                  Catalyst Core Player Guide
                </CardTitle>
                <p className="text-sm text-slate-400">Complete guide to gameplay, lore, character creation, and campaign references</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-violet-900/20 border border-violet-500/30 rounded-lg p-6 text-center">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-violet-400" />
                  <h3 className="text-xl font-bold text-white mb-2">Official Rulebook PDF</h3>
                  <p className="text-slate-400 mb-4">
                    Complete 93-page guide covering Earth-9 lore, character creation, combat mechanics, 
                    factions, global systems, and campaign references.
                  </p>
                  <a
                    href="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696d1e71c654a257ffdf4599/6f77e7c82_Catalyst_Core_Player_Guide.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    download="Catalyst_Core_Player_Guide.pdf"
                  >
                    <Button className="bg-violet-600 hover:bg-violet-700 gap-2">
                      <Download className="h-4 w-4" />
                      Download PDF
                    </Button>
                  </a>
                  <a
                    href="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696d1e71c654a257ffdf4599/6f77e7c82_Catalyst_Core_Player_Guide.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2"
                  >
                    <Button variant="outline" className="gap-2">
                      <FileText className="h-4 w-4" />
                      View in Browser
                    </Button>
                  </a>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-3">Table of Contents</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {[
                      'Ch 1-3: Welcome to Earth-9 & Creation Checklist',
                      'Ch 4-6: The Catalyst Event & Powers',
                      'Ch 7-9: A Decade of Change & NYC 2036',
                      'Ch 10-12: Factions & Global Reactions',
                      'Ch 13-16: Themes, Advancement & The Big Question',
                      'Ch 17-24: Americas, Europe, Africa, Asia & 2036',
                      'Ch 25-27: Core System & Character Creation',
                      'Ch 28-30: Augments, Mechanics & Levels',
                      'Ch 31: Complete Gear & Equipment',
                      'Ch 32: Speeches, Handouts & Character Sheets'
                    ].map((chapter, i) => (
                      <div key={i} className="flex items-start gap-2 text-slate-400">
                        <span className="text-violet-400">•</span>
                        {chapter}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="creation" className="space-y-4">
            {/* Classification */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">Step 1: Classification <AskAIButton prompt="Explain the Classification system in Catalyst Core — what does each classification mean mechanically and what perk does it grant?" /></CardTitle>
                <p className="text-sm text-slate-400">Choose how you received your powers</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'Mutant', perk: 'Reroll one failed saving throw per long rest' },
                  { name: 'Enhanced Human', perk: 'Gain advantage on all Technology-related checks' },
                  { name: 'Magic User', perk: 'Cast one minor magical effect (prestidigitation) per long rest' },
                  { name: 'Alien/Extraterrestrial', perk: 'Immune to environmental hazard and no penalty to movement in rough terrain' },
                  { name: 'Mystical Being', perk: '+2 to Persuasion or Intimidation checks' }
                ].map(c => (
                  <div key={c.name} className="bg-slate-700/50 rounded-lg p-3">
                    <div className="font-semibold text-white mb-1">{c.name}</div>
                    <div className="text-sm text-slate-400">{c.perk}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Power Styles */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">Step 2: Power Styles (Up to 2) <AskAIButton prompt="Explain the Power Styles in Catalyst Core — how do primary vs secondary power styles work and what are good combos?" /></CardTitle>
                <p className="text-sm text-slate-400">Choose your superpowers (only one grants perk)</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'Physical Powerhouse', perk: 'Cut one attack by half once per combat encounter' },
                  { name: 'Energy Manipulator', perk: 'Reroll 1s once per turn' },
                  { name: 'Speedster', perk: '+10 ft movement and +1 TC while moving 20+ ft' },
                  { name: 'Telekinetic/Psychic', perk: 'Force enemies to reroll all rolls above 17 once per rest' },
                  { name: 'Illusionist', perk: 'Create a 1-min decoy illusion once per combat encounter' },
                  { name: 'Shape-shifter', perk: 'Advantage on Deception, disguise freely' },
                  { name: 'Elemental Controller', perk: '+2 to hit and +5 to damage once per turn when using elemental powers' }
                ].map(p => (
                  <div key={p.name} className="bg-slate-700/50 rounded-lg p-3">
                    <div className="font-semibold text-white mb-1">{p.name}</div>
                    <div className="text-sm text-slate-400">{p.perk}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Origin Stories */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">Step 3: Origin Story <AskAIButton prompt="Explain Origin Stories in Catalyst Core and which origins are best for different playstyles." /></CardTitle>
                <p className="text-sm text-slate-400">What influenced you becoming a vigilante</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'The Accident', perk: 'Resistance to one damage type' },
                  { name: 'The Experiment', perk: 'Reroll a failed CON or INT save once per long rest' },
                  { name: 'The Legacy', perk: 'Use the powers of one other character once per long rest' },
                  { name: 'The Awakening', perk: '+5 to hit and +10 to damage when below ½ HP' },
                  { name: 'The Pact', perk: 'Auto-success on one save or +10 to any roll once per long rest' },
                  { name: 'The Lost Time', perk: 'Roll d20 (DC 17) to declare "Skill Move" - no SP cost, +1d6 bonus' },
                  { name: 'The Exposure', perk: '+5 elemental damage once per round' },
                  { name: 'The Rebirth', perk: 'If knocked out, stand up with 1 HP and resistance to all damage for 1 round' },
                  { name: 'The Vigil', perk: 'Create shield reducing incoming damage to zero for all allies for one turn' },
                  { name: 'The Redemption', perk: 'Take damage for ally within movement range, they heal 1d6 HP' }
                ].map(o => (
                  <div key={o.name} className="bg-slate-700/50 rounded-lg p-3">
                    <div className="font-semibold text-white mb-1">{o.name}</div>
                    <div className="text-sm text-slate-400">{o.perk}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Ability Scores */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Step 4: Ability Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-slate-300 space-y-2">
                  <p><strong className="text-white">Method:</strong> Roll 7d20, drop the lowest</p>
                  <p><strong className="text-white">Abilities:</strong> STR, DEX, CON, INT, WIS, CHA</p>
                </div>
              </CardContent>
            </Card>

            {/* HP & TC */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Step 5-6: HP & Toughness Class</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-white font-semibold mb-2">Hit Points (HP)</div>
                  <p className="text-slate-300 mb-3">HP = 30 + CON Modifier + (Tier Bonus × 1d10)</p>
                  <div className="space-y-2">
                    {[
                      { tier: 5, name: 'Rookie', bonus: '+1d10', example: '33-42 HP' },
                      { tier: 4, name: 'Emerging Vigilante', bonus: '+2d10', example: '34-52 HP' },
                      { tier: 3, name: 'Field-Tested Operative', bonus: '+3d10', example: '37-62 HP' },
                      { tier: 2, name: 'Respected Force', bonus: '+4d10', example: '40-72 HP' },
                      { tier: 1, name: 'Heroic Figure', bonus: '+5d10', example: '43-82 HP' },
                      { tier: 0, name: 'Transcendent/Legendary', bonus: '+100 fixed', example: '102 HP (no roll)' }
                    ].map(t => (
                      <div key={t.tier} className="flex items-center justify-between bg-slate-700/30 rounded px-3 py-2 text-sm">
                        <span className="text-slate-300">Tier {t.tier}: {t.name}</span>
                        <span className="text-violet-400">{t.bonus}</span>
                        <span className="text-slate-500">{t.example}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="text-white font-semibold mb-2">Toughness Class (TC)</div>
                  <p className="text-slate-300">TC = 10 + DEX Modifier + Armor/Shield Bonuses + Power/Origin Bonuses</p>
                </div>

                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                  <div className="text-red-400 font-semibold mb-2">If HP Hits 0</div>
                  <p className="text-slate-300 text-sm">Make 3 CON Saves (DC 13)</p>
                  <ul className="text-sm text-slate-400 mt-2 space-y-1">
                    <li>• 2/3 success: Stabilize at 1 HP, prone, critical condition</li>
                    <li>• 2/3 fail: Fall unconscious, must be healed or possibly die</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Alignments */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Step 9: Alignment</CardTitle>
                <p className="text-sm text-slate-400">Moral Axis (Light/Neutral/Shadow) + Discipline Axis (Lawful/Neutral/Chaotic)</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'Paragon (Lawful Light)', perk: 'Auto-succeed a Charisma check with civilians/allies once per session' },
                  { name: 'Guardian (Neutral Light)', perk: 'Restore 1d6 HP or 1 SP to ally as bonus action once per session' },
                  { name: 'Vigilante (Chaotic Light)', perk: 'Ignore opportunity attacks when moving toward threat/hostage' },
                  { name: 'Sentinel (Lawful Neutral)', perk: '+1 to all saves when acting on orders/directives' },
                  { name: 'Outsider (True Neutral)', perk: 'Reroll any roll OR remove one condition once per session' },
                  { name: 'Wildcard (Chaotic Neutral)', perk: 'Advantage on Initiative and Deception once per combat' },
                  { name: 'Inquisitor (Lawful Shadow)', perk: 'Deal maximum damage to "criminal" enemies once per session' },
                  { name: 'Anti-Hero (Neutral Shadow)', perk: 'Heal 1d6 HP when defeating enemy while no allies within 10 ft' },
                  { name: 'Renegade (Chaotic Shadow)', perk: '+1d6 damage when attacking from stealth/surprise once per combat' }
                ].map(a => (
                  <div key={a.name} className="bg-slate-700/50 rounded-lg p-3">
                    <div className="font-semibold text-white mb-1">{a.name}</div>
                    <div className="text-sm text-slate-400">{a.perk}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="combat" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <Swords className="h-5 w-5 text-violet-400" />
                  Combat Mechanics
                  <AskAIButton prompt="Walk me through a full combat round in Catalyst Core — initiative, action economy, attacks, and reactions." />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-white font-semibold mb-2">Initiative</div>
                  <p className="text-slate-300">Roll 1d20 + DEX modifier</p>
                </div>

                <div>
                  <div className="text-white font-semibold mb-2">Action Economy</div>
                  <p className="text-slate-300 mb-2">Each turn = 1 Action, 1 Movement, and 1 Reaction (per round)</p>
                  <div className="space-y-2">
                    <div className="bg-slate-700/30 rounded px-3 py-2">
                      <span className="text-violet-400 font-medium">Action:</span>
                      <span className="text-slate-300 ml-2">Main action (attack, power, etc.)</span>
                    </div>
                    <div className="bg-slate-700/30 rounded px-3 py-2">
                      <span className="text-blue-400 font-medium">Movement:</span>
                      <span className="text-slate-300 ml-2">Move up to your speed</span>
                    </div>
                    <div className="bg-slate-700/30 rounded px-3 py-2">
                      <span className="text-emerald-400 font-medium">Bonus Action:</span>
                      <span className="text-slate-300 ml-2">Ready attack/power for next turn (1 per turn)</span>
                    </div>
                    <div className="bg-slate-700/30 rounded px-3 py-2">
                      <span className="text-amber-400 font-medium">Reaction:</span>
                      <span className="text-slate-300 ml-2">Response to trigger (once per round)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-white font-semibold mb-2">Attack Rolls</div>
                  <p className="text-slate-300">Roll 1d20 + relevant modifiers</p>
                </div>

                <div className="bg-amber-900/20 border border-amber-500/50 rounded-lg p-4">
                  <div className="text-amber-400 font-semibold mb-2">Critical Hits</div>
                  <p className="text-slate-300 text-sm">On natural 20, roll all damage dice twice</p>
                </div>

                <div>
                  <div className="text-white font-semibold mb-2">Saving Throws</div>
                  <p className="text-slate-300 mb-2">Roll 1d20 + modifier to resist effects</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-slate-700/30 rounded px-3 py-2">
                      <span className="text-white font-medium">STR:</span>
                      <span className="text-slate-400 ml-1">Grapples, force blasts</span>
                    </div>
                    <div className="bg-slate-700/30 rounded px-3 py-2">
                      <span className="text-white font-medium">DEX:</span>
                      <span className="text-slate-400 ml-1">Lasers, explosions</span>
                    </div>
                    <div className="bg-slate-700/30 rounded px-3 py-2">
                      <span className="text-white font-medium">CON:</span>
                      <span className="text-slate-400 ml-1">Poison, radiation</span>
                    </div>
                    <div className="bg-slate-700/30 rounded px-3 py-2">
                      <span className="text-white font-medium">INT:</span>
                      <span className="text-slate-400 ml-1">Illusions, hacks</span>
                    </div>
                    <div className="bg-slate-700/30 rounded px-3 py-2">
                      <span className="text-white font-medium">WIS:</span>
                      <span className="text-slate-400 ml-1">Psychic pressure</span>
                    </div>
                    <div className="bg-slate-700/30 rounded px-3 py-2">
                      <span className="text-white font-medium">CHA:</span>
                      <span className="text-slate-400 ml-1">Emotional manipulation</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="powers" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <Zap className="h-5 w-5 text-violet-400" />
                  Stamina Points (SP)
                  <AskAIButton prompt="Explain Stamina Points (SP) in Catalyst Core — how they work, SP costs, regeneration, and optimal SP management in combat." />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-violet-900/20 border border-violet-500/50 rounded-lg p-4">
                  <p className="text-white font-semibold mb-2">SP = 5 + CON Modifier</p>
                  <p className="text-slate-300 text-sm">SP fully regenerates at the start of each combat round</p>
                </div>

                <div>
                  <div className="text-white font-semibold mb-3">SP Cost Reference</div>
                  <div className="space-y-2">
                    {[
                      { cost: '1 SP', type: 'Basic attack, minor effect', examples: 'Energy blast, melee strike, shove, trip' },
                      { cost: '2 SP', type: 'Core ability or status effect', examples: 'Firebolt + Burn, Ice Slash + Slow, Force Push' },
                      { cost: '3 SP', type: 'AoE, enhanced status, heal', examples: 'Cone of Lightning, Stun Wave, Group Buff' },
                      { cost: '4 SP', type: 'Strong AoE, hard crowd control', examples: 'Paralyze Zone, Mind Trap, Gravity Crush' },
                      { cost: '5 SP', type: 'Ultimate ability (10-round cooldown)', examples: 'Meteor Storm, Time Freeze, Rebirth, Mass Heal' }
                    ].map(sp => (
                      <div key={sp.cost} className="bg-slate-700/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-violet-500">{sp.cost}</Badge>
                          <span className="text-white font-medium">{sp.type}</span>
                        </div>
                        <div className="text-sm text-slate-400">{sp.examples}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-white font-semibold mb-2">Special SP Costs</div>
                  <div className="space-y-2 text-sm">
                    <div className="bg-slate-700/30 rounded px-3 py-2 text-slate-300">
                      <strong>Boost Roll:</strong> 1 SP – Add +1d4 to any roll
                    </div>
                    <div className="bg-slate-700/30 rounded px-3 py-2 text-slate-300">
                      <strong>Concentrate:</strong> +1 SP/round – Maintain mental powers
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-white font-semibold mb-3">Power Effect Tags</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {[
                      { tag: 'Burn', effect: 'Target takes 1d4 fire damage at start of next turn' },
                      { tag: 'Freeze', effect: 'Reduces movement by 10 ft for 1 round' },
                      { tag: 'Stun', effect: 'Target loses next turn (WIS save to resist)' },
                      { tag: 'Push/Pull', effect: 'Move target 10-20 ft (STR/DEX save)' },
                      { tag: 'Weaken', effect: '–2 to attack rolls for 1 round' },
                      { tag: 'Blind', effect: 'Disadvantage on attacks and Perception (CON save)' },
                      { tag: 'Regen', effect: 'Regain 1d6 SP or HP at end of next 3 turns' },
                      { tag: 'Shield', effect: 'Temporary HP or AC boost until hit' },
                      { tag: 'Phase', effect: 'Teleport short range or avoid attacks' }
                    ].map(e => (
                      <div key={e.tag} className="bg-slate-700/30 rounded px-3 py-2">
                        <span className="text-violet-400 font-medium">{e.tag}:</span>
                        <span className="text-slate-400 ml-1">{e.effect}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="elements" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Elemental Damage Hierarchy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { element: 'Fire', strong: 'Earth, Ice, Shadow', weak: 'Water, Aether', effect: 'Burn, melts cover (1d6 fire)' },
                    { element: 'Water', strong: 'Fire, Catalyst', weak: 'Earth, Lightning', effect: 'Freeze, slick terrain' },
                    { element: 'Earth', strong: 'Lightning, Air', weak: 'Fire, Ice', effect: 'Difficult terrain, barriers' },
                    { element: 'Air', strong: 'Water, Fire', weak: 'Lightning, Shadow', effect: 'Push, disarm flying foes' },
                    { element: 'Lightning', strong: 'Water, Air', weak: 'Earth, Shadow', effect: 'Stun tech, electrify water' },
                    { element: 'Ice', strong: 'Earth, Fire', weak: 'Fire, Energy', effect: 'Speed –10, brittle strikes' },
                    { element: 'Light', strong: 'Shadow, Psychic', weak: 'Void, Corruption', effect: 'Dispel illusion, 1d8 radiant' },
                    { element: 'Shadow', strong: 'Light, Psychic', weak: 'Fire, Light', effect: 'Fear, 1d6 psychic damage' },
                    { element: 'Energy', strong: 'Ice, Water, Light', weak: 'Earth, Aether', effect: '2d6 lightning, disable tech' },
                    { element: 'Psychic', strong: 'Elemental, Tech-based', weak: 'Shadow, Light', effect: 'Disorient, mind-read, 1d6 psychic' },
                    { element: 'Void', strong: 'Light, Energy, Catalyst', weak: 'None', effect: 'Silence zone, nullify, 1d8 true damage' },
                    { element: 'Catalyst', strong: 'Technology, Structure', weak: 'Water, Void', effect: 'Wild surge, corrupt powers' },
                    { element: 'Aether', strong: 'Fire, Lightning, Energy', weak: 'Shadow, Void', effect: 'Phase, time warp, 1d6 force' }
                  ].map(e => (
                    <div key={e.element} className="bg-slate-700/50 rounded-lg p-3">
                      <div className="font-semibold text-white mb-2">{e.element}</div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-emerald-400">Strong vs:</span>
                          <span className="text-slate-400 ml-1">{e.strong}</span>
                        </div>
                        <div>
                          <span className="text-red-400">Weak vs:</span>
                          <span className="text-slate-400 ml-1">{e.weak}</span>
                        </div>
                        <div>
                          <span className="text-violet-400">Effect:</span>
                          <span className="text-slate-400 ml-1">{e.effect}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Resistances & Vulnerabilities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { class: 'Mutant', resistant: 'Radiation, Psychic', vulnerable: 'Necrotic, Force' },
                    { class: 'Enhanced Human', resistant: 'Piercing, Fire', vulnerable: 'Psychic, Radiation' },
                    { class: 'Magic User', resistant: 'Force, Necrotic', vulnerable: 'Confusion, Radiation' },
                    { class: 'Alien/Extraterrestrial', resistant: 'Cold, Acid, Lightning', vulnerable: 'Radiant, Emotion' },
                    { class: 'Mystical Being', resistant: 'Radiant, Psychic', vulnerable: 'Corruption, Radiation' }
                  ].map(r => (
                    <div key={r.class} className="bg-slate-700/50 rounded-lg p-3 text-sm">
                      <div className="text-white font-semibold mb-1">{r.class}</div>
                      <div className="flex gap-4">
                        <div>
                          <span className="text-emerald-400">Resistant:</span>
                          <span className="text-slate-400 ml-1">{r.resistant}</span>
                        </div>
                        <div>
                          <span className="text-red-400">Vulnerable:</span>
                          <span className="text-slate-400 ml-1">{r.vulnerable}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="downtime" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Downtime Activity System</CardTitle>
                <p className="text-sm text-slate-400">Use between missions to pursue side goals or upgrades</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'Media Control', modifier: 'CHA', benefit: 'Improve or damage public trust' },
                  { name: 'Research', modifier: 'INT/WIS', benefit: 'Discover weaknesses in next threat' },
                  { name: 'Train or Tinker', modifier: 'STR/INT', benefit: 'Next session +1 SP or minor upgrade' },
                  { name: 'Gather Intel', modifier: 'CHA/WIS', benefit: 'Learn secrets or avoid traps' },
                  { name: 'Personal Time', modifier: 'WIS/CHA', benefit: 'Refresh mind; reroll one save next session' }
                ].map(d => (
                  <div key={d.name} className="bg-slate-700/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white">{d.name}</span>
                      <Badge variant="outline" className="text-xs">{d.modifier}</Badge>
                    </div>
                    <div className="text-sm text-slate-400">{d.benefit}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Cinematic Action Points</CardTitle>
                <p className="text-sm text-slate-400">One per session - heroic moments</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400">•</span>
                    Automatically succeed on a roll
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400">•</span>
                    Interrupt initiative order
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400">•</span>
                    Use a flashback to gain +5 to a roll
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400">•</span>
                    Redirect damage or rescue an ally at the last second
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="glossary" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Game Mechanics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <div className="font-semibold text-white mb-1">SP (Stamina Points)</div>
                    <div className="text-sm text-slate-400">A resource used to fuel powers and abilities. Regenerates fully at the start of each combat round. SP = 5 + your Constitution modifier.</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <div className="font-semibold text-white mb-1">SP Cost</div>
                    <div className="text-sm text-slate-400">The number of SP required to use a power. Ranges from 1 (basic attack) to 5 (ultimate power).</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <div className="font-semibold text-white mb-1">Combat Encounter</div>
                    <div className="text-sm text-slate-400">A structured battle or skirmish where turn order and power use is tracked.</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <div className="font-semibold text-white mb-1">Per Session / Per Long Rest</div>
                    <div className="text-sm text-slate-400">An ability or perk that may be used once during a full play session (not per combat).</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <div className="font-semibold text-white mb-1">Cooldown</div>
                    <div className="text-sm text-slate-400">The number of rounds that must pass before a specific power can be used again (e.g., 10-turn cooldown for 5 SP powers).</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Combat Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="font-semibold text-white mb-1">Reaction</div>
                  <div className="text-sm text-slate-400">An action taken outside your turn, usually in response to a trigger (e.g., being hit).</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="font-semibold text-white mb-1">Initiative</div>
                  <div className="text-sm text-slate-400">The order of turns in combat, determined by rolling 1d20 + DEX modifier.</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="font-semibold text-white mb-1">Critical Hit</div>
                  <div className="text-sm text-slate-400">Roll a natural 20 on an attack. Double the damage dice.</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="font-semibold text-white mb-1">Area of Effect (AoE)</div>
                  <div className="text-sm text-slate-400">A power that targets multiple enemies in a specific area (cone, line, radius).</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Power Mechanics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="font-semibold text-white mb-1">Effect Tags</div>
                  <div className="text-sm text-slate-400">Descriptive mechanics attached to powers (e.g., Burn, Stun, Push). Usually require a saving throw.</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="font-semibold text-white mb-1">Saving Throw (Save)</div>
                  <div className="text-sm text-slate-400">A roll (1d20 + modifier) to resist a harmful power or effect. E.g., "WIS Save DC 14" = Roll d20 + WIS modifier and beat 14 to avoid the effect.</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="font-semibold text-white mb-1">Boost Roll</div>
                  <div className="text-sm text-slate-400">Spend 1 SP to add +1d4 to any roll.</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="font-semibold text-white mb-1">Concentration</div>
                  <div className="text-sm text-slate-400">Some powers require ongoing focus. These cost an extra +1 SP per round and usually require avoiding damage or distractions.</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="font-semibold text-white mb-1">Skill Move (Lost Time Origin)</div>
                  <div className="text-sm text-slate-400">A power used freely (no SP cost) with +1d6 bonus effect. Treated like a cinematic, adrenaline-fueled moment.</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}