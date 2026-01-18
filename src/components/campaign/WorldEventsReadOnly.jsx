import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function WorldEventsReadOnly({ campaign }) {
  const events = campaign.world_events || [];
  
  const severityColors = {
    low: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500' },
    medium: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500' },
    high: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500' },
    critical: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500' }
  };
  
  const activeEvents = events.filter(e => e.status === 'active');
  const resolvedEvents = events.filter(e => e.status === 'resolved');
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <Globe className="h-5 w-5 text-violet-400" />
        World Events
      </h2>
      
      {activeEvents.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Active Events</h3>
          {activeEvents.map((event) => {
            const colors = severityColors[event.severity] || severityColors.medium;
            return (
              <Card key={event.id} className={cn("bg-slate-800/50 border-2", colors.border)}>
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertTriangle className={cn("h-5 w-5", colors.text)} />
                    {event.name}
                  </CardTitle>
                  <Badge className={cn("mt-2 w-fit", colors.bg, colors.text)}>
                    {event.severity} severity
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-300">{event.description}</p>
                  {event.impact && (
                    <div className={cn("p-3 rounded-lg", colors.bg)}>
                      <div className="text-xs font-semibold text-slate-400 uppercase mb-1">Impact</div>
                      <p className="text-sm text-slate-300">{event.impact}</p>
                    </div>
                  )}
                  {event.player_actions?.length > 0 && (
                    <div className="bg-slate-700/50 rounded p-3">
                      <div className="text-xs font-semibold text-slate-400 mb-2">Player Responses:</div>
                      {event.player_actions.map((pa, i) => (
                        <div key={i} className="text-xs text-slate-300 mb-1">
                          • {pa.action}
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
        <Card className="bg-slate-800/30 border-slate-700">
          <CardContent className="py-12 text-center">
            <Globe className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No world events</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}