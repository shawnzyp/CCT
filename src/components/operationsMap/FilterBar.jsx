import React from 'react';
import { cn } from '@/lib/utils';
import { Filter, Eye, EyeOff } from 'lucide-react';
import { LAYER_TYPES } from './mapConfig';

const URGENCY_LEVELS = [
  { value: 0, label: 'All' },
  { value: 2, label: '2+' },
  { value: 3, label: '3+' },
  { value: 4, label: '4+' },
  { value: 5, label: 'Max' },
];

export default function FilterBar({ state, onToggleLayer, urgencyFilter, onUrgencyFilter }) {
  return (
    <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-slate-900/95 border border-violet-500/30 rounded-full px-3 py-1.5 shadow-xl backdrop-blur-sm">
      {/* Layer visibility toggles */}
      <div className="flex items-center gap-1">
        <Filter className="h-3 w-3 text-slate-500 mr-1" />
        {LAYER_TYPES.map(({ key, icon, label }) => {
          const visible = state.visibleLayers[key];
          return (
            <button
              key={key}
              onClick={() => onToggleLayer(key)}
              title={`${visible ? 'Hide' : 'Show'} ${label}`}
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-all",
                visible
                  ? "bg-violet-600/30 border-violet-500/50 text-violet-200"
                  : "bg-slate-800 border-slate-700 text-slate-500 opacity-60"
              )}
            >
              <span>{icon}</span>
              <span className="hidden sm:inline">{label}</span>
              {!visible && <EyeOff className="h-2.5 w-2.5 ml-0.5" />}
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-slate-700" />

      {/* Urgency filter */}
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider mr-1">Urgency</span>
        {URGENCY_LEVELS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onUrgencyFilter(value)}
            className={cn(
              "px-2 py-0.5 rounded-full text-xs border transition-all",
              urgencyFilter === value
                ? "bg-amber-500/30 border-amber-500/60 text-amber-200"
                : "bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300"
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}