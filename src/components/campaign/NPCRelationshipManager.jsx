import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, Swords, Minus, Users, TrendingUp, TrendingDown, AlertCircle, History } from "lucide-react";
import { toast } from "sonner";
import useSoundEffects from '@/components/sounds/useSoundEffects';

const RELATIONSHIP_LEVELS = [
  { value: 'hostile', label: 'Hostile', color: 'bg-red-600', icon: Swords, textColor: 'text-red-400' },
  { value: 'unfriendly', label: 'Unfriendly', color: 'bg-orange-600', icon: AlertCircle, textColor: 'text-orange-400' },
  { value: 'neutral', label: 'Neutral', color: 'bg-slate-600', icon: Minus, textColor: 'text-slate-400' },
  { value: 'friendly', label: 'Friendly', color: 'bg-green-600', icon: Heart, textColor: 'text-green-400' },
  { value: 'allied', label: 'Allied', color: 'bg-blue-600', icon: Users, textColor: 'text-blue-400' }
];

export default function NPCRelationshipManager({ campaign, characters, onUpdate }) {
  const { play } = useSoundEffects();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedNPC, setSelectedNPC] = useState(null);
  const [newRelationship, setNewRelationship] = useState({
    target_id: '',
    target_type: 'character',
    relationship_level: 'neutral',
    notes: ''
  });

  const npcs = campaign.gm_npcs || [];
  const relationships = campaign.npc_relationships || [];

  const getLevelData = (level) => RELATIONSHIP_LEVELS.find(l => l.value === level) || RELATIONSHIP_LEVELS[2];

  const getRelationshipsForNPC = (npcId) => {
    return relationships.filter(r => r.npc_id === npcId);
  };

  const getTargetName = (targetId, targetType) => {
    if (targetType === 'character') {
      const char = characters.find(c => c.id === targetId);
      return char?.name || 'Unknown Character';
    } else {
      const npc = npcs.find(n => n.id === targetId);
      return npc?.name || 'Unknown NPC';
    }
  };

  const addRelationship = () => {
    if (!selectedNPC || !newRelationship.target_id) {
      toast.error('Please select a target');
      return;
    }

    // Check if relationship already exists
    const existing = relationships.find(
      r => r.npc_id === selectedNPC.id && 
           r.target_id === newRelationship.target_id && 
           r.target_type === newRelationship.target_type
    );

    if (existing) {
      toast.error('Relationship already exists');
      return;
    }

    const relationship = {
      id: `rel_${Date.now()}`,
      npc_id: selectedNPC.id,
      target_id: newRelationship.target_id,
      target_type: newRelationship.target_type,
      relationship_level: newRelationship.relationship_level,
      relationship_value: getRelationshipValue(newRelationship.relationship_level),
      notes: newRelationship.notes,
      history: [{
        timestamp: new Date().toISOString(),
        old_level: null,
        new_level: newRelationship.relationship_level,
        reason: 'Initial relationship established'
      }]
    };

    onUpdate({
      npc_relationships: [...relationships, relationship]
    });

    setNewRelationship({
      target_id: '',
      target_type: 'character',
      relationship_level: 'neutral',
      notes: ''
    });
    setShowDialog(false);
    play('success', 0.3);
    toast.success('Relationship added');
  };

  const updateRelationship = (relationshipId, newLevel, reason) => {
    const updated = relationships.map(r => {
      if (r.id === relationshipId) {
        return {
          ...r,
          relationship_level: newLevel,
          relationship_value: getRelationshipValue(newLevel),
          history: [
            ...r.history,
            {
              timestamp: new Date().toISOString(),
              old_level: r.relationship_level,
              new_level: newLevel,
              reason: reason || 'Manual update'
            }
          ]
        };
      }
      return r;
    });

    onUpdate({ npc_relationships: updated });
    play('click', 0.2);
    toast.success('Relationship updated');
  };

  const deleteRelationship = (relationshipId) => {
    const updated = relationships.filter(r => r.id !== relationshipId);
    onUpdate({ npc_relationships: updated });
    play('error', 0.2);
    toast.success('Relationship removed');
  };

  const getRelationshipValue = (level) => {
    const values = { hostile: -2, unfriendly: -1, neutral: 0, friendly: 1, allied: 2 };
    return values[level] || 0;
  };

  const getAvailableTargets = () => {
    if (!selectedNPC) return [];
    
    const existingTargets = getRelationshipsForNPC(selectedNPC.id).map(r => 
      `${r.target_type}_${r.target_id}`
    );

    const targets = [];
    
    characters.forEach(char => {
      const key = `character_${char.id}`;
      if (!existingTargets.includes(key)) {
        targets.push({ id: char.id, name: char.name, type: 'character' });
      }
    });

    npcs.forEach(npc => {
      if (npc.id !== selectedNPC.id) {
        const key = `npc_${npc.id}`;
        if (!existingTargets.includes(key)) {
          targets.push({ id: npc.id, name: npc.name, type: 'npc' });
        }
      }
    });

    return targets;
  };

  return (
    <div className="space-y-4">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-violet-400" />
            NPC Relationship Tracker
          </CardTitle>
          <p className="text-xs text-slate-400">
            Track how NPCs feel about player characters and other NPCs
          </p>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {npcs.map(npc => {
                const npcRels = getRelationshipsForNPC(npc.id);
                return (
                  <Card key={npc.id} className="bg-slate-900 border-slate-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-white text-base">{npc.name}</CardTitle>
                          <Badge variant="outline" className="text-xs mt-1">{npc.role}</Badge>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedNPC(npc);
                            setShowDialog(true);
                          }}
                          className="bg-violet-600 hover:bg-violet-700"
                        >
                          Add Relationship
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {npcRels.length > 0 ? (
                        <div className="space-y-2">
                          {npcRels.map(rel => {
                            const levelData = getLevelData(rel.relationship_level);
                            const LevelIcon = levelData.icon;
                            
                            return (
                              <div key={rel.id} className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <LevelIcon className={`h-4 w-4 ${levelData.textColor}`} />
                                    <div>
                                      <div className="text-sm text-white font-medium">
                                        {getTargetName(rel.target_id, rel.target_type)}
                                      </div>
                                      <Badge className={`${levelData.color} text-white text-xs mt-1`}>
                                        {levelData.label}
                                      </Badge>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-1">
                                    <Select
                                      value={rel.relationship_level}
                                      onValueChange={(newLevel) => {
                                        const reason = prompt('Reason for relationship change:');
                                        if (reason !== null) {
                                          updateRelationship(rel.id, newLevel, reason);
                                        }
                                      }}
                                    >
                                      <SelectTrigger className="h-7 text-xs w-[100px] bg-slate-900 border-slate-600">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {RELATIONSHIP_LEVELS.map(level => (
                                          <SelectItem key={level.value} value={level.value}>
                                            {level.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                          <History className="h-3 w-3" />
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="bg-slate-900 border-violet-500 text-white">
                                        <DialogHeader>
                                          <DialogTitle>Relationship History</DialogTitle>
                                        </DialogHeader>
                                        <ScrollArea className="h-[300px]">
                                          <div className="space-y-2">
                                            {rel.history?.map((h, i) => (
                                              <div key={i} className="p-2 bg-slate-800 rounded text-xs">
                                                <div className="flex items-center gap-2 mb-1">
                                                  {h.old_level && (
                                                    <>
                                                      <Badge className={getLevelData(h.old_level).color}>
                                                        {getLevelData(h.old_level).label}
                                                      </Badge>
                                                      <TrendingUp className="h-3 w-3 text-slate-400" />
                                                    </>
                                                  )}
                                                  <Badge className={getLevelData(h.new_level).color}>
                                                    {getLevelData(h.new_level).label}
                                                  </Badge>
                                                </div>
                                                <p className="text-slate-400">{h.reason}</p>
                                                <p className="text-slate-500 text-[10px]">
                                                  {new Date(h.timestamp).toLocaleString()}
                                                </p>
                                              </div>
                                            ))}
                                          </div>
                                        </ScrollArea>
                                      </DialogContent>
                                    </Dialog>
                                  </div>
                                </div>
                                {rel.notes && (
                                  <p className="text-xs text-slate-400 mt-2">{rel.notes}</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 text-center py-4">
                          No relationships defined
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

              {npcs.length === 0 && (
                <Card className="bg-slate-900 border-slate-700">
                  <CardContent className="py-12 text-center">
                    <Users className="h-16 w-16 mx-auto text-slate-600 mb-4" />
                    <p className="text-slate-400">No NPCs created yet</p>
                    <p className="text-slate-500 text-sm">Create NPCs in the NPCs tab first</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Add Relationship Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-slate-900 border-2 border-violet-500 text-white">
          <DialogHeader>
            <DialogTitle className="text-violet-400">
              Add Relationship for {selectedNPC?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 uppercase mb-2 block">Target</label>
              <Select
                value={`${newRelationship.target_type}_${newRelationship.target_id}`}
                onValueChange={(value) => {
                  const [type, id] = value.split('_');
                  setNewRelationship({
                    ...newRelationship,
                    target_type: type,
                    target_id: id
                  });
                }}
              >
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue placeholder="Select character or NPC" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableTargets().map(target => (
                    <SelectItem key={`${target.type}_${target.id}`} value={`${target.type}_${target.id}`}>
                      {target.name} ({target.type === 'character' ? 'PC' : 'NPC'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase mb-2 block">Relationship Level</label>
              <Select
                value={newRelationship.relationship_level}
                onValueChange={(value) => setNewRelationship({ ...newRelationship, relationship_level: value })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIP_LEVELS.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase mb-2 block">Notes (Optional)</label>
              <Textarea
                value={newRelationship.notes}
                onChange={(e) => setNewRelationship({ ...newRelationship, notes: e.target.value })}
                className="bg-slate-800 border-slate-600 text-white h-20"
                placeholder="Why does this relationship exist? Context..."
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => {
                  setShowDialog(false);
                  setSelectedNPC(null);
                  setNewRelationship({
                    target_id: '',
                    target_type: 'character',
                    relationship_level: 'neutral',
                    notes: ''
                  });
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={addRelationship}
                disabled={!newRelationship.target_id}
                className="flex-1 bg-violet-600 hover:bg-violet-700"
              >
                Add Relationship
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}