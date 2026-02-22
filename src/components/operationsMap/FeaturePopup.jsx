import React from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, X } from 'lucide-react';
import { FACTION_COLORS, LAYER_TYPES, URGENCY_COLORS } from './mapConfig';
import { cn } from '@/lib/utils';

export default function FeaturePopup({ feature, isDM, activeTool, onEdit, onDelete, onClose }) {
  if (!feature) return null;
  const layerDef = LAYER_TYPES.find(l => l.key === feature.type) || {};
  const factionColor = FACTION_COLORS[feature.faction] || '#64748B';
  const urgencyColor = URGENCY_COLORS[feature.metadata?.urgency] || '#64748B';

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-72 pointer-events-auto">
      <div className="bg-slate-900/98 border border-violet-500/40 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700"
          style={{ borderLeft: `3px solid ${factionColor}` }}>
          <div className="flex items-center gap-2 min-w-0">
            <span>{layerDef.icon}</span>
            <span className="font-semibold text-white text-sm truncate">{feature.label}</span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full font-mono uppercase flex-shrink-0"
              style={{ background: `${factionColor}22`, color: factionColor }}
            >
              {feature.visibility}
            </span>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white ml-2 flex-shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-3 py-2 space-y-1.5">
          {feature.description && (
            <p className="text-xs text-slate-400">{feature.description}</p>
          )}
          <div className="flex flex-wrap gap-2 text-xs">
            {feature.faction && feature.faction !== 'neutral' && (
              <span className="px-2 py-0.5 rounded-full font-medium"
                style={{ background: `${factionColor}22`, color: factionColor }}>
                {feature.faction}
              </span>
            )}
            {feature.metadata?.urgency > 0 && feature.type === 'sos' && (
              <span className="px-2 py-0.5 rounded-full font-bold"
                style={{ background: `${urgencyColor}22`, color: urgencyColor }}>
                Urgency {feature.metadata.urgency}
              </span>
            )}
            {feature.metadata?.control != null && feature.type !== 'sos' && (
              <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300">
                Control: {feature.metadata.control}%
              </span>
            )}
            {feature.metadata?.eta_minutes != null && (
              <span className={cn("px-2 py-0.5 rounded-full",
                feature.metadata.eta_minutes < 10
                  ? "bg-orange-500/20 text-orange-300 animate-pulse"
                  : "bg-slate-700 text-slate-300")}>
                ETA: {feature.metadata.eta_minutes}m
              </span>
            )}
          </div>
          {isDM && (
            <p className="text-[10px] text-slate-600 font-mono">
              {Array.isArray(feature.coords)
                ? `${feature.coords[0]?.toFixed(4)}, ${feature.coords[1]?.toFixed(4)}`
                : ''}
            </p>
          )}
        </div>

        {/* GM Actions */}
        {isDM && (
          <div className="flex gap-2 px-3 py-2 border-t border-slate-700">
            <Button size="sm" variant="ghost" onClick={onEdit} className="flex-1 gap-1.5 text-xs h-7">
              <Pencil className="h-3 w-3" /> Edit
            </Button>
            <Button size="sm" variant="ghost" onClick={onDelete}
              className="flex-1 gap-1.5 text-xs h-7 text-red-400 hover:text-red-300 hover:bg-red-500/10">
              <Trash2 className="h-3 w-3" /> Delete
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}