import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle2, Radio, Copy, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

export default function SessionLinkPanel() {
  const [joinCode, setJoinCode] = useState('');
  const [isLinked, setIsLinked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [linkedSession, setLinkedSession] = useState(null);

  // Load linked session from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('linkedSession');
    if (stored) {
      try {
        const session = JSON.parse(stored);
        setLinkedSession(session);
        setIsLinked(true);
      } catch {}
    }
  }, []);

  const { data: directorPresence } = useQuery({
    queryKey: ['directorPresence', linkedSession?.campaignId, linkedSession?.sessionId],
    queryFn: async () => {
      if (!linkedSession) return null;
      const presences = await base44.entities.Presence.filter({
        role: 'DIRECTOR',
        campaignId: linkedSession.campaignId,
        sessionId: linkedSession.sessionId
      });
      return presences.length > 0 ? presences[0] : null;
    },
    enabled: isLinked,
    refetchInterval: 5000
  });

  const handleJoinSession = async () => {
    if (!joinCode.trim()) return;
    
    setLoading(true);
    try {
      const response = await base44.functions.invoke('joinGameSession', {
        joinCode: joinCode.toUpperCase()
      });

      const session = {
        campaignId: response.data.campaignId,
        sessionId: response.data.sessionId,
        sessionName: response.data.sessionName,
        directorId: response.data.directorId,
        joinedAt: new Date().toISOString()
      };

      localStorage.setItem('linkedSession', JSON.stringify(session));
      setLinkedSession(session);
      setIsLinked(true);
      setJoinCode('');
      toast.success(`Linked to ${response.data.sessionName}`);
    } catch (error) {
      toast.error(error.message || 'Failed to join session');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = () => {
    localStorage.removeItem('linkedSession');
    setLinkedSession(null);
    setIsLinked(false);
    toast.success('Session unlinked');
  };

  const directorStatus = directorPresence?.status || 'offline';
  const directorOnline = directorStatus === 'online';

  if (!isLinked) {
    return (
      <div className="space-y-3 p-4 rounded-lg bg-slate-900 border border-slate-700">
        <div className="text-sm font-semibold mb-3">Link to Director Session</div>
        <div className="space-y-2">
          <Input
            placeholder="Enter join code (e.g., ABC123)"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleJoinSession()}
            maxLength="6"
          />
          <Button
            onClick={handleJoinSession}
            disabled={!joinCode.trim() || loading}
            className="w-full"
          >
            {loading ? 'Linking...' : 'Link Session'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 rounded-lg bg-violet-950/40 border border-violet-800/40">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-400" />
          Session Linked
        </div>
        <div className="flex items-center gap-2 text-xs">
          {directorOnline ? (
            <>
              <Wifi className="h-3 w-3 text-green-400" />
              <span className="text-green-400">Director Online</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3 text-slate-400" />
              <span className="text-slate-400">Director Offline</span>
            </>
          )}
        </div>
      </div>

      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-400">Session:</span>
          <span className="font-mono">{linkedSession.sessionName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Campaign:</span>
          <span className="font-mono text-[10px]">{linkedSession.campaignId.slice(0, 8)}...</span>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleUnlink}
        className="w-full text-xs"
      >
        Unlink Session
      </Button>
    </div>
  );
}