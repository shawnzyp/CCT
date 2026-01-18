import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, CheckCircle, Circle } from "lucide-react";

export default function CampaignEvents({ campaign }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [impact, setImpact] = useState('');
  const queryClient = useQueryClient();
  
  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Campaign.update(campaign.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['campaign', campaign.id]);
      setShowForm(false);
      setName('');
      setDescription('');
      setImpact('');
    }
  });
  
  const addEvent = () => {
    const newEvent = { name, description, impact, resolved: false };
    updateMutation.mutate({
      world_events: [...(campaign.world_events || []), newEvent]
    });
  };
  
  const toggleResolved = (index) => {
    const events = [...(campaign.world_events || [])];
    events[index].resolved = !events[index].resolved;
    updateMutation.mutate({ world_events: events });
  };
  
  const deleteEvent = (index) => {
    const events = [...(campaign.world_events || [])];
    events.splice(index, 1);
    updateMutation.mutate({ world_events: events });
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">World Events</h2>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Event
        </Button>
      </div>
      
      {showForm && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6 space-y-3">
            <Input
              placeholder="Event name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
            />
            <Textarea
              placeholder="Description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white h-20"
            />
            <Input
              placeholder="Impact on world/story..."
              value={impact}
              onChange={(e) => setImpact(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
            />
            <div className="flex gap-2">
              <Button onClick={addEvent} disabled={!name.trim()} className="flex-1">Add Event</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="space-y-3">
        {(campaign.world_events || []).map((event, index) => (
          <Card key={index} className="bg-slate-800/50 border-slate-700 group">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <button onClick={() => toggleResolved(index)} className="text-slate-400 hover:text-white">
                    {event.resolved ? (
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </button>
                  <div className="flex-1">
                    <CardTitle className={`text-white text-lg ${event.resolved ? 'line-through opacity-60' : ''}`}>
                      {event.name}
                    </CardTitle>
                    {event.impact && (
                      <p className="text-xs text-amber-400 mt-1">Impact: {event.impact}</p>
                    )}
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-red-400"
                  onClick={() => deleteEvent(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            {event.description && (
              <CardContent>
                <p className="text-slate-300 text-sm">{event.description}</p>
              </CardContent>
            )}
          </Card>
        ))}
        {(!campaign.world_events || campaign.world_events.length === 0) && (
          <div className="text-center py-12 text-slate-500">
            No world events yet
          </div>
        )}
      </div>
    </div>
  );
}