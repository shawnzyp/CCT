import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Plus, Zap, Clock, CheckCircle, AlertTriangle, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function WorldEventsManager({ campaign, onUpdate }) {
  const [showDialog, setShowDialog] = useState(false);
  const [generatingEvent, setGeneratingEvent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    impact: '',
    severity: 'medium',
    affected_locations: [],
    affected_npcs: [],
    affected_quests: [],
    status: 'active',
    player_actions: []
  });
  
  const events = campaign.world_events || [];
  
  const severityColors = {
    low: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500' },
    medium: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500' },
    high: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500' },
    critical: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500' }
  };
  
  const handleGenerateEvent = async () => {
    setGeneratingEvent(true);
    
    const locations = campaign.world_locations?.map(l => l.name).join(', ') || 'various locations';
    const npcs = campaign.world_npcs?.map(n => n.name).join(', ') || 'local NPCs';
    const activeQuests = campaign.quests?.filter(q => q.status === 'active').map(q => q.title).join(', ') || 'current missions';
    
    const prompt = `Generate a dramatic world event for a Catalyst Core TTRPG campaign.

Campaign Context:
- Locations: ${locations}
- NPCs: ${npcs}
- Active Quests: ${activeQuests}

Create a world event that:
- Has immediate impact on the world
- Affects 1-3 locations, NPCs, or quests
- Creates opportunities for player action
- Fits the superhero vigilante theme

Include:
- Event name (dramatic and compelling)
- Description (2-3 sentences)
- Impact summary
- Severity level (low/medium/high/critical)
- Which locations/NPCs/quests are affected (use actual names from context)
- 2-3 ways players could respond or influence the event`;
    
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            impact: { type: "string" },
            severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
            affected_locations: { type: "array", items: { type: "string" } },
            affected_npcs: { type: "array", items: { type: "string" } },
            affected_quests: { type: "array", items: { type: "string" } },
            player_response_options: { type: "array", items: { type: "string" } }
          }
        }
      });
      
      setFormData({
        ...result,
        status: 'active',
        player_actions: [],
        triggered_date: new Date().toISOString()
      });
      setShowDialog(true);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setGeneratingEvent(false);
    }
  };
  
  const handleSave = () => {
    const newEvents = [...events, { ...formData, id: Date.now().toString() }];
    onUpdate({ world_events: newEvents });
    setShowDialog(false);
    setFormData({
      name: '',
      description: '',
      impact: '',
      severity: 'medium',
      affected_locations: [],
      affected_npcs: [],
      affected_quests: [],
      status: 'active',
      player_actions: []
    });
  };
  
  const handlePlayerAction = (eventId, action) => {
    const updatedEvents = events.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          player_actions: [...(event.player_actions || []), {
            action,
            timestamp: new Date().toISOString(),
            user: 'Player'
          }]
        };
      }
      return event;
    });
    onUpdate({ world_events: updatedEvents });
  };
  
  const handleResolveEvent = (eventId) => {
    const updatedEvents = events.map(event => 
      event.id === eventId ? { ...event, status: 'resolved', resolved_date: new Date().toISOString() } : event
    );
    onUpdate({ world_events: updatedEvents });
  };
  
  const activeEvents = events.filter(e => e.status === 'active');
  const resolvedEvents = events.filter(e => e.status === 'resolved');
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Globe className="h-5 w-5 text-violet-400" />
          World Events
        </h2>
        <div className="flex gap-2">
          <Button 
            onClick={handleGenerateEvent}
            disabled={generatingEvent}
            className="gap-2 bg-violet-600 hover:bg-violet-700"
          >
            {generatingEvent ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Generating...</>
            ) : (
              <><Sparkles className="h-4 w-4" />AI Generate Event</>
            )}
          </Button>
          <Button onClick={() => setShowDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </div>
      </div>
      
      {/* Active Events */}
      {activeEvents.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Active Events</h3>
          {activeEvents.map((event) => {
            const colors = severityColors[event.severity] || severityColors.medium;
            return (
              <Card key={event.id} className={cn("bg-slate-800/50 border-2", colors.border)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <AlertTriangle className={cn("h-5 w-5", colors.text)} />
                        {event.name}
                      </CardTitle>
                      <Badge className={cn("mt-2", colors.bg, colors.text)}>
                        {event.severity} severity
                      </Badge>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleResolveEvent(event.id)}
                      variant="outline"
                      className="gap-1"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Resolve
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-300">{event.description}</p>
                  
                  {event.impact && (
                    <div className={cn("p-3 rounded-lg", colors.bg)}>
                      <div className="text-xs font-semibold text-slate-400 uppercase mb-1">Impact</div>
                      <p className="text-sm text-slate-300">{event.impact}</p>
                    </div>
                  )}
                  
                  {/* Affected Elements */}
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    {event.affected_locations?.length > 0 && (
                      <div>
                        <div className="text-slate-500 mb-1">Locations</div>
                        {event.affected_locations.map((loc, i) => (
                          <Badge key={i} variant="outline" className="text-xs mr-1">{loc}</Badge>
                        ))}
                      </div>
                    )}
                    {event.affected_npcs?.length > 0 && (
                      <div>
                        <div className="text-slate-500 mb-1">NPCs</div>
                        {event.affected_npcs.map((npc, i) => (
                          <Badge key={i} variant="outline" className="text-xs mr-1">{npc}</Badge>
                        ))}
                      </div>
                    )}
                    {event.affected_quests?.length > 0 && (
                      <div>
                        <div className="text-slate-500 mb-1">Quests</div>
                        {event.affected_quests.map((quest, i) => (
                          <Badge key={i} variant="outline" className="text-xs mr-1">{quest}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Player Response Options */}
                  {event.player_response_options?.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold text-white mb-2">Player Actions:</div>
                      <div className="flex flex-wrap gap-2">
                        {event.player_response_options.map((option, i) => (
                          <Button
                            key={i}
                            size="sm"
                            variant="outline"
                            onClick={() => handlePlayerAction(event.id, option)}
                            className="text-xs"
                          >
                            <Zap className="h-3 w-3 mr-1" />
                            {option}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Player Actions Log */}
                  {event.player_actions?.length > 0 && (
                    <div className="bg-slate-700/50 rounded p-3">
                      <div className="text-xs font-semibold text-slate-400 mb-2">Player Responses:</div>
                      {event.player_actions.map((pa, i) => (
                        <div key={i} className="text-xs text-slate-300 mb-1">
                          • {pa.action} <span className="text-slate-500">({new Date(pa.timestamp).toLocaleTimeString()})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      
      {/* Resolved Events */}
      {resolvedEvents.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Resolved Events</h3>
          {resolvedEvents.map((event) => (
            <Card key={event.id} className="bg-slate-800/30 border-slate-700 opacity-60">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-white font-medium">{event.name}</span>
                  <Badge variant="outline" className="ml-auto text-xs">Resolved</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {events.length === 0 && (
        <Card className="bg-slate-800/30 border-slate-700 border-dashed">
          <CardContent className="py-12 text-center">
            <Globe className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 mb-4">No world events yet</p>
            <Button onClick={handleGenerateEvent} variant="outline" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Generate First Event
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Create/Edit Dialog */}
      {showDialog && (
        <Dialog open onOpenChange={setShowDialog}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create World Event</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <Input
                placeholder="Event Name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-slate-800 border-slate-700"
              />
              
              <Textarea
                placeholder="Description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-slate-800 border-slate-700 min-h-[80px]"
              />
              
              <Textarea
                placeholder="Impact on the world"
                value={formData.impact || ''}
                onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                className="bg-slate-800 border-slate-700 min-h-[60px]"
              />
              
              <Select value={formData.severity} onValueChange={(val) => setFormData({ ...formData, severity: val })}>
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Severity</SelectItem>
                  <SelectItem value="medium">Medium Severity</SelectItem>
                  <SelectItem value="high">High Severity</SelectItem>
                  <SelectItem value="critical">Critical Severity</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="bg-violet-600 hover:bg-violet-700">
                  Create Event
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}