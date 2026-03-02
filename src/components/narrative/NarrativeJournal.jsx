import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BookOpen, Plus, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function NarrativeJournal({ entries = [], isLoading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: '', content: '', category: 'event' });
  const queryClient = useQueryClient();

  const createEntryMutation = useMutation({
    mutationFn: async (entry) => {
      // Update current character's journal
      const chars = await base44.entities.Character.list();
      if (chars.length === 0) return null;
      
      const current = chars[0];
      const updated = {
        ...current,
        player_journal: [
          ...(current.player_journal || []),
          {
            title: entry.title,
            content: entry.content,
            category: entry.category,
            date: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
      };
      
      return base44.entities.Character.update(current.id, updated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      setShowNewEntry(false);
      setNewEntry({ title: '', content: '', category: 'event' });
    }
  });

  const filteredEntries = entries.filter(e =>
    e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = {
    event: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
    clue: 'bg-violet-500/10 border-violet-500/30 text-violet-400',
    character: 'bg-green-500/10 border-green-500/30 text-green-400',
    location: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    plot: 'bg-red-500/10 border-red-500/30 text-red-400'
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search journal entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-slate-800 border-slate-700"
          />
        </div>
        <Button
          onClick={() => setShowNewEntry(true)}
          className="bg-violet-600 hover:bg-violet-700 gap-2"
        >
          <Plus className="h-4 w-4" />
          Entry
        </Button>
      </div>

      {filteredEntries.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-8 text-center">
            <BookOpen className="h-8 w-8 text-slate-500 mx-auto mb-2" />
            <p className="text-slate-400">No journal entries yet. Start documenting your adventures!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map((entry, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base text-cyan-400">{entry.title}</CardTitle>
                    <span className={`text-xs px-2 py-1 rounded-md border ${categories[entry.category] || 'bg-slate-700'}`}>
                      {entry.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {new Date(entry.date || entry.updated_at).toLocaleDateString()}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-300 line-clamp-2">{entry.content}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* New Entry Dialog */}
      <Dialog open={showNewEntry} onOpenChange={setShowNewEntry}>
        <DialogContent className="bg-gradient-to-br from-slate-900 to-slate-950 border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-cyan-400">New Journal Entry</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Title</label>
              <Input
                value={newEntry.title}
                onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                placeholder="Entry title..."
                className="bg-slate-800 border-slate-700"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Category</label>
              <select
                value={newEntry.category}
                onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-sm text-slate-300"
              >
                <option value="event">Event</option>
                <option value="clue">Clue</option>
                <option value="character">Character</option>
                <option value="location">Location</option>
                <option value="plot">Plot Point</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Content</label>
              <Textarea
                value={newEntry.content}
                onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                placeholder="Write your entry..."
                className="bg-slate-800 border-slate-700 h-32"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => setShowNewEntry(false)}
                variant="outline"
                className="flex-1 border-slate-600"
              >
                Cancel
              </Button>
              <Button
                onClick={() => createEntryMutation.mutate(newEntry)}
                disabled={!newEntry.title || !newEntry.content || createEntryMutation.isPending}
                className="flex-1 bg-violet-600 hover:bg-violet-700"
              >
                {createEntryMutation.isPending ? 'Saving...' : 'Save Entry'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}