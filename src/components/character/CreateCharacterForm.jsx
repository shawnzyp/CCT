import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Dices, ChevronRight, ChevronLeft, Check, Zap, Palette } from "lucide-react";
import PortraitUploader from "@/components/character/PortraitUploader";
import VisualCustomizer from "@/components/character/VisualCustomizer";
import AegisSuggestions from "@/components/aegis/AegisSuggestions";
import { motion, AnimatePresence } from "framer-motion";

const CLASSIFICATIONS = [
  { value: 'mutant', label: 'Mutant', perk: 'Reroll one failed saving throw per long rest' },
  { value: 'enhanced_human', label: 'Enhanced Human', perk: 'Advantage on all Technology-related checks' },
  { value: 'magic_user', label: 'Magic User', perk: 'Cast one minor magical effect per long rest' },
  { value: 'alien', label: 'Alien/Extraterrestrial', perk: 'Immune to environmental hazard, no rough terrain penalty' },
  { value: 'mystical_being', label: 'Mystical Being', perk: '+2 to Persuasion or Intimidation checks' }
];

const POWER_STYLES = [
  { value: 'physical_powerhouse', label: 'Physical Powerhouse', perk: 'Cut one attack by half once per combat' },
  { value: 'energy_manipulator', label: 'Energy Manipulator', perk: 'Reroll 1s once per turn' },
  { value: 'speedster', label: 'Speedster', perk: '+10 ft movement and +1 AC while moving 20+ ft' },
  { value: 'telekinetic_psychic', label: 'Telekinetic/Psychic', perk: 'Force enemies to reroll rolls above 17 once per rest' },
  { value: 'illusionist', label: 'Illusionist', perk: 'Create a 1-min decoy illusion once per combat' },
  { value: 'shape_shifter', label: 'Shape-shifter', perk: 'Advantage on Deception, disguise freely' },
  { value: 'elemental_controller', label: 'Elemental Controller', perk: '+2 to hit and +5 damage once per turn' }
];

const ORIGINS = [
  { value: 'the_accident', label: 'The Accident', perk: 'Resistance to one damage type' },
  { value: 'the_experiment', label: 'The Experiment', perk: 'Reroll a failed CON or INT save per long rest' },
  { value: 'the_legacy', label: 'The Legacy', perk: 'Use powers of another character once per long rest' },
  { value: 'the_awakening', label: 'The Awakening', perk: '+5 to hit and +10 damage when below ½ HP' },
  { value: 'the_pact', label: 'The Pact', perk: 'Auto-success on one save or +10 to any roll per long rest' },
  { value: 'the_lost_time', label: 'The Lost Time', perk: 'Chance for free Skill Move per combat' },
  { value: 'the_exposure', label: 'The Exposure', perk: '+5 elemental damage once per round' },
  { value: 'the_rebirth', label: 'The Rebirth', perk: 'Stand up at 1 HP with resistance when knocked out' },
  { value: 'the_vigil', label: 'The Vigil', perk: 'Create shield reducing ally damage to zero for 1 turn' },
  { value: 'the_redemption', label: 'The Redemption', perk: 'Take damage for ally, heal them 1d6, gain advantage' }
];

const TIERS = [
  { value: 5, label: 'Tier 5: Rookie', bonus: '+1d10' },
  { value: 4, label: 'Tier 4: Emerging Vigilante', bonus: '+2d10' },
  { value: 3, label: 'Tier 3: Field-Tested Operative', bonus: '+3d10' },
  { value: 2, label: 'Tier 2: Respected Force', bonus: '+4d10' },
  { value: 1, label: 'Tier 1: Heroic Figure', bonus: '+5d10' },
  { value: 0, label: 'Tier 0: Legendary', bonus: '+100 fixed' }
];

const ALIGNMENTS = [
  { value: 'paragon', label: 'Paragon (Lawful Light)', perk: 'Auto-succeed Charisma check once per session' },
  { value: 'guardian', label: 'Guardian (Neutral Light)', perk: 'Restore 1d6 HP/SP to ally as bonus action' },
  { value: 'vigilante', label: 'Vigilante (Chaotic Light)', perk: 'Ignore opportunity attacks toward threats' },
  { value: 'sentinel', label: 'Sentinel (Lawful Neutral)', perk: '+1 to saves when acting on orders' },
  { value: 'outsider', label: 'Outsider (True Neutral)', perk: 'Reroll or remove condition once per session' },
  { value: 'wildcard', label: 'Wildcard (Chaotic Neutral)', perk: 'Advantage on Initiative and Deception' },
  { value: 'inquisitor', label: 'Inquisitor (Lawful Shadow)', perk: 'Max damage to "criminals" once per session' },
  { value: 'anti_hero', label: 'Anti-Hero (Neutral Shadow)', perk: 'Heal 1d6 HP on solo kills' },
  { value: 'renegade', label: 'Renegade (Chaotic Shadow)', perk: '+1d6 damage from stealth/surprise' }
];

const STATS = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

export default function CreateCharacterForm({ onSubmit, initialData, isLoading, campaignId }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(initialData || {
    name: '',
    real_name: '',
    classification: '',
    power_styles: [],
    primary_power_style: '',
    origin_story: '',
    tier: 5,
    ability_scores: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
    alignment: '',
    damage_resistance: '',
    backstory_notes: '',
    campaign_id: campaignId || ''
  });
  
  const [showVisualCustomizer, setShowVisualCustomizer] = useState(false);
  
  const steps = [
    { title: 'Identity', subtitle: 'Who is your vigilante?' },
    { title: 'Appearance', subtitle: 'Visual customization' },
    { title: 'Classification', subtitle: 'How did you receive your powers?' },
    { title: 'Power Style', subtitle: 'What are your superpowers?' },
    { title: 'Origin', subtitle: 'What shaped you?' },
    { title: 'Abilities', subtitle: 'Roll your stats' },
    { title: 'Tier & HP', subtitle: 'Your heroic level' },
    { title: 'Alignment', subtitle: 'Your moral compass' },
    { title: 'Review', subtitle: 'Finalize your vigilante' }
  ];
  
  const updateData = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };
  
  const togglePowerStyle = (style) => {
    const current = data.power_styles || [];
    if (current.includes(style)) {
      updateData('power_styles', current.filter(s => s !== style));
      if (data.primary_power_style === style) {
        updateData('primary_power_style', '');
      }
    } else if (current.length < 2) {
      updateData('power_styles', [...current, style]);
      if (current.length === 0) {
        updateData('primary_power_style', style);
      }
    }
  };
  
  const rollStats = () => {
    const rolls = [];
    for (let i = 0; i < 7; i++) {
      rolls.push(Math.floor(Math.random() * 20) + 1);
    }
    rolls.sort((a, b) => b - a);
    const topSix = rolls.slice(0, 6);
    
    const newScores = {};
    STATS.forEach((stat, i) => {
      newScores[stat] = topSix[i];
    });
    updateData('ability_scores', newScores);
  };
  
  const calculateHP = () => {
    const conMod = Math.floor((data.ability_scores.CON - 10) / 2);
    if (data.tier === 0) {
      return 100 + conMod;
    }
    const tierDice = 6 - data.tier;
    let bonus = 0;
    for (let i = 0; i < tierDice; i++) {
      bonus += Math.floor(Math.random() * 10) + 1;
    }
    return 30 + conMod + bonus;
  };
  
  const calculateTC = () => {
    const dexMod = Math.floor((data.ability_scores.DEX - 10) / 2);
    return 10 + dexMod + (data.armor_bonus || 0);
  };
  
  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  };
  
  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };
  
  const handleSubmit = () => {
    const hp = calculateHP();
    const tc = calculateTC();
    const conMod = Math.floor((data.ability_scores.CON - 10) / 2);
    const dexMod = Math.floor((data.ability_scores.DEX - 10) / 2);

    // Get perks from selections
    const classificationPerk = CLASSIFICATIONS.find(c => c.value === data.classification)?.perk;
    const primaryStylePerk = POWER_STYLES.find(p => p.value === data.primary_power_style)?.perk;
    const originPerk = ORIGINS.find(o => o.value === data.origin_story)?.perk;
    const alignmentPerk = ALIGNMENTS.find(a => a.value === data.alignment)?.perk;

    onSubmit({
      ...data,
      max_hp: hp,
      current_hp: hp,
      max_sp: 5 + conMod,
      current_sp: 5 + conMod,
      toughness_class: tc,
      initiative_modifier: dexMod,
      passive_perception: 10 + Math.floor((data.ability_scores.WIS - 10) / 2),
      classification_perk: classificationPerk,
      primary_power_style_perk: primaryStylePerk,
      origin_perk: originPerk,
      alignment_perk: alignmentPerk,
      powers: [],
      skills: {
        athletics: 'none',
        acrobatics: 'none',
        stealth: 'none',
        investigation: 'none',
        perception: 'none',
        insight: 'none',
        persuasion: 'none',
        deception: 'none',
        intimidation: 'none',
        technology: 'none',
        medicine: 'none',
        survival: 'none'
      }
    });
  };
  
  const canProceed = () => {
    switch (step) {
      case 0: return data.name?.trim();
      case 1: return true; // Appearance is optional
      case 2: return data.classification;
      case 3: return data.power_styles?.length > 0 && data.primary_power_style;
      case 4: return data.origin_story;
      case 5: return Object.values(data.ability_scores).every(v => v > 0);
      case 6: return data.tier !== undefined;
      case 7: return data.alignment;
      default: return true;
    }
  };
  
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-slate-300">Vigilante Name *</Label>
              <Input
                value={data.name}
                onChange={(e) => updateData('name', e.target.value)}
                placeholder="e.g., Shadow Strike, Nova, The Catalyst"
                className="bg-slate-800 border-slate-700 text-white mt-1"
              />
              <AegisSuggestions
                type="name"
                context={data}
                onSelect={(name) => updateData('name', name)}
                label="Name"
              />
            </div>
            <div>
              <Label className="text-slate-300">Real Name (Secret Identity)</Label>
              <Input
                value={data.real_name}
                onChange={(e) => updateData('real_name', e.target.value)}
                placeholder="e.g., Alex Chen"
                className="bg-slate-800 border-slate-700 text-white mt-1"
              />
            </div>
            <PortraitUploader
              currentUrl={data.portrait_url}
              onUpload={(url) => updateData('portrait_url', url)}
            />
            <AegisSuggestions
              type="portrait"
              context={data}
              onSelect={(url) => updateData('portrait_url', url)}
              label="Portrait"
            />
          </div>
        );
        
      case 1:
        return (
          <div className="space-y-4">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-violet-400" />
                  <span className="font-medium text-white">Visual Customization</span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setShowVisualCustomizer(true)}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  Customize
                </Button>
              </div>
              {data.visual_customization && (
                <div className="text-sm text-slate-400 space-y-1">
                  {data.visual_customization.costume_primary_color && (
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: data.visual_customization.costume_primary_color }}
                      />
                      <span>Primary: {data.visual_customization.costume_primary_color}</span>
                    </div>
                  )}
                  {data.visual_customization.costume_style && (
                    <div>Style: {data.visual_customization.costume_style}</div>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500 text-center">
              This is optional - you can customize your character's appearance later
            </p>
          </div>
        );
        
      case 2:
        return (
          <div className="grid gap-3">
            {CLASSIFICATIONS.map(c => (
              <div
                key={c.value}
                onClick={() => updateData('classification', c.value)}
                className={cn(
                  "p-4 rounded-xl border-2 cursor-pointer transition-all",
                  data.classification === c.value
                    ? "border-violet-500 bg-violet-500/10"
                    : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">{c.label}</span>
                  {data.classification === c.value && (
                    <Check className="h-5 w-5 text-violet-400" />
                  )}
                </div>
                <p className="text-sm text-slate-400 mt-1">{c.perk}</p>
              </div>
            ))}
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">Select up to 2 power styles. The primary one grants its perk.</p>
            <div className="grid gap-3">
              {POWER_STYLES.map(p => {
                const isSelected = data.power_styles?.includes(p.value);
                const isPrimary = data.primary_power_style === p.value;
                return (
                  <div
                    key={p.value}
                    onClick={() => togglePowerStyle(p.value)}
                    className={cn(
                      "p-4 rounded-xl border-2 cursor-pointer transition-all",
                      isSelected
                        ? "border-violet-500 bg-violet-500/10"
                        : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{p.label}</span>
                        {isPrimary && (
                          <Badge className="bg-violet-500 text-xs">Primary</Badge>
                        )}
                      </div>
                      {isSelected && <Check className="h-5 w-5 text-violet-400" />}
                    </div>
                    <p className="text-sm text-slate-400 mt-1">{p.perk}</p>
                    {isSelected && !isPrimary && data.power_styles?.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="mt-2 text-violet-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateData('primary_power_style', p.value);
                        }}
                      >
                        Set as Primary
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-4">
            <AegisSuggestions
              type="origin"
              context={data}
              onSelect={(origin) => updateData('backstory_notes', origin)}
              label="Origin Story"
            />
            <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2">
              {ORIGINS.map(o => (
                <div
                  key={o.value}
                  onClick={() => updateData('origin_story', o.value)}
                  className={cn(
                    "p-4 rounded-xl border-2 cursor-pointer transition-all",
                    data.origin_story === o.value
                      ? "border-violet-500 bg-violet-500/10"
                      : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">{o.label}</span>
                    {data.origin_story === o.value && (
                      <Check className="h-5 w-5 text-violet-400" />
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{o.perk}</p>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 5:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">Roll 7d20, drop the lowest</p>
              <Button onClick={rollStats} variant="outline" className="gap-2 border-violet-500 text-violet-400">
                <Dices className="h-4 w-4" />
                Roll Stats
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {STATS.map(stat => (
                <div key={stat} className="bg-slate-800 rounded-xl p-3 text-center">
                  <Label className="text-slate-400 text-xs">{stat}</Label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={data.ability_scores[stat]}
                    onChange={(e) => updateData('ability_scores', {
                      ...data.ability_scores,
                      [stat]: parseInt(e.target.value) || 0
                    })}
                    className="bg-slate-700 border-slate-600 text-white text-center text-xl font-bold mt-1"
                  />
                  <div className="text-xs text-violet-400 mt-1">
                    {(() => {
                      const mod = Math.floor((data.ability_scores[stat] - 10) / 2);
                      return mod >= 0 ? `+${mod}` : mod;
                    })()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 6:
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-slate-300">Heroic Tier</Label>
              <Select value={String(data.tier)} onValueChange={(v) => updateData('tier', parseInt(v))}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIERS.map(t => (
                    <SelectItem key={t.value} value={String(t.value)}>
                      {t.label} ({t.bonus})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="bg-slate-800 rounded-xl p-4">
              <div className="text-sm text-slate-400 mb-2">HP Formula</div>
              <div className="text-white font-mono">
                {data.tier === 0 
                  ? `100 + CON mod = ${100 + Math.floor((data.ability_scores.CON - 10) / 2)}`
                  : `30 + CON mod + ${6 - data.tier}d10`
                }
              </div>
            </div>
          </div>
        );
        
      case 7:
        return (
          <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2">
            {ALIGNMENTS.map(a => (
              <div
                key={a.value}
                onClick={() => updateData('alignment', a.value)}
                className={cn(
                  "p-4 rounded-xl border-2 cursor-pointer transition-all",
                  data.alignment === a.value
                    ? "border-violet-500 bg-violet-500/10"
                    : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">{a.label}</span>
                  {data.alignment === a.value && (
                    <Check className="h-5 w-5 text-violet-400" />
                  )}
                </div>
                <p className="text-sm text-slate-400 mt-1">{a.perk}</p>
              </div>
            ))}
          </div>
        );
        
      case 8:
        return (
          <div className="space-y-4">
            {data.portrait_url && (
              <div className="flex justify-center">
                <img 
                  src={data.portrait_url} 
                  alt={data.name}
                  className="w-48 h-48 rounded-xl object-cover border-2 border-violet-500"
                />
              </div>
            )}
            <div className="bg-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Name</span>
                <span className="text-white font-medium">{data.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Classification</span>
                <span className="text-white">{CLASSIFICATIONS.find(c => c.value === data.classification)?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Power Styles</span>
                <span className="text-white">{data.power_styles?.map(p => POWER_STYLES.find(ps => ps.value === p)?.label).join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Origin</span>
                <span className="text-white">{ORIGINS.find(o => o.value === data.origin_story)?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tier</span>
                <span className="text-white">{TIERS.find(t => t.value === data.tier)?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Alignment</span>
                <span className="text-white">{ALIGNMENTS.find(a => a.value === data.alignment)?.label}</span>
              </div>
            </div>
            <div>
              <Label className="text-slate-300">Notes / Backstory (Optional)</Label>
              <Textarea
                value={data.backstory_notes}
                onChange={(e) => updateData('backstory_notes', e.target.value)}
                placeholder="Add any notes about your character's backstory..."
                className="bg-slate-800 border-slate-700 text-white mt-1 h-24"
              />
              <AegisSuggestions
                type="backstory"
                context={data}
                onSelect={(backstory) => updateData('backstory_notes', backstory)}
                label="Backstory"
              />
            </div>
          </div>
        );
    }
  };
  
  return (
    <Card className="bg-slate-900/80 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                i < step ? "bg-violet-500 text-white" :
                i === step ? "bg-violet-500/20 border-2 border-violet-500 text-violet-400" :
                "bg-slate-800 text-slate-500"
              )}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={cn(
                  "w-4 md:w-8 h-0.5 mx-1",
                  i < step ? "bg-violet-500" : "bg-slate-700"
                )} />
              )}
            </div>
          ))}
        </div>
        <CardTitle className="text-white">{steps[step].title}</CardTitle>
        <p className="text-slate-400 text-sm">{steps[step].subtitle}</p>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
        
        <div className="flex justify-between mt-6 pt-4 border-t border-slate-700">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 0}
            className="border-slate-600 text-slate-300"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          
          {step < steps.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-violet-600 hover:bg-violet-700"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {isLoading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                  <Zap className="h-4 w-4" />
                </motion.div>
              ) : (
                <>
                  Create Vigilante
                  <Zap className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}