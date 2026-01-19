import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { BookOpen, Play, Pause, Plus, Trash2, Edit, Clock, Gift, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import useSoundEffects from '@/components/sounds/useSoundEffects';

export default function AdventureModuleDeployment({ campaign, onUpdate }) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingStage, setEditingStage] = useState(null);
  const [adventureForm, setAdventureForm] = useState({
    title: '',
    description: '',
    duration_minutes: 30,
    stages: [],
    rewards: {
      xp: 0,
      gold: 0,
      items: []
    }
  });
  const [stageForm, setStageForm] = useState({
    title: '',
    description: '',
    choices: [{ text: '', next_stage: null }]
  });
  const { play } = useSoundEffects();

  const activeAdventure = campaign.active_adventure || null;

  const addChoice = () => {
    setStageForm({
      ...stageForm,
      choices: [...stageForm.choices, { text: '', next_stage: null }]
    });
  };

  const updateChoice = (index, field, value) => {
    const updated = [...stageForm.choices];
    updated[index][field] = value;
    setStageForm({ ...stageForm, choices: updated });
  };

  const removeChoice = (index) => {
    setStageForm({
      ...stageForm,
      choices: stageForm.choices.filter((_, i) => i !== index)
    });
  };

  const saveStage = () => {
    if (!stageForm.title || !stageForm.description) {
      toast.error('Stage needs title and description');
      return;
    }

    if (stageForm.choices.some(c => !c.text)) {
      toast.error('All choices need text');
      return;
    }

    const stage = {
      id: editingStage?.id || `stage_${Date.now()}`,
      title: stageForm.title,
      description: stageForm.description,
      choices: stageForm.choices
    };

    let updatedStages;
    if (editingStage) {
      updatedStages = adventureForm.stages.map(s => s.id === editingStage.id ? stage : s);
    } else {
      updatedStages = [...adventureForm.stages, stage];
    }

    setAdventureForm({ ...adventureForm, stages: updatedStages });
    resetStageForm();
    play('success', 0.2);
  };

  const deleteStage = (stageId) => {
    setAdventureForm({
      ...adventureForm,
      stages: adventureForm.stages.filter(s => s.id !== stageId)
    });
    play('error', 0.2);
  };

  const editStage = (stage) => {
    setStageForm({
      title: stage.title,
      description: stage.description,
      choices: [...stage.choices]
    });
    setEditingStage(stage);
  };

  const resetStageForm = () => {
    setStageForm({
      title: '',
      description: '',
      choices: [{ text: '', next_stage: null }]
    });
    setEditingStage(null);
  };

  const deployAdventure = () => {
    if (!adventureForm.title || adventureForm.stages.length === 0) {
      toast.error('Adventure needs title and at least one stage');
      return;
    }

    const adventure = {
      ...adventureForm,
      active: true,
      deployed_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + adventureForm.duration_minutes * 60000).toISOString(),
      player_progress: {},
      completed_by: []
    };

    onUpdate({ active_adventure: adventure });
    setShowCreateDialog(false);
    setAdventureForm({
      title: '',
      description: '',
      duration_minutes: 30,
      stages: [],
      rewards: { xp: 0, gold: 0, items: [] }
    });
    play('success', 0.5);
    toast.success('Adventure deployed to all players!');
  };

  const endAdventure = () => {
    if (!activeAdventure) return;

    const archive = {
      ...activeAdventure,
      active: false,
      ended_at: new Date().toISOString()
    };

    const history = campaign.adventure_history || [];
    history.push(archive);

    onUpdate({
      active_adventure: null,
      adventure_history: history
    });

    play('error', 0.3);
    toast.success('Adventure ended');
  };

  const addRewardItem = () => {
    setAdventureForm({
      ...adventureForm,
      rewards: {
        ...adventureForm.rewards,
        items: [...adventureForm.rewards.items, '']
      }
    });
  };

  const updateRewardItem = (index, value) => {
    const updated = [...adventureForm.rewards.items];
    updated[index] = value;
    setAdventureForm({
      ...adventureForm,
      rewards: { ...adventureForm.rewards, items: updated }
    });
  };

  const removeRewardItem = (index) => {
    setAdventureForm({
      ...adventureForm,
      rewards: {
        ...adventureForm.rewards,
        items: adventureForm.rewards.items.filter((_, i) => i !== index)
      }
    });
  };

  if (activeAdventure) {
    const timeRemaining = new Date(activeAdventure.expires_at) - new Date();
    const minutesLeft = Math.max(0, Math.floor(timeRemaining / 60000));
    const completedCount = activeAdventure.completed_by?.length || 0;

    return (
      <div className="space-y-4">
        <Card className="bg-gradient-to-br from-blue-950 to-slate-900 border-2 border-blue-500">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-400 animate-pulse" />
                {activeAdventure.title}
              </div>
              <Badge className="bg-green-500 text-white">ACTIVE</Badge>
            </CardTitle>
            <p className="text-sm text-slate-300">{activeAdventure.description}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-800/50 rounded">
                <div className="text-xs text-slate-400 uppercase">Time Remaining</div>
                <div className="text-2xl font-bold text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-400" />
                  {minutesLeft}m
                </div>
              </div>
              <div className="p-3 bg-slate-800/50 rounded">
                <div className="text-xs text-slate-400 uppercase">Completed</div>
                <div className="text-2xl font-bold text-white">{completedCount}</div>
              </div>
            </div>

            <div className="p-4 bg-slate-800/50 rounded-lg">
              <div className="text-sm font-semibold text-slate-300 mb-2">Rewards on Completion:</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {activeAdventure.rewards.xp > 0 && (
                  <div className="flex items-center gap-2 text-blue-300">
                    <Zap className="h-4 w-4" />
                    {activeAdventure.rewards.xp} XP
                  </div>
                )}
                {activeAdventure.rewards.gold > 0 && (
                  <div className="flex items-center gap-2 text-yellow-300">
                    <Gift className="h-4 w-4" />
                    {activeAdventure.rewards.gold} Gold
                  </div>
                )}
                {activeAdventure.rewards.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-green-300">
                    <Gift className="h-4 w-4" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={endAdventure}
              variant="outline"
              className="w-full border-red-500 text-red-400 hover:bg-red-500/10"
            >
              <Pause className="h-4 w-4 mr-2" />
              End Adventure
            </Button>
          </CardContent>
        </Card>

        {/* Completed Players */}
        {completedCount > 0 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">Completed By</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {activeAdventure.completed_by?.map((name, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-green-900/20 rounded">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-slate-300">{name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-blue-950 to-slate-900 border-2 border-blue-500">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-400" />
            Adventure Module System
          </CardTitle>
          <p className="text-sm text-slate-300">Deploy interactive choose-your-own-adventure events</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-900/20 border-2 border-blue-600/50 rounded-lg">
            <div className="space-y-2 text-sm text-slate-300">
              <p>Create multi-stage adventures with branching choices:</p>
              <ul className="space-y-1 ml-4">
                <li>• Set time limit for completion</li>
                <li>• Build multiple stages with choices</li>
                <li>• Automatic rewards upon completion</li>
                <li>• Track player progress in real-time</li>
              </ul>
            </div>
          </div>

          <Button
            onClick={() => setShowCreateDialog(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold border-2 border-blue-500"
          >
            <Play className="h-4 w-4 mr-2" />
            Create New Adventure
          </Button>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-slate-900 border-2 border-blue-500 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-blue-400">Create Adventure Module</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 uppercase">Title *</label>
                <Input
                  value={adventureForm.title}
                  onChange={(e) => setAdventureForm({ ...adventureForm, title: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white"
                  placeholder="The Midnight Heist"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase">Description</label>
                <Textarea
                  value={adventureForm.description}
                  onChange={(e) => setAdventureForm({ ...adventureForm, description: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white h-20"
                  placeholder="A mysterious theft has occurred..."
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase">Duration (minutes)</label>
                <Input
                  type="number"
                  value={adventureForm.duration_minutes}
                  onChange={(e) => setAdventureForm({ ...adventureForm, duration_minutes: parseInt(e.target.value) })}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </div>

            {/* Rewards */}
            <div className="p-4 bg-slate-800 rounded-lg space-y-3">
              <div className="text-sm font-semibold text-slate-300">Completion Rewards</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400">XP</label>
                  <Input
                    type="number"
                    value={adventureForm.rewards.xp}
                    onChange={(e) => setAdventureForm({
                      ...adventureForm,
                      rewards: { ...adventureForm.rewards, xp: parseInt(e.target.value) || 0 }
                    })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Gold</label>
                  <Input
                    type="number"
                    value={adventureForm.rewards.gold}
                    onChange={(e) => setAdventureForm({
                      ...adventureForm,
                      rewards: { ...adventureForm.rewards, gold: parseInt(e.target.value) || 0 }
                    })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-slate-400">Items</label>
                  <Button size="sm" onClick={addRewardItem} variant="outline" className="h-6 text-xs">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Item
                  </Button>
                </div>
                {adventureForm.rewards.items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <Input
                      value={item}
                      onChange={(e) => updateRewardItem(idx, e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Magic Amulet"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeRewardItem(idx)}
                      className="text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Stages */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-300">
                  Stages ({adventureForm.stages.length})
                </div>
              </div>

              {/* Stage Form */}
              <div className="p-4 bg-slate-800 rounded-lg space-y-3 border-2 border-blue-500/50">
                <div className="text-sm font-semibold text-blue-400">
                  {editingStage ? 'Edit Stage' : 'New Stage'}
                </div>
                <div>
                  <label className="text-xs text-slate-400">Stage Title</label>
                  <Input
                    value={stageForm.title}
                    onChange={(e) => setStageForm({ ...stageForm, title: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="The Choice"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Stage Description</label>
                  <Textarea
                    value={stageForm.description}
                    onChange={(e) => setStageForm({ ...stageForm, description: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white h-20"
                    placeholder="You stand before two doors..."
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-slate-400">Choices</label>
                    <Button size="sm" onClick={addChoice} variant="outline" className="h-6 text-xs">
                      <Plus className="h-3 w-3 mr-1" />
                      Add Choice
                    </Button>
                  </div>
                  {stageForm.choices.map((choice, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <Input
                        value={choice.text}
                        onChange={(e) => updateChoice(idx, 'text', e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white flex-1"
                        placeholder="Enter the left door"
                      />
                      <select
                        value={choice.next_stage || ''}
                        onChange={(e) => updateChoice(idx, 'next_stage', e.target.value || null)}
                        className="bg-slate-700 border-slate-600 text-white rounded px-2"
                      >
                        <option value="">End</option>
                        {adventureForm.stages.map(s => (
                          <option key={s.id} value={s.id}>{s.title}</option>
                        ))}
                      </select>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeChoice(idx)}
                        className="text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  {editingStage && (
                    <Button size="sm" onClick={resetStageForm} variant="outline">
                      Cancel
                    </Button>
                  )}
                  <Button size="sm" onClick={saveStage} className="bg-blue-600 hover:bg-blue-700">
                    {editingStage ? 'Update Stage' : 'Add Stage'}
                  </Button>
                </div>
              </div>

              {/* Existing Stages */}
              {adventureForm.stages.length > 0 && (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {adventureForm.stages.map((stage, idx) => (
                      <div key={stage.id} className="p-3 bg-slate-800 rounded border border-slate-700">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <Badge variant="outline" className="text-xs mr-2">Stage {idx + 1}</Badge>
                            <span className="text-white font-medium">{stage.title}</span>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => editStage(stage)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => deleteStage(stage.id)} className="text-red-400">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400">{stage.description}</p>
                        <div className="mt-2 text-xs text-slate-500">
                          {stage.choices.length} choice(s)
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>

            <div className="flex gap-2 pt-4 border-t border-slate-700">
              <Button onClick={() => setShowCreateDialog(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={deployAdventure}
                disabled={!adventureForm.title || adventureForm.stages.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Deploy Adventure
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}