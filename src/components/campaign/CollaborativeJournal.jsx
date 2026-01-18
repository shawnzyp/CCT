import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, User, Clock, BookOpen, MapPin, Users as UsersIcon, Scroll, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const entryTypeIcons = {
  plot: BookOpen,
  location: MapPin,
  npc: User,
  event: Scroll,
  note: Info,
  lore: BookOpen
};

const entryTypeColors = {
  plot: 'text-violet-400 bg-violet-500/20',
  location: 'text-blue-400 bg-blue-500/20',
  npc: 'text-green-400 bg-green-500/20',
  event: 'text-amber-400 bg-amber-500/20',
  note: 'text-slate-400 bg-slate-500/20',
  lore: 'text-purple-400 bg-purple-500/20'
};

export default function CollaborativeJournal({ campaign, currentUser, onUpdate }) {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    type: 'note',
    title: '',
    content: '',
    contributors: []
  });
  
  const entries = campaign.journal_entries || [];
  
  const handleSave = () => {
    const newEntry = {
      ...formData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      author: currentUser?.email || 'Unknown',
      contributors: [currentUser?.email || 'Unknown']
    };
    
    const newEntries = [newEntry, ...entries];
    onUpdate({ journal_entries: newEntries });
    setShowDialog(false);
    setFormData({ type: 'note', title: '', content: '', contributors: [] });
  };
  
  const handleAddContribution = (entryId, contribution) => {
    const updatedEntries = entries.map(entry => {
      if (entry.id === entryId) {
        const contributors = entry.contributors || [entry.author];
        if (!contributors.includes(currentUser?.email)) {
          contributors.push(currentUser?.email);
        }
        return {
          ...entry,
          content: entry.content + '\n\n---\n' + contribution,
          contributors,
          last_updated: new Date().toISOString()
        };
      }
      return entry;
    });
    onUpdate({ journal_entries: updatedEntries });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-violet-400" />
          Collaborative Journal
        </h2>
        <Button onClick={() => setShowDialog(true)} className="gap-2 bg-violet-600 hover:bg-violet-700">
          <Plus className="h-4 w-4" />
          Add Entry
        </Button>
      </div>
      
      <div className="space-y-3">
        {entries.map((entry) => {
          const Icon = entryTypeIcons[entry.type] || BookOpen;
          const colors = entryTypeColors[entry.type] || entryTypeColors.note;
          const contributors = entry.contributors || [entry.author];
          
          return (
            <Card key={entry.id} className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", colors)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <CardTitle className="text-white">{entry.title}</CardTitle>
                      <Badge variant="outline" className="text-xs capitalize">{entry.type}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <UsersIcon className="h-3 w-3" />
                        {contributors.length} contributor{contributors.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-slate-300 whitespace-pre-wrap">{entry.content}</div>
                
                {contributors.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {contributors.map((contrib, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        <User className="h-3 w-3 mr-1" />
                        {contrib.split('@')[0]}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <ContributeDialog 
                  entryId={entry.id}
                  entryTitle={entry.title}
                  onContribute={handleAddContribution}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {entries.length === 0 && (
        <Card className="bg-slate-800/30 border-slate-700 border-dashed">
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 mb-4">No journal entries yet</p>
            <Button onClick={() => setShowDialog(true)} variant="outline">
              Add First Entry
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Add Entry Dialog */}
      {showDialog && (
        <Dialog open onOpenChange={setShowDialog}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>Add Journal Entry</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plot">Plot Development</SelectItem>
                  <SelectItem value="location">Location Discovery</SelectItem>
                  <SelectItem value="npc">NPC Encounter</SelectItem>
                  <SelectItem value="event">Major Event</SelectItem>
                  <SelectItem value="note">General Note</SelectItem>
                  <SelectItem value="lore">Lore & History</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                placeholder="Entry Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-slate-800 border-slate-700"
              />
              
              <Textarea
                placeholder="Entry Content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="bg-slate-800 border-slate-700 min-h-[150px]"
              />
              
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="bg-violet-600 hover:bg-violet-700">
                  Add Entry
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function ContributeDialog({ entryId, entryTitle, onContribute }) {
  const [showDialog, setShowDialog] = useState(false);
  const [contribution, setContribution] = useState('');
  
  const handleSubmit = () => {
    if (contribution.trim()) {
      onContribute(entryId, contribution);
      setContribution('');
      setShowDialog(false);
    }
  };
  
  return (
    <>
      <Button 
        size="sm" 
        variant="outline" 
        onClick={() => setShowDialog(true)}
        className="gap-1"
      >
        <Plus className="h-3 w-3" />
        Add to Entry
      </Button>
      
      {showDialog && (
        <Dialog open onOpenChange={setShowDialog}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>Contribute to: {entryTitle}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <Textarea
                placeholder="Add your contribution..."
                value={contribution}
                onChange={(e) => setContribution(e.target.value)}
                className="bg-slate-800 border-slate-700 min-h-[120px]"
              />
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} className="bg-violet-600 hover:bg-violet-700">
                  Add Contribution
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}