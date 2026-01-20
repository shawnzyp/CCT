import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Radio, Clock, AlertTriangle, Zap, Trash2, Eye, Play, StopCircle } from "lucide-react";
import { toast } from "sonner";
import useSoundEffects from '@/components/sounds/useSoundEffects';
import { ScrollArea } from "@/components/ui/scroll-area";

export default function EchoEventsDeployment({ campaign, onUpdate }) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    duration_minutes: 30,
    choices: [
      { text: '', impact: '' },
      { text: '', impact: '' }
    ]
  });
  const { play } = useSoundEffects();

  const activeEvent = campaign.active_echo_event;
  const eventHistory = campaign.echo_event_history || [];

  const addChoice = () => {
    setEventForm({
      ...eventForm,
      choices: [...eventForm.choices, { text: '', impact: '' }]
    });
  };

  const removeChoice = (index) => {
    setEventForm({
      ...eventForm,
      choices: eventForm.choices.filter((_, i) => i !== index)
    });
  };

  const updateChoice = (index, field, value) => {
    const updated = [...eventForm.choices];
    updated[index] = { ...updated[index], [field]: value };
    setEventForm({ ...eventForm, choices: updated });
  };

  const deployEvent = () => {
    if (!eventForm.title || eventForm.choices.some(c => !c.text)) {
      toast.error('Fill in all fields');
      return;
    }

    const event = {
      active: true,
      title: eventForm.title,
      description: eventForm.description,
      duration_minutes: eventForm.duration_minutes,
      deployed_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + eventForm.duration_minutes * 60000).toISOString(),
      choices: eventForm.choices.map((c, i) => ({
        id: `choice_${i}`,
        text: c.text,
        impact: c.impact,
        votes: []
      }))
    };

    onUpdate({ active_echo_event: event });
    setShowCreateDialog(false);
    setEventForm({
      title: '',
      description: '',
      duration_minutes: 30,
      choices: [{ text: '', impact: '' }, { text: '', impact: '' }]
    });
    play('success', 0.5);
    toast.success('Echo Event deployed!');
  };

  const endEvent = () => {
    if (!activeEvent) return;

    const results = activeEvent.choices.map(choice => ({
      ...choice,
      vote_count: choice.votes.length
    }));

    const winningChoice = results.reduce((max, choice) => 
      choice.vote_count > max.vote_count ? choice : max
    );

    const completedEvent = {
      ...activeEvent,
      active: false,
      completed_at: new Date().toISOString(),
      results,
      winning_choice: winningChoice
    };

    const updatedHistory = [...eventHistory, completedEvent];

    onUpdate({
      active_echo_event: null,
      echo_event_history: updatedHistory
    });

    play('success', 0.5);
    toast.success(`Event ended! Winning choice: ${winningChoice.text}`);
  };

  const cancelEvent = () => {
    onUpdate({ active_echo_event: null });
    play('error', 0.3);
    toast.info('Event cancelled');
  };

  const timeRemaining = () => {
    if (!activeEvent) return '';
    const remaining = new Date(activeEvent.expires_at) - new Date();
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="space-y-4">
      {/* Active Event Panel */}
      {activeEvent ? (
        <Card className="bg-gradient-to-br from-orange-900/50 to-red-900/50 border-2 border-orange-500">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Radio className="h-5 w-5 text-orange-400 animate-pulse" />
              Active Echo Event: {activeEvent.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-orange-300 text-sm">
              <Clock className="h-4 w-4" />
              <span>Time Remaining: {timeRemaining()}</span>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-slate-400 uppercase tracking-wider">Choices & Votes</p>
              {activeEvent.choices.map((choice, i) => (
                <div key={i} className="bg-slate-800/50 rounded p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-white font-medium">{choice.text}</p>
                      <p className="text-xs text-slate-400 mt-1">Impact: {choice.impact}</p>
                    </div>
                    <Badge variant="outline" className="text-orange-400 border-orange-400">
                      {choice.votes.length} votes
                    </Badge>
                  </div>
                  {choice.votes.length > 0 && (
                    <div className="mt-2 text-xs text-slate-400">
                      Voted by: {choice.votes.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={endEvent}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <StopCircle className="h-4 w-4 mr-2" />
                End Event & Tally Results
              </Button>
              <Button
                onClick={cancelEvent}
                variant="outline"
                className="border-red-500 text-red-400 hover:bg-red-500/20"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Radio className="h-5 w-5 text-orange-400" />
              Echo Events
            </CardTitle>
            <p className="text-sm text-slate-400">
              Deploy dynamic world events that players vote on in real-time
            </p>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              <Play className="h-4 w-4 mr-2" />
              Deploy New Echo Event
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Event History */}
      {eventHistory.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Event History</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {eventHistory.slice().reverse().map((event, i) => (
                  <Card key={i} className="bg-slate-700/50 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-white">{event.title}</p>
                          <p className="text-xs text-slate-400">
                            {new Date(event.completed_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className="bg-green-600">Completed</Badge>
                      </div>
                      <div className="mt-2 p-2 bg-green-900/20 border border-green-600/30 rounded">
                        <p className="text-xs text-green-400 font-semibold">Winning Choice:</p>
                        <p className="text-sm text-white mt-1">{event.winning_choice?.text}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {event.winning_choice?.vote_count} votes
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Create Event Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-slate-900 border-2 border-orange-500 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-orange-400 flex items-center gap-2">
              <Radio className="h-5 w-5" />
              Deploy Echo Event
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 bg-orange-900/20 border border-orange-600/30 rounded">
              <p className="text-xs text-orange-300">
                Echo Events are real-time voting scenarios where players influence the world.
                Create compelling choices with meaningful impacts.
              </p>
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase">Event Title *</label>
              <Input
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                placeholder="e.g., The Council's Dilemma"
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase">Description</label>
              <Textarea
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                placeholder="What's happening? Set the scene..."
                className="bg-slate-800 border-slate-600 text-white h-24"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase">Duration (minutes)</label>
              <Input
                type="number"
                value={eventForm.duration_minutes}
                onChange={(e) => setEventForm({ ...eventForm, duration_minutes: parseInt(e.target.value) })}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-400 uppercase">Choices *</label>
                <Button
                  onClick={addChoice}
                  size="sm"
                  variant="outline"
                  className="border-orange-500 text-orange-400"
                >
                  <Zap className="h-3 w-3 mr-2" />
                  Add Choice
                </Button>
              </div>

              {eventForm.choices.map((choice, i) => (
                <Card key={i} className="bg-slate-800 border-slate-600">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-orange-400 font-semibold">Choice {i + 1}</span>
                      {eventForm.choices.length > 2 && (
                        <Button
                          onClick={() => removeChoice(i)}
                          size="sm"
                          variant="ghost"
                          className="h-6 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <Input
                      value={choice.text}
                      onChange={(e) => updateChoice(i, 'text', e.target.value)}
                      placeholder="What can players choose?"
                      className="bg-slate-700 border-slate-600 text-white text-sm"
                    />
                    <Textarea
                      value={choice.impact}
                      onChange={(e) => updateChoice(i, 'impact', e.target.value)}
                      placeholder="What happens if this wins? (visible to players)"
                      className="bg-slate-700 border-slate-600 text-white text-sm h-16"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => setShowCreateDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={deployEvent}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Deploy Event
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}