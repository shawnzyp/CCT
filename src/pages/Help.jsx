import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, Users, Zap, BookOpen, Swords } from "lucide-react";

export default function Help() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <HelpCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Help Center</h1>
            <p className="text-slate-400">Guide for using Catalyst Core Character Tracker</p>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-violet-400" />
                Getting Started
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="select-character" className="border-slate-700">
                  <AccordionTrigger className="text-white hover:text-violet-400">
                    How do I select my character?
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-300">
                    Click "Select Character" in the top navigation. Choose your character from the list. Your selected character will be used throughout the app until you log out or switch characters.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="create-character" className="border-slate-700">
                  <AccordionTrigger className="text-white hover:text-violet-400">
                    How do I create a new character?
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-300">
                    Navigate to Home → Create Character, or go directly to the Characters page and click "New Vigilante". Follow the multi-step wizard to choose your classification, power styles, origin story, ability scores, tier, and alignment.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="campaigns" className="border-slate-700">
                  <AccordionTrigger className="text-white hover:text-violet-400">
                    What are campaigns?
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-300">
                    Campaigns are shared adventures where multiple players can join with their characters. Each campaign has a session log, quests, story arcs, journal entries, and combat encounters. You can message other players through the session log.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-violet-400" />
                Character Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="powers" className="border-slate-700">
                  <AccordionTrigger className="text-white hover:text-violet-400">
                    How do I create and use powers?
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-300 space-y-2">
                    <p>Go to your Character Sheet → Powers tab. Click "Add Power" to create a new power (maximum 5 powers per character).</p>
                    <p>Each power needs: Name, Range, Effect, SP Cost (1-5), and optional Save type. Powers with 5 SP cost have a 10-round cooldown.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="progression" className="border-slate-700">
                  <AccordionTrigger className="text-white hover:text-violet-400">
                    How does leveling up work?
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-300">
                    Gain XP from combat encounters and quests. When you reach the required XP threshold, a "Level Up" button appears. You can allocate stat points and skill proficiencies when leveling up. You can also upgrade powers at certain levels.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="equipment" className="border-slate-700">
                  <AccordionTrigger className="text-white hover:text-violet-400">
                    How do I manage equipment and inventory?
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-300">
                    Character Sheet → Equipment tab shows your equipped items. Inventory tab shows unequipped items and loot. You can equip/unequip items, and loot drops automatically from defeated enemies during combat.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="downtime" className="border-slate-700">
                  <AccordionTrigger className="text-white hover:text-violet-400">
                    What are downtime activities?
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-300">
                    Between missions, you can perform downtime activities like Media Control, Research, Training, Gather Intel, or Personal Time. Each activity uses different ability modifiers and grants session benefits. Access this from Character Sheet → Downtime tab.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Swords className="h-5 w-5 text-violet-400" />
                Combat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="combat-start" className="border-slate-700">
                  <AccordionTrigger className="text-white hover:text-violet-400">
                    How do I start combat?
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-300 space-y-2">
                    <p>In a campaign, go to the Combat tab. Click "Generate Enemies" to create opponents, then "Roll Initiative & Start" to begin combat.</p>
                    <p>Initiative is rolled automatically for all combatants (1d20 + DEX modifier).</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="turns" className="border-slate-700">
                  <AccordionTrigger className="text-white hover:text-violet-400">
                    What can I do on my turn?
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-300">
                    Each turn you have: 1 Action (attack, use power), 1 Movement (move up to your speed), 1 Bonus Action (ready attack/power for next turn), and 1 Reaction (per round, triggered by events). Track these with the action economy checkboxes.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="sp-regen" className="border-slate-700">
                  <AccordionTrigger className="text-white hover:text-violet-400">
                    When do SP regenerate?
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-300">
                    Stamina Points (SP) fully regenerate at the start of each new combat round. Your max SP = 5 + CON modifier.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="dice-rolls" className="border-slate-700">
                  <AccordionTrigger className="text-white hover:text-violet-400">
                    How do I make attack and save rolls?
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-300">
                    During your turn, click the "Attack" or "Save" buttons. A dice roller dialog will appear showing your modifier. Click "Roll Dice" to see the result. Natural 20 = critical hit (double damage dice)!
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-violet-400" />
                Session Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="session-log" className="border-slate-700">
                  <AccordionTrigger className="text-white hover:text-violet-400">
                    How does the session log work?
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-300">
                    The session log is a shared chat for all players in a campaign. Select your character first, then type messages that will be associated with that character. All players can see the full conversation history.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}