import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen } from "lucide-react";

const GAME_MECHANICS = [
  { term: 'SP (Stamina Points)', definition: 'A resource used to fuel powers and abilities. Regenerates fully at the start of each combat round. SP = 5 + your Constitution modifier.' },
  { term: 'SP Cost', definition: 'The number of SP required to use a power. Ranges from 1 (basic attack) to 5 (ultimate power).' },
  { term: 'Combat Encounter', definition: 'A structured battle or skirmish where turn order and power use is tracked.' },
  { term: 'Per Session', definition: 'An ability or perk that may be used once during a full play session (not per combat).' },
  { term: 'Per Combat Encounter', definition: 'An ability or effect that resets or can be used again with each new combat.' },
  { term: 'Per Long Rest', definition: 'Equivalent to "per session" unless your GM uses longer campaigns with actual rest mechanics.' },
  { term: 'Cooldown (e.g., 10-turn)', definition: 'The number of rounds that must pass before a specific power can be used again.' }
];

const CHARACTER_TERMS = [
  { term: 'Classification', definition: 'A character\'s origin or power source (e.g., Mutant, Magic User). Equivalent to race/species.' },
  { term: 'Power Style', definition: 'Your character\'s "class" or core combat role (e.g., Energy Manipulator, Speedster).' },
  { term: 'Origin Story', definition: 'A narrative-based background that grants a unique perk and defines how you gained your powers.' },
  { term: 'Signature Move', definition: 'Your character\'s most iconic power or combat action. Often a 2–3 SP custom power.' },
  { term: 'Skill Move', definition: 'In context of Lost Time Origin: A thematic term indicating a power used freely (no SP cost) with bonus effect. Treated like a cinematic, adrenaline-fueled moment.' }
];

const POWER_MECHANICS = [
  { term: 'Effect Tags', definition: 'Descriptive mechanics attached to powers (e.g., Burn, Stun, Push). Usually require a saving throw.' },
  { term: 'Saving Throw (Save)', definition: 'A roll (1d20 + modifier) to resist a harmful power or effect. E.g., "WIS Save DC 14" = Roll d20 + WIS modifier and beat 14 to avoid the effect.' },
  { term: 'Condition', definition: 'A lasting negative effect (e.g., Blinded, Charmed, Stunned) that alters combat behavior or stats.' },
  { term: 'Boost Roll', definition: 'Spend 1 SP to add +1d4 to any roll.' },
  { term: 'Concentration', definition: 'Some powers require ongoing focus. These cost an extra +1 SP per round and usually require the character to avoid taking damage or distractions.' }
];

const COMBAT_TERMS = [
  { term: 'COMBAT Action Economy', definition: 'Each turn in combat allows 1 Action, 1 Movement, and 1 Reaction. Some abilities may be used as Bonus Actions.' },
  { term: 'Reaction', definition: 'An action taken outside your turn, usually in response to a trigger (e.g., being hit).' },
  { term: 'Initiative', definition: 'The order of turns in combat, determined by rolling 1d20 + DEX modifier.' },
  { term: 'Attack Roll', definition: '1d20 + relevant modifiers used to determine if a power or weapon hits.' },
  { term: 'Critical Hit', definition: 'Roll a natural 20 on an attack. Double the damage dice.' },
  { term: 'Area of Effect (AoE)', definition: 'A power that targets multiple enemies in a specific area (cone, line, radius).' }
];

const ROLEPLAY_TERMS = [
  { term: 'Alignment', definition: 'Your moral and ethical stance. In Catalyst Core, defined by a Moral Axis (Light, Neutral, Shadow) and a Discipline Axis (Lawful, Neutral, Chaotic).' },
  { term: 'Faction Reputation', definition: 'A measure of how much your character is trusted or feared by major organizations.' },
  { term: 'Downtime Activity', definition: 'Non-combat scenes between missions where players pursue personal or strategic goals.' },
  { term: 'Cinematic Action Point', definition: 'A once-per-session narrative mechanic that allows a player to auto-succeed, flashback, interrupt initiative, or rescue an ally at the last second.' },
  { term: 'Narrative Trigger', definition: 'An event that influences public opinion, civilian behavior, or faction outcomes (e.g., saving a civilian, causing collateral damage).' },
  { term: 'Public Trust', definition: 'The team\'s reputation with the general population. Impacts story options, media coverage, and faction support.' }
];

export default function GlossaryOfTerms() {
  return (
    <div className="space-y-4">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-violet-400" />
            Glossary of Terms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="game-mechanics" className="border-slate-700">
              <AccordionTrigger className="text-white hover:text-violet-400">
                Game Mechanics
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  {GAME_MECHANICS.map(item => (
                    <div key={item.term} className="bg-slate-700/30 rounded-lg p-3">
                      <div className="font-semibold text-violet-400 mb-1">{item.term}</div>
                      <div className="text-sm text-slate-300">{item.definition}</div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="character-terms" className="border-slate-700">
              <AccordionTrigger className="text-white hover:text-violet-400">
                Character Creation Terms
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  {CHARACTER_TERMS.map(item => (
                    <div key={item.term} className="bg-slate-700/30 rounded-lg p-3">
                      <div className="font-semibold text-violet-400 mb-1">{item.term}</div>
                      <div className="text-sm text-slate-300">{item.definition}</div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="power-mechanics" className="border-slate-700">
              <AccordionTrigger className="text-white hover:text-violet-400">
                Power Mechanics
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  {POWER_MECHANICS.map(item => (
                    <div key={item.term} className="bg-slate-700/30 rounded-lg p-3">
                      <div className="font-semibold text-violet-400 mb-1">{item.term}</div>
                      <div className="text-sm text-slate-300">{item.definition}</div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="combat-terms" className="border-slate-700">
              <AccordionTrigger className="text-white hover:text-violet-400">
                Combat Terms
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  {COMBAT_TERMS.map(item => (
                    <div key={item.term} className="bg-slate-700/30 rounded-lg p-3">
                      <div className="font-semibold text-violet-400 mb-1">{item.term}</div>
                      <div className="text-sm text-slate-300">{item.definition}</div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="roleplay-terms" className="border-slate-700">
              <AccordionTrigger className="text-white hover:text-violet-400">
                Roleplay & Narrative Terms
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  {ROLEPLAY_TERMS.map(item => (
                    <div key={item.term} className="bg-slate-700/30 rounded-lg p-3">
                      <div className="font-semibold text-violet-400 mb-1">{item.term}</div>
                      <div className="text-sm text-slate-300">{item.definition}</div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}