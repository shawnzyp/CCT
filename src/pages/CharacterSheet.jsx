import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Shield, Zap, Heart, User, Swords, 
  BookOpen, Settings, Plus, Pencil, Trash2, TrendingUp, ArrowUp, Package, FileText, Dices
} from "lucide-react";

import StatBlock, { getModifier, formatModifier } from "@/components/character/StatBlock";
import ResourceBar from "@/components/character/ResourceBar";
import PowerCard from "@/components/character/PowerCard";
import DiceRoller from "@/components/character/DiceRoller";
import { CLASSIFICATION_LABELS, TIER_LABELS, ALIGNMENT_LABELS } from "@/components/character/CharacterCard";
import PowerEditor from "@/components/character/PowerEditor";
import ProgressionBar from "@/components/character/ProgressionBar";
import LevelUpDialog from "@/components/character/LevelUpDialog";
import EquipmentManager from "@/components/character/EquipmentManager";
import PowerUpgradeDialog from "@/components/character/PowerUpgradeDialog";
import SkillsPanel from "@/components/character/SkillsPanel";
import InventoryPanel from "@/components/character/InventoryPanel";
import DowntimeActivities from "@/components/character/DowntimeActivities";
import ImportExportCharacter from "@/components/character/ImportExportCharacter";
import StatsVisual from "@/components/character/StatsVisual";
import ActiveEffects from "@/components/character/ActiveEffects";
import CombatStatsPanel from "@/components/character/CombatStatsPanel";
import CharacterEditor from "@/components/character/CharacterEditor";
import ItemsReference from "@/components/character/ItemsReference";
import CharacterQuestionnaire from "@/components/character/CharacterQuestionnaire";
import ExportCharacterPDF from '@/components/utils/ExportCharacterPDF';
import EnhancedCombatPanel from '@/components/character/EnhancedCombatPanel';
import EnhancedInventorySystem from '@/components/character/EnhancedInventorySystem';
import ProgressionTracker from '@/components/character/ProgressionTracker';
import PlayerJournal from '@/components/character/PlayerJournal';
import EnhancedLevelUpDialog from '@/components/character/EnhancedLevelUpDialog';
import { canLevelUp } from '@/components/character/ProgressionData';
import { toast } from 'sonner';

const ORIGIN_LABELS = {
  the_accident: 'The Accident',
  the_experiment: 'The Experiment',
  the_legacy: 'The Legacy',
  the_awakening: 'The Awakening',
  the_pact: 'The Pact',
  the_lost_time: 'The Lost Time',
  the_exposure: 'The Exposure',
  the_rebirth: 'The Rebirth',
  the_vigil: 'The Vigil',
  the_redemption: 'The Redemption'
};

const POWER_STYLE_LABELS = {
  physical_powerhouse: 'Physical Powerhouse',
  energy_manipulator: 'Energy Manipulator',
  speedster: 'Speedster',
  telekinetic_psychic: 'Telekinetic/Psychic',
  illusionist: 'Illusionist',
  shape_shifter: 'Shape-shifter',
  elemental_controller: 'Elemental Controller'
};

export default function CharacterSheet() {
  const urlParams = new URLSearchParams(window.location.search);
  const characterId = urlParams.get('id');
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [activeTab, setActiveTab] = useState('combat');
  
  const [showPowerEditor, setShowPowerEditor] = useState(false);
  const [editingPower, setEditingPower] = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [upgradingPower, setUpgradingPower] = useState(null);
  const [showCharacterEditor, setShowCharacterEditor] = useState(false);
  
  const { data: character, isLoading } = useQuery({
    queryKey: ['character', characterId],
    queryFn: () => base44.entities.Character.filter({ id: characterId }),
    select: (data) => data[0],
    enabled: !!characterId
  });
  
  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Character.update(characterId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['character', characterId]);
      setLastSaved(new Date());
      setIsSaving(false);
    }
  });

  // Auto-save based on settings
  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('catalystCoreSettings') || '{"autoSave": true, "autoSaveInterval": 3}');
    
    if (!settings.autoSave) return;

    const intervalMs = settings.autoSaveInterval * 60000;
    const autoSaveInterval = setInterval(() => {
      if (character) {
        setIsSaving(true);
        updateMutation.mutate(character);
        // Play darker autosave sound
        const audio = new Audio();
        audio.src = 'https://cdn.freesound.org/previews/397/397353_6666450-lq.mp3';
        audio.volume = 0.15;
        audio.play().catch(() => {});
      }
    }, intervalMs);

    return () => clearInterval(autoSaveInterval);
  }, [character]);

  const handleManualSave = () => {
    setIsSaving(true);
    updateMutation.mutate(character);
    toast.success('Character saved!');
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Zap className="h-8 w-8 text-violet-400" />
        </motion.div>
      </div>
    );
  }
  
  if (!character) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl text-white mb-4">Character not found</h2>
          <Link to={createPageUrl('Home')}>
            <Button>Back Home</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  const conMod = getModifier(character.ability_scores?.CON || 10);
  const dexMod = getModifier(character.ability_scores?.DEX || 10);
  const maxSP = 5 + conMod;

  const rollDice = (bonus, label) => {
    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + bonus;
    const isCrit = roll === 20;
    const isFail = roll === 1;
    
    toast(
      <div className="flex flex-col gap-1">
        <div className="font-semibold">{label}</div>
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-lg font-bold",
            isCrit && "text-green-400",
            isFail && "text-red-400"
          )}>
            {roll}
          </span>
          <span className="text-slate-400">+</span>
          <span className="text-slate-300">{bonus}</span>
          <span className="text-slate-400">=</span>
          <span className="text-lg font-bold text-violet-400">{total}</span>
        </div>
        {isCrit && <span className="text-xs text-green-400">Critical Success!</span>}
        {isFail && <span className="text-xs text-red-400">Critical Failure!</span>}
      </div>,
      { duration: 4000 }
    );
  };
  
  const handleHPChange = (newHP) => {
    updateMutation.mutate({ current_hp: newHP });
  };
  
  const handleSavePower = (power) => {
    const currentPowers = character.powers || [];
    let newPowers;
    
    if (editingPower !== null) {
      newPowers = currentPowers.map((p, i) => i === editingPower ? power : p);
    } else {
      newPowers = [...currentPowers, { ...power, current_cooldown: 0 }];
    }
    
    updateMutation.mutate({ powers: newPowers });
    setShowPowerEditor(false);
    setEditingPower(null);
  };
  
  const handleDeletePower = (index) => {
    const newPowers = character.powers.filter((_, i) => i !== index);
    updateMutation.mutate({ powers: newPowers });
  };
  
  const handleUsePower = (power) => {
    if (power.cooldown > 0) {
      const newPowers = character.powers.map(p => 
        p.name === power.name ? { ...p, current_cooldown: power.cooldown } : p
      );
      updateMutation.mutate({ powers: newPowers });
    }
  };
  
  const handleLevelUp = (updates) => {
    updateMutation.mutate(updates);
    setShowLevelUp(false);
  };
  
  const handlePowerUpgrade = (upgradedPower) => {
    const newPowers = character.powers.map(p => 
      p.name === upgradedPower.name ? upgradedPower : p
    );
    updateMutation.mutate({ powers: newPowers });
    setUpgradingPower(null);
  };
  
  const handleEquipmentUpdate = (equipment) => {
    updateMutation.mutate({ equipment });
  };
  
  const handleSkillsUpdate = (skills) => {
    updateMutation.mutate({ skills });
  };
  
  const handleInventoryUpdate = (updates) => {
    updateMutation.mutate(updates);
  };
  
  const handleEquipFromInventory = (updates) => {
    updateMutation.mutate(updates);
  };

  const handleImport = (characterData) => {
    updateMutation.mutate(characterData);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="space-y-3 mb-4 sm:mb-6">
          {/* Top row: Back button + Portrait + Name */}
          <div className="flex items-start gap-2 sm:gap-3">
            <Link to={createPageUrl('Home')} className="flex-shrink-0">
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white h-8 w-8 sm:h-10 sm:w-10">
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            
            {/* Portrait */}
            <div className={cn(
              "w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0",
              "bg-gradient-to-br from-violet-600 to-purple-700",
              "flex items-center justify-center"
            )}>
              {character.portrait_url ? (
                <img src={character.portrait_url} alt={character.name} className="w-full h-full object-cover" />
              ) : (
                <User className="h-6 w-6 sm:h-7 sm:w-7 text-white/60" />
              )}
            </div>
            
            {/* Name */}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white truncate">{character.name}</h1>
            </div>
          </div>

          {/* Second row: Badges */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <Badge variant="outline" className="border-violet-500/50 text-violet-400 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
              {CLASSIFICATION_LABELS[character.classification]}
            </Badge>
            <Badge variant="outline" className="border-amber-500/50 text-amber-400 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
              {TIER_LABELS[character.tier]}
            </Badge>
            <Badge variant="outline" className="border-slate-500/50 text-slate-400 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
              {ALIGNMENT_LABELS[character.alignment]}
            </Badge>
          </div>

          {/* Third row: Action buttons */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <Button
              onClick={() => setShowCharacterEditor(true)}
              variant="outline"
              size="sm"
              className="border-violet-500 text-violet-400 hover:bg-violet-500/20 text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3"
            >
              <Settings className="h-3 w-3 sm:h-3.5 sm:w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            <ExportCharacterPDF character={character} />
            <ImportExportCharacter character={character} onImport={handleImport} />
          </div>
        </div>
        
        {/* Progression Bar */}
        <div className="mb-6">
          <ProgressionBar 
            character={character} 
            onLevelUp={() => setShowLevelUp(true)}
          />
        </div>
        
        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[60vh]" position="popper" side="bottom" align="start" sideOffset={5}>
              <SelectItem value="combat">⚔️ Combat</SelectItem>
              <SelectItem value="stats">📊 Stats</SelectItem>
              <SelectItem value="powers">⚡ Powers</SelectItem>
              <SelectItem value="equipment">🛡️ Equipment</SelectItem>
              <SelectItem value="inventory">📦 Inventory</SelectItem>
              <SelectItem value="info">📖 Info</SelectItem>
              <SelectItem value="downtime">💙 Downtime</SelectItem>
              <SelectItem value="progression">📈 Progression</SelectItem>
              <SelectItem value="journal">📔 Journal</SelectItem>
              <SelectItem value="notes">📝 Notes</SelectItem>
              <SelectItem value="items">📦 Items Reference</SelectItem>
              <SelectItem value="questionnaire">📖 Questionnaire</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Combat Tab */}
          <TabsContent value="combat" className="space-y-4">
            <EnhancedCombatPanel character={character} onUpdate={(data) => updateMutation.mutate(data)} />
          </TabsContent>
          
          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-4">
                <StatsVisual character={character} />
                
                <SkillsPanel character={character} onUpdate={handleSkillsUpdate} />
                
                <ActiveEffects 
                  character={character} 
                  onUpdate={(data) => updateMutation.mutate(data)} 
                />
              </div>
              
              <div>
                <DiceRoller />
              </div>
            </div>
            
            {/* Saving Throws */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Saving Throws</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map(stat => {
                    const mod = getModifier(character.ability_scores?.[stat] || 10);
                    return (
                      <div key={stat} className="flex items-center justify-between gap-2 bg-slate-700/50 rounded-lg px-3 py-2">
                        <span className="text-sm text-slate-300 font-medium">{stat}</span>
                        <span className={cn(
                          "font-bold text-base",
                          mod >= 0 ? "text-emerald-300" : "text-red-300"
                        )}>
                          {formatModifier(mod)}
                        </span>
                        <Button
                          onClick={() => rollDice(mod, `${stat} Save`)}
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-violet-400 hover:text-violet-300 hover:bg-violet-500/20"
                        >
                          <Dices className="h-3 w-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Powers Tab */}
          <TabsContent value="powers" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Powers ({character.powers?.length || 0}/5)</h2>
              {(character.powers?.length || 0) < 5 && (
                <Button 
                  onClick={() => { setEditingPower(null); setShowPowerEditor(true); }}
                  className="bg-violet-600 hover:bg-violet-700 gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Power
                </Button>
              )}
            </div>
            
            {character.powers?.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {character.powers.map((power, index) => (
                  <div key={index} className="relative group">
                    <PowerCard power={power} onUse={handleUsePower} canUse />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 bg-violet-600/80 hover:bg-violet-500"
                        onClick={() => setUpgradingPower(power)}
                        title="Upgrade Power"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 bg-slate-800/80 hover:bg-slate-700"
                        onClick={() => { setEditingPower(index); setShowPowerEditor(true); }}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 bg-slate-800/80 hover:bg-red-600"
                        onClick={() => handleDeletePower(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="bg-slate-800/30 border-slate-700 border-dashed">
                <CardContent className="py-12 text-center">
                  <Zap className="h-10 w-10 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-300 mb-4">No powers created yet</p>
                  <Button 
                    onClick={() => setShowPowerEditor(true)}
                    variant="outline"
                    className="border-violet-500 text-violet-400"
                  >
                    Create Your First Power
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Equipment Tab */}
          <TabsContent value="equipment">
            <EquipmentManager 
              character={character}
              onUpdate={handleEquipmentUpdate}
            />
          </TabsContent>
          
          {/* Inventory Tab */}
          <TabsContent value="inventory">
            <EnhancedInventorySystem 
              character={character}
              onUpdate={(data) => updateMutation.mutate(data)}
            />
          </TabsContent>

          {/* Progression Tracker Tab */}
          <TabsContent value="progression">
            <ProgressionTracker 
              character={character} 
              onLevelUp={() => setShowLevelUp(true)}
            />
          </TabsContent>

          {/* Player Journal Tab */}
          <TabsContent value="journal">
            <PlayerJournal 
              character={character}
              onUpdate={(data) => updateMutation.mutate(data)}
            />
          </TabsContent>
          
          {/* Downtime Tab */}
          <TabsContent value="downtime">
            <DowntimeActivities 
              character={character}
              onUpdate={(data) => updateMutation.mutate(data)}
            />
          </TabsContent>
          
          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Character Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={character.backstory_notes || ''}
                  onChange={(e) => updateMutation.mutate({ backstory_notes: e.target.value })}
                  className="w-full min-h-[300px] bg-slate-900/50 border border-slate-700 rounded-lg p-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Add your character notes, backstory, or roleplay details..."
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Items Reference Tab */}
          <TabsContent value="items">
            <ItemsReference />
          </TabsContent>

          {/* Questionnaire Tab */}
          <TabsContent value="questionnaire">
            <CharacterQuestionnaire 
              character={character}
              onUpdate={(data) => updateMutation.mutate(data)}
            />
          </TabsContent>

          {/* Info Tab */}
          <TabsContent value="info" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Classification & Origin</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Classification</div>
                    <div className="text-white font-medium mt-1">{CLASSIFICATION_LABELS[character.classification]}</div>
                    {character.classification_perk && (
                      <div className="text-xs text-violet-400 mt-1 italic">✦ {character.classification_perk}</div>
                    )}
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Origin Story</div>
                    <div className="text-white font-medium mt-1">{ORIGIN_LABELS[character.origin_story]}</div>
                    {character.origin_perk && (
                      <div className="text-xs text-violet-400 mt-1 italic">✦ {character.origin_perk}</div>
                    )}
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Power Styles</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {character.power_styles?.map(style => (
                        <Badge 
                          key={style}
                          className={cn(
                            "text-xs",
                            style === character.primary_power_style
                              ? "bg-violet-500 text-white"
                              : "bg-slate-700 text-slate-300"
                          )}
                        >
                          {POWER_STYLE_LABELS[style]}
                          {style === character.primary_power_style && " (Primary)"}
                        </Badge>
                      ))}
                    </div>
                    {character.primary_power_style_perk && (
                      <div className="text-xs text-violet-400 mt-1 italic">✦ Primary Perk: {character.primary_power_style_perk}</div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Identity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Vigilante Name</div>
                    <div className="text-white font-medium mt-1">{character.name}</div>
                  </div>
                  {character.real_name && (
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Real Name</div>
                      <div className="text-white mt-1">{character.real_name}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Alignment</div>
                    <div className="text-white mt-1">{ALIGNMENT_LABELS[character.alignment]}</div>
                    {character.alignment_perk && (
                      <div className="text-xs text-violet-400 mt-1 italic">✦ {character.alignment_perk}</div>
                    )}
                  </div>
                  {character.damage_resistance && (
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Damage Resistance</div>
                      <div className="text-white mt-1">{character.damage_resistance}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {character.backstory_notes && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Backstory Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">{character.backstory_notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Modals */}
      {showPowerEditor && (
        <PowerEditor
          power={editingPower !== null ? character.powers[editingPower] : null}
          character={character}
          onSave={handleSavePower}
          onClose={() => { setShowPowerEditor(false); setEditingPower(null); }}
        />
      )}
      
      {showLevelUp && (
        <EnhancedLevelUpDialog
          character={character}
          onConfirm={handleLevelUp}
          onClose={() => setShowLevelUp(false)}
        />
      )}
      
      {upgradingPower && (
        <PowerUpgradeDialog
          power={upgradingPower}
          onUpgrade={handlePowerUpgrade}
          onClose={() => setUpgradingPower(null)}
        />
      )}

      {showCharacterEditor && (
        <CharacterEditor
          character={character}
          isOpen={showCharacterEditor}
          onClose={() => setShowCharacterEditor(false)}
          onSave={(data) => {
            updateMutation.mutate(data);
            setShowCharacterEditor(false);
          }}
        />
      )}
    </div>
  );
}