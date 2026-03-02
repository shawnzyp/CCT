import React, { useState, useEffect } from 'react';
import { Zap, Star, TrendingUp } from 'lucide-react';

export default function WidgetCreditsXP({ accentA, panel1, text0, text1, muted }) {
  const [char, setChar] = useState(null);

  useEffect(() => {
    try { setChar(JSON.parse(localStorage.getItem('currentCharacter') || 'null')); } catch {}
    const h = (e) => setChar(e.detail);
    window.addEventListener('characterChanged', h);
    return () => window.removeEventListener('characterChanged', h);
  }, []);

  if (!char) return <p className="text-[10px] font-mono text-center py-3" style={{ color: muted }}>SELECT OPERATIVE</p>;

  const xpToNext = 1000; // standard per level
  const xpPct = Math.min(100, ((char.current_xp || 0) % xpToNext) / xpToNext * 100);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-lg p-3" style={{ background: panel1 }}>
        <Star className="h-4 w-4 flex-shrink-0" style={{ color: '#FFC857' }} />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-[9px] font-mono" style={{ color: muted }}>EXPERIENCE</span>
            <span className="text-xs font-mono font-bold" style={{ color: '#FFC857' }}>{char.current_xp || 0} XP</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#FFC85720' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${xpPct}%`, background: '#FFC857' }} />
          </div>
          <div className="text-[8px] font-mono mt-0.5" style={{ color: muted }}>Lv {char.level || 1} → {xpToNext - ((char.current_xp || 0) % xpToNext)} to next</div>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-lg p-3" style={{ background: panel1 }}>
        <Zap className="h-4 w-4 flex-shrink-0" style={{ color: '#00D1B2' }} />
        <div className="flex-1">
          <span className="text-[9px] font-mono block" style={{ color: muted }}>CREDITS</span>
          <span className="text-lg font-mono font-bold" style={{ color: '#00D1B2' }}>{char.credits || 0} CR</span>
        </div>
      </div>

      {(char.achievements?.length || 0) > 0 && (
        <div className="flex items-center gap-2 rounded-lg p-3" style={{ background: panel1 }}>
          <TrendingUp className="h-4 w-4 flex-shrink-0" style={{ color: accentA }} />
          <div className="flex-1">
            <span className="text-[9px] font-mono block" style={{ color: muted }}>ACHIEVEMENTS</span>
            <span className="text-lg font-mono font-bold" style={{ color: accentA }}>{char.achievements.length}</span>
          </div>
        </div>
      )}
    </div>
  );
}