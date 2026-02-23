/**
 * VisualQA — Dev overlay showing layout bounds, token source, theme info.
 * Enable in Settings > Visual QA Mode.
 */
import React, { useEffect, useState } from 'react';
import { useTheme } from './useTheme';
import { X } from 'lucide-react';

export default function VisualQA({ onClose }) {
  const { theme, factionId, mode } = useTheme();
  const c = theme?.colors || {};
  const m = theme?.motion || {};
  const [overflowCount, setOverflowCount] = useState(0);

  useEffect(() => {
    // Highlight overflowing elements
    let count = 0;
    const els = document.querySelectorAll('*');
    const markers = [];
    els.forEach(el => {
      if (el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 2) {
        if (el.closest('[data-qa-ignore]')) return;
        const orig = el.getAttribute('style') || '';
        el.setAttribute('data-qa-orig', orig);
        el.style.outline = '2px solid rgba(255,59,59,0.8)';
        markers.push(el);
        count++;
      }
    });
    setOverflowCount(count);
    return () => {
      markers.forEach(el => {
        el.style.outline = '';
      });
    };
  }, []);

  const panel0 = c.panel0 || '#1A1F26';
  const accentA = c.accentA || '#00E5FF';
  const text0 = c.text0 || '#E6F1FF';
  const text1 = c.text1 || '#8EA0B5';
  const muted = c.muted || '#5F6E80';

  const rows = [
    ['Faction', `${factionId} — ${theme?.name}`],
    ['Mode', mode],
    ['Accent A', c.accentA],
    ['Accent B', c.accentB],
    ['Success', c.success],
    ['Warning', c.warning],
    ['Danger', c.danger],
    ['Motion fast', `${m.fast}ms`],
    ['Motion med', `${m.med}ms`],
    ['Motion slow', `${m.slow}ms`],
    ['Easing', m.easing],
    ['Overflow els', overflowCount === 0 ? '✓ None' : `⚠ ${overflowCount} detected`],
  ];

  return (
    <div
      data-qa-ignore
      className="fixed bottom-20 right-3 z-[99999] rounded-xl border shadow-2xl w-72 text-xs"
      style={{ background: panel0 + 'F5', borderColor: accentA + '40', backdropFilter: 'blur(12px)' }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: accentA + '20' }}>
        <span className="font-mono font-bold uppercase tracking-widest text-[10px]" style={{ color: accentA }}>
          ⬡ VISUAL QA MODE
        </span>
        <button
          className="cc-sm-target h-6 w-6 flex items-center justify-center rounded opacity-60 hover:opacity-100"
          style={{ color: text1 }}
          onClick={onClose}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="p-2 space-y-0.5">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-2 px-1 py-0.5">
            <span className="font-mono" style={{ color: muted }}>{k}</span>
            <span
              className="font-mono font-bold truncate max-w-[140px]"
              style={{
                color: k === 'Overflow els' && overflowCount > 0 ? c.danger : text0,
              }}
            >
              {k.includes('Accent') || k.includes('Success') || k.includes('Warning') || k.includes('Danger')
                ? <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: v }} />
                    {v}
                  </span>
                : v}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}