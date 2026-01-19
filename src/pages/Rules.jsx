import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Shield, Zap, Swords, Users, AlertCircle } from "lucide-react";
import GlossaryOfTerms from "@/components/rules/GlossaryOfTerms";

export default function Rules() {
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

        <Tabs defaultValue="creation" className="space-y-4">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="creation">Character Creation</TabsTrigger>
            <TabsTrigger value="combat">Combat</TabsTrigger>
            <TabsTrigger value="powers">Powers & SP</TabsTrigger>
            <TabsTrigger value="elements">Elements</TabsTrigger>
            <TabsTrigger value="downtime">Downtime</TabsTrigger>
            <TabsTrigger value="glossary">Glossary</TabsTrigger>
          </TabsList>

          <TabsContent value="creation" className="space-y-4">
            {/* Classification */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Step 1: Classification</CardTitle>
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
                <CardTitle className="text-white">Step 2: Power Styles (Up to 2)</CardTitle>
                <p className="text-sm text-slate-400">Choose your superpowers (only one grants perk)</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'Physical Powerhouse', perk: 'Cut one attack by half once per combat encounter' },
                  { name: 'Energy Manipulator', perk: 'Reroll 1s once per turn' },
                  { name: 'Speedster', perk: '+10 ft movement and +1 AC while moving 20+ ft' },
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
                <CardTitle className="text-white">Step 3: Origin Story</CardTitle>
                <p className="text-sm text-slate-400">What influenced you becoming a superhero</p>
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
                <CardTitle className="text-white flex items-center gap-2">
                  <Swords className="h-5 w-5 text-violet-400" />
                  Combat Mechanics
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
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-violet-400" />
                  Stamina Points (SP)
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

          <TabsContent value="glossary">
            <GlossaryOfTerms />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}