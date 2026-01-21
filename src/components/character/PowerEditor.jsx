import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { X, Zap, Info, Plus, Trash2, Flame, Droplet, Wind, Sparkles, Focus, Link2 } from "lucide-react";

const SP_COSTS = [
  { value: 1, label: '1 SP - Basic attack, minor effect' },
  { value: 2, label: '2 SP - Core ability, status effect' },
  { value: 3, label: '3 SP - AoE, enhanced status, heal' },
  { value: 4, label: '4 SP - Strong AoE, hard crowd control' },
  { value: 5, label: '5 SP - Ultimate (10-turn cooldown)' }
];

const EFFECT_TAGS = [
  { name: 'Burn', desc: '1d4 fire damage at start of next turn', category: 'damage' },
  { name: 'Freeze', desc: 'Reduces movement by 10 ft for 1 round', category: 'control' },
  { name: 'Stun', desc: 'Target loses next turn (WIS save)', category: 'control' },
  { name: 'Push/Pull', desc: 'Move target 10-20 ft (STR/DEX save)', category: 'control' },
  { name: 'Weaken', desc: '-2 to attack rolls for 1 round', category: 'debuff' },
  { name: 'Blind', desc: 'Disadvantage on attacks (CON save)', category: 'debuff' },
  { name: 'Regen', desc: 'Regain 1d6 SP/HP for 3 turns', category: 'buff' },
  { name: 'Shield', desc: 'Temp HP or AC boost until hit', category: 'buff' },
  { name: 'Phase', desc: 'Teleport short range or avoid attacks', category: 'utility' },
  { name: 'Frighten', desc: 'Target is Frightened (WIS save)', category: 'debuff' },
  { name: 'Charm', desc: 'Target is Charmed (CHA save)', category: 'control' },
  { name: 'Poison', desc: '1d6 poison damage each turn', category: 'damage' },
  { name: 'Paralyze', desc: 'Target is Paralyzed (CON save)', category: 'control' },
  { name: 'Confusion', desc: 'Target acts randomly (INT save)', category: 'control' },
  { name: 'Haste', desc: '+1 action, +10 ft movement', category: 'buff' },
  { name: 'Slow', desc: '-1 action, -10 ft movement', category: 'debuff' },
  { name: 'Knockdown', desc: 'Target falls prone (STR save)', category: 'control' },
  { name: 'Silence', desc: 'Cannot cast spells/use verbal powers', category: 'control' }
];

const DAMAGE_TYPES = [
  { name: 'Fire', icon: Flame, color: 'text-orange-400' },
  { name: 'Water', icon: Droplet, color: 'text-blue-400' },
  { name: 'Earth', icon: Sparkles, color: 'text-amber-600' },
  { name: 'Air', icon: Wind, color: 'text-cyan-400' },
  { name: 'Lightning', icon: Zap, color: 'text-yellow-400' },
  { name: 'Ice', icon: Droplet, color: 'text-cyan-200' },
  { name: 'Light', icon: Sparkles, color: 'text-yellow-200' },
  { name: 'Shadow', icon: Sparkles, color: 'text-purple-400' },
  { name: 'Energy', icon: Zap, color: 'text-violet-400' },
  { name: 'Psychic', icon: Sparkles, color: 'text-pink-400' },
  { name: 'Void', icon: Sparkles, color: 'text-slate-400' },
  { name: 'Catalyst', icon: Zap, color: 'text-emerald-400' },
  { name: 'Aether', icon: Sparkles, color: 'text-indigo-400' },
  { name: 'Force', icon: Zap, color: 'text-blue-500' },
  { name: 'Necrotic', icon: Sparkles, color: 'text-green-500' },
  { name: 'Radiant', icon: Sparkles, color: 'text-amber-300' },
  { name: 'Poison', icon: Droplet, color: 'text-green-600' },
  { name: 'Acid', icon: Droplet, color: 'text-lime-500' },
  { name: 'Thunder', icon: Zap, color: 'text-indigo-500' },
  { name: 'Slashing', icon: Sparkles, color: 'text-slate-300' },
  { name: 'Piercing', icon: Sparkles, color: 'text-slate-300' },
  { name: 'Bludgeoning', icon: Sparkles, color: 'text-slate-300' }
];

const CONCENTRATION_DURATIONS = [
  '1 turn',
  '2 turns',
  '3 turns',
  '1 minute',
  '5 minutes',
  '10 minutes',
  'Until end of combat',
  'Until dismissed'
];

const POWER_STYLE_LABELS = {
  physical_powerhouse: 'Physical Powerhouse',
  energy_manipulator: 'Energy Manipulator',
  speedster: 'Speedster',
  telekinetic_psychic: 'Telekinetic/Psychic',
  illusionist: 'Illusionist',
  shape_shifter: 'Shape-shifter',
  elemental_controller: 'Elemental Controller'
};

const RANGE_OPTIONS = [
  'Melee',
  'Self',
  '15 ft',
  '30 ft',
  '60 ft',
  '30 ft cone',
  '60 ft line',
  '15 ft radius',
  '30 ft radius'
];

const SAVE_TYPES = [
  'STR save',
  'DEX save',
  'CON save',
  'INT save',
  'WIS save',
  'CHA save'
];

export default function PowerEditor({ power, onSave, onClose, character }) {
  const [data, setData] = useState(power || {
    name: '',
    range: 'Melee',
    effect: '',
    sp_cost: 1,
    saving_throw: '',
    description: '',
    cooldown: 0,
    damage_type: '',
    damage_dice_count: 2,
    damage_dice_type: 6,
    damage_modifier: 0,
    effect_tags: [],
    custom_effect_tags: [],
    requires_concentration: false,
    concentration_duration: '1 turn',
    linked_to_origin: false,
    linked_to_power_style: '',
    is_signature_move: false
  });
  
  const [customTagName, setCustomTagName] = useState('');
  const [customTagDesc, setCustomTagDesc] = useState('');
  
  const updateData = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
    
    // Auto-set cooldown for ultimate powers
    if (field === 'sp_cost' && value === 5) {
      setData(prev => ({ ...prev, [field]: value, cooldown: 10 }));
    }
    
    // Auto-adjust SP cost for concentration powers
    if (field === 'requires_concentration' && value === true && prev.sp_cost < 2) {
      setData(prev => ({ ...prev, [field]: value, sp_cost: 2 }));
    }
  };
  
  const toggleEffectTag = (tag) => {
    const current = data.effect_tags || [];
    if (current.includes(tag)) {
      updateData('effect_tags', current.filter(t => t !== tag));
    } else {
      updateData('effect_tags', [...current, tag]);
    }
  };
  
  const addCustomTag = () => {
    if (!customTagName.trim()) return;
    
    const newTag = {
      name: customTagName.trim(),
      description: customTagDesc.trim() || 'Custom effect'
    };
    
    const current = data.custom_effect_tags || [];
    updateData('custom_effect_tags', [...current, newTag]);
    setCustomTagName('');
    setCustomTagDesc('');
  };
  
  const removeCustomTag = (index) => {
    const current = data.custom_effect_tags || [];
    updateData('custom_effect_tags', current.filter((_, i) => i !== index));
  };
  
  const isValid = data.name?.trim() && data.effect?.trim();
  
  const effectTagsByCategory = EFFECT_TAGS.reduce((acc, tag) => {
    if (!acc[tag.category]) acc[tag.category] = [];
    acc[tag.category].push(tag);
    return acc;
  }, {});
  
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-violet-400" />
            {power ? 'Edit Power' : 'Create Power'}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="basics" className="space-y-4">
          <TabsList className="bg-slate-800 w-full justify-start">
            <TabsTrigger value="basics">Basics</TabsTrigger>
            <TabsTrigger value="effects">Effects & Tags</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="linking">Theming</TabsTrigger>
          </TabsList>
          
          {/* BASICS TAB */}
          <TabsContent value="basics" className="space-y-4">
            {/* Power Name */}
          <div>
            <Label className="text-slate-300">Power Name *</Label>
            <Input
              value={data.name}
              onChange={(e) => updateData('name', e.target.value)}
              placeholder="e.g., Shadowstrike, Nova Burst"
              className="bg-slate-800 border-slate-700 text-white mt-1"
            />
          </div>
          
          {/* SP Cost */}
          <div>
            <Label className="text-slate-300">SP Cost *</Label>
            <Select value={String(data.sp_cost)} onValueChange={(v) => updateData('sp_cost', parseInt(v))}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SP_COSTS.map(cost => (
                  <SelectItem key={cost.value} value={String(cost.value)}>
                    {cost.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Range */}
          <div>
            <Label className="text-slate-300">Range</Label>
            <Select value={data.range} onValueChange={(v) => updateData('range', v)}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RANGE_OPTIONS.map(range => (
                  <SelectItem key={range} value={range}>{range}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Damage Dice */}
          <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
            <Label className="text-slate-300">Damage Dice (optional)</Label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs text-slate-400">Number of Dice</Label>
                <Input
                  type="number"
                  min={0}
                  max={10}
                  value={data.damage_dice_count || 0}
                  onChange={(e) => updateData('damage_dice_count', parseInt(e.target.value) || 0)}
                  className="bg-slate-800 border-slate-700 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-400">Dice Type</Label>
                <Select value={String(data.damage_dice_type || 6)} onValueChange={(v) => updateData('damage_dice_type', parseInt(v))}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">d4</SelectItem>
                    <SelectItem value="6">d6</SelectItem>
                    <SelectItem value="8">d8</SelectItem>
                    <SelectItem value="10">d10</SelectItem>
                    <SelectItem value="12">d12</SelectItem>
                    <SelectItem value="20">d20</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-slate-400">Modifier</Label>
                <Input
                  type="number"
                  min={-10}
                  max={20}
                  value={data.damage_modifier || 0}
                  onChange={(e) => updateData('damage_modifier', parseInt(e.target.value) || 0)}
                  className="bg-slate-800 border-slate-700 text-white mt-1"
                />
              </div>
            </div>
            {(data.damage_dice_count > 0) && (
              <div className="bg-violet-500/10 border border-violet-500/30 rounded p-2">
                <p className="text-sm text-violet-300 font-mono">
                  {data.damage_dice_count}d{data.damage_dice_type}
                  {data.damage_modifier !== 0 && ` ${data.damage_modifier >= 0 ? '+' : ''}${data.damage_modifier}`}
                  {data.damage_type && ` ${data.damage_type} damage`}
                </p>
              </div>
            )}
          </div>

          {/* Effect */}
          <div>
            <Label className="text-slate-300">Effect Description *</Label>
            <Textarea
              value={data.effect}
              onChange={(e) => updateData('effect', e.target.value)}
              placeholder="e.g., Strike target with flames + Burn effect"
              className="bg-slate-800 border-slate-700 text-white mt-1 h-20"
            />
            <p className="text-xs text-slate-500 mt-1">Describe the power's mechanical effect and any additional effects</p>
          </div>
          
          {/* Description */}
          <div>
            <Label className="text-slate-300">Description (flavor text)</Label>
            <Textarea
              value={data.description}
              onChange={(e) => updateData('description', e.target.value)}
              placeholder="Describe what this power looks and feels like..."
              className="bg-slate-800 border-slate-700 text-white mt-1 h-20"
            />
          </div>
          </TabsContent>
          
          {/* EFFECTS & TAGS TAB */}
          <TabsContent value="effects" className="space-y-4">
            {/* Damage Type */}
            <div>
              <Label className="text-slate-300 flex items-center gap-2">
                <Flame className="h-4 w-4" />
                Damage/Element Type
              </Label>
              <Select value={data.damage_type || ''} onValueChange={(v) => updateData('damage_type', v)}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                  <SelectValue placeholder="Select type (optional)" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value={null}>None</SelectItem>
                  {DAMAGE_TYPES.map(type => (
                    <SelectItem key={type.name} value={type.name}>
                      <span className={type.color}>{type.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {data.damage_type && (
                <p className="text-xs text-slate-500 mt-1">
                  See Elemental Damage Hierarchy for strengths/weaknesses
                </p>
              )}
            </div>
            
            <Separator className="bg-slate-700" />
            
            {/* Predefined Effect Tags */}
            <div>
              <Label className="text-slate-300 mb-2 block">Standard Effect Tags</Label>
              <p className="text-xs text-slate-500 mb-3">Click to add/remove effects</p>
              
              {Object.entries(effectTagsByCategory).map(([category, tags]) => (
                <div key={category} className="mb-3">
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-1 capitalize">{category}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map(tag => {
                      const isSelected = data.effect_tags?.includes(tag.name);
                      return (
                        <Badge
                          key={tag.name}
                          variant={isSelected ? "default" : "outline"}
                          className={cn(
                            "cursor-pointer text-xs transition-all",
                            isSelected 
                              ? "bg-violet-500 hover:bg-violet-600 text-white" 
                              : "border-slate-600 text-slate-400 hover:border-violet-500 hover:text-violet-300"
                          )}
                          onClick={() => toggleEffectTag(tag.name)}
                          title={tag.desc}
                        >
                          {tag.name}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            <Separator className="bg-slate-700" />
            
            {/* Custom Effect Tags */}
            <div>
              <Label className="text-slate-300 mb-2 block">Custom Effect Tags</Label>
              <p className="text-xs text-slate-500 mb-3">Create unique effects for your power</p>
              
              {/* Custom tags list */}
              {data.custom_effect_tags?.length > 0 && (
                <div className="space-y-2 mb-3">
                  {data.custom_effect_tags.map((tag, index) => (
                    <div key={index} className="flex items-start gap-2 bg-slate-800 rounded-lg p-2">
                      <div className="flex-1">
                        <div className="font-medium text-sm text-white">{tag.name}</div>
                        <div className="text-xs text-slate-400">{tag.description}</div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-red-400 hover:text-red-300"
                        onClick={() => removeCustomTag(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Add custom tag */}
              <div className="space-y-2 bg-slate-800/50 rounded-lg p-3">
                <Input
                  placeholder="Tag name (e.g., Drain Life)"
                  value={customTagName}
                  onChange={(e) => setCustomTagName(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                />
                <Input
                  placeholder="Description (e.g., Heal HP equal to damage dealt)"
                  value={customTagDesc}
                  onChange={(e) => setCustomTagDesc(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                />
                <Button
                  onClick={addCustomTag}
                  disabled={!customTagName.trim()}
                  size="sm"
                  variant="outline"
                  className="w-full border-violet-500 text-violet-400"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Custom Tag
                </Button>
              </div>
            </div>
          </TabsContent>
          
          {/* ADVANCED TAB */}
          <TabsContent value="advanced" className="space-y-4">
          
          {/* Saving Throw */}
          <div>
            <Label className="text-slate-300">Saving Throw (if applicable)</Label>
            <div className="flex gap-2 mt-1">
              <Select value={data.saving_throw?.split(' ')[0] || ''} onValueChange={(v) => {
                const dc = data.saving_throw?.match(/DC (\d+)/)?.[1] || '13';
                updateData('saving_throw', v ? `${v} save DC ${dc}` : '');
              }}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white flex-1">
                  <SelectValue placeholder="Save type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>None</SelectItem>
                  {['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map(stat => (
                    <SelectItem key={stat} value={stat}>{stat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {data.saving_throw && (
                <Input
                  type="number"
                  min={10}
                  max={25}
                  value={data.saving_throw?.match(/DC (\d+)/)?.[1] || 13}
                  onChange={(e) => {
                    const stat = data.saving_throw?.split(' ')[0] || 'DEX';
                    updateData('saving_throw', `${stat} save DC ${e.target.value}`);
                  }}
                  className="bg-slate-800 border-slate-700 text-white w-20"
                  placeholder="DC"
                />
              )}
            </div>
          </div>
          
          {/* Concentration */}
          <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="concentration"
                  checked={data.requires_concentration}
                  onCheckedChange={(checked) => updateData('requires_concentration', checked)}
                />
                <Label htmlFor="concentration" className="text-slate-300 cursor-pointer flex items-center gap-2">
                  <Focus className="h-4 w-4 text-violet-400" />
                  Requires Concentration
                </Label>
              </div>
            </div>
            
            {data.requires_concentration && (
              <>
                <p className="text-xs text-slate-400">
                  Concentration powers cost +1 SP per round to maintain. Breaking concentration ends the effect.
                </p>
                <div>
                  <Label className="text-slate-300 text-xs">Duration</Label>
                  <Select 
                    value={data.concentration_duration} 
                    onValueChange={(v) => updateData('concentration_duration', v)}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONCENTRATION_DURATIONS.map(duration => (
                        <SelectItem key={duration} value={duration}>{duration}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="bg-violet-500/10 border border-violet-500/30 rounded p-2">
                  <p className="text-xs text-violet-300">
                    <strong>Adjusted SP Cost:</strong> {data.sp_cost} initial + 1/round to maintain
                  </p>
                </div>
              </>
            )}
          </div>
          
          {/* Cooldown */}
          <div>
            <Label className="text-slate-300">Cooldown (turns)</Label>
            <Input
              type="number"
              min={0}
              max={20}
              value={data.cooldown}
              onChange={(e) => updateData('cooldown', parseInt(e.target.value) || 0)}
              className="bg-slate-800 border-slate-700 text-white mt-1"
            />
            {data.sp_cost === 5 && (
              <p className="text-xs text-amber-400 mt-1">Ultimate powers have a 10-turn cooldown</p>
            )}
          </div>
          </TabsContent>
          
          {/* THEMING TAB */}
          <TabsContent value="linking" className="space-y-4">
            <div className="bg-slate-800/50 rounded-lg p-4 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Link2 className="h-4 w-4 text-violet-400" />
                  <Label className="text-slate-300">Thematic Links & Designation</Label>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Link this power to your character's origin or power style for thematic consistency
                </p>
              </div>

              {/* Signature Move */}
              <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="signature-move"
                    checked={data.is_signature_move}
                    onCheckedChange={(checked) => updateData('is_signature_move', checked)}
                  />
                  <Label htmlFor="signature-move" className="text-amber-300 cursor-pointer flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Mark as Signature Move
                  </Label>
                </div>
                {data.is_signature_move && (
                  <p className="text-xs text-amber-400 ml-6">
                    This is your most iconic power - typically a 2-3 SP move that defines your combat style
                  </p>
                )}
              </div>

              <Separator className="bg-slate-700" />
              
              {/* Link to Origin */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="link-origin"
                    checked={data.linked_to_origin}
                    onCheckedChange={(checked) => updateData('linked_to_origin', checked)}
                  />
                  <Label htmlFor="link-origin" className="text-slate-300 cursor-pointer">
                    Linked to Origin Story
                  </Label>
                </div>
                {data.linked_to_origin && character?.origin_story && (
                  <div className="ml-6 bg-slate-700/50 rounded p-2">
                    <Badge className="bg-amber-500/20 text-amber-300 text-xs">
                      {character.origin_story.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                    <p className="text-xs text-slate-400 mt-1">
                      This power reflects your origin story and signature abilities
                    </p>
                  </div>
                )}
              </div>
              
              <Separator className="bg-slate-700" />
              
              {/* Link to Power Style */}
              <div className="space-y-2">
                <Label className="text-slate-300">Linked to Power Style</Label>
                <Select 
                  value={data.linked_to_power_style || ''} 
                  onValueChange={(v) => updateData('linked_to_power_style', v)}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>None</SelectItem>
                    {character?.power_styles?.map(style => (
                      <SelectItem key={style} value={style}>
                        {POWER_STYLE_LABELS[style]}
                        {style === character.primary_power_style && ' (Primary)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {data.linked_to_power_style && (
                  <p className="text-xs text-slate-400">
                    This power draws from your {POWER_STYLE_LABELS[data.linked_to_power_style]} abilities
                  </p>
                )}
              </div>
              
              {(data.linked_to_origin || data.linked_to_power_style) && (
                <div className="bg-violet-500/10 border border-violet-500/30 rounded p-3">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-violet-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-violet-300">
                      <strong>Thematic Bonus:</strong> Powers linked to your origin or primary power style 
                      may receive narrative advantages or GM-approved bonuses in appropriate situations.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
          <Button variant="outline" onClick={onClose} className="border-slate-600 text-slate-300">
            Cancel
          </Button>
          <Button 
            onClick={() => onSave(data)}
            disabled={!isValid}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {power ? 'Update Power' : 'Create Power'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}