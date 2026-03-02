import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, MapPin, User, Book, Pencil, Trash2 } from "lucide-react";
import CollaborativeNotes from "./CollaborativeNotes";
import AILoreEngine from "./AILoreEngine";

export default function WorldBuilder({ campaign, characters = [], onUpdate }) {
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState('location');
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({});
  const [currentUser, setCurrentUser] = React.useState(null);
  
  React.useEffect(() => {
    const getUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch (e) {}
    };
    getUser();
  }, []);
  
  const worldData = {
    locations: campaign.world_locations || [],
    npcs: campaign.world_npcs || [],
    lore: campaign.world_lore || []
  };
  
  const openDialog = (type, index = null) => {
    setDialogType(type);
    setEditingIndex(index);
    
    if (index !== null) {
      const key = type === 'location' ? 'locations' : type === 'npc' ? 'npcs' : 'lore';
      setFormData(worldData[key][index]);
    } else {
      setFormData({});
    }
    
    setShowDialog(true);
  };
  
  const handleSave = () => {
    const key = dialogType === 'location' ? 'locations' : dialogType === 'npc' ? 'npcs' : 'lore';
    const dbKey = `world_${key}`;
    let newData = [...worldData[key]];
    
    if (editingIndex !== null) {
      newData[editingIndex] = formData;
    } else {
      newData.push({ ...formData, id: Date.now().toString() });
    }
    
    onUpdate({ [dbKey]: newData });
    setShowDialog(false);
    setFormData({});
    setEditingIndex(null);
  };
  
  const handleDelete = (type, index) => {
    const key = type === 'location' ? 'locations' : type === 'npc' ? 'npcs' : 'lore';
    const dbKey = `world_${key}`;
    const newData = worldData[key].filter((_, i) => i !== index);
    onUpdate({ [dbKey]: newData });
  };
  
  return (
    <div className="space-y-6">
      {/* AI Lore Engine */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <AILoreEngine campaign={campaign} characters={characters} onUpdate={onUpdate} />
      </div>

      <Tabs defaultValue="locations" className="space-y-4">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="locations">
            <MapPin className="h-4 w-4 mr-2" />
            Locations
          </TabsTrigger>
          <TabsTrigger value="npcs">
            <User className="h-4 w-4 mr-2" />
            NPCs
          </TabsTrigger>
          <TabsTrigger value="lore">
            <Book className="h-4 w-4 mr-2" />
            Lore
          </TabsTrigger>
        </TabsList>
        
        {/* Locations */}
        <TabsContent value="locations">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Locations</CardTitle>
                <Button onClick={() => openDialog('location')} className="gap-2 bg-violet-600 hover:bg-violet-700">
                  <Plus className="h-4 w-4" />
                  Add Location
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {worldData.locations.length > 0 ? (
                <div className="grid gap-3">
                  {worldData.locations.map((loc, i) => (
                    <div key={i} className="bg-slate-700/50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-white flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-violet-400" />
                            {loc.name}
                          </h4>
                          {loc.type && (
                            <Badge variant="outline" className="text-xs mt-1">{loc.type}</Badge>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openDialog('location', i)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleDelete('location', i)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-400">{loc.description}</p>
                      <CollaborativeNotes 
                        notes={loc.notes || []}
                        currentUser={currentUser}
                        onUpdate={(notes) => {
                          const newData = [...worldData.locations];
                          newData[i] = { ...loc, notes };
                          onUpdate({ world_locations: newData });
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-center py-8">No locations created yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* NPCs */}
        <TabsContent value="npcs">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">NPCs</CardTitle>
                <Button onClick={() => openDialog('npc')} className="gap-2 bg-violet-600 hover:bg-violet-700">
                  <Plus className="h-4 w-4" />
                  Add NPC
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {worldData.npcs.length > 0 ? (
                <div className="grid gap-3">
                  {worldData.npcs.map((npc, i) => (
                    <div key={i} className="bg-slate-700/50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-white flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-400" />
                            {npc.name}
                          </h4>
                          {npc.role && (
                            <Badge variant="outline" className="text-xs mt-1">{npc.role}</Badge>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openDialog('npc', i)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleDelete('npc', i)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-400">{npc.description}</p>
                      {npc.relationship && (
                        <p className="text-xs text-slate-500 mt-2">Relationship: {npc.relationship}</p>
                      )}
                      <CollaborativeNotes 
                        notes={npc.notes || []}
                        currentUser={currentUser}
                        onUpdate={(notes) => {
                          const newData = [...worldData.npcs];
                          newData[i] = { ...npc, notes };
                          onUpdate({ world_npcs: newData });
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-center py-8">No NPCs created yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Lore */}
        <TabsContent value="lore">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Lore & History</CardTitle>
                <Button onClick={() => openDialog('lore')} className="gap-2 bg-violet-600 hover:bg-violet-700">
                  <Plus className="h-4 w-4" />
                  Add Lore
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {worldData.lore.length > 0 ? (
                <div className="grid gap-3">
                  {worldData.lore.map((entry, i) => (
                    <div key={i} className="bg-slate-700/50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-white flex items-center gap-2">
                          <Book className="h-4 w-4 text-amber-400" />
                          {entry.title}
                        </h4>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openDialog('lore', i)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleDelete('lore', i)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-400">{entry.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-center py-8">No lore entries yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Add/Edit Dialog */}
      {showDialog && (
        <Dialog open onOpenChange={setShowDialog}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>
                {editingIndex !== null ? 'Edit' : 'Add'} {dialogType === 'location' ? 'Location' : dialogType === 'npc' ? 'NPC' : 'Lore'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {dialogType === 'location' && (
                <>
                  <Input
                    placeholder="Location Name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-slate-800 border-slate-700"
                  />
                  <Input
                    placeholder="Type (e.g., City, Base, Hideout)"
                    value={formData.type || ''}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="bg-slate-800 border-slate-700"
                  />
                  <Textarea
                    placeholder="Description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-slate-800 border-slate-700 min-h-[100px]"
                  />
                </>
              )}
              
              {dialogType === 'npc' && (
                <>
                  <Input
                    placeholder="NPC Name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-slate-800 border-slate-700"
                  />
                  <Input
                    placeholder="Role (e.g., Ally, Villain, Merchant)"
                    value={formData.role || ''}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="bg-slate-800 border-slate-700"
                  />
                  <Textarea
                    placeholder="Description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-slate-800 border-slate-700 min-h-[100px]"
                  />
                  <Input
                    placeholder="Relationship to party"
                    value={formData.relationship || ''}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    className="bg-slate-800 border-slate-700"
                  />
                </>
              )}
              
              {dialogType === 'lore' && (
                <>
                  <Input
                    placeholder="Title"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-slate-800 border-slate-700"
                  />
                  <Textarea
                    placeholder="Lore content"
                    value={formData.content || ''}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="bg-slate-800 border-slate-700 min-h-[150px]"
                  />
                </>
              )}
              
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="bg-violet-600 hover:bg-violet-700">
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}