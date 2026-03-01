import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { User, Swords, Settings2 } from 'lucide-react';

const ENVIRONMENTS = ['urban', 'underground', 'rooftop', 'corporate HQ', 'port district', 'suburbs', 'abandoned facility', 'government building'];
const INTENSITIES = ['skirmish', 'standard', 'brutal', 'to the death'];
const NARRATIVE_STYLES = ['cinematic', 'tactical', 'gritty noir', 'anime-style', 'strategic report'];
const SPEEDS = ['slow', 'normal', 'fast'];

export default function CombatSimSetup({ characters, onStart, colors }) {
  const { accentA, panel0, panel1, text0, text1, muted } = colors;
  const [selected, setSelected] = useState({ a: null, b: null });
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState({
    environment: 'urban',
    intensity: 'standard',
    narrative_style: 'cinematic',
    speed: 'normal',
    rounds: '6-8',
    custom_notes: '',
  });

  const panelStyle = { background: panel0, border: `1px solid ${accentA}20` };
  const canStart = selected.a && selected.b && selected.a.id !== selected.b.id;

  const updateConfig = (k, v) => setConfig(prev => ({ ...prev, [k]: v }));

  return (
    <div className="space-y-5">
      {/* Character selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {['a', 'b'].map((slot, i) => (
          <div key={slot}>
            <div className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: i === 0 ? accentA : '#FF6B6B' }}>
              {i === 0 ? '◈ Combatant Alpha' : '◈ Combatant Beta'}
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {characters.map(char => (
                <button key={char.id} onClick={() => setSelected(prev => ({ ...prev, [slot]: char }))}
                  className="w-full text-left rounded-lg p-3 transition-all"
                  style={{
                    background: selected[slot]?.id === char.id ? (i === 0 ? accentA + '20' : '#FF6B6B20') : panel1,
                    border: `1px solid ${selected[slot]?.id === char.id ? (i === 0 ? accentA + '60' : '#FF6B6B60') : accentA + '15'}`,
                  }}>
                  <div className="flex items-center gap-2">
                    {char.portrait_url ? (
                      <img src={char.portrait_url} className="w-8 h-8 rounded object-cover flex-shrink-0" alt="" />
                    ) : (
                      <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0" style={{ background: accentA + '20' }}>
                        <User className="h-4 w-4" style={{ color: accentA }} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-mono font-bold truncate" style={{ color: text0 }}>{char.name}</div>
                      <div className="text-[10px]" style={{ color: muted }}>
                        HP: {char.current_hp || char.max_hp || '?'} · TC: {char.toughness_class || 10} · {char.primary_power_style?.replace(/_/g,' ') || '—'}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              {characters.length === 0 && (
                <div className="text-xs text-center py-6 rounded-lg" style={{ color: muted, border: `1px dashed ${accentA}20` }}>No characters found</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* VS preview */}
      {selected.a && selected.b && (
        <div className="flex items-center justify-center gap-4 p-3 rounded-lg" style={panelStyle}>
          <span className="text-sm font-mono font-bold" style={{ color: accentA }}>{selected.a.name}</span>
          <Swords className="h-5 w-5" style={{ color: muted }} />
          <span className="text-sm font-mono font-bold" style={{ color: '#FF6B6B' }}>{selected.b.name}</span>
        </div>
      )}

      {/* Battle config toggle */}
      <button onClick={() => setShowConfig(!showConfig)}
        className="flex items-center gap-2 text-xs font-mono uppercase tracking-wide w-full justify-center py-2 rounded-lg transition-all"
        style={{ color: showConfig ? accentA : muted, background: panel0, border: `1px solid ${accentA}20` }}>
        <Settings2 className="h-3.5 w-3.5" />
        {showConfig ? 'Hide' : 'Configure'} Battle Settings
      </button>

      {showConfig && (
        <div className="rounded-lg p-4 space-y-3" style={panelStyle}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'ENVIRONMENT', key: 'environment', options: ENVIRONMENTS },
              { label: 'INTENSITY', key: 'intensity', options: INTENSITIES },
              { label: 'NARRATIVE STYLE', key: 'narrative_style', options: NARRATIVE_STYLES },
              { label: 'PLAYBACK SPEED', key: 'speed', options: SPEEDS },
            ].map(({ label, key, options }) => (
              <div key={key}>
                <div className="text-[9px] font-mono uppercase tracking-widest mb-1" style={{ color: muted }}>{label}</div>
                <Select value={config[key]} onValueChange={v => updateConfig(key, v)}>
                  <SelectTrigger className="h-8 text-xs" style={{ background: panel1, borderColor: accentA + '30', color: text0 }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ))}
            <div>
              <div className="text-[9px] font-mono uppercase tracking-widest mb-1" style={{ color: muted }}>ROUNDS</div>
              <Input value={config.rounds} onChange={e => updateConfig('rounds', e.target.value)} placeholder="6-8" className="h-8 text-xs" style={{ background: panel1, color: text0, borderColor: accentA + '30' }} />
            </div>
          </div>
          <div>
            <div className="text-[9px] font-mono uppercase tracking-widest mb-1" style={{ color: muted }}>AI DIRECTOR NOTES (optional)</div>
            <Input value={config.custom_notes} onChange={e => updateConfig('custom_notes', e.target.value)} placeholder="e.g. make it a close fight, include a betrayal twist..." className="text-xs" style={{ background: panel1, color: text0, borderColor: accentA + '30' }} />
          </div>
        </div>
      )}

      <Button onClick={() => onStart(selected, config)} disabled={!canStart} className="w-full gap-2" style={{ background: accentA, color: '#000' }}>
        <Swords className="h-4 w-4" />
        INITIATE SIMULATION
      </Button>
    </div>
  );
}