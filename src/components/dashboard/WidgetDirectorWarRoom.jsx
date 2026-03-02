import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Radio, Users, AlertCircle, CheckCircle, Send, MessageSquare, Zap, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';

export default function WidgetDirectorWarRoom({ accentA, panel1, panel0, text0, text1, muted }) {
  const qc = useQueryClient();
  const [isDM] = useState(() => localStorage.getItem('isDM') === 'true');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [activeTab, setActiveTab] = useState('signals');

  const { data: presences = [] } = useQuery({
    queryKey: ['warroom-presences'],
    queryFn: () => base44.entities.Presence.filter({ status: 'online' }, '-lastSeenAt', 20),
    staleTime: 10_000,
    refetchInterval: 15_000,
  });

  const { data: signals = [] } = useQuery({
    queryKey: ['warroom-signals'],
    queryFn: () => base44.entities.PlayerSignal.filter({ read: false }, '-created_date', 10),
    staleTime: 10_000,
    refetchInterval: 10_000,
    enabled: isDM,
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['warroom-sessions'],
    queryFn: () => base44.entities.SessionLink.filter({ status: 'active' }, '-created_date', 5),
    staleTime: 15_000,
  });

  const markRead = useMutation({
    mutationFn: (id) => base44.entities.PlayerSignal.update(id, { read: true }),
    onSuccess: () => qc.invalidateQueries(['warroom-signals']),
  });

  const SIGNAL_LABELS = { READY: 'Ready', HELP: 'Need Help', BUG: 'Bug Report', STATUS: 'Status' };
  const SIGNAL_COLOR = { READY: '#00D1B2', HELP: '#FFC857', BUG: '#FF3B3B', STATUS: accentA };

  if (!isDM) {
    return (
      <div className="text-center py-4">
        <Eye className="h-6 w-6 mx-auto mb-2 opacity-30" style={{ color: muted }} />
        <p className="text-[10px] font-mono" style={{ color: muted }}>DIRECTOR ACCESS REQUIRED</p>
        <p className="text-[9px] font-mono mt-1 opacity-60" style={{ color: muted }}>Log in as Director to access War Room</p>
      </div>
    );
  }

  const tabs = [
    { id: 'signals', label: `SIGNALS ${signals.length > 0 ? `(${signals.length})` : ''}` },
    { id: 'presence', label: `PRESENCE (${presences.length})` },
    { id: 'sessions', label: `SESSIONS (${sessions.length})` },
  ];

  return (
    <div className="space-y-3">
      {/* Tab bar */}
      <div className="flex gap-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className="px-2.5 py-1 rounded text-[8px] font-mono font-bold transition-all"
            style={{ background: activeTab === t.id ? accentA + '25' : 'transparent', color: activeTab === t.id ? accentA : muted }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Signals */}
      {activeTab === 'signals' && (
        <div className="space-y-1.5">
          {signals.length === 0 && <p className="text-[10px] font-mono text-center py-3" style={{ color: muted }}>NO PENDING SIGNALS</p>}
          {signals.map(s => {
            const color = SIGNAL_COLOR[s.type] || accentA;
            return (
              <div key={s.id} className="flex items-center gap-2 rounded px-2.5 py-2" style={{ background: panel1, border: `1px solid ${color}30` }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-mono font-bold" style={{ color }}>{SIGNAL_LABELS[s.type] || s.type}</div>
                  <div className="text-[9px] font-mono truncate" style={{ color: muted }}>{s.playerEmail}</div>
                  {s.payload?.message && <div className="text-[9px] mt-0.5" style={{ color: text1 }}>{s.payload.message}</div>}
                </div>
                <button onClick={() => markRead.mutate(s.id)} className="cc-sm-target p-1 hover:opacity-70">
                  <CheckCircle className="h-3.5 w-3.5" style={{ color: '#00D1B2' }} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Presence */}
      {activeTab === 'presence' && (
        <div className="space-y-1.5">
          {presences.length === 0 && <p className="text-[10px] font-mono text-center py-3" style={{ color: muted }}>NO PLAYERS ONLINE</p>}
          {presences.map(p => (
            <div key={p.id} className="flex items-center gap-2 rounded px-2.5 py-2" style={{ background: panel1 }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#00D1B2' }} />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-mono truncate" style={{ color: text1 }}>{p.userId}</div>
                <div className="text-[8px] font-mono" style={{ color: muted }}>{p.role} · {p.status}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sessions */}
      {activeTab === 'sessions' && (
        <div className="space-y-1.5">
          {sessions.length === 0 && <p className="text-[10px] font-mono text-center py-3" style={{ color: muted }}>NO ACTIVE SESSIONS</p>}
          {sessions.map(s => (
            <div key={s.id} className="flex items-center gap-2 rounded px-2.5 py-2" style={{ background: panel1 }}>
              <Radio className="h-3 w-3 animate-pulse flex-shrink-0" style={{ color: '#00D1B2' }} />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-mono font-bold truncate" style={{ color: text0 }}>{s.sessionName}</div>
                <div className="text-[8px] font-mono" style={{ color: muted }}>Code: {s.joinCode} · {(s.playerIds || []).length} players</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}