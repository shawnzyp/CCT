import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Shield, Zap, Heart, User, Swords, 
  BookOpen, Settings, Plus, Pencil, Trash2 
} from "lucide-react";

import StatBlock, { getModifier, formatModifier } from "@/components/character/StatBlock";
import ResourceBar from "@/components/character/ResourceBar";
import PowerCard from "@/components/character/PowerCard";
import DiceRoller from "@/components/character/DiceRoller";
import { CLASSIFICATION_LABELS, TIER_LABELS, ALIGNMENT_LABELS } from "@/components/character/CharacterCard";
import PowerEditor from "@/components/character/PowerEditor";

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
  
  const [showPowerEditor, setShowPowerEditor] = useState(false);
  const [editingPower, setEditingPower] = useState(null);
  
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
    }
  });
  
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
          <Link to={createPageUrl('Characters')}>
            <Button>Back to Roster</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  const conMod = getModifier(character.ability_scores?.CON || 10);
  const dexMod = getModifier(character.ability_scores?.DEX || 10);
  const maxSP = 5 + conMod;
  
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
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to={createPageUrl('Characters')}>
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          
          <div className="flex-1">
            <div className="flex items-center gap-3">
              {/* Portrait */}
              <div className={cn(
                "w-14 h-14 rounded-xl overflow-hidden flex-shrink-0",
                "bg-gradient-to-br from-violet-600 to-purple-700",
                "flex items-center justify-center"
              )}>
                {character.portrait_url ? (
                  <img src={character.portrait_url} alt={character.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="h-7 w-7 text-white/60" />
                )}
              </div>
              
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">{character.name}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge variant="outline" className="border-violet-500/50 text-violet-400 text-xs">
                    {CLASSIFICATION_LABELS[character.classification]}
                  </Badge>
                  <Badge variant="outline" className="border-amber-500/50 text-amber-400 text-xs">
                    {TIER_LABELS[character.tier]}
                  </Badge>
                  <Badge variant="outline" className="border-slate-500/50 text-slate-400 text-xs">
                    {ALIGNMENT_LABELS[character.alignment]}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Stats Bar */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <ResourceBar
                label="Hit Points"
                current={character.current_hp || character.max_hp}
                max={character.max_hp}
                color="red"
                onChange={handleHPChange}
              />
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wider">Toughness Class</div>
                <div className="text-3xl font-bold text-white">{character.toughness_class || 10}</div>
              </div>
              <Shield className="h-8 w-8 text-blue-400" />
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wider">Stamina Points</div>
                <div className="text-3xl font-bold text-white">{maxSP}</div>
                <div className="text-xs text-slate-500">Regenerates each round</div>
              </div>
              <Zap className="h-8 w-8 text-violet-400" />
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <Tabs defaultValue="stats" className="space-y-4">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="stats" className="data-[state=active]:bg-violet-500/20">
              <Swords className="h-4 w-4 mr-2" />
              Stats
            </TabsTrigger>
            <TabsTrigger value="powers" className="data-[state=active]:bg-violet-500/20">
              <Zap className="h-4 w-4 mr-2" />
              Powers
            </TabsTrigger>
            <TabsTrigger value="info" className="data-[state=active]:bg-violet-500/20">
              <BookOpen className="h-4 w-4 mr-2" />
              Info
            </TabsTrigger>
          </TabsList>
          
          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Ability Scores</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StatBlock scores={character.ability_scores} />
                  </CardContent>
                </Card>
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
                      <div key={stat} className="flex items-center justify-between bg-slate-700/50 rounded-lg px-3 py-2">
                        <span className="text-sm text-slate-400">{stat}</span>
                        <span className={cn(
                          "font-bold",
                          mod >= 0 ? "text-emerald-400" : "text-red-400"
                        )}>
                          {formatModifier(mod)}
                        </span>
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
                  <Zap className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 mb-4">No powers created yet</p>
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
          
          {/* Info Tab */}
          <TabsContent value="info" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Classification & Origin</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider">Classification</div>
                    <div className="text-white font-medium">{CLASSIFICATION_LABELS[character.classification]}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider">Origin Story</div>
                    <div className="text-white font-medium">{ORIGIN_LABELS[character.origin_story]}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider">Power Styles</div>
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
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Identity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider">Vigilante Name</div>
                    <div className="text-white font-medium">{character.name}</div>
                  </div>
                  {character.real_name && (
                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-wider">Real Name</div>
                      <div className="text-white">{character.real_name}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider">Alignment</div>
                    <div className="text-white">{ALIGNMENT_LABELS[character.alignment]}</div>
                  </div>
                  {character.damage_resistance && (
                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-wider">Damage Resistance</div>
                      <div className="text-white">{character.damage_resistance}</div>
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
                  <p className="text-slate-300 whitespace-pre-wrap">{character.backstory_notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Power Editor Modal */}
      {showPowerEditor && (
        <PowerEditor
          power={editingPower !== null ? character.powers[editingPower] : null}
          onSave={handleSavePower}
          onClose={() => { setShowPowerEditor(false); setEditingPower(null); }}
        />
      )}
    </div>
  );
}