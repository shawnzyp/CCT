import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, MapPin, Users, BookOpen, Zap, StickyNote, Trash2 } from "lucide-react";
import { format } from "date-fns";

const ENTRY_TYPES = {
  plot: { icon: BookOpen, color: 'bg-violet-500/20 text-violet-400', label: 'Plot' },
  location: { icon: MapPin, color: 'bg-emerald-500/20 text-emerald-400', label: 'Location' },
  npc: { icon: Users, color: 'bg-blue-500/20 text-blue-400', label: 'NPC' },
  event: { icon: Zap, color: 'bg-amber-500/20 text-amber-400', label: 'Event' },
  note: { icon: StickyNote, color: 'bg-slate-500/20 text-slate-400', label: 'Note' }
};

export default function CampaignJournal({ campaign }) {
  const [showForm, setShowForm] = useState(false);
  const [entryType, setEntryType] = useState('plot');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();
  
  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Campaign.update(campaign.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['campaign', campaign.id]);
      setShowForm(false);
      setTitle('');
      setContent('');
    }
  });
  
  const addEntry = () => {
    const newEntry = {
      type: entryType,
      title,
      content,
      timestamp: new Date().toISOString()
    };
    updateMutation.mutate({
      journal_entries: [...(campaign.journal_entries || []), newEntry]
    });
  };
  
  const deleteEntry = (index) => {
    const entries = [...(campaign.journal_entries || [])];
    entries.splice(index, 1);
    updateMutation.mutate({ journal_entries: entries });
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Journal Entries</h2>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Entry
        </Button>
      </div>
      
      {showForm && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6 space-y-3">
            <Select value={entryType} onValueChange={setEntryType}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ENTRY_TYPES).map(([key, { label, icon: Icon }]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Entry title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
            />
            <Textarea
              placeholder="Details..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white h-24"
            />
            <div className="flex gap-2">
              <Button onClick={addEntry} disabled={!title.trim()} className="flex-1">Add Entry</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="space-y-3">
        {(campaign.journal_entries || []).map((entry, index) => {
          const typeConfig = ENTRY_TYPES[entry.type];
          const Icon = typeConfig.icon;
          return (
            <Card key={index} className="bg-slate-800/50 border-slate-700 group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={typeConfig.color}>
                      <Icon className="h-3 w-3 mr-1" />
                      {typeConfig.label}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {format(new Date(entry.timestamp), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-red-400"
                    onClick={() => deleteEntry(index)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <CardTitle className="text-white text-lg">{entry.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 whitespace-pre-wrap">{entry.content}</p>
              </CardContent>
            </Card>
          );
        })}
        {(!campaign.journal_entries || campaign.journal_entries.length === 0) && (
          <div className="text-center py-12 text-slate-500">
            No journal entries yet. Start documenting your adventure!
          </div>
        )}
      </div>
    </div>
  );
}