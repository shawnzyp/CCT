import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ScrollText, Plus, CheckCircle2, Clock, XCircle, ChevronDown, ChevronRight, Award } from "lucide-react";

const STATUS_CONFIG = {
  active: { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Active' },
  completed: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/20', label: 'Completed' },
  failed: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Failed' },
  abandoned: { icon: XCircle, color: 'text-slate-400', bg: 'bg-slate-500/20', label: 'Abandoned' }
};

export default function QuestTracker({ quests = [], onUpdate }) {
  const [showDialog, setShowDialog] = useState(false);
  const [expandedQuest, setExpandedQuest] = useState(null);
  const [newQuest, setNewQuest] = useState({
    title: '',
    description: '',
    status: 'active',
    objectives: [],
    rewards: ''
  });

  const handleAddQuest = () => {
    const quest = {
      ...newQuest,
      created_date: new Date().toISOString()
    };
    onUpdate([...quests, quest]);
    setNewQuest({ title: '', description: '', status: 'active', objectives: [], rewards: '' });
    setShowDialog(false);
  };

  const handleToggleObjective = (questIndex, objIndex) => {
    const updated = [...quests];
    updated[questIndex].objectives[objIndex].completed = !updated[questIndex].objectives[objIndex].completed;
    onUpdate(updated);
  };

  const handleUpdateStatus = (questIndex, newStatus) => {
    const updated = [...quests];
    updated[questIndex].status = newStatus;
    if (newStatus === 'completed') {
      updated[questIndex].completed_date = new Date().toISOString();
    }
    onUpdate(updated);
  };

  const activeQuests = quests.filter(q => q.status === 'active');
  const completedQuests = quests.filter(q => q.status === 'completed');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-white">Quest Log</h3>
          <Badge variant="outline" className="text-violet-400">{activeQuests.length} Active</Badge>
          <Badge variant="outline" className="text-green-400">{completedQuests.length} Completed</Badge>
        </div>
        <Button onClick={() => setShowDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Quest
        </Button>
      </div>

      {quests.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="py-12 text-center">
            <ScrollText className="h-12 w-12 mx-auto mb-3 text-slate-600" />
            <p className="text-slate-400">No quests yet. Create one to track your adventures!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {quests.map((quest, index) => {
            const statusConfig = STATUS_CONFIG[quest.status];
            const StatusIcon = statusConfig.icon;
            const isExpanded = expandedQuest === index;
            const completedObjectives = quest.objectives?.filter(o => o.completed).length || 0;
            const totalObjectives = quest.objectives?.length || 0;

            return (
              <Card key={index} className={cn("bg-slate-800/50 border-2 transition-all", statusConfig.bg.replace('/20', '/10'))}>
                <CardContent className="p-4">
                  <div
                    className="flex items-start justify-between cursor-pointer"
                    onClick={() => setExpandedQuest(isExpanded ? null : index)}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <StatusIcon className={cn("h-5 w-5 mt-0.5", statusConfig.color)} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-white">{quest.title}</h4>
                          <Badge className={cn("text-xs", statusConfig.bg, statusConfig.color)}>
                            {statusConfig.label}
                          </Badge>
                        </div>
                        {totalObjectives > 0 && (
                          <p className="text-xs text-slate-400 mt-1">
                            {completedObjectives}/{totalObjectives} objectives completed
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {quest.status === 'active' && (
                        <Select value={quest.status} onValueChange={(v) => handleUpdateStatus(index, v)}>
                          <SelectTrigger className="h-8 w-32 bg-slate-900 border-slate-700 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                            <SelectItem value="abandoned">Abandoned</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      {isExpanded ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pl-8 space-y-3">
                      {quest.description && (
                        <p className="text-sm text-slate-300">{quest.description}</p>
                      )}

                      {quest.objectives?.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-xs font-semibold text-slate-400 uppercase">Objectives</h5>
                          {quest.objectives.map((obj, objIndex) => (
                            <div key={objIndex} className="flex items-start gap-2">
                              <Checkbox
                                checked={obj.completed}
                                onCheckedChange={() => handleToggleObjective(index, objIndex)}
                                className="mt-0.5"
                              />
                              <span className={cn("text-sm", obj.completed ? "line-through text-slate-500" : "text-slate-300")}>
                                {obj.description}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {quest.rewards && (
                        <div className="flex items-center gap-2 text-sm">
                          <Award className="h-4 w-4 text-amber-400" />
                          <span className="text-amber-400 font-medium">Rewards:</span>
                          <span className="text-slate-300">{quest.rewards}</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-slate-900 border-violet-500">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Quest</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-300">Quest Title</Label>
              <Input
                value={newQuest.title}
                onChange={(e) => setNewQuest({ ...newQuest, title: e.target.value })}
                placeholder="Enter quest title..."
                className="bg-slate-800 border-slate-700 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300">Description</Label>
              <Textarea
                value={newQuest.description}
                onChange={(e) => setNewQuest({ ...newQuest, description: e.target.value })}
                placeholder="Quest details and background..."
                className="bg-slate-800 border-slate-700 text-white mt-1 h-24"
              />
            </div>
            <div>
              <Label className="text-slate-300">Rewards</Label>
              <Input
                value={newQuest.rewards}
                onChange={(e) => setNewQuest({ ...newQuest, rewards: e.target.value })}
                placeholder="XP, gold, items, etc."
                className="bg-slate-800 border-slate-700 text-white mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddQuest} className="flex-1 bg-violet-600 hover:bg-violet-700">
                Create Quest
              </Button>
              <Button onClick={() => setShowDialog(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}