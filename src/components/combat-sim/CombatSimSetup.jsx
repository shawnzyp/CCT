import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { User, Swords } from 'lucide-react';

export default function CombatSimSetup({ characters, onStart, colors }) {
  const { accentA, panel0, panel1, text0, text1, muted } = colors;
  const [selected, setSelected] = useState({ a: null, b: null });

  const panelStyle = { background: panel0, border: `1px solid ${accentA}20` };

  const selectChar = (slot, char) => {
    setSelected(prev => ({ ...prev, [slot]: char }));
  };

  const canStart = selected.a && selected.b && selected.a.id !== selected.b.id;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {['a', 'b'].map((slot, i) => (
          <div key={slot}>
            <div className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: i === 0 ? accentA : '#FF6B6B' }}>
              {i === 0 ? '◈ Combatant Alpha' : '◈ Combatant Beta'}
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {characters.map(char => (
                <button
                  key={char.id}
                  onClick={() => selectChar(slot, char)}
                  className="w-full text-left rounded-lg p-3 transition-all"
                  style={{
                    background: selected[slot]?.id === char.id ? (i === 0 ? accentA + '20' : '#FF6B6B20') : panel1,
                    border: `1px solid ${selected[slot]?.id === char.id ? (i === 0 ? accentA + '60' : '#FF6B6B60') : accentA + '15'}`,
                  }}
                >
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
                        HP: {char.current_hp || char.max_hp || '?'} · TC: {char.toughness_class || 10}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              {characters.length === 0 && (
                <div className="text-xs text-center py-6 rounded-lg" style={{ color: muted, border: `1px dashed ${accentA}20` }}>
                  No characters found
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selected.a && selected.b && (
        <div className="flex items-center justify-center gap-4 p-3 rounded-lg" style={{ background: panel0, border: `1px solid ${accentA}20` }}>
          <span className="text-sm font-mono font-bold" style={{ color: accentA }}>{selected.a.name}</span>
          <Swords className="h-5 w-5" style={{ color: muted }} />
          <span className="text-sm font-mono font-bold" style={{ color: '#FF6B6B' }}>{selected.b.name}</span>
        </div>
      )}

      <Button
        onClick={() => onStart(selected)}
        disabled={!canStart}
        className="w-full gap-2"
        style={{ background: accentA, color: '#000' }}
      >
        <Swords className="h-4 w-4" />
        INITIATE SIMULATION
      </Button>
    </div>
  );
}