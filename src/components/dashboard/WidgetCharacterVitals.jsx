import React, { useState, useEffect } from 'react';
import { Heart, Zap, Shield, User, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function WidgetCharacterVitals({ accentA, panel1, text0, text1, muted }) {
  const [char, setChar] = useState(null);

  useEffect(() => {
    try {
      const c = JSON.parse(localStorage.getItem('currentCharacter') || 'null');
      setChar(c);
    } catch {}
    const handler = (e) => setChar(e.detail);
    window.addEventListener('characterChanged', handler);
    return () => window.removeEventListener('characterChanged', handler);
  }, []);

  if (!char) {
    return (
      <div className="flex flex-col items-center justify-center py-6 gap-2">
        <User className="h-8 w-8 opacity-30" style={{ color: muted }} />
        <p className="text-[10px] font-mono" style={{ color: muted }}>NO OPERATIVE SELECTED</p>
      </div>
    );
  }

  const hp = char.current_hp ?? char.max_hp ?? 0;
  const maxHp = char.max_hp || 1;
  const hpPct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  const hpColor = hpPct > 60 ? '#00D1B2' : hpPct > 30 ? '#FFC857' : '#FF3B3B';

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {char.portrait_url
          ? <img src={char.portrait_url} alt={char.name} className="w-10 h-10 rounded-lg object-cover border" style={{ borderColor: accentA + '40' }} />
          : <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: accentA + '20' }}><User className="h-5 w-5" style={{ color: accentA }} /></div>
        }
        <div className="flex-1 min-w-0">
          <div className="text-xs font-mono font-bold truncate" style={{ color: text0 }}>{char.name}</div>
          <div className="text-[9px] font-mono" style={{ color: muted }}>LVL {char.level || 1} · {char.classification?.replace(/_/g, ' ').toUpperCase()}</div>
        </div>
        <Link to={createPageUrl(`CharacterSheet?id=${char.id}`)}>
          <ArrowRight className="h-4 w-4 hover:opacity-70" style={{ color: accentA }} />
        </Link>
      </div>

      {/* HP Bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1"><Heart className="h-3 w-3" style={{ color: hpColor }} /><span className="text-[9px] font-mono" style={{ color: muted }}>HP</span></div>
          <span className="text-[9px] font-mono font-bold" style={{ color: hpColor }}>{hp} / {maxHp}</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: panel1 }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${hpPct}%`, background: hpColor }} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="text-center rounded p-2" style={{ background: panel1 }}>
          <div className="text-sm font-mono font-bold" style={{ color: accentA }}>{char.toughness_class || '—'}</div>
          <div className="text-[8px] font-mono" style={{ color: muted }}>TC</div>
        </div>
        <div className="text-center rounded p-2" style={{ background: panel1 }}>
          <div className="text-sm font-mono font-bold" style={{ color: '#FFC857' }}>{char.current_xp || 0}</div>
          <div className="text-[8px] font-mono" style={{ color: muted }}>XP</div>
        </div>
        <div className="text-center rounded p-2" style={{ background: panel1 }}>
          <div className="text-sm font-mono font-bold" style={{ color: '#00D1B2' }}>{char.credits || 0}</div>
          <div className="text-[8px] font-mono" style={{ color: muted }}>CR</div>
        </div>
      </div>
    </div>
  );
}