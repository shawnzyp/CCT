import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Plus, User } from "lucide-react";

export default function CollaborativeNotes({ notes = [], onUpdate, currentUser }) {
  const [showInput, setShowInput] = useState(false);
  const [newNote, setNewNote] = useState('');
  
  const handleAddNote = () => {
    if (newNote.trim()) {
      const updatedNotes = [
        ...notes,
        {
          content: newNote,
          author: currentUser?.email || 'Unknown',
          timestamp: new Date().toISOString()
        }
      ];
      onUpdate(updatedNotes);
      setNewNote('');
      setShowInput(false);
    }
  };
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <MessageSquare className="h-3 w-3" />
          Collaborative Notes
        </div>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={() => setShowInput(!showInput)}
          className="h-6 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Note
        </Button>
      </div>
      
      {showInput && (
        <div className="space-y-2">
          <Textarea
            placeholder="Add your note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="bg-slate-700/50 border-slate-600 text-white text-sm min-h-[60px]"
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowInput(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAddNote} className="bg-violet-600 hover:bg-violet-700">
              Save Note
            </Button>
          </div>
        </div>
      )}
      
      {notes.length > 0 ? (
        <div className="space-y-2">
          {notes.map((note, i) => (
            <div key={i} className="bg-slate-700/30 rounded p-2 text-sm">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  <User className="h-2 w-2 mr-1" />
                  {note.author.split('@')[0]}
                </Badge>
                <span className="text-xs text-slate-500">
                  {new Date(note.timestamp).toLocaleDateString()}
                </span>
              </div>
              <p className="text-slate-300">{note.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-500 text-center py-4">No notes yet</p>
      )}
    </div>
  );
}