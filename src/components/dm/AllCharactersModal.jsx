import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Users, Search, Edit2, Save, X, Heart, Zap, Shield, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function AllCharactersModal({ open, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [editData, setEditData] = useState(null);
  const queryClient = useQueryClient();

  const { data: characters = [], isLoading } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.Character.list('-created_date'),
    enabled: open
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Character.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['characters']);
      toast.success('Character updated successfully');
      setSelectedCharacter(null);
      setEditData(null);
    }
  });

  const filteredCharacters = characters.filter(char =>
    char.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    char.secret_identity?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditCharacter = (character) => {
    setSelectedCharacter(character);
    setEditData({ ...character });
  };

  const handleSaveEdits = () => {
    if (!editData) return;
    updateMutation.mutate({ id: editData.id, data: editData });
  };

  const handleCancel = () => {
    setSelectedCharacter(null);
    setEditData(null);
  };

  const tierLabels = {
    0: 'Street Level',
    1: 'Enhanced',
    2: 'Elite',
    3: 'Superhuman',
    4: 'Legendary',
    5: 'Cosmic'
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] bg-slate-900 border-violet-500 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-violet-400 text-xl">
            <Users className="h-6 w-6" />
            All Characters - Director View
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 h-full overflow-hidden">
          {/* Left Panel - Character List */}
          <div className={`${selectedCharacter ? 'w-1/3' : 'w-full'} flex flex-col gap-3 transition-all`}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search characters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700"
              />
            </div>

            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-2">
                {isLoading ? (
                  <p className="text-slate-400 text-center py-8">Loading characters...</p>
                ) : filteredCharacters.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No characters found</p>
                ) : (
                  filteredCharacters.map((char) => (
                    <Card
                      key={char.id}
                      className={`cursor-pointer transition-all border-2 ${
                        selectedCharacter?.id === char.id
                          ? 'bg-violet-900/40 border-violet-500'
                          : 'bg-slate-800/50 border-slate-700 hover:border-violet-500/50'
                      }`}
                      onClick={() => handleEditCharacter(char)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white truncate">{char.name}</h3>
                            {char.secret_identity && (
                              <p className="text-sm text-slate-400 truncate">{char.secret_identity}</p>
                            )}
                            <div className="flex gap-2 mt-2 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                Lvl {char.level || 1}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {tierLabels[char.tier] || 'Unknown'}
                              </Badge>
                              {char.classification && (
                                <Badge className="bg-violet-600 text-xs">
                                  {char.classification.replace(/_/g, ' ')}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Edit2 className="h-4 w-4 text-violet-400 flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right Panel - Character Editor */}
          {selectedCharacter && editData && (
            <div className="flex-1 flex flex-col gap-3 border-l border-slate-700 pl-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Editing: {editData.name}</h3>
                <Button variant="ghost" size="icon" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <ScrollArea className="flex-1">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="w-full grid grid-cols-7 bg-slate-800 h-auto">
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="stats">Stats</TabsTrigger>
                    <TabsTrigger value="resources">Resources</TabsTrigger>
                    <TabsTrigger value="progression">Progression</TabsTrigger>
                    <TabsTrigger value="powers">Powers</TabsTrigger>
                    <TabsTrigger value="equipment">Equipment</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4 mt-4">
                    <div>
                      <Label>Vigilante Name</Label>
                      <Input
                        value={editData.name || ''}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="bg-slate-800 border-slate-700"
                      />
                    </div>
                    <div>
                      <Label>Secret Identity</Label>
                      <Input
                        value={editData.secret_identity || ''}
                        onChange={(e) => setEditData({ ...editData, secret_identity: e.target.value })}
                        className="bg-slate-800 border-slate-700"
                      />
                    </div>
                    <div>
                      <Label>Classification</Label>
                      <Select
                        value={editData.classification}
                        onValueChange={(val) => setEditData({ ...editData, classification: val })}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mutant">Mutant</SelectItem>
                          <SelectItem value="enhanced_human">Enhanced Human</SelectItem>
                          <SelectItem value="magic_user">Magic User</SelectItem>
                          <SelectItem value="alien">Alien</SelectItem>
                          <SelectItem value="mystical_being">Mystical Being</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Alignment</Label>
                      <Input
                        value={editData.alignment || ''}
                        onChange={(e) => setEditData({ ...editData, alignment: e.target.value })}
                        className="bg-slate-800 border-slate-700"
                      />
                    </div>
                    <div>
                      <Label>Backstory Notes</Label>
                      <Textarea
                        value={editData.backstory_notes || ''}
                        onChange={(e) => setEditData({ ...editData, backstory_notes: e.target.value })}
                        className="bg-slate-800 border-slate-700 min-h-[100px]"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="stats" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-red-400" />
                          Max HP
                        </Label>
                        <Input
                          type="number"
                          value={editData.max_hp || 0}
                          onChange={(e) => setEditData({ ...editData, max_hp: parseInt(e.target.value) || 0 })}
                          className="bg-slate-800 border-slate-700"
                        />
                      </div>
                      <div>
                        <Label className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-red-400" />
                          Current HP
                        </Label>
                        <Input
                          type="number"
                          value={editData.current_hp || 0}
                          onChange={(e) => setEditData({ ...editData, current_hp: parseInt(e.target.value) || 0 })}
                          className="bg-slate-800 border-slate-700"
                        />
                      </div>
                      <div>
                        <Label className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-blue-400" />
                          Max SP
                        </Label>
                        <Input
                          type="number"
                          value={editData.max_sp || 0}
                          onChange={(e) => setEditData({ ...editData, max_sp: parseInt(e.target.value) || 0 })}
                          className="bg-slate-800 border-slate-700"
                        />
                      </div>
                      <div>
                        <Label className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-blue-400" />
                          Current SP
                        </Label>
                        <Input
                          type="number"
                          value={editData.current_sp || 0}
                          onChange={(e) => setEditData({ ...editData, current_sp: parseInt(e.target.value) || 0 })}
                          className="bg-slate-800 border-slate-700"
                        />
                      </div>
                      <div>
                        <Label className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-amber-400" />
                          Toughness Class
                        </Label>
                        <Input
                          type="number"
                          value={editData.toughness_class || 0}
                          onChange={(e) => setEditData({ ...editData, toughness_class: parseInt(e.target.value) || 0 })}
                          className="bg-slate-800 border-slate-700"
                        />
                      </div>
                      <div>
                        <Label>Speed</Label>
                        <Input
                          type="number"
                          value={editData.speed || 30}
                          onChange={(e) => setEditData({ ...editData, speed: parseInt(e.target.value) || 30 })}
                          className="bg-slate-800 border-slate-700"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="resources" className="space-y-4 mt-4">
                    <div>
                      <Label className="flex items-center gap-2">
                        Credits
                      </Label>
                      <Input
                        type="number"
                        value={editData.credits || 0}
                        onChange={(e) => setEditData({ ...editData, credits: parseInt(e.target.value) || 0 })}
                        className="bg-slate-800 border-slate-700"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="progression" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-violet-400" />
                          Level
                        </Label>
                        <Input
                          type="number"
                          value={editData.level || 1}
                          onChange={(e) => setEditData({ ...editData, level: parseInt(e.target.value) || 1 })}
                          className="bg-slate-800 border-slate-700"
                        />
                      </div>
                      <div>
                        <Label>Current XP</Label>
                        <Input
                          type="number"
                          value={editData.current_xp || 0}
                          onChange={(e) => setEditData({ ...editData, current_xp: parseInt(e.target.value) || 0 })}
                          className="bg-slate-800 border-slate-700"
                        />
                      </div>
                      <div>
                        <Label>Tier</Label>
                        <Select
                          value={editData.tier?.toString()}
                          onValueChange={(val) => setEditData({ ...editData, tier: parseInt(val) })}
                        >
                          <SelectTrigger className="bg-slate-800 border-slate-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Tier 0 - Street Level</SelectItem>
                            <SelectItem value="1">Tier 1 - Enhanced</SelectItem>
                            <SelectItem value="2">Tier 2 - Elite</SelectItem>
                            <SelectItem value="3">Tier 3 - Superhuman</SelectItem>
                            <SelectItem value="4">Tier 4 - Legendary</SelectItem>
                            <SelectItem value="5">Tier 5 - Cosmic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="powers" className="space-y-4 mt-4">
                    <div>
                      <Label>Powers (JSON)</Label>
                      <Textarea
                        value={JSON.stringify(editData.powers || [], null, 2)}
                        onChange={(e) => {
                          try {
                            setEditData({ ...editData, powers: JSON.parse(e.target.value) });
                          } catch (err) {
                            // Allow invalid JSON while editing
                          }
                        }}
                        className="bg-slate-800 border-slate-700 font-mono text-xs min-h-[200px]"
                        placeholder="[{name: 'Power Name', description: '...'}]"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="equipment" className="space-y-4 mt-4">
                    <div>
                      <Label>Equipment (JSON)</Label>
                      <Textarea
                        value={JSON.stringify(editData.equipment || [], null, 2)}
                        onChange={(e) => {
                          try {
                            setEditData({ ...editData, equipment: JSON.parse(e.target.value) });
                          } catch (err) {
                            // Allow invalid JSON while editing
                          }
                        }}
                        className="bg-slate-800 border-slate-700 font-mono text-xs min-h-[200px]"
                        placeholder="[{name: 'Weapon', type: '...', bonus: 0}]"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="inventory" className="space-y-4 mt-4">
                    <div>
                      <Label>Inventory (JSON)</Label>
                      <Textarea
                        value={JSON.stringify(editData.inventory || [], null, 2)}
                        onChange={(e) => {
                          try {
                            setEditData({ ...editData, inventory: JSON.parse(e.target.value) });
                          } catch (err) {
                            // Allow invalid JSON while editing
                          }
                        }}
                        className="bg-slate-800 border-slate-700 font-mono text-xs min-h-[200px]"
                        placeholder="[{name: 'Item', quantity: 1}]"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </ScrollArea>

              <div className="flex gap-3 pt-3 border-t border-slate-700">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdits}
                  disabled={updateMutation.isPending}
                  className="flex-1 bg-violet-600 hover:bg-violet-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Director Edits
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}