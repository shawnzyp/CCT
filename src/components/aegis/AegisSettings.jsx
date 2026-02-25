import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useSettings } from '@/components/utils/useSettings';
import { useTheme } from '@/components/theme/useTheme';
import { toast } from 'sonner';
import { Radio, Zap, Brain, Bell, MessageSquare, Cpu } from 'lucide-react';

const FOCUS_OPTIONS = [
  { id: 'rules',   label: 'Rules & Mechanics' },
  { id: 'combat',  label: 'Combat Tactics' },
  { id: 'lore',    label: 'Lore & Factions' },
  { id: 'character', label: 'Character Building' },
  { id: 'economy',  label: 'Economy & Gear' },
];

function Row({ label, desc, children }) {
  const { theme } = useTheme();
  return (
    <div className="flex items-center justify-between py-2.5 border-b last:border-b-0"
      style={{ borderColor: 'rgba(139,92,246,0.12)' }}>
      <div>
        <div className="text-sm font-medium" style={{ color: theme?.colors?.text0 || '#E6F1FF' }}>{label}</div>
        {desc && <div className="text-xs mt-0.5" style={{ color: theme?.colors?.muted || '#5F6E80' }}>{desc}</div>}
      </div>
      <div className="flex-shrink-0 ml-4">{children}</div>
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  const { theme } = useTheme();
  return (
    <div className="rounded-xl border mb-4 overflow-hidden"
      style={{ background: theme?.colors?.panel0 || '#1A1F26', borderColor: 'rgba(139,92,246,0.25)' }}>
      <div className="px-4 py-3 border-b flex items-center gap-2"
        style={{ borderColor: 'rgba(139,92,246,0.18)' }}>
        <Icon className="h-4 w-4" style={{ color: '#a78bfa' }} />
        <span className="text-xs font-mono font-bold uppercase tracking-[0.15em]"
          style={{ color: theme?.colors?.text0 }}>
          {title}
        </span>
      </div>
      <div className="p-4 space-y-1">
        {children}
      </div>
    </div>
  );
}

export default function AegisSettings() {
  const { settings, updateSettings } = useSettings();

  const update = (key, value) => {
    updateSettings({ [key]: value });
    toast.success('A.E.G.I.S. config updated', { duration: 800 });
  };

  const toggleFocus = (id) => {
    const current = settings.aegisAreasOfFocus || ['rules', 'combat', 'lore'];
    const next = current.includes(id)
      ? current.filter(f => f !== id)
      : [...current, id];
    if (next.length === 0) return; // must have at least one
    update('aegisAreasOfFocus', next);
  };

  const focus = settings.aegisAreasOfFocus || ['rules', 'combat', 'lore'];

  return (
    <div>
      {/* Master toggle */}
      <Section icon={Radio} title="A.E.G.I.S. System">
        <Row label="Enable A.E.G.I.S." desc="Show the assistant panel and advisory bubbles">
          <Switch checked={settings.aegisEnabled !== false} onCheckedChange={v => update('aegisEnabled', v)} />
        </Row>
        <Row label="Action Modules" desc="Allow A.E.G.I.S. to perform app actions (schedule, report, etc.)">
          <Switch checked={settings.aegisActionModules !== false} onCheckedChange={v => update('aegisActionModules', v)} />
        </Row>
        <Row label="Conversation History" desc="Use prior messages as context for smarter replies">
          <Switch checked={settings.aegisConversationHistory !== false} onCheckedChange={v => update('aegisConversationHistory', v)} />
        </Row>
      </Section>

      {/* Communication style */}
      <Section icon={MessageSquare} title="Communication Style">
        <Row label="Tone" desc="How A.E.G.I.S. phrases its responses">
          <Select
            value={settings.aegisCommunicationStyle || 'tactical'}
            onValueChange={v => update('aegisCommunicationStyle', v)}
          >
            <SelectTrigger className="w-32 text-xs" style={{ background: 'transparent', borderColor: 'rgba(139,92,246,0.4)', color: '#e2d9f3' }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tactical">Tactical (Default)</SelectItem>
              <SelectItem value="balanced">Balanced</SelectItem>
              <SelectItem value="verbose">Verbose</SelectItem>
            </SelectContent>
          </Select>
        </Row>
      </Section>

      {/* Focus areas */}
      <Section icon={Brain} title="Areas of Focus">
        <p className="text-xs font-mono mb-3" style={{ color: '#7c6f9a' }}>
          Select domains A.E.G.I.S. will prioritize (min 1)
        </p>
        <div className="flex flex-wrap gap-2">
          {FOCUS_OPTIONS.map(({ id, label }) => {
            const active = focus.includes(id);
            return (
              <button
                key={id}
                onClick={() => toggleFocus(id)}
                className="px-3 py-1.5 rounded-full text-xs font-mono transition-all border"
                style={{
                  background: active ? 'rgba(139,92,246,0.2)' : 'transparent',
                  borderColor: active ? 'rgba(139,92,246,0.7)' : 'rgba(139,92,246,0.25)',
                  color: active ? '#c4b5fd' : '#6b5b8a',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Notifications */}
      <Section icon={Bell} title="Notifications & Proactivity">
        <Row label="Proactive Tips" desc="A.E.G.I.S. surfaces unsolicited advisory messages">
          <Switch checked={settings.aegisProactiveTips !== false} onCheckedChange={v => update('aegisProactiveTips', v)} />
        </Row>
        {settings.aegisProactiveTips !== false && (
          <div className="pt-2 pb-1 px-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono" style={{ color: '#7c6f9a' }}>
                Advisory interval: {settings.aegisAdvisoryInterval ?? 90}s
              </span>
            </div>
            <Slider
              value={[settings.aegisAdvisoryInterval ?? 90]}
              min={30} max={300} step={30}
              onValueChange={([v]) => update('aegisAdvisoryInterval', v)}
              className="w-full"
            />
            <div className="flex justify-between mt-1">
              <span className="text-[10px] font-mono" style={{ color: '#5a4f73' }}>30s</span>
              <span className="text-[10px] font-mono" style={{ color: '#5a4f73' }}>5min</span>
            </div>
          </div>
        )}
        <Row label="Campaign Event Alerts" desc="Advisory bubble when new campaign content is available">
          <Switch checked={settings.aegisNotifyOnNewContent !== false} onCheckedChange={v => update('aegisNotifyOnNewContent', v)} />
        </Row>
      </Section>

      {/* Footer note */}
      <div className="mt-2 p-3 rounded-lg border text-center"
        style={{ borderColor: 'rgba(139,92,246,0.2)', background: 'rgba(139,92,246,0.06)' }}>
        <p className="text-xs font-mono" style={{ color: '#7c6f9a' }}>
          A.E.G.I.S. CONFIG PERSISTENT // CHANGES APPLIED IMMEDIATELY
        </p>
      </div>
    </div>
  );
}