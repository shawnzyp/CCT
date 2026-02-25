import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Mail, Zap, MapPin, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

const EVENT_ICONS = {
  ALERT: AlertCircle,
  HANDOUT: Mail,
  MISSION_BRIEF: Zap,
  MAP_UPDATE: MapPin,
  CLOCK_UPDATE: Clock,
  SYSTEM: Zap,
  PING: Radio
};

export default function EventInbox() {
  const [linkedSession, setLinkedSession] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('linkedSession');
    if (stored) {
      try {
        setLinkedSession(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const { data: events = [], refetch } = useQuery({
    queryKey: ['gameEvents', linkedSession?.campaignId, linkedSession?.sessionId],
    queryFn: async () => {
      if (!linkedSession) return [];
      const allEvents = await base44.entities.GameEvent.filter({
        campaignId: linkedSession.campaignId,
        sessionId: linkedSession.sessionId
      });
      return allEvents.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!linkedSession,
    refetchInterval: 3000
  });

  const { data: deliveries = [] } = useQuery({
    queryKey: ['eventDeliveries', linkedSession?.campaignId, linkedSession?.sessionId],
    queryFn: async () => {
      if (!linkedSession) return [];
      const user = await base44.auth.me();
      const allDeliveries = await base44.entities.EventDelivery.filter({
        campaignId: linkedSession.campaignId,
        sessionId: linkedSession.sessionId,
        recipientId: user.email
      });
      return allDeliveries;
    },
    enabled: !!linkedSession,
    refetchInterval: 3000
  });

  const handleAcknowledge = async (eventId) => {
    try {
      await base44.functions.invoke('acknowledgeEvent', {
        eventId,
        campaignId: linkedSession.campaignId,
        sessionId: linkedSession.sessionId
      });
      toast.success('Event acknowledged');
      refetch();
    } catch (error) {
      toast.error('Failed to acknowledge');
    }
  };

  const handleMarkDelivered = async (eventId) => {
    try {
      const user = await base44.auth.me();
      const delivery = deliveries.find(d => d.eventId === eventId && d.recipientId === user.email);
      if (delivery && delivery.status === 'pending') {
        await base44.entities.EventDelivery.update(delivery.id, {
          status: 'delivered',
          deliveredAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Failed to mark delivered:', error);
    }
  };

  if (!linkedSession) {
    return (
      <div className="p-4 text-center text-slate-400 text-sm">
        Not linked to a session
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="p-4 text-center text-slate-400 text-sm">
        No events yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {events.map((event) => {
        const Icon = EVENT_ICONS[event.type] || Zap;
        const delivery = deliveries.find(d => d.eventId === event.id);
        const isAcknowledged = delivery?.status === 'acknowledged';

        return (
          <div
            key={event.id}
            className="p-3 rounded-lg border border-slate-700 bg-slate-900/50 hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 min-w-0 flex-1">
                <Icon className="h-4 w-4 text-violet-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-200 capitalize">
                    {event.type.replace(/_/g, ' ')}
                  </div>
                  {event.payload?.message && (
                    <div className="text-xs text-slate-400 mt-1">
                      {event.payload.message}
                    </div>
                  )}
                </div>
              </div>
              {!isAcknowledged && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAcknowledge(event.id)}
                  className="text-xs flex-shrink-0"
                >
                  Ack
                </Button>
              )}
              {isAcknowledged && (
                <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
              )}
            </div>
            <div className="text-[10px] text-slate-500 mt-2">
              {new Date(event.created_date).toLocaleTimeString()}
            </div>
          </div>
        );
      })}
    </div>
  );
}