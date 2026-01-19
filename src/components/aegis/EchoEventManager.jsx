import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, AlertTriangle, Clock, Eye, EyeOff, Plus, ChevronRight, ChevronLeft, Zap, Trash2 } from "lucide-react";
import useSoundEffects from '@/components/sounds/useSoundEffects';
import { useAegis } from './AegisContext';

const EVENT_STAGES = [
  { stage: 1, name: 'Emergence', color: 'blue', description: 'Initial signs detected' },
  { stage: 2, name: 'Escalation', color: 'yellow', description: 'Growing threat' },
  { stage: 3, name: 'Crisis', color: 'orange', description: 'Active danger' },
  { stage: 4, name: 'Catastrophe', color: 'red', description: 'Severe consequences' },
  { stage: 5, name: 'Resolution', color: 'violet', description: 'Aftermath/conclusion' }
];

export default function EchoEventManager({ campaignId, isGM = false }) {
  const [echoEvents, setEchoEvents] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: '',
    current_stage: 1,
    public_broadcast: '',
    gm_cause: '',
    gm_consequence: '',
    clock_segments: 6,
    clock_current: 0
  });
  const { play } = useSoundEffects();

  const getStageConfig = (stage) => EVENT_STAGES.find(s => s.stage === stage) || EVENT_STAGES[0];

  const createEvent = () => {
    const event = {
      id: `echo_${Date.now()}`,
      ...newEvent,
      created_at: new Date().toISOString(),
      broadcasts: [{
        stage: newEvent.current_stage,
        message: newEvent.public_broadcast,
        timestamp: new Date().toISOString()
      }]
    };
    
    setEchoEvents([...echoEvents, event]);
    setShowCreateDialog(false);
    setNewEvent({
      name: '',
      current_stage: 1,
      public_broadcast: '',
      gm_cause: '',
      gm_consequence: '',
      clock_segments: 6,
      clock_current: 0
    });
    play('success', 0.3);
  };

  const advanceStage = (eventId) => {
    setEchoEvents(events =>
      events.map(e => {
        if (e.id === eventId && e.current_stage < 5) {
          return { ...e, current_stage: e.current_stage + 1 };
        }
        return e;
      })
    );
    play('navigate', 0.2);
  };

  const regressStage = (eventId) => {
    setEchoEvents(events =>
      events.map(e => {
        if (e.id === eventId && e.current_stage > 1) {
          return { ...e, current_stage: e.current_stage - 1 };
        }
        return e;
      })
    );
    play('click', 0.1);
  };

  const tickEventClock = (eventId, delta) => {
    setEchoEvents(events =>
      events.map(e => {
        if (e.id === eventId) {
          const newCurrent = Math.max(0, Math.min(e.clock_current + delta, e.clock_segments));
          return { ...e, clock_current: newCurrent };
        }
        return e;
      })
    );
    play(delta > 0 ? 'error' : 'click', 0.2);
  };

  const addBroadcast = (eventId, message) => {
    setEchoEvents(events =>
      events.map(e => {
        if (e.id === eventId) {
          return {
            ...e,
            broadcasts: [...(e.broadcasts || []), {
              stage: e.current_stage,
              message,
              timestamp: new Date().toISOString()
            }]
          };
        }
        return e;
      })
    );
    play('navigate', 0.2);
  };

  const deleteEvent = (eventId) => {
    setEchoEvents(events => events.filter(e => e.id !== eventId));
    play('error', 0.2);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white font-mono">ECHO EVENT TRACKING</h3>
          <p className="text-xs text-slate-400 font-mono">Large-scale incident monitoring</p>
        </div>
        {isGM && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-violet-600 hover:bg-violet-700 text-white border-2 border-violet-500">
                <Plus className="h-4 w-4 mr-2" />
                New Echo Event
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-2 border-violet-500 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-violet-400 font-mono">Create Echo Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider">Event Name</label>
                  <Input
                    value={newEvent.name}
                    onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                    placeholder="The Convergence Protocol"
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider">Initial Stage</label>
                  <Select
                    value={newEvent.current_stage.toString()}
                    onValueChange={(v) => setNewEvent({ ...newEvent, current_stage: parseInt(v) })}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {EVENT_STAGES.map(stage => (
                        <SelectItem key={stage.stage} value={stage.stage.toString()}>
                          Stage {stage.stage}: {stage.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider">Public Broadcast</label>
                  <Textarea
                    value={newEvent.public_broadcast}
                    onChange={(e) => setNewEvent({ ...newEvent, public_broadcast: e.target.value })}
                    placeholder="Emergency alert: Unidentified energy signature detected downtown..."
                    className="bg-slate-800 border-slate-600 text-white h-20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-orange-400 uppercase tracking-wider flex items-center gap-1">
                      <EyeOff className="h-3 w-3" />
                      GM-Only Cause
                    </label>
                    <Textarea
                      value={newEvent.gm_cause}
                      onChange={(e) => setNewEvent({ ...newEvent, gm_cause: e.target.value })}
                      placeholder="Reality breach caused by..."
                      className="bg-slate-800 border-orange-600/50 text-slate-300 h-20"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-red-400 uppercase tracking-wider flex items-center gap-1">
                      <EyeOff className="h-3 w-3" />
                      GM-Only Consequence
                    </label>
                    <Textarea
                      value={newEvent.gm_consequence}
                      onChange={(e) => setNewEvent({ ...newEvent, gm_consequence: e.target.value })}
                      placeholder="If unresolved, dimensional collapse..."
                      className="bg-slate-800 border-red-600/50 text-slate-300 h-20"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider">Countdown Clock Segments</label>
                  <Select
                    value={newEvent.clock_segments.toString()}
                    onValueChange={(v) => setNewEvent({ ...newEvent, clock_segments: parseInt(v) })}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {[4, 6, 8, 10, 12].map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} segments
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={createEvent}
                  disabled={!newEvent.name || !newEvent.public_broadcast}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Events List */}
      <ScrollArea className="h-[500px]">
        <AnimatePresence>
          {echoEvents.length > 0 ? (
            <div className="space-y-4">
              {echoEvents.map((event) => {
                const stageConfig = getStageConfig(event.current_stage);
                const clockPercent = (event.clock_current / event.clock_segments) * 100;

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <Card className={cn(
                      "bg-slate-800 border-2 transition-all",
                      `border-${stageConfig.color}-500/50`
                    )}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-white font-mono flex items-center gap-2">
                              <Radio className={cn("h-4 w-4", `text-${stageConfig.color}-400`)} />
                              {event.name}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className={cn("font-mono", `bg-${stageConfig.color}-600`)}>
                                Stage {event.current_stage}: {stageConfig.name}
                              </Badge>
                              {clockPercent >= 75 && (
                                <Badge className="bg-red-600 animate-pulse">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Critical
                                </Badge>
                              )}
                            </div>
                          </div>
                          {isGM && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteEvent(event.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Public Broadcast */}
                        <div className="p-3 bg-violet-900/30 border-2 border-violet-500/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Eye className="h-3 w-3 text-violet-400" />
                            <span className="text-xs font-mono text-violet-400 uppercase tracking-wider">
                              Public Broadcast
                            </span>
                          </div>
                          {event.broadcasts?.slice(-1)[0]?.message && (
                            <p className="text-sm text-slate-300 leading-relaxed">
                              {event.broadcasts.slice(-1)[0].message}
                            </p>
                          )}
                        </div>

                        {/* GM-Only Information */}
                        {isGM && (event.gm_cause || event.gm_consequence) && (
                          <div className="grid grid-cols-2 gap-3">
                            {event.gm_cause && (
                              <div className="p-2 bg-orange-900/20 border border-orange-600/30 rounded">
                                <div className="flex items-center gap-1 mb-1">
                                  <EyeOff className="h-3 w-3 text-orange-400" />
                                  <span className="text-xs font-mono text-orange-400 uppercase">Cause</span>
                                </div>
                                <p className="text-xs text-slate-400">{event.gm_cause}</p>
                              </div>
                            )}
                            {event.gm_consequence && (
                              <div className="p-2 bg-red-900/20 border border-red-600/30 rounded">
                                <div className="flex items-center gap-1 mb-1">
                                  <EyeOff className="h-3 w-3 text-red-400" />
                                  <span className="text-xs font-mono text-red-400 uppercase">Consequence</span>
                                </div>
                                <p className="text-xs text-slate-400">{event.gm_consequence}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Countdown Clock */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono text-slate-400 uppercase flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Event Clock
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              {event.clock_current}/{event.clock_segments}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            {Array.from({ length: event.clock_segments }).map((_, i) => (
                              <div
                                key={i}
                                className={cn(
                                  "flex-1 h-3 rounded transition-all",
                                  i < event.clock_current
                                    ? clockPercent >= 75 ? "bg-red-500"
                                    : clockPercent >= 50 ? "bg-orange-500"
                                    : "bg-yellow-500"
                                    : "bg-slate-700"
                                )}
                              />
                            ))}
                          </div>
                          {isGM && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => tickEventClock(event.id, 1)}
                                disabled={event.clock_current >= event.clock_segments}
                                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white border-2 border-orange-500"
                              >
                                <ChevronRight className="h-3 w-3 mr-1" />
                                Advance Clock
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => tickEventClock(event.id, -1)}
                                disabled={event.clock_current <= 0}
                                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white border-2 border-slate-500"
                              >
                                <ChevronLeft className="h-3 w-3 mr-1" />
                                Rewind
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Stage Control */}
                        {isGM && (
                          <div className="flex gap-2 pt-2 border-t border-slate-700">
                            <Button
                              size="sm"
                              onClick={() => regressStage(event.id)}
                              disabled={event.current_stage <= 1}
                              className="flex-1 bg-slate-600 hover:bg-slate-700 text-white border-2 border-slate-500"
                            >
                              <ChevronLeft className="h-3 w-3 mr-1" />
                              Previous Stage
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => advanceStage(event.id)}
                              disabled={event.current_stage >= 5}
                              className={cn(
                                "flex-1 text-white border-2",
                                `bg-${stageConfig.color}-600 hover:bg-${stageConfig.color}-700 border-${stageConfig.color}-500`
                              )}
                            >
                              <ChevronRight className="h-3 w-3 mr-1" />
                              Next Stage
                            </Button>
                          </div>
                        )}

                        {/* Broadcast History */}
                        {event.broadcasts?.length > 1 && (
                          <details className="text-xs">
                            <summary className="text-slate-400 cursor-pointer hover:text-slate-300">
                              Broadcast History ({event.broadcasts.length})
                            </summary>
                            <div className="mt-2 space-y-2">
                              {event.broadcasts.slice(0, -1).reverse().map((broadcast, i) => (
                                <div key={i} className="p-2 bg-slate-900/50 rounded border border-slate-700">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="text-xs">
                                      Stage {broadcast.stage}
                                    </Badge>
                                    <span className="text-slate-500 text-xs">
                                      {new Date(broadcast.timestamp).toLocaleString()}
                                    </span>
                                  </div>
                                  <p className="text-slate-400">{broadcast.message}</p>
                                </div>
                              ))}
                            </div>
                          </details>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <Card className="bg-slate-800 border-2 border-slate-700">
              <CardContent className="py-12 text-center">
                <Radio className="h-16 w-16 mx-auto text-slate-600 mb-4" />
                <p className="text-slate-400 text-sm">No Echo Events tracked</p>
                {isGM && (
                  <p className="text-slate-500 text-xs mt-2">
                    Create an event to track large-scale incidents
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </AnimatePresence>
      </ScrollArea>
    </div>
  );
}