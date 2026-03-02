import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Bot, RefreshCw, Loader2, Shield, Zap, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const CACHE_KEY = 'cc_faction_ai_alert';
const CACHE_TTL = 30 * 60 * 1000; // 30 min

export default function WidgetAIFactionAlert({ accentA, panel1, text0, text1, muted }) {
  const [alert, setAlert] = useState(() => {
    try {
      const c = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (c && Date.now() - c.ts < CACHE_TTL) return c.data;
    } catch {}
    return null;
  });
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const [factions, reputations, missions] = await Promise.all([
        base44.entities.Faction.list('-global_influence', 5),
        base44.entities.FactionReputation.list('-updated_date', 10),
        base44.entities.Mission.filter({ status: 'completed' }, '-updated_date', 5),
      ]);

      const factionSummary = factions.map(f =>
        `${f.name}: influence ${f.global_influence}, state: ${f.narrative_state}`
      ).join('\n');

      const repSummary = reputations.map(r =>
        `Faction ${r.faction_key}: standing ${r.standing}, rep ${r.reputation}`
      ).join('\n');

      const missionSummary = missions.map(m => `Completed: ${m.title}`).join('\n');

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are A.E.G.I.S., the AI director of Catalyst Core (superhero TTRPG, NYC 2036).

FACTION STATUS:
${factionSummary || 'No faction data'}

PLAYER REPUTATION RECORDS:
${repSummary || 'No reputation data'}

RECENTLY COMPLETED MISSIONS:
${missionSummary || 'None'}

Based on collective player actions and faction dynamics, generate:
1. A dramatic faction alert (what's changing in the world RIGHT NOW due to player actions)
2. An emergent mission opportunity (1 sentence) 
3. A narrative consequence (how the world has shifted)

Keep it punchy, immersive, and specific to the data. Use markdown.`,
        response_json_schema: {
          type: 'object',
          properties: {
            alert_title: { type: 'string' },
            alert_body: { type: 'string' },
            new_mission: { type: 'string' },
            world_shift: { type: 'string' },
            threat_level: { type: 'string', enum: ['low', 'moderate', 'high', 'critical'] }
          }
        }
      });

      setAlert(result);
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data: result, ts: Date.now() }));
    } catch {
      setAlert({ alert_title: 'SIGNAL CORRUPTED', alert_body: '// A.E.G.I.S. feed unavailable — check network', threat_level: 'low' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (!alert) generate(); }, []);

  const threatColor = { low: '#00D1B2', moderate: '#FFC857', high: '#FF8C00', critical: '#FF3B3B' }[alert?.threat_level] || accentA;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-3.5 w-3.5" style={{ color: 'rgba(167,139,250,0.9)' }} />
          <span className="text-[9px] font-mono" style={{ color: muted }}>A.I. FACTION INTELLIGENCE DIGEST</span>
        </div>
        <button onClick={generate} disabled={loading} className="p-1 hover:opacity-70 disabled:opacity-40 cc-sm-target">
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} style={{ color: muted }} />
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-6 gap-2">
          <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'rgba(167,139,250,0.7)' }} />
          <span className="text-[10px] font-mono" style={{ color: muted }}>Analyzing faction dynamics...</span>
        </div>
      )}

      {alert && !loading && (
        <div className="space-y-3">
          <div className="flex items-start gap-2 p-3 rounded-lg border" style={{ background: panel1, borderColor: threatColor + '40' }}>
            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: threatColor }} />
            <div>
              <div className="text-[10px] font-mono font-bold mb-1" style={{ color: threatColor }}>{alert.alert_title}</div>
              <div className="text-[10px] leading-relaxed" style={{ color: text1 }}>{alert.alert_body}</div>
            </div>
            <span className="text-[8px] font-mono px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: threatColor + '20', color: threatColor }}>
              {(alert.threat_level || 'LOW').toUpperCase()}
            </span>
          </div>

          {alert.new_mission && (
            <div className="flex items-start gap-2 p-2.5 rounded-lg" style={{ background: accentA + '10', border: `1px solid ${accentA}25` }}>
              <Zap className="h-3 w-3 flex-shrink-0 mt-0.5" style={{ color: accentA }} />
              <div>
                <div className="text-[8px] font-mono font-bold mb-0.5" style={{ color: accentA }}>EMERGENT MISSION OPPORTUNITY</div>
                <div className="text-[10px]" style={{ color: text1 }}>{alert.new_mission}</div>
              </div>
            </div>
          )}

          {alert.world_shift && (
            <div className="flex items-start gap-2 p-2.5 rounded-lg" style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)' }}>
              <Shield className="h-3 w-3 flex-shrink-0 mt-0.5" style={{ color: 'rgba(167,139,250,0.9)' }} />
              <div>
                <div className="text-[8px] font-mono font-bold mb-0.5" style={{ color: 'rgba(167,139,250,0.9)' }}>WORLD STATE SHIFT</div>
                <div className="text-[10px]" style={{ color: text1 }}>{alert.world_shift}</div>
              </div>
            </div>
          )}

          <p className="text-[8px] font-mono text-right" style={{ color: muted }}>Generated by A.E.G.I.S. Director AI · Tap ↺ to refresh</p>
        </div>
      )}
    </div>
  );
}