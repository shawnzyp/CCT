import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wifi, Copy, Zap, RefreshCw, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

export default function DirectorSessionPanel({ campaignId }) {
  const [sessionName, setSessionName] = useState('');
  const [creating, setCreating] = useState(false);
  const [activeSession, setActiveSession] = useState(null);

  const { data: session, refetch: refetchSession } = useQuery({
    queryKey: ['activeSession', campaignId],
    queryFn: async () => {
      if (!campaignId) return null;
      const sessions = await base44.entities.SessionLink.filter({
        campaignId,
        status: 'active'
      });
      return sessions.length > 0 ? sessions[0] : null;
    },
    enabled: !!campaignId,
    refetchInterval: 5000
  });

  const { data: connectedPlayers = [] } = useQuery({
    queryKey: ['connectedPlayers', session?.campaignId, session?.sessionId],
    queryFn: async () => {
      if (!session) return [];
      const presences = await base44.entities.Presence.filter({
        role: 'PLAYER',
        campaignId: session.campaignId,
        sessionId: session.sessionId
      });
      return presences.sort((a, b) => new Date(b.lastSeenAt) - new Date(a.lastSeenAt));
    },
    enabled: !!session,
    refetchInterval: 5000
  });

  const { data: recentEvents = [] } = useQuery({
    queryKey: ['recentGameEvents', session?.campaignId, session?.sessionId],
    queryFn: async () => {
      if (!session) return [];
      const events = await base44.entities.GameEvent.filter({
        campaignId: session.campaignId,
        sessionId: session.sessionId
      });
      return events.slice(-10).reverse();
    },
    enabled: !!session,
    refetchInterval: 3000
  });

  const { data: deliveries = [] } = useQuery({
    queryKey: ['allDeliveries', session?.campaignId, session?.sessionId],
    queryFn: async () => {
      if (!session) return [];
      return await base44.entities.EventDelivery.filter({
        campaignId: session.campaignId,
        sessionId: session.sessionId
      });
    },
    enabled: !!session,
    refetchInterval: 3000
  });

  const handleCreateSession = async () => {
    if (!sessionName.trim()) {
      toast.error('Enter session name');
      return;
    }

    setCreating(true);
    try {
      const response = await base44.functions.invoke('createGameSession', {
        campaignId,
        sessionName
      });

      toast.success(`Session created: ${response.data.joinCode}`);
      setSessionName('');
      refetchSession();
    } catch (error) {
      toast.error(error.message || 'Failed to create session');
    } finally {
      setCreating(false);
    }
  };

  const handlePingPlayers = async () => {
    if (!session) return;

    try {
      await base44.functions.invoke('publishGameEvent', {
        campaignId: session.campaignId,
        sessionId: session.sessionId,
        type: 'PING',
        payload: { message: 'Director ping - please respond' },
        recipients: 'ALL'
      });
      toast.success(`Pinged ${session.playerIds?.length || 0} players`);
    } catch (error) {
      toast.error('Failed to ping players');
    }
  };

  const handleCopyJoinCode = () => {
    navigator.clipboard.writeText(session.joinCode);
    toast.success('Join code copied!');
  };

  if (!session) {
    return (
      <div className="space-y-3 p-4 rounded-lg bg-slate-900/50 border border-slate-700">
        <div className="text-sm font-semibold mb-3">Create Session</div>
        <div className="space-y-2">
          <Input
            placeholder="Session name (e.g., Main Campaign)"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateSession()}
          />
          <Button
            onClick={handleCreateSession}
            disabled={!sessionName.trim() || creating}
            className="w-full"
          >
            {creating ? 'Creating...' : 'Start Session'}
          </Button>
        </div>
      </div>
    );
  }

  const onlineCount = connectedPlayers.filter(p => p.status === 'online').length;
  const deliveredCount = deliveries.filter(d => d.status === 'delivered' || d.status === 'acknowledged').length;
  const acknowledgedCount = deliveries.filter(d => d.status === 'acknowledged').length;

  return (
    <div className="space-y-4 p-4 rounded-lg bg-slate-900/50 border border-slate-700">
      {/* Session Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">{session.sessionName}</div>
          <div className="flex items-center gap-2 text-xs">
            <Wifi className={onlineCount > 0 ? 'text-green-400' : 'text-slate-500'} size={16} />
            <span>{onlineCount} online</span>
          </div>
        </div>

        {/* Join Code */}
        <div className="flex items-center gap-2 p-2 rounded bg-slate-800 border border-slate-700">
          <code className="flex-1 text-xs font-mono">{session.joinCode}</code>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopyJoinCode}
            className="h-6 w-6 p-0"
          >
            <Copy size={14} />
          </Button>
        </div>
      </div>

      {/* Connected Players */}
      <div className="space-y-2">
        <div className="text-xs font-semibold flex items-center gap-2">
          <Users size={14} />
          Connected Players
        </div>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {connectedPlayers.length === 0 ? (
            <div className="text-xs text-slate-400">Waiting for players...</div>
          ) : (
            connectedPlayers.map(player => (
              <div key={player.id} className="text-xs flex items-center justify-between p-2 rounded bg-slate-800">
                <span className="truncate">{player.userId}</span>
                <span className={player.status === 'online' ? 'text-green-400' : 'text-slate-500'}>
                  {player.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handlePingPlayers}
          variant="outline"
          className="gap-2 flex-1"
        >
          <Zap size={14} />
          Ping
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={refetchSession}
          className="h-8 w-8 p-0"
        >
          <RefreshCw size={14} />
        </Button>
      </div>

      {/* Last Broadcast */}
      <div className="space-y-2">
        <div className="text-xs font-semibold">Last Broadcast</div>
        <div className="text-xs text-slate-400">
          {recentEvents.length > 0 ? (
            <div>
              Latest: {recentEvents[0].type}
              <br />
              Delivered: {deliveredCount} | Acknowledged: {acknowledgedCount}
            </div>
          ) : (
            'No events yet'
          )}
        </div>
      </div>
    </div>
  );
}