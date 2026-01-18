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
import { BookOpen, Plus, ChevronDown, ChevronRight, Milestone } from "lucide-react";

const STATUS_CONFIG = {
  planned: { color: 'text-slate-400', bg: 'bg-slate-500/20', label: 'Planned' },
  in_progress: { color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'In Progress' },
  completed: { color: 'text-green-400', bg: 'bg-green-500/20', label: 'Completed' }
};

export default function StoryArcTracker({ storyArcs = [], onUpdate }) {
  const [showDialog, setShowDialog] = useState(false);
  const [expandedArc, setExpandedArc] = useState(null);
  const [newArc, setNewArc] = useState({
    title: '',
    description: '',
    status: 'planned',
    milestones: []
  });

  const handleAddArc = () => {
    onUpdate([...storyArcs, newArc]);
    setNewArc({ title: '', description: '', status: 'planned', milestones: [] });
    setShowDialog(false);
  };

  const handleToggleMilestone = (arcIndex, milestoneIndex) => {
    const updated = [...storyArcs];
    updated[arcIndex].milestones[milestoneIndex].completed = !updated[arcIndex].milestones[milestoneIndex].completed;
    if (updated[arcIndex].milestones[milestoneIndex].completed) {
      updated[arcIndex].milestones[milestoneIndex].date = new Date().toISOString();
    }
    onUpdate(updated);
  };

  const handleUpdateStatus = (arcIndex, newStatus) => {
    const updated = [...storyArcs];
    updated[arcIndex].status = newStatus;
    onUpdate(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Story Arcs</h3>
        <Button onClick={() => setShowDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Arc
        </Button>
      </div>

      {storyArcs.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-3 text-slate-600" />
            <p className="text-slate-400">No story arcs yet. Create one to outline your campaign's narrative!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {storyArcs.map((arc, index) => {
            const statusConfig = STATUS_CONFIG[arc.status];
            const isExpanded = expandedArc === index;
            const completedMilestones = arc.milestones?.filter(m => m.completed).length || 0;
            const totalMilestones = arc.milestones?.length || 0;

            return (
              <Card key={index} className={cn("bg-slate-800/50 border-2", statusConfig.bg.replace('/20', '/10'))}>
                <CardContent className="p-4">
                  <div
                    className="flex items-start justify-between cursor-pointer"
                    onClick={() => setExpandedArc(isExpanded ? null : index)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-white">{arc.title}</h4>
                        <Badge className={cn("text-xs", statusConfig.bg, statusConfig.color)}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                      {totalMilestones > 0 && (
                        <p className="text-xs text-slate-400 mt-1">
                          {completedMilestones}/{totalMilestones} milestones reached
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={arc.status} onValueChange={(v) => handleUpdateStatus(index, v)}>
                        <SelectTrigger className="h-8 w-32 bg-slate-900 border-slate-700 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planned">Planned</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      {isExpanded ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 space-y-3">
                      {arc.description && (
                        <p className="text-sm text-slate-300">{arc.description}</p>
                      )}

                      {arc.milestones?.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-2">
                            <Milestone className="h-3 w-3" />
                            Milestones
                          </h5>
                          {arc.milestones.map((milestone, mIndex) => (
                            <div key={mIndex} className="flex items-start gap-2 pl-5">
                              <Checkbox
                                checked={milestone.completed}
                                onCheckedChange={() => handleToggleMilestone(index, mIndex)}
                                className="mt-0.5"
                              />
                              <span className={cn("text-sm", milestone.completed ? "line-through text-slate-500" : "text-slate-300")}>
                                {milestone.title}
                              </span>
                            </div>
                          ))}
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
            <DialogTitle className="text-white">Create Story Arc</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-300">Arc Title</Label>
              <Input
                value={newArc.title}
                onChange={(e) => setNewArc({ ...newArc, title: e.target.value })}
                placeholder="Enter story arc title..."
                className="bg-slate-800 border-slate-700 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300">Description</Label>
              <Textarea
                value={newArc.description}
                onChange={(e) => setNewArc({ ...newArc, description: e.target.value })}
                placeholder="Describe the main narrative thread..."
                className="bg-slate-800 border-slate-700 text-white mt-1 h-24"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddArc} className="flex-1 bg-violet-600 hover:bg-violet-700">
                Create Arc
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