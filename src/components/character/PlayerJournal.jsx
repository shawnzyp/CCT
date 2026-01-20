import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Plus, Edit, Trash2, Lock } from "lucide-react";
import { toast } from "sonner";

export default function PlayerJournal({ character, onUpdate }) {
  const [showCreateEntry, setShowCreateEntry] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [entryForm, setEntryForm] = useState({
    title: '',
    content: '',
    category: 'general',
    date: new Date().toISOString()
  });

  const journal = character.player_journal || [];

  const saveEntry = () => {
    if (!entryForm.title || !entryForm.content) {
      toast.error('Fill in title and content');
      return;
    }

    let updatedJournal;
    if (editingIndex !== null) {
      updatedJournal = journal.map((entry, i) => 
        i === editingIndex ? { ...entryForm, updated_at: new Date().toISOString() } : entry
      );
    } else {
      updatedJournal = [...journal, entryForm];
    }

    onUpdate({ player_journal: updatedJournal });
    resetForm();
    toast.success(editingIndex !== null ? 'Entry updated' : 'Entry created');
  };

  const deleteEntry = (index) => {
    const updatedJournal = journal.filter((_, i) => i !== index);
    onUpdate({ player_journal: updatedJournal });
    toast.success('Entry deleted');
  };

  const resetForm = () => {
    setShowCreateEntry(false);
    setEditingIndex(null);
    setEntryForm({
      title: '',
      content: '',
      category: 'general',
      date: new Date().toISOString()
    });
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'quest': return 'bg-emerald-600';
      case 'personal': return 'bg-purple-600';
      case 'combat': return 'bg-red-600';
      case 'relationship': return 'bg-pink-600';
      default: return 'bg-slate-600';
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-violet-400" />
            Private Journal
          </CardTitle>
          <Button
            onClick={() => setShowCreateEntry(true)}
            size="sm"
            className="bg-violet-600 hover:bg-violet-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Entry
          </Button>
        </div>
        <p className="text-xs text-slate-400 flex items-center gap-1 mt-2">
          <Lock className="h-3 w-3" />
          Only you can see these entries
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          {journal.length > 0 ? (
            <div className="space-y-3">
              {journal.slice().reverse().map((entry, i) => {
                const actualIndex = journal.length - 1 - i;
                return (
                  <Card key={i} className="bg-slate-700/50 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white">{entry.title}</h3>
                            <Badge className={getCategoryColor(entry.category)}>
                              {entry.category}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(entry.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingIndex(actualIndex);
                              setEntryForm(entry);
                              setShowCreateEntry(true);
                            }}
                            className="h-7 text-slate-400"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteEntry(actualIndex)}
                            className="h-7 text-red-400"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-300 whitespace-pre-wrap">{entry.content}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto text-slate-600 mb-4" />
              <p className="text-slate-400">No journal entries yet</p>
              <p className="text-slate-500 text-sm mt-2">
                Record your thoughts, plans, and reflections
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Create/Edit Entry Dialog */}
      <Dialog open={showCreateEntry} onOpenChange={setShowCreateEntry}>
        <DialogContent className="bg-slate-900 border-2 border-violet-500 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-violet-400">
              {editingIndex !== null ? 'Edit Entry' : 'New Journal Entry'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 uppercase">Title</label>
              <Input
                value={entryForm.title}
                onChange={(e) => setEntryForm({ ...entryForm, title: e.target.value })}
                placeholder="Entry title..."
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase">Category</label>
              <Select value={entryForm.category} onValueChange={(v) => setEntryForm({ ...entryForm, category: v })}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="quest">Quest</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="combat">Combat</SelectItem>
                  <SelectItem value="relationship">Relationship</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase">Entry</label>
              <Textarea
                value={entryForm.content}
                onChange={(e) => setEntryForm({ ...entryForm, content: e.target.value })}
                placeholder="Write your thoughts..."
                className="bg-slate-800 border-slate-600 text-white h-48"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={resetForm} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={saveEntry} className="flex-1 bg-violet-600 hover:bg-violet-700">
                {editingIndex !== null ? 'Update' : 'Save'} Entry
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}