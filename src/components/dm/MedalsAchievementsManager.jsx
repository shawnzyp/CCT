import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Award, Medal, Plus, Trash2, Calendar, User, Check, X, Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function MedalsAchievementsManager({ campaignId }) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    type: 'achievement',
    name: '',
    description: '',
    icon: '🏆',
    schedule_date: '',
    character_ids: []
  });

  const queryClient = useQueryClient();

  const { data: characters = [] } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.Character.list('-created_date')
  });

  const { data: campaign } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: async () => {
      const campaigns = await base44.entities.Campaign.filter({ id: campaignId });
      return campaigns[0];
    },
    enabled: !!campaignId
  });

  const awardMutation = useMutation({
    mutationFn: async ({ characterId, itemData }) => {
      const chars = await base44.entities.Character.filter({ id: characterId });
      const character = chars[0];
      
      if (itemData.type === 'achievement') {
        const achievements = character.achievements || [];
        return base44.entities.Character.update(characterId, {
          achievements: [...achievements, {
            ...itemData,
            date: new Date().toISOString()
          }]
        });
      } else {
        const milestones = character.milestones || [];
        return base44.entities.Character.update(characterId, {
          milestones: [...milestones, {
            level: character.level,
            achievement: itemData.name,
            description: itemData.description,
            icon: itemData.icon,
            date: new Date().toISOString()
          }]
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['characters']);
      toast.success('Awarded successfully!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ characterId, itemIndex, itemType }) => {
      const chars = await base44.entities.Character.filter({ id: characterId });
      const character = chars[0];
      
      if (itemType === 'achievement') {
        const achievements = character.achievements || [];
        return base44.entities.Character.update(characterId, {
          achievements: achievements.filter((_, i) => i !== itemIndex)
        });
      } else {
        const milestones = character.milestones || [];
        return base44.entities.Character.update(characterId, {
          milestones: milestones.filter((_, i) => i !== itemIndex)
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['characters']);
      toast.success('Removed successfully!');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ characterId, itemIndex, itemType, itemData }) => {
      const chars = await base44.entities.Character.filter({ id: characterId });
      const character = chars[0];
      
      if (itemType === 'achievement') {
        const achievements = character.achievements || [];
        achievements[itemIndex] = { ...itemData, date: itemData.date || new Date().toISOString() };
        return base44.entities.Character.update(characterId, {
          achievements
        });
      } else {
        const milestones = character.milestones || [];
        milestones[itemIndex] = {
          level: character.level,
          achievement: itemData.name,
          description: itemData.description,
          icon: itemData.icon,
          date: itemData.date || new Date().toISOString()
        };
        return base44.entities.Character.update(characterId, {
          milestones
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['characters']);
      toast.success('Updated successfully!');
      setEditingItem(null);
    }
  });

  const handleAward = () => {
    if (!newItem.name || newItem.character_ids.length === 0) {
      toast.error('Please fill in name and select characters');
      return;
    }

    newItem.character_ids.forEach(charId => {
      awardMutation.mutate({ characterId: charId, itemData: newItem });
    });

    setNewItem({
      type: 'achievement',
      name: '',
      description: '',
      icon: '🏆',
      schedule_date: '',
      character_ids: []
    });
    setShowCreate(false);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
  };

  const handleSaveEdit = () => {
    if (!editingItem.name) {
      toast.error('Name is required');
      return;
    }

    updateMutation.mutate({
      characterId: editingItem.characterId,
      itemIndex: editingItem.index,
      itemType: editingItem.type,
      itemData: {
        name: editingItem.name,
        description: editingItem.description,
        icon: editingItem.icon,
        date: editingItem.date
      }
    });
  };

  const handleDelete = (item) => {
    if (confirm(`Remove "${item.name}" from ${item.characterName}?`)) {
      deleteMutation.mutate({
        characterId: item.characterId,
        itemIndex: item.index,
        itemType: item.type
      });
    }
  };

  const iconOptions = newItem.type === 'achievement' 
    ? ['🏆', '⭐', '🎖️', '👑', '💎', '🔥', '⚡', '🌟', '💪', '🎯']
    : ['🥇', '🥈', '🥉', '🏅', '🎗️', '🌠', '✨', '💫', '🔱', '⚔️'];

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-400" />
            Medals & Achievements Manager
          </CardTitle>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button className="bg-violet-600 hover:bg-violet-700">
                <Plus className="h-4 w-4 mr-2" />
                Create & Award
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">Create Medal or Achievement</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Type</label>
                  <Select value={newItem.type} onValueChange={(value) => setNewItem({...newItem, type: value})}>
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="achievement">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          Achievement
                        </div>
                      </SelectItem>
                      <SelectItem value="medal">
                        <div className="flex items-center gap-2">
                          <Medal className="h-4 w-4" />
                          Medal/Milestone
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Icon</label>
                  <div className="flex gap-2 flex-wrap">
                    {iconOptions.map(icon => (
                      <button
                        key={icon}
                        onClick={() => setNewItem({...newItem, icon})}
                        className={cn(
                          "w-10 h-10 rounded-lg border-2 transition-all text-xl",
                          newItem.icon === icon 
                            ? "border-violet-500 bg-violet-500/20" 
                            : "border-slate-700 bg-slate-800 hover:border-slate-600"
                        )}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Name</label>
                  <Input
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    placeholder="e.g., First Blood, Master Tactician"
                    className="bg-slate-800 border-slate-700"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Description</label>
                  <Textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                    placeholder="Describe the achievement..."
                    className="bg-slate-800 border-slate-700 h-20"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Schedule (Optional)</label>
                  <Input
                    type="datetime-local"
                    value={newItem.schedule_date}
                    onChange={(e) => setNewItem({...newItem, schedule_date: e.target.value})}
                    className="bg-slate-800 border-slate-700"
                  />
                  <p className="text-xs text-slate-500 mt-1">Leave empty to award immediately</p>
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Award to Characters</label>
                  <div className="border border-slate-700 rounded-lg p-3 bg-slate-800 max-h-48 overflow-y-auto space-y-2">
                    {characters.map(char => (
                      <label key={char.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-700/50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={newItem.character_ids.includes(char.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewItem({...newItem, character_ids: [...newItem.character_ids, char.id]});
                            } else {
                              setNewItem({...newItem, character_ids: newItem.character_ids.filter(id => id !== char.id)});
                            }
                          }}
                          className="rounded"
                        />
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-200">{char.name}</span>
                        <Badge variant="outline" className="text-xs ml-auto">
                          Level {char.level}
                        </Badge>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowCreate(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAward}
                    className="bg-violet-600 hover:bg-violet-700"
                    disabled={awardMutation.isPending}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    {newItem.schedule_date ? 'Schedule Award' : 'Award Now'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Edit {editingItem?.type === 'achievement' ? 'Achievement' : 'Medal'}</DialogTitle>
          </DialogHeader>
          
          {editingItem && (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Icon</label>
                <div className="flex gap-2 flex-wrap">
                  {(editingItem.type === 'achievement' 
                    ? ['🏆', '⭐', '🎖️', '👑', '💎', '🔥', '⚡', '🌟', '💪', '🎯']
                    : ['🥇', '🥈', '🥉', '🏅', '🎗️', '🌠', '✨', '💫', '🔱', '⚔️']
                  ).map(icon => (
                    <button
                      key={icon}
                      onClick={() => setEditingItem({...editingItem, icon})}
                      className={cn(
                        "w-10 h-10 rounded-lg border-2 transition-all text-xl",
                        editingItem.icon === icon 
                          ? "border-violet-500 bg-violet-500/20" 
                          : "border-slate-700 bg-slate-800 hover:border-slate-600"
                      )}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">Name</label>
                <Input
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                  className="bg-slate-800 border-slate-700"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">Description</label>
                <Textarea
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                  className="bg-slate-800 border-slate-700 h-20"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setEditingItem(null)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveEdit}
                  className="bg-violet-600 hover:bg-violet-700"
                  disabled={updateMutation.isPending}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <CardContent>
        <div className="space-y-4">
          {/* Recent Awards */}
          <div>
            <h3 className="text-sm font-semibold text-violet-400 mb-2">Recent Awards</h3>
            <div className="space-y-2">
              {characters.flatMap(char => 
                (char.achievements || []).map((achievement, i) => ({
                  ...achievement,
                  characterName: char.name,
                  characterId: char.id,
                  type: 'achievement',
                  index: i,
                  key: `${char.id}-achievement-${i}`
                }))
              ).concat(
                characters.flatMap(char => 
                  (char.milestones || []).map((milestone, i) => ({
                    ...milestone,
                    name: milestone.achievement,
                    characterName: char.name,
                    characterId: char.id,
                    type: 'milestone',
                    index: i,
                    key: `${char.id}-milestone-${i}`
                  }))
                )
              ).sort((a, b) => new Date(b.date) - new Date(a.date)).map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 bg-slate-700/30 rounded hover:bg-slate-700/50 transition-colors group">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-xl">{item.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm text-white font-medium">{item.name}</div>
                      <div className="text-xs text-slate-400">
                        Awarded to {item.characterName}
                        {item.date && ` • ${new Date(item.date).toLocaleDateString()}`}
                      </div>
                      {item.description && (
                        <div className="text-xs text-slate-500 mt-1">{item.description}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs capitalize">
                      {item.type}
                    </Badge>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-violet-400 hover:text-violet-300 hover:bg-violet-500/20"
                        onClick={() => handleEdit(item)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        onClick={() => handleDelete(item)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}