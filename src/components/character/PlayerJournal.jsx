import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { BookOpen, Plus, Edit, Trash2, Lock, Share2, Sparkles, Users } from "lucide-react";
import { toast } from "sonner";
import { base44 } from '@/api/base44Client';

export default function PlayerJournal({ character, onUpdate }) {
  const [showCreateEntry, setShowCreateEntry] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [entryForm, setEntryForm] = useState({
    title: '',
    content: '',
    category: 'general',
    date: new Date().toISOString(),
    shared_with: []
  });
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [aiPrompts, setAiPrompts] = useState([]);

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
      date: new Date().toISOString(),
      shared_with: []
    });
    setAiPrompts([]);
  };

  const generateAIPrompts = async () => {
    setLoadingPrompt(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a game master helping a player reflect on their character in the Catalyst Core RPG.

Character Details:
- Name: ${character.name}
- Classification: ${character.classification}
- Origin Story: ${character.origin_story}
- Alignment: ${character.alignment}
- Power Styles: ${character.power_styles?.join(', ')}

Recent milestones: ${(character.milestones || []).slice(-3).map(m => m.description).join(', ') || 'None yet'}

Generate 5 thoughtful journal prompts that would help this character reflect on their journey, moral choices, relationships, or powers. Each prompt should be specific to their origin and alignment. Make them thought-provoking but not too long.

Return as JSON array of strings.`,
        response_json_schema: {
          type: "object",
          properties: {
            prompts: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setAiPrompts(response.prompts || []);
    } catch (error) {
      toast.error('Failed to generate prompts');
    }
    setLoadingPrompt(false);
  };

  const toggleShare = (shareTarget) => {
    const currentShared = entryForm.shared_with || [];
    const updated = currentShared.includes(shareTarget)
      ? currentShared.filter(s => s !== shareTarget)
      : [...currentShared, shareTarget];
    setEntryForm({ ...entryForm, shared_with: updated });
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
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-white">{entry.title}</h3>
                            <Badge className={getCategoryColor(entry.category)}>
                              {entry.category}
                            </Badge>
                            {entry.shared_with?.length > 0 && (
                              <Badge variant="outline" className="text-xs border-blue-400 text-blue-400">
                                <Share2 className="h-3 w-3 mr-1" />
                                Shared
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(entry.date).toLocaleDateString()}
                          </p>
                          {entry.shared_with?.length > 0 && (
                            <p className="text-xs text-blue-400 mt-1">
                              Shared with: {entry.shared_with.join(', ')}
                            </p>
                          )}
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
            {/* AI Prompts */}
            {aiPrompts.length === 0 && (
              <div className="bg-violet-900/20 border border-violet-500/30 rounded-lg p-3">
                <Button
                  onClick={generateAIPrompts}
                  disabled={loadingPrompt}
                  variant="ghost"
                  size="sm"
                  className="w-full text-violet-400 hover:bg-violet-500/20"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {loadingPrompt ? 'Generating prompts...' : 'Get AI Writing Prompts'}
                </Button>
              </div>
            )}

            {aiPrompts.length > 0 && (
              <div className="bg-violet-900/20 border border-violet-500/30 rounded-lg p-3">
                <p className="text-xs text-violet-400 uppercase mb-2 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Reflection Prompts
                </p>
                <div className="space-y-1">
                  {aiPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setEntryForm({ ...entryForm, content: prompt });
                        setAiPrompts([]);
                      }}
                      className="w-full text-left text-xs text-slate-300 hover:text-white p-2 rounded hover:bg-violet-500/20 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
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

            {/* Sharing Options */}
            <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-3">
              <p className="text-xs text-slate-400 uppercase mb-2 flex items-center gap-1">
                <Share2 className="h-3 w-3" />
                Share Entry
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={entryForm.shared_with?.includes('DM') ? 'default' : 'outline'}
                  onClick={() => toggleShare('DM')}
                  className={entryForm.shared_with?.includes('DM') ? 'bg-emerald-600' : ''}
                >
                  Share with DM
                </Button>
                <Button
                  size="sm"
                  variant={entryForm.shared_with?.includes('Party') ? 'default' : 'outline'}
                  onClick={() => toggleShare('Party')}
                  className={entryForm.shared_with?.includes('Party') ? 'bg-blue-600' : ''}
                >
                  <Users className="h-3 w-3 mr-1" />
                  Share with Party
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Shared entries can be viewed by selected recipients
              </p>
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