import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, Flame, Droplet, Zap, Wind, Mountain, Snowflake, Sun, Moon, Skull, CloudRain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const HAZARD_PRESETS = [
  { name: 'Burning Building', icon: Flame, color: 'orange', effect: '1d6 fire damage at start of turn', saveDC: 13, saveType: 'DEX' },
  { name: 'Electrified Floor', icon: Zap, color: 'yellow', effect: '1d4 lightning damage on movement', saveDC: 12, saveType: 'DEX' },
  { name: 'Toxic Gas', icon: Skull, color: 'green', effect: '1d4 poison damage, disadvantage on attacks', saveDC: 14, saveType: 'CON' },
  { name: 'Icy Terrain', icon: Snowflake, color: 'cyan', effect: 'Difficult terrain, DEX save or fall prone', saveDC: 13, saveType: 'DEX' },
  { name: 'Debris Field', icon: Mountain, color: 'slate', effect: 'Difficult terrain, half movement', saveDC: 0, saveType: 'None' },
  { name: 'Heavy Rain', icon: CloudRain, color: 'blue', effect: 'Disadvantage on Perception, ranged attacks', saveDC: 0, saveType: 'None' },
  { name: 'Strong Winds', icon: Wind, color: 'slate', effect: 'Movement halved, ranged attacks disadvantage', saveDC: 0, saveType: 'None' },
  { name: 'Low Light', icon: Moon, color: 'indigo', effect: 'Disadvantage on Perception, attacks without darkvision', saveDC: 0, saveType: 'None' },
  { name: 'Bright Glare', icon: Sun, color: 'yellow', effect: 'Disadvantage on Perception checks', saveDC: 0, saveType: 'None' },
  { name: 'Water Hazard', icon: Droplet, color: 'blue', effect: 'Difficult terrain, lightning attacks deal +1d6 to all in area', saveDC: 0, saveType: 'None' }
];

const ICON_MAP = {
  Flame, Droplet, Zap, Wind, Mountain, Snowflake, Sun, Moon, Skull, CloudRain
};

export default function EnvironmentalEffects({ effects = [], onUpdate }) {
  const [showDialog, setShowDialog] = useState(false);
  const [editingEffect, setEditingEffect] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    effect: '',
    saveDC: 0,
    saveType: 'None',
    icon: 'Flame',
    color: 'orange'
  });

  const openDialog = (preset = null) => {
    if (preset) {
      setFormData({
        name: preset.name,
        effect: preset.effect,
        saveDC: preset.saveDC,
        saveType: preset.saveType,
        icon: preset.icon.name,
        color: preset.color
      });
    } else {
      setFormData({
        name: '',
        effect: '',
        saveDC: 0,
        saveType: 'None',
        icon: 'Flame',
        color: 'orange'
      });
    }
    setShowDialog(true);
  };

  const handleSave = () => {
    const newEffect = { ...formData, id: Date.now() };
    onUpdate([...effects, newEffect]);
    setShowDialog(false);
  };

  const handleRemove = (id) => {
    onUpdate(effects.filter(e => e.id !== id));
  };

  const colorClasses = {
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    green: 'bg-green-500/20 text-green-400 border-green-500/50',
    cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50',
    slate: 'bg-slate-500/20 text-slate-400 border-slate-500/50',
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    indigo: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50'
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Mountain className="h-4 w-4 text-violet-400" />
            Environmental Effects
          </CardTitle>
          <Button
            size="sm"
            onClick={() => openDialog()}
            className="bg-violet-600 hover:bg-violet-700 h-7"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {effects.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-slate-500 text-sm mb-3">No environmental effects active</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {HAZARD_PRESETS.slice(0, 3).map(preset => (
                <Button
                  key={preset.name}
                  size="sm"
                  variant="outline"
                  onClick={() => openDialog(preset)}
                  className="text-xs border-slate-600 text-slate-400 hover:border-violet-500"
                >
                  <preset.icon className="h-3 w-3 mr-1" />
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {effects.map((effect) => {
                const Icon = ICON_MAP[effect.icon] || Flame;
                return (
                  <motion.div
                    key={effect.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={cn(
                      "border-2 rounded-lg p-3",
                      colorClasses[effect.color] || colorClasses.orange
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1">
                        <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm">{effect.name}</div>
                          <div className="text-xs opacity-80 mt-1">{effect.effect}</div>
                          {effect.saveDC > 0 && (
                            <div className="text-xs mt-1 font-mono">
                              {effect.saveType} Save DC {effect.saveDC}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemove(effect.id)}
                        className="h-6 w-6 hover:bg-red-500/20 hover:text-red-400"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </CardContent>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-slate-900 border-violet-500 text-white">
          <DialogHeader>
            <DialogTitle className="text-violet-400">Add Environmental Effect</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {HAZARD_PRESETS.map(preset => (
                <Button
                  key={preset.name}
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setFormData({
                      name: preset.name,
                      effect: preset.effect,
                      saveDC: preset.saveDC,
                      saveType: preset.saveType,
                      icon: preset.icon.name,
                      color: preset.color
                    });
                  }}
                  className="text-xs border-slate-600 hover:border-violet-500 flex-col h-auto py-2"
                >
                  <preset.icon className="h-4 w-4 mb-1" />
                  <span className="text-xs">{preset.name.split(' ')[0]}</span>
                </Button>
              ))}
            </div>

            <div>
              <label className="text-sm text-slate-400">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-slate-800 border-slate-600 text-white mt-1"
                placeholder="e.g., Burning Building"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400">Effect Description</label>
              <Textarea
                value={formData.effect}
                onChange={(e) => setFormData(prev => ({ ...prev, effect: e.target.value }))}
                className="bg-slate-800 border-slate-600 text-white mt-1 h-20"
                placeholder="e.g., 1d6 fire damage at start of turn"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-slate-400">Save DC (0 = none)</label>
                <Input
                  type="number"
                  value={formData.saveDC}
                  onChange={(e) => setFormData(prev => ({ ...prev, saveDC: parseInt(e.target.value) || 0 }))}
                  className="bg-slate-800 border-slate-600 text-white mt-1"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400">Save Type</label>
                <Input
                  value={formData.saveType}
                  onChange={(e) => setFormData(prev => ({ ...prev, saveType: e.target.value }))}
                  className="bg-slate-800 border-slate-600 text-white mt-1"
                  placeholder="e.g., DEX"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleSave} 
              className="bg-violet-600 hover:bg-violet-700"
              disabled={!formData.name || !formData.effect}
            >
              Add Effect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}