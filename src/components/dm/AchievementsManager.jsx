import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trophy, Award, Star, Plus, Edit, Trash2, Send } from "lucide-react";
import { toast } from "sonner";
import { base44 } from '@/api/base44Client';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ACHIEVEMENT_TEMPLATES = [
  {
    id: 'first_blood',
    name: 'First Blood',
    description: 'Defeat your first enemy in combat',
    icon: '⚔️',
    type: 'combat',
    tiers: [
      { level: 1, requirement: 'Defeat 1 enemy', auto_track: { stat: 'enemies_defeated', threshold: 1 } },
      { level: 2, requirement: 'Defeat 10 enemies', auto_track: { stat: 'enemies_defeated', threshold: 10 } },
      { level: 3, requirement: 'Defeat 50 enemies', auto_track: { stat: 'enemies_defeated', threshold: 50 } }
    ]
  },
  {
    id: 'level_up',
    name: 'Rising Star',
    description: 'Advance your heroic journey',
    icon: '⭐',
    type: 'progression',
    tiers: [
      { level: 1, requirement: 'Reach Level 5', auto_track: { stat: 'level', threshold: 5 } },
      { level: 2, requirement: 'Reach Level 10', auto_track: { stat: 'level', threshold: 10 } },
      { level: 3, requirement: 'Reach Level 15', auto_track: { stat: 'level', threshold: 15 } }
    ]
  },
  {
    id: 'critical_master',
    name: 'Critical Master',
    description: 'Land devastating critical hits',
    icon: '🎯',
    type: 'combat',
    tiers: [
      { level: 1, requirement: 'Land 5 critical hits', auto_track: { stat: 'critical_hits', threshold: 5 } },
      { level: 2, requirement: 'Land 25 critical hits', auto_track: { stat: 'critical_hits', threshold: 25 } },
      { level: 3, requirement: 'Land 100 critical hits', auto_track: { stat: 'critical_hits', threshold: 100 } }
    ]
  },
  {
    id: 'quest_seeker',
    name: 'Quest Seeker',
    description: 'Complete campaign quests',
    icon: '📜',
    type: 'quest',
    tiers: [
      { level: 1, requirement: 'Complete 1 quest', auto_track: { stat: 'quests_completed', threshold: 1 } },
      { level: 2, requirement: 'Complete 5 quests', auto_track: { stat: 'quests_completed', threshold: 5 } },
      { level: 3, requirement: 'Complete 15 quests', auto_track: { stat: 'quests_completed', threshold: 15 } }
    ]
  }
];

export default function AchievementsManager({ campaign, characters, onUpdate }) {
  const [achievements, setAchievements] = useState(campaign.achievement_definitions || ACHIEVEMENT_TEMPLATES);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAwardDialog, setShowAwardDialog] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState('');
  const [selectedAchievement, setSelectedAchievement] = useState('');
  const [selectedTier, setSelectedTier] = useState(1);

  const saveAchievements = (updated) => {
    setAchievements(updated);
    onUpdate({ achievement_definitions: updated });
    toast.success('Achievements updated');
  };

  const deleteAchievement = (id) => {
    const updated = achievements.filter(a => a.id !== id);
    saveAchievements(updated);
  };

  const awardAchievement = async () => {
    if (!selectedCharacter || !selectedAchievement) {
      toast.error('Select character and achievement');
      return;
    }

    const achievement = achievements.find(a => a.id === selectedAchievement);
    const character = characters.find(c => c.id === selectedCharacter);

    const award = {
      achievement_id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      tier: selectedTier,
      awarded_at: new Date().toISOString()
    };

    const currentAchievements = character.achievements || [];
    await base44.entities.Character.update(selectedCharacter, {
      achievements: [...currentAchievements, award]
    });

    toast.success(`Awarded ${achievement.name} to ${character.name}!`);
    setShowAwardDialog(false);
    setSelectedCharacter('');
    setSelectedAchievement('');
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-violet-600 hover:bg-violet-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Define Achievement
        </Button>
        <Button
          onClick={() => setShowAwardDialog(true)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Send className="h-4 w-4 mr-2" />
          Award Achievement
        </Button>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="grid gap-3">
          {achievements.map((achievement) => (
            <Card key={achievement.id} className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div>
                      <CardTitle className="text-white text-base">{achievement.name}</CardTitle>
                      <p className="text-xs text-slate-400">{achievement.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteAchievement(achievement.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {achievement.tiers.map((tier, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-yellow-600">Tier {tier.level}</Badge>
                        <span className="text-sm text-slate-300">{tier.requirement}</span>
                      </div>
                      {tier.auto_track && (
                        <Badge variant="outline" className="text-violet-400 border-violet-400 text-xs">
                          Auto
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Award Dialog */}
      <Dialog open={showAwardDialog} onOpenChange={setShowAwardDialog}>
        <DialogContent className="bg-slate-900 border-2 border-emerald-500 text-white">
          <DialogHeader>
            <DialogTitle className="text-emerald-400">Award Achievement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 uppercase">Character</label>
              <Select value={selectedCharacter} onValueChange={setSelectedCharacter}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue placeholder="Select character" />
                </SelectTrigger>
                <SelectContent>
                  {characters.map(char => (
                    <SelectItem key={char.id} value={char.id}>{char.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase">Achievement</label>
              <Select value={selectedAchievement} onValueChange={setSelectedAchievement}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue placeholder="Select achievement" />
                </SelectTrigger>
                <SelectContent>
                  {achievements.map(ach => (
                    <SelectItem key={ach.id} value={ach.id}>
                      {ach.icon} {ach.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase">Tier</label>
              <Select value={selectedTier.toString()} onValueChange={(v) => setSelectedTier(parseInt(v))}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3].map(tier => (
                    <SelectItem key={tier} value={tier.toString()}>Tier {tier}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={awardAchievement} className="w-full bg-emerald-600 hover:bg-emerald-700">
              <Trophy className="h-4 w-4 mr-2" />
              Award Achievement
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}