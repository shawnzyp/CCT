import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, Sparkles, Wand2 } from 'lucide-react';

const themes = [
  { value: 'rescue', label: 'Rescue Mission' },
  { value: 'investigation', label: 'Investigation' },
  { value: 'sabotage', label: 'Sabotage' },
  { value: 'heist', label: 'Heist' },
  { value: 'defense', label: 'Defense' },
  { value: 'exploration', label: 'Exploration' }
];

const difficulties = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
  { value: 'deadly', label: 'Deadly' }
];

const settings = [
  { value: 'urban', label: 'Urban' },
  { value: 'underground', label: 'Underground' },
  { value: 'wilderness', label: 'Wilderness' },
  { value: 'facility', label: 'Facility' },
  { value: 'space', label: 'Space' }
];

export default function ProceduralMissionGenerator({ onGenerate, onClose, isLoading }) {
  const [theme, setTheme] = useState('rescue');
  const [difficulty, setDifficulty] = useState('medium');
  const [setting, setSetting] = useState('urban');

  const handleGenerate = () => {
    onGenerate({ theme, difficulty, setting });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-slate-900 to-slate-950 border-slate-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-cyan-400">
            <Wand2 className="h-5 w-5" />
            Generate Quest
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Mission Theme</label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="bg-slate-800 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {themes.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Difficulty</label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="bg-slate-800 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {difficulties.map(d => (
                  <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Setting</label>
            <Select value={setting} onValueChange={setSetting}>
              <SelectTrigger className="bg-slate-800 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {settings.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-violet-500/10 border border-violet-500/30 rounded-lg p-3">
            <p className="text-xs text-violet-200">
              <strong>AI Generation:</strong> Creating a unique, narrative-driven mission tailored to your selections.
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-slate-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isLoading}
              className="flex-1 bg-violet-600 hover:bg-violet-700 gap-2"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin">⚡</span>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}