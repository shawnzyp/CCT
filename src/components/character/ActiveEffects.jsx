import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Plus, X, TrendingUp, TrendingDown, Shield, Timer } from "lucide-react";

const effectTypes = {
  buff: { icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500' },
  debuff: { icon: TrendingDown, color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500' },
  condition: { icon: Shield, color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500' },
  concentration: { icon: Sparkles, color: 'text-violet-400', bg: 'bg-violet-500/20', border: 'border-violet-500' }
};

export default function ActiveEffects({ character, onUpdate }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEffect, setNewEffect] = useState({
    name: '',
    type: 'buff',
    duration: '',
    description: ''
  });

  const activeEffects = character.active_conditions || [];

  const handleAddEffect = () => {
    if (!newEffect.name.trim()) return;

    const effect = {
      id: Date.now().toString(),
      ...newEffect,
      applied_at: new Date().toISOString()
    };

    onUpdate({ 
      active_conditions: [...activeEffects, effect]
    });

    setNewEffect({ name: '', type: 'buff', duration: '', description: '' });
    setDialogOpen(false);
  };

  const handleRemoveEffect = (effectId) => {
    onUpdate({
      active_conditions: activeEffects.filter(e => e.id !== effectId)
    });
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-400" />
          Active Effects
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Effect
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Add Active Effect</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Effect Name</label>
                <Input
                  value={newEffect.name}
                  onChange={(e) => setNewEffect({ ...newEffect, name: e.target.value })}
                  placeholder="e.g., Haste, Poisoned, Blessed"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Type</label>
                <Select value={newEffect.type} onValueChange={(v) => setNewEffect({ ...newEffect, type: v })}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buff">Buff</SelectItem>
                    <SelectItem value="debuff">Debuff</SelectItem>
                    <SelectItem value="condition">Condition</SelectItem>
                    <SelectItem value="concentration">Concentration</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">Duration</label>
                <Input
                  value={newEffect.duration}
                  onChange={(e) => setNewEffect({ ...newEffect, duration: e.target.value })}
                  placeholder="e.g., 1 hour, 3 rounds, Until rest"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">Description</label>
                <Textarea
                  value={newEffect.description}
                  onChange={(e) => setNewEffect({ ...newEffect, description: e.target.value })}
                  placeholder="Effect details..."
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <Button onClick={handleAddEffect} className="w-full">
                Add Effect
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {activeEffects.length > 0 ? (
          <div className="space-y-2">
            {activeEffects.map((effect) => {
              const config = effectTypes[effect.type] || effectTypes.buff;
              const Icon = config.icon;
              
              return (
                <div 
                  key={effect.id}
                  className={`${config.bg} border ${config.border} rounded-lg p-3`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${config.color}`} />
                      <span className="font-semibold text-white">{effect.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {effect.type}
                      </Badge>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-slate-400 hover:text-white"
                      onClick={() => handleRemoveEffect(effect.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {effect.duration && (
                    <div className="flex items-center gap-1 text-xs text-slate-300 mb-1">
                      <Timer className="h-3 w-3" />
                      <span>{effect.duration}</span>
                    </div>
                  )}
                  
                  {effect.description && (
                    <p className="text-sm text-slate-300">{effect.description}</p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-slate-400 py-6">No active effects</p>
        )}
      </CardContent>
    </Card>
  );
}