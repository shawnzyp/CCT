import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Radio, Send, AlertCircle, HelpCircle, CheckCircle2, Bug } from 'lucide-react';
import { toast } from 'sonner';

const SIGNALS = [
  { type: 'READY', label: 'Ready', icon: CheckCircle2, color: 'text-green-400' },
  { type: 'HELP', label: 'Need Clarification', icon: HelpCircle, color: 'text-yellow-400' },
  { type: 'BUG', label: 'Bug Report', icon: Bug, color: 'text-red-400' },
  { type: 'STATUS', label: 'Status Update', icon: Radio, color: 'text-blue-400' }
];

export default function PlayerSignalButton() {
  const [linkedSession, setLinkedSession] = useState(() => {
    const stored = localStorage.getItem('linkedSession');
    return stored ? JSON.parse(stored) : null;
  });
  const [sending, setSending] = useState(false);

  const handleSignal = async (signalType) => {
    if (!linkedSession) {
      toast.error('Not linked to a session');
      return;
    }

    setSending(true);
    try {
      await base44.functions.invoke('sendPlayerSignal', {
        campaignId: linkedSession.campaignId,
        sessionId: linkedSession.sessionId,
        type: signalType,
        payload: { timestamp: new Date().toISOString() }
      });
      toast.success(`Sent "${signalType}" to Director`);
    } catch (error) {
      toast.error('Failed to send signal');
    } finally {
      setSending(false);
    }
  };

  if (!linkedSession) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={sending}
        >
          <Send className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Signal Director</span>
          <span className="sm:hidden">Signal</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SIGNALS.map(signal => {
          const Icon = signal.icon;
          return (
            <DropdownMenuItem
              key={signal.type}
              onClick={() => handleSignal(signal.type)}
              disabled={sending}
            >
              <Icon className={`h-4 w-4 mr-2 ${signal.color}`} />
              {signal.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}