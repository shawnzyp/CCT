import React, { useState } from 'react';
import PageWrapper from '@/components/utils/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HelpCircle, Users, Zap, BookOpen, Swords, Shield, Package, Settings, Radio, Sparkles, Trophy, Coins, Map, ScrollText, Star, Target, Lock, FileText, Hammer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <PageWrapper className="overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <HelpCircle className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">Complete User Guide</h1>
            <p className="text-slate-400">Comprehensive guide for players and DMs</p>
          </div>
        </div>

        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardContent className="pt-6">
            <Input
              placeholder="Search the guide..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </CardContent>
        </Card>

        <Tabs defaultValue="player" className="w-full">
          <TabsList className="bg-slate-800 border border-slate-700 grid grid-cols-2 w-full mb-6">
            <TabsTrigger value="player" className="text-white">
              <Users className="h-4 w-4 mr-2" />
              Player Guide
            </TabsTrigger>
            <TabsTrigger value="dm" className="text-white">
              <Shield className="h-4 w-4 mr-2" />
              DM Guide
            </TabsTrigger>
          </TabsList>

          {/* PLAYER GUIDE */}
          <TabsContent value="player">
            <div className="space-y-4">
              {/* Player Overview */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">📖 Welcome to Catalyst Core!</CardTitle>
                  <CardDescription className="text-slate-400">Everything you need to know as a player</CardDescription>
                </CardHeader>
                <CardContent className="text-slate-300 space-y-2">
                  <p>This guide covers all player features. Use the search bar above to find specific topics, or browse each section below.</p>
                  <p>New to the system? Start with <strong>Getting Started</strong> and <strong>Character Management</strong>.</p>
                </CardContent>
              </Card>

              {/* Getting Started */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-violet-400" />
                    Getting Started
                  </CardTitle>
                  <CardDescription className="text-slate-400">First steps with Catalyst Core</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="select-character" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        How do I select my character?
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>Click <Badge variant="outline" className="mx-1">Select Character</Badge> in the top navigation bar.</p>
                        <p>A character selector modal will appear showing all your characters with their portraits, levels, and stats.</p>
                        <p>Click on a character card to see a detailed preview, then click <Badge className="bg-violet-600 mx-1">Load Character</Badge> to confirm.</p>
                        <p>Your selected character persists across sessions and is used for all gameplay features.</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="create-character" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        How do I create a new character?
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p><strong>Step 1:</strong> Navigate to <Badge variant="outline" className="mx-1">Character → Create Character</Badge></p>
                        <p><strong>Step 2:</strong> Choose your <strong>Classification</strong> (Mutant, Enhanced Human, Magic User, Alien, Mystical Being) - each grants a unique perk</p>
                        <p><strong>Step 3:</strong> Select <strong>Power Styles</strong> (minimum 2) like Elemental, Psychic, Technomancy, etc. Choose a primary style for an additional perk</p>
                        <p><strong>Step 4:</strong> Pick your <strong>Origin Story</strong> (The Accident, The Legacy, The Awakening, etc.) for another perk</p>
                        <p><strong>Step 5:</strong> Allocate <strong>Ability Scores</strong> using point-buy system (27 points total)</p>
                        <p><strong>Step 6:</strong> Choose your starting <strong>Tier</strong> (0-5) which determines power level</p>
                        <p><strong>Step 7:</strong> Set your <strong>Alignment</strong> on Moral and Discipline axes for final perks</p>
                        <p><strong>Step 8:</strong> Customize appearance, upload portrait, and finalize your vigilante!</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="character-selector" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Using the Character Selector
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>The character selector shows: Character portrait, vigilante name, secret identity, level, tier, HP, SP, TC stats, classification, power styles, and origin.</p>
                        <p>Use the search bar to filter characters by name or secret identity.</p>
                        <p>Switch characters anytime by clicking the character icon in the header.</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="campaigns" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        What are campaigns?
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>Campaigns are shared adventures where multiple players join with their characters.</p>
                        <p><strong>Features include:</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Session logs for group chat</li>
                          <li>Quest tracking (main, side, faction quests)</li>
                          <li>Story arcs with progress tracking</li>
                          <li>Collaborative journal for notes and NPCs</li>
                          <li>Combat encounters with initiative tracker</li>
                          <li>Shared resources and files</li>
                          <li>World events timeline</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="navigation" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        App Navigation
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p><strong>Character Menu:</strong> My Characters, Create Character</p>
                        <p><strong>Campaign Menu:</strong> View and join campaigns</p>
                        <p><strong>Tools Menu:</strong> Dice Roller, Economy (marketplace & trading)</p>
                        <p><strong>Reference Menu:</strong> Rules reference, this Help guide</p>
                        <p><strong>System Menu:</strong> Settings (audio, visual, gameplay preferences)</p>
                        <p><strong>Mobile:</strong> Tap hamburger menu for full navigation</p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              {/* Character Management */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="h-5 w-5 text-violet-400" />
                    Character Management
                  </CardTitle>
                  <CardDescription className="text-slate-400">Managing your vigilante</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="character-sheet" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Character Sheet Overview
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>The Character Sheet has multiple tabs for different aspects of your character:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li><strong>Combat:</strong> HP/SP tracking, active effects, combat stats</li>
                          <li><strong>Stats:</strong> Ability scores and skill proficiencies</li>
                          <li><strong>Powers:</strong> Create and manage up to 5 powers</li>
                          <li><strong>Equipment:</strong> Equipped gear with bonuses</li>
                          <li><strong>Inventory:</strong> Unequipped items and consumables</li>
                          <li><strong>Info:</strong> Backstory, perks, and character details</li>
                          <li><strong>Downtime:</strong> Between-session activities</li>
                          <li><strong>Progression:</strong> XP, leveling, milestones</li>
                          <li><strong>Journal:</strong> Personal notes and session recaps</li>
                          <li><strong>Notes:</strong> Quick notepad</li>
                          <li><strong>Items Reference:</strong> Browse available gear</li>
                          <li><strong>Questionnaire:</strong> Character development questions</li>
                        </ul>
                        <p><Badge className="bg-green-600 mt-2">Auto-saves</Badge> Changes save automatically every 30 seconds</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="powers" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Creating and Using Powers
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p><strong>Creating Powers:</strong></p>
                        <p>Character Sheet → Powers tab → <Badge className="bg-violet-600 mx-1">Add Power</Badge></p>
                        <p><strong>Required fields:</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li><strong>Name:</strong> Your power's title</li>
                          <li><strong>Range:</strong> Touch, Close (30ft), Medium (60ft), Long (120ft), or Self</li>
                          <li><strong>Effect:</strong> Detailed description of what it does</li>
                          <li><strong>SP Cost:</strong> 1-5 Stamina Points</li>
                          <li><strong>Save Type:</strong> STR, DEX, CON, INT, WIS, or CHA (optional)</li>
                          <li><strong>Damage/Healing:</strong> Dice notation (e.g., 2d6+3)</li>
                          <li><strong>Power Style:</strong> Visual effect category</li>
                        </ul>
                        <p><Badge variant="destructive">⚠️</Badge> Powers costing 5 SP have a 10-round cooldown</p>
                        <p><strong>Power Upgrades:</strong> At certain levels, click <Badge className="bg-amber-600 mx-1">Upgrade Power</Badge> to enhance damage, range, or reduce SP cost</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="progression" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Leveling & Progression
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p><strong>XP Sources:</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Combat encounters (50-200 XP per enemy)</li>
                          <li>Quest completion (100-500 XP)</li>
                          <li>DM awards via XP panel</li>
                          <li>Milestones (story-based progression)</li>
                        </ul>
                        <p><strong>Level Up Process:</strong></p>
                        <p>When you reach required XP (default 1000 per level), click <Badge className="bg-gold-600 mx-1">Level Up</Badge></p>
                        <p>Choose to improve: +2 to one ability score OR +1 to two scores, gain skill proficiencies, increase HP/SP</p>
                        <p><strong>Milestones:</strong> Track major story moments in Progression tab. DM can award milestone-based levels.</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="equipment" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Equipment & Inventory
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p><strong>Equipment Tab:</strong> Shows currently equipped items</p>
                        <p><strong>Slots:</strong> Armor, Weapon 1, Weapon 2, Utility items (up to 3)</p>
                        <p><strong>Item Bonuses:</strong> Auto-calculated and applied to TC, damage, skill checks</p>
                        <p><strong>Inventory Tab:</strong> Unequipped items, consumables, quest items</p>
                        <p><strong>Actions:</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Equip/Unequip items</li>
                          <li>Use consumables (potions, gadgets)</li>
                          <li>Drop or sell items</li>
                          <li>View item descriptions and stats</li>
                        </ul>
                        <p><strong>Weight:</strong> Track encumbrance (under development)</p>
                        <p><strong>Custom Items:</strong> DM can create unique gear via DM Tools</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="downtime" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Downtime Activities
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>Between missions, perform activities that grant benefits:</p>
                        <p><strong>Media Control</strong> (CHA) - Gain advantage on social checks for 1 session</p>
                        <p><strong>Research</strong> (INT) - Learn enemy weaknesses or uncover secrets</p>
                        <p><strong>Training</strong> (STR/DEX/CON) - Gain temporary +1 to chosen stat for 1 session</p>
                        <p><strong>Gather Intel</strong> (WIS) - Scout locations, identify threats</p>
                        <p><strong>Personal Time</strong> - Recover extra HP, reduce stress</p>
                        <p><strong>Crafting</strong> - Create or modify equipment (requires materials)</p>
                        <p>Roll relevant ability check (DC 15). Success grants full benefit, partial on 10-14, none below 10.</p>
                        <p>Track completed activities and ongoing benefits in Downtime tab.</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="journal" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Player Journal
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>Personal journal visible only to you. Create entries for:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li><strong>Session Recaps:</strong> What happened this session</li>
                          <li><strong>Character Thoughts:</strong> Internal monologue and reflections</li>
                          <li><strong>NPCs:</strong> Notes about characters you've met</li>
                          <li><strong>Mysteries:</strong> Clues and theories</li>
                          <li><strong>Goals:</strong> Short and long-term objectives</li>
                        </ul>
                        <p>Entries have title, content, category, and timestamp. Fully editable.</p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              {/* Combat System */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Swords className="h-5 w-5 text-violet-400" />
                    Combat System
                  </CardTitle>
                  <CardDescription className="text-slate-400">Tactical encounters</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="combat-start" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Starting Combat
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p><strong>As DM:</strong> Campaign → Combat tab → <Badge className="bg-violet-600 mx-1">Generate Enemies</Badge></p>
                        <p>Choose enemy tier and count. System auto-generates balanced encounters.</p>
                        <p>Click <Badge className="bg-red-600 mx-1">Roll Initiative & Start</Badge> to begin.</p>
                        <p><strong>Initiative:</strong> 1d20 + DEX modifier for all combatants. Turn order displayed clearly.</p>
                        <p><strong>Tactical Grid:</strong> Visual 30x30 grid shows positions. Drag tokens to move characters.</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="turns" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Your Turn: Action Economy
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>Each turn you have:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li><strong>1 Action:</strong> Attack, use a power, dash, disengage, help</li>
                          <li><strong>1 Movement:</strong> Move up to your Speed (default 30ft)</li>
                          <li><strong>1 Bonus Action:</strong> Ready an attack/power for later</li>
                          <li><strong>1 Reaction (per round):</strong> Opportunity attacks, triggered abilities</li>
                          <li><strong>Free Actions:</strong> Speak, drop item, interact with environment</li>
                        </ul>
                        <p>Check off actions as you use them. They reset at start of your next turn.</p>
                        <p><strong>Cinematic Actions:</strong> Once per session, describe an epic moment. Auto-succeed on the action!</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="attacks" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Making Attacks
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p><strong>Attack Roll:</strong> 1d20 + relevant modifier (STR for melee, DEX for ranged)</p>
                        <p><strong>To Hit:</strong> Must meet or exceed target's Toughness Class (TC)</p>
                        <p><strong>Damage:</strong> Roll weapon/power damage dice + ability modifier</p>
                        <p><strong>Critical Hit (Nat 20):</strong> Roll all damage dice twice!</p>
                        <p><strong>Critical Miss (Nat 1):</strong> Disadvantage on next attack</p>
                        <p><strong>Advantage/Disadvantage:</strong> Roll 2d20, take highest/lowest</p>
                        <p><strong>Cover:</strong> +2 TC (half cover) or +5 TC (full cover)</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="powers-combat" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Using Powers in Combat
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p><strong>SP Cost:</strong> Powers cost 1-5 Stamina Points. Check your current SP before using.</p>
                        <p><strong>Attack Powers:</strong> Roll 1d20 + power modifier vs target TC</p>
                        <p><strong>Save Powers:</strong> Target rolls d20 + relevant stat vs your Save DC (8 + proficiency + stat mod)</p>
                        <p><strong>Cooldowns:</strong> 5 SP powers have 10-round cooldown after use</p>
                        <p><strong>SP Regeneration:</strong> Full SP restored at start of each round!</p>
                        <p><strong>Area Effects:</strong> Describe affected targets, DM adjudicates</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="sp-regen" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Stamina & HP Management
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p><strong>Max SP:</strong> 5 + CON modifier</p>
                        <p><strong>SP Regeneration:</strong> Full SP at the start of each combat round</p>
                        <p><strong>Max HP:</strong> Based on tier and level (10 + (Tier × 10) + CON mod per level)</p>
                        <p><strong>Healing:</strong> Potions, powers, or rest. Some powers restore HP.</p>
                        <p><strong>At 0 HP:</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>If Death Saves enabled: Roll d20. 10+ = success, below 10 = failure. 3 failures = death.</li>
                          <li>If Death Saves disabled: Unconscious until healed</li>
                          <li>Nat 20 on death save = regain 1 HP!</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="conditions" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Conditions & Status Effects
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>Common conditions tracked in Combat tab:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li><strong>Stunned:</strong> Can't take actions or reactions</li>
                          <li><strong>Prone:</strong> Disadvantage on attacks, melee attacks against you have advantage</li>
                          <li><strong>Grappled:</strong> Speed = 0, can't move</li>
                          <li><strong>Restrained:</strong> Speed = 0, disadvantage on DEX saves, attacks against you have advantage</li>
                          <li><strong>Poisoned:</strong> Disadvantage on attack rolls and ability checks</li>
                          <li><strong>Blinded:</strong> Auto-fail checks requiring sight, disadvantage on attacks</li>
                          <li><strong>Invisible:</strong> Advantage on attacks, attacks against you have disadvantage</li>
                        </ul>
                        <p>Click condition icons to toggle them on/off. They affect rolls automatically.</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="tactical-grid" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Tactical Grid & Movement
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p><strong>Grid:</strong> Each square = 5 feet</p>
                        <p><strong>Movement:</strong> Drag your token to move. Movement budget shown.</p>
                        <p><strong>Difficult Terrain:</strong> Costs 2 feet per 1 foot moved</p>
                        <p><strong>Opportunity Attacks:</strong> Moving out of enemy reach provokes reaction attack (unless you Disengage)</p>
                        <p><strong>Range:</strong> Measure distance by hovering. Touch/Close/Medium/Long ranges shown visually.</p>
                        <p><strong>Cover:</strong> DM determines if obstacles provide half or full cover</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="ending-combat" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Ending Combat & Rewards
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>Combat ends when all enemies are defeated or flee.</p>
                        <p><strong>XP Rewards:</strong> DM awards XP via XP panel. Typical: 50-200 XP per enemy.</p>
                        <p><strong>Loot:</strong> Click defeated enemies to see loot drops. Items auto-added to inventory.</p>
                        <p><strong>Rest:</strong> After combat, take a short rest to restore HP (percentage based on campaign settings).</p>
                        <p><strong>Combat Log:</strong> Review full combat history - every attack, roll, and outcome recorded.</p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              {/* Economy & Trading */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Coins className="h-5 w-5 text-violet-400" />
                    Economy & Trading
                  </CardTitle>
                  <CardDescription className="text-slate-400">Credits, marketplace, and trading</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="credits" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Credits System
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p><strong>Starting Credits:</strong> Set by DM (default 500)</p>
                        <p><strong>Earning Credits:</strong> Loot from enemies, quest rewards, selling items, completing adventures</p>
                        <p><strong>Spending:</strong> Buy from NPCvendors, player marketplace, or custom DM shops</p>
                        <p>View credit balance in Character Sheet header or Economy page.</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="marketplace" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Player Marketplace
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p><strong>Selling Items:</strong> Economy → Marketplace → <Badge className="bg-violet-600 mx-1">List Item</Badge></p>
                        <p>Choose item from inventory, set price, confirm listing.</p>
                        <p><strong>Buying:</strong> Browse active listings, click <Badge className="bg-green-600 mx-1">Buy</Badge> to purchase.</p>
                        <p>Credits transferred instantly. Item moves to buyer's inventory.</p>
                        <p><strong>Canceling:</strong> Click <Badge variant="destructive" className="mx-1">Cancel</Badge> on your listings to remove them.</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="trading" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Direct Trading
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>Economy → Trading → <Badge className="bg-violet-600 mx-1">Create Trade Offer</Badge></p>
                        <p><strong>Setup:</strong> Select recipient character, choose items/credits you offer, choose items/credits you request</p>
                        <p><strong>Offers:</strong> Recipient gets notification. They can accept, reject, or ignore.</p>
                        <p><strong>Acceptance:</strong> Both parties' inventories update automatically. Items and credits transfer.</p>
                        <p><strong>Expiration:</strong> Offers expire after 7 days if not accepted.</p>
                        <p>Great for trading gear, splitting loot, or helping teammates!</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="vendors" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        NPC Vendors
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>DM creates NPC vendors with specialized inventory:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li><strong>Weapons Dealer:</strong> Combat gear</li>
                          <li><strong>Armor Shop:</strong> Protective equipment</li>
                          <li><strong>Gadget Merchant:</strong> Utility items</li>
                          <li><strong>Consumables Vendor:</strong> Potions, grenades</li>
                          <li><strong>Rare Items Dealer:</strong> Legendary gear (high reputation required)</li>
                        </ul>
                        <p>Each vendor has stock limits and prices. Some require faction reputation.</p>
                        <p>Economy → Vendors to browse available shops.</p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              {/* Campaign Features */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Map className="h-5 w-5 text-violet-400" />
                    Campaign Features
                  </CardTitle>
                  <CardDescription className="text-slate-400">Shared gameplay systems</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="session-log" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Session Log & Chat
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>Campaign → Session Log for group communication.</p>
                        <p><strong>Messages:</strong> Type in-character or out-of-character messages. All players see them.</p>
                        <p><strong>Auto-tags:</strong> Messages tagged with your character name and portrait.</p>
                        <p><strong>History:</strong> Full scrollable history of all session communications.</p>
                        <p><strong>Emotes:</strong> Use /me command for action descriptions (e.g., "/me draws weapon").</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="quests" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Quest Tracking
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>Campaign → Quests shows active, completed, and failed quests.</p>
                        <p><strong>Quest Types:</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li><strong>Main Quests:</strong> Primary story objectives</li>
                          <li><strong>Side Quests:</strong> Optional missions</li>
                          <li><strong>Faction Quests:</strong> Tied to organizations</li>
                        </ul>
                        <p><strong>Progress:</strong> DM updates quest objectives. Rewards shown (XP, credits, items).</p>
                        <p><strong>Completion:</strong> Automatically marked done when objectives met. Rewards distributed.</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="story-arcs" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Story Arcs
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>Campaign → Story Arcs tracks major narrative threads.</p>
                        <p>Each arc has: Title, description, status (Planning/Active/Completed), progress percentage, key NPCs, and important locations.</p>
                        <p>DM updates arc progress. Players see overall campaign narrative structure.</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="journal-campaign" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Collaborative Journal
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>Campaign → Journal for shared notes visible to all players.</p>
                        <p><strong>Entry Types:</strong> Session recaps, NPC profiles, location notes, clues, theories</p>
                        <p>Anyone can create/edit entries. Great for group lore tracking.</p>
                        <p>Searchable by title and category.</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="world-events" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        World Events Timeline
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>Campaign → Events shows chronological world happenings.</p>
                        <p>DM creates events: Date, title, description, impact on world.</p>
                        <p>Players see timeline of major story beats and world changes.</p>
                        <p>Useful for keeping track of campaign chronology.</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="achievements" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Achievements System
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>Character Sheet → Achievements shows unlocked achievements (if enabled by DM).</p>
                        <p><strong>Types:</strong> Combat milestones, story progress, skill challenges, social victories</p>
                        <p><strong>Tracking:</strong> Stats automatically tracked (enemies defeated, criticals, damage dealt, etc.)</p>
                        <p><strong>Rewards:</strong> Some achievements grant XP bonuses or unique perks.</p>
                        <p>View progress bars for incomplete achievements.</p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              {/* Advanced Features */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-violet-400" />
                    Advanced Features
                  </CardTitle>
                  <CardDescription className="text-slate-400">Special campaign systems</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="shards" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Shards of Many Fates
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>Mystical shards that alter reality when drawn (if enabled by DM).</p>
                        <p>Campaign → Shards → <Badge className="bg-violet-600 mx-1">Draw Shard</Badge></p>
                        <p><strong>Effects:</strong> Positive (advantage, bonus damage), neutral (wild effects), or negative (disadvantage, challenges)</p>
                        <p><strong>Limitations:</strong> Each player can draw once per session</p>
                        <p><strong>History:</strong> View all drawn shards and their effects</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="deck-fates" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Deck of Fates
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>Magical deck with powerful cards (if DM deploys one).</p>
                        <p>Campaign → Deck → <Badge className="bg-violet-600 mx-1">Draw Card</Badge></p>
                        <p><strong>Card Types:</strong> Buffs, debuffs, instant effects, persistent powers, curses, blessings</p>
                        <p><strong>Rarity:</strong> Common to Legendary cards with varying power</p>
                        <p><strong>Deployment:</strong> DM chooses when deck becomes available</p>
                        <p>Effects last until specified duration or dispelled.</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="echo-events" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Echo Events
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>Major world-altering scenarios that require group votes.</p>
                        <p><strong>Trigger:</strong> DM deploys Echo Event during critical story moments</p>
                        <p><strong>Voting:</strong> Each player votes on outcome (2-4 options typically)</p>
                        <p><strong>Results:</strong> Majority vote determines story direction</p>
                        <p><strong>Consequences:</strong> Significant impact on campaign world and future events</p>
                        <p>View active vote and past Echo Events in Campaign → Events.</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="adventures" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Adventure Modules
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>Pre-designed solo or small-group missions (if DM deploys).</p>
                        <p>Campaign → Adventures → Select module</p>
                        <p><strong>Structure:</strong> Multi-choice narrative with combat encounters</p>
                        <p><strong>Rewards:</strong> XP, items, and story progress upon completion</p>
                        <p><strong>Difficulty:</strong> Scaled to character level</p>
                        <p>Complete to unlock next part of module or earn special rewards.</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="faction-rep" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Faction Reputation
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>Track standing with various organizations (if enabled).</p>
                        <p>Character Sheet → Info tab shows faction relationships.</p>
                        <p><strong>Levels:</strong> Hostile, Unfriendly, Neutral, Friendly, Allied</p>
                        <p><strong>Gaining Rep:</strong> Complete faction quests, help members, make aligned choices</p>
                        <p><strong>Losing Rep:</strong> Betray faction, harm members, opposing actions</p>
                        <p><strong>Benefits:</strong> Higher rep unlocks vendors, safe houses, faction powers, and special quests</p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              {/* Tools & Utilities */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-violet-400" />
                    Tools & Utilities
                  </CardTitle>
                  <CardDescription className="text-slate-400">Helper features</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="dice-roller" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Dice Roller
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>Tools → Dice Roller for manual rolls.</p>
                        <p><strong>Dice Types:</strong> d4, d6, d8, d10, d12, d20, d100</p>
                        <p><strong>Options:</strong> Roll multiple dice, add modifiers, advantage/disadvantage</p>
                        <p><strong>History:</strong> View last 10 rolls with results</p>
                        <p><strong>Quick Rolls:</strong> Preset buttons for common checks (Perception, Stealth, Initiative)</p>
                        <p>3D animated dice rolls with haptic feedback!</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="aegis" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        A.E.G.I.S. Assistant
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>AI companion in bottom-left corner provides:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li><strong>Tactical Advice:</strong> Combat suggestions</li>
                          <li><strong>Rule Lookups:</strong> Quick rule references</li>
                          <li><strong>Encouragement:</strong> Motivational messages</li>
                          <li><strong>Combat Analysis:</strong> Real-time threat assessment</li>
                        </ul>
                        <p>Click A.E.G.I.S. icon to expand full interface with chat.</p>
                        <p>Automatically provides context-aware help!</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="settings" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Settings & Accessibility
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>System → Settings for customization:</p>
                        <p><strong>Visual:</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Font size (Small to X-Large)</li>
                          <li>High contrast mode</li>
                          <li>Scanline effects toggle</li>
                          <li>Particle effects toggle</li>
                          <li>Reduced motion</li>
                        </ul>
                        <p><strong>Audio:</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Master volume</li>
                          <li>SFX volume</li>
                          <li>Music volume</li>
                          <li>Combat music toggle</li>
                          <li>Voice announcements</li>
                        </ul>
                        <p><strong>Gameplay:</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Auto-roll advantage/disadvantage</li>
                          <li>Confirm critical actions</li>
                          <li>Tutorial hints</li>
                          <li>Haptic feedback intensity</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="export" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Export & Sharing
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>Character Sheet → <Badge variant="outline" className="mx-1">Export Character</Badge></p>
                        <p><strong>Formats:</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li><strong>PDF:</strong> Printable character sheet</li>
                          <li><strong>JSON:</strong> Data file for backup/transfer</li>
                          <li><strong>PNG:</strong> Character card image</li>
                        </ul>
                        <p><strong>Import:</strong> Load JSON files to restore characters</p>
                        <p>Share character sheets with DM or other players!</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="tutorials" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Tutorials & Hints
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>Interactive tutorials guide you through features.</p>
                        <p><strong>Auto-trigger:</strong> First time using a feature shows contextual help</p>
                        <p><strong>Manual access:</strong> Settings → Tutorial System → Restart Tutorial</p>
                        <p><strong>Tooltips:</strong> Hover over UI elements for quick explanations</p>
                        <p>Disable in Settings if you prefer no guidance.</p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* DM GUIDE */}
          <TabsContent value="dm">
            <div className="space-y-4">
              {/* DM Overview */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="h-5 w-5 text-violet-400" />
                    DM Hub Overview
                  </CardTitle>
                  <CardDescription className="text-slate-400">Access and setup</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="dm-access" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Accessing DM Tools
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>Scroll to bottom of any page → <Badge className="bg-violet-600 mx-1">Enter DM Mode</Badge></p>
                        <p><strong>Setup:</strong></p>
                        <ol className="list-decimal list-inside space-y-1 ml-2">
                          <li>First time: Click "Enter DM Mode" → Set 4-digit PIN</li>
                          <li>Confirm PIN by entering it again</li>
                          <li>PIN saved locally for secure access</li>
                        </ol>
                        <p><strong>Re-entry:</strong> Enter PIN each session to unlock DM Hub</p>
                        <p><strong>Exit:</strong> Click <Badge variant="outline" className="mx-1">Exit DM Mode</Badge> at page bottom</p>
                        <p><strong>Change PIN:</strong> DM Hub → Settings → PIN Settings</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="dm-hub" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        DM Hub Dashboard
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>Central command center for all DM tools.</p>
                        <p><strong>Quick Stats:</strong> Active campaigns, total characters, session count, achievements unlocked</p>
                        <p><strong>Tool Categories:</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li><strong>Campaign Management:</strong> Campaigns, Combat Tracker, NPC Generator, Loot Generator</li>
                          <li><strong>Character & Combat:</strong> Character dashboard, XP Awards, Enemy Generator</li>
                          <li><strong>Economy & Items:</strong> Vendor Manager, Custom Items, Marketplace Monitor</li>
                          <li><strong>Configuration:</strong> Game Settings, Achievements, PIN Settings</li>
                        </ul>
                        <p><strong>Quick Actions:</strong> Create Campaign, Generate NPCs, Award XP, Create Items</p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              {/* Campaign Management */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Map className="h-5 w-5 text-violet-400" />
                    Campaign Management
                  </CardTitle>
                  <CardDescription className="text-slate-400">Creating and running campaigns</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="create-campaign" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Creating Campaigns
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>Campaigns → <Badge className="bg-violet-600 mx-1">New Campaign</Badge></p>
                        <p><strong>Required:</strong> Name, description</p>
                        <p><strong>Optional:</strong> Logo image, starting status</p>
                        <p><strong>Status Options:</strong> Planning, Active, On Hold, Completed</p>
                        <p>After creation, configure game settings and features.</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="campaign-settings" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Campaign Settings & Rules
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>Campaign → GM Tools → <Badge variant="outline" className="mx-1">Game Settings</Badge></p>
                        <p><strong>Gameplay Rules:</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li><strong>Starting Credits:</strong> Default 500, adjustable</li>
                          <li><strong>XP per Level:</strong> Default 1000, customize progression speed</li>
                          <li><strong>Max Character Level:</strong> Default 20, set campaign cap</li>
                          <li><strong>Rest Healing:</strong> HP % restored on rest (default 100%)</li>
                          <li><strong>Critical Confirmation:</strong> Require confirmation roll for crits</li>
                          <li><strong>Flanking Advantage:</strong> Grant advantage when flanking enemies</li>
                        </ul>
                        <p><strong>Feature Toggles:</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Shards of Many Fates (on/off)</li>
                          <li>Achievement System (on/off)</li>
                          <li>Cinematic Action Points (on/off)</li>
                          <li>Death Saves (on/off)</li>
                          <li>Faction Reputation (on/off)</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="discord-webhook" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Discord Webhook Integration
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>DM Hub → Game Settings → Discord tab</p>
                        <p><strong>Setup:</strong></p>
                        <ol className="list-decimal list-inside space-y-1 ml-2">
                          <li>In Discord: Server Settings → Integrations → Webhooks → New Webhook</li>
                          <li>Copy webhook URL</li>
                          <li>Paste into "Webhook URL" field</li>
                          <li>Set bot name (default: "O.M.N.I. S.C. REPORT")</li>
                          <li>Select events to post (combat start/end, level ups, deaths, etc.)</li>
                          <li>Click <Badge className="bg-violet-600 mx-1">Save Settings</Badge></li>
                          <li>Click <Badge variant="outline" className="mx-1">Test Webhook</Badge> to verify</li>
                        </ol>
                        <p><strong>Events:</strong> Combat start/end, level up, character death, critical rolls, quest complete, adventure complete, deck draws, echo votes, achievements</p>
                        <p>Messages post automatically to your Discord channel!</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="session-management" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Session Logs & History
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>Campaign → Session Log shows all player messages.</p>
                        <p><strong>DM Abilities:</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Post as yourself or NPCs</li>
                          <li>Edit or delete any message</li>
                          <li>Pin important messages</li>
                          <li>Mute disruptive players (future feature)</li>
                        </ul>
                        <p>Campaign tracks: Session count, last session date, total playtime</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="quest-management" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Quest & Story Arc Management
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p><strong>Quests:</strong> Campaign → GM Tools → Quest Tracker</p>
                        <p>Create quests with: Title, description, type (main/side/faction), objectives, rewards (XP/credits/items)</p>
                        <p>Update quest progress. Mark objectives complete. Distribute rewards automatically.</p>
                        <p><strong>Story Arcs:</strong> Campaign → GM Tools → Story Arcs</p>
                        <p>Track major narrative threads. Set progress %, add NPCs and locations, update status.</p>
                        <p>Players see story structure and current position in campaign.</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="world-building" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        World Building Tools
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>Campaign → GM Tools → World Builder</p>
                        <p><strong>Locations:</strong> Name, description, map image, important NPCs, connections to other locations</p>
                        <p><strong>NPCs:</strong> Name, portrait, description, faction, attitude, secrets</p>
                        <p><strong>Lore:</strong> World history, factions, magic systems, technologies</p>
                        <p><strong>Events Timeline:</strong> Date, title, description, global impact</p>
                        <p>All visible to players for reference.</p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              {/* Combat & Encounters */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Swords className="h-5 w-5 text-violet-400" />
                    Combat & Encounters
                  </CardTitle>
                  <CardDescription className="text-slate-400">Running battles</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="enemy-generator" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Enemy Generator
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>DM Hub → Enemy Generator</p>
                        <p><strong>Quick Generation:</strong> Select tier (0-5) and count. Auto-generates balanced enemies.</p>
                        <p><strong>Enemy Stats:</strong> Name, HP, TC, initiative mod, attacks (with damage), abilities, position</p>
                        <p><strong>Customization:</strong> Edit any generated stat. Add custom abilities.</p>
                        <p><strong>Templates:</strong> Save frequently-used enemies for quick deployment.</p>
                        <p>Enemies automatically added to combat tracker when combat starts.</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="combat-tracker" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Combat Tracker
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>Campaign → Combat tab shows full combat interface.</p>
                        <p><strong>DM Controls:</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Roll initiative for all combatants</li>
                          <li>Track HP, SP, and conditions for all characters</li>
                          <li>Apply damage or healing to any combatant</li>
                          <li>Add/remove enemies mid-combat</li>
                          <li>Skip turns or reorder initiative</li>
                          <li>Apply environmental effects</li>
                          <li>End combat and award XP</li>
                        </ul>
                        <p><strong>Tactical Grid:</strong> Drag tokens to move combatants. Measure ranges. Apply positioning effects.</p>
                        <p><strong>Combat Log:</strong> Full history of every action, roll, and outcome. Export after session.</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="xp-awards" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        XP & Milestone Awards
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>DM Hub → XP Awards or within Combat Tracker</p>
                        <p><strong>After Combat:</strong> Suggested XP based on enemy difficulty. Adjust as needed. Award to all or specific players.</p>
                        <p><strong>Manual XP:</strong> Campaign → GM Tools → XP Panel. Enter amount and reason. Award to party or individuals.</p>
                        <p><strong>Milestones:</strong> Toggle milestone-based leveling in Game Settings. Award levels directly for story achievements.</p>
                        <p>Players notified immediately. Discord webhook posts if configured.</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="loot-generator" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Loot Generator
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>DM Hub → Loot Generator</p>
                        <p><strong>Quick Loot:</strong> Generate random loot based on enemy tier and rarity</p>
                        <p><strong>Manual Distribution:</strong> Select specific items from database. Choose recipient character.</p>
                        <p><strong>Credits:</strong> Award credits directly to players</p>
                        <p><strong>Auto-drop:</strong> Enable auto-loot in combat settings. Defeated enemies drop items automatically.</p>
                        <p>Loot added directly to character inventories.</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="encounters" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Random Encounter Generator
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>DM Hub → Random Encounters</p>
                        <p>Generate surprise encounters for exploration:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Combat encounters (balanced to party level)</li>
                          <li>Social encounters (NPCs with goals)</li>
                          <li>Environmental hazards</li>
                          <li>Treasure finds</li>
                          <li>Story hooks</li>
                        </ul>
                        <p>Roll on table or let system auto-generate based on location and party level.</p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              {/* NPC & Item Management */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-violet-400" />
                    NPC & Item Management
                  </CardTitle>
                  <CardDescription className="text-slate-400">Creating content</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="npc-generator" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        NPC Generator
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>DM Hub → NPC Generator</p>
                        <p><strong>Quick Templates:</strong> Guard, Merchant, Noble, Criminal, Scientist, etc.</p>
                        <p><strong>Full NPCs:</strong> Name, portrait, description, stats, personality traits, goals, secrets</p>
                        <p><strong>Relationship Tracker:</strong> Track NPC attitudes toward each player character</p>
                        <p>NPCs saved to campaign. Visible in World Builder and journal.</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="custom-items" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Custom Item Creator
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>DM Hub → Custom Items</p>
                        <p><strong>Item Types:</strong> Weapon, Armor, Utility, Consumable</p>
                        <p><strong>Properties:</strong> Name, description, rarity, bonuses (TC, damage, skills), special effects, cost</p>
                        <p><strong>Bonuses:</strong> +X to TC, +X to damage, +X to specific skills, advantage on checks, special abilities</p>
                        <p><strong>Distribution:</strong> Add to specific character inventory or make available in vendor shops</p>
                        <p>Custom items appear in Items Reference for players.</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="vendor-manager" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Vendor Manager
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>DM Hub → Vendor Manager</p>
                        <p><strong>Create Vendors:</strong> Name, description, location, specialty (weapons/armor/utilities/etc.)</p>
                        <p><strong>Inventory:</strong> Add items, set prices, set stock quantities, apply discounts</p>
                        <p><strong>Access Control:</strong> Require minimum faction reputation to access vendor</p>
                        <p><strong>Availability:</strong> Toggle vendor on/off (e.g., traveling merchant appears/disappears)</p>
                        <p>Players browse vendors in Economy → Vendors.</p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              {/* Advanced Systems */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-violet-400" />
                    Advanced Systems
                  </CardTitle>
                  <CardDescription className="text-slate-400">Special features deployment</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="deck-deployment" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Deck of Fates Deployment
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>Campaign → GM Tools → Deck of Fates</p>
                        <p><strong>Activate:</strong> Choose when to make deck available to players</p>
                        <p><strong>Customize:</strong> Select which cards are in the deck (remove dangerous ones if needed)</p>
                        <p><strong>Limits:</strong> Set draw limits (per session, per character, total)</p>
                        <p><strong>Monitor:</strong> See what cards have been drawn and by whom</p>
                        <p>Players can draw cards from Campaign → Deck of Fates tab.</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="adventure-deployment" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Adventure Module Deployment
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>Campaign → GM Tools → Adventure Modules</p>
                        <p><strong>Select Module:</strong> Choose from pre-built adventures</p>
                        <p><strong>Customize:</strong> Edit encounters, rewards, narrative choices</p>
                        <p><strong>Deploy:</strong> Make available to specific characters or entire party</p>
                        <p><strong>Track Progress:</strong> See who's started, completed, where they are</p>
                        <p>Great for solo player sessions or side content.</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="echo-deployment" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Echo Events Deployment
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>Campaign → GM Tools → Echo Events</p>
                        <p><strong>Create Event:</strong> Title, description, 2-4 vote options, consequences for each</p>
                        <p><strong>Deploy:</strong> Activate event during critical story moments</p>
                        <p><strong>Voting Period:</strong> Set duration (hours/days)</p>
                        <p><strong>Results:</strong> System tallies votes. Winning option triggers consequences.</p>
                        <p><strong>World Impact:</strong> Update world state based on outcome</p>
                        <p>Major tool for collaborative storytelling!</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="achievements-dm" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Achievement System Management
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>DM Hub → Achievements Manager</p>
                        <p><strong>Enable:</strong> Turn on achievements in Game Settings → Features</p>
                        <p><strong>Configure:</strong> Create custom achievements with: Title, description, icon, requirements, rewards</p>
                        <p><strong>Types:</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Auto-tracking (enemies defeated, damage dealt, etc.)</li>
                          <li>Story-based (DM manually awards)</li>
                          <li>Hidden achievements (revealed when unlocked)</li>
                        </ul>
                        <p><strong>Rewards:</strong> XP bonuses, unique items, titles, cosmetics</p>
                        <p>Players see progress in Character Sheet → Achievements.</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="shards-dm" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Shards of Many Fates Management
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>Enable in Game Settings → Features → Shards of Many Fates</p>
                        <p><strong>Monitor:</strong> See all shards drawn by players in campaign history</p>
                        <p><strong>Effects:</strong> Shards have predetermined effects. DM can modify outcomes narratively.</p>
                        <p><strong>Limits:</strong> One shard draw per player per session (auto-enforced)</p>
                        <p>Adds randomness and excitement to sessions!</p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              {/* DM Tools & Utilities */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Hammer className="h-5 w-5 text-violet-400" />
                    DM Tools & Utilities
                  </CardTitle>
                  <CardDescription className="text-slate-400">Helper features for DMs</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="character-overview" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Character Overview
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>DM Hub → Character Dashboard</p>
                        <p>View all players' characters: Levels, HP, XP, equipment, powers, current conditions</p>
                        <p><strong>Quick Actions:</strong> Award XP, give items, adjust HP, apply conditions</p>
                        <p><strong>Comparison:</strong> See relative power levels and party balance</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="notes-gm" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        GM Notes
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>Campaign → GM Tools → GM Notes</p>
                        <p><strong>Private Notes:</strong> Only visible to DM. Players cannot see.</p>
                        <p><strong>Uses:</strong> Plot secrets, NPC motivations, upcoming events, player observations</p>
                        <p><strong>Organization:</strong> Rich text editor with formatting</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="session-prep" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Session Preparation
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p><strong>Checklist:</strong></p>
                        <ol className="list-decimal list-inside space-y-1 ml-2">
                          <li>Review last session notes</li>
                          <li>Generate any needed NPCs or enemies</li>
                          <li>Prepare loot tables</li>
                          <li>Update quest objectives</li>
                          <li>Set up combat encounters in advance</li>
                          <li>Test Discord webhook</li>
                          <li>Review player character sheets for continuity</li>
                        </ol>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="export-campaign" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Campaign Export & Backup
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>Campaign → GM Tools → Export Campaign</p>
                        <p><strong>Full Export:</strong> All campaign data, characters, encounters, NPCs, items</p>
                        <p><strong>Format:</strong> JSON file for backup or transfer</p>
                        <p><strong>Import:</strong> Restore campaigns from backup files</p>
                        <p>Recommended: Export after every session!</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="economy-monitor" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        Economy Monitoring
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>DM Hub → Marketplace Monitor</p>
                        <p>View all marketplace transactions, player trades, vendor purchases</p>
                        <p>Track economy health: Credit distribution, inflation indicators</p>
                        <p>Cancel fraudulent transactions if needed</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="pin-security" className="border-slate-700">
                      <AccordionTrigger className="text-white hover:text-violet-400">
                        PIN Security Settings
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 space-y-2">
                        <p>DM Hub → PIN Settings</p>
                        <p><strong>Change PIN:</strong> Enter current PIN, then new 4-digit PIN</p>
                        <p><strong>Reset:</strong> If forgotten, clear browser local storage (will lose saved PIN)</p>
                        <p><strong>Security:</strong> PIN stored locally, not on server</p>
                        <p>Keep PIN secure to prevent unauthorized DM access!</p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              {/* Best Practices */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Star className="h-5 w-5 text-violet-400" />
                    DM Best Practices
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-slate-300 space-y-3">
                  <p><strong>Session Zero:</strong> Use Game Settings to establish house rules with players before starting.</p>
                  <p><strong>Balance:</strong> Use Enemy Generator tier system to create appropriate challenges.</p>
                  <p><strong>Pacing:</strong> Award XP and levels at narrative milestones, not just combat.</p>
                  <p><strong>Engagement:</strong> Use Echo Events for major story decisions to involve all players.</p>
                  <p><strong>Economy:</strong> Monitor marketplace to prevent exploitation. Adjust vendor prices as needed.</p>
                  <p><strong>Documentation:</strong> Use GM Notes to track ongoing plots. Update regularly.</p>
                  <p><strong>Feedback:</strong> Check Session Log regularly. Respond to player questions and concerns.</p>
                  <p><strong>Backups:</strong> Export campaign data frequently to prevent data loss.</p>
                  <p><strong>Discord:</strong> Test webhook before session to ensure notifications work.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}