import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronRight, ChevronLeft, Download, Eye, EyeOff, Layers, Crosshair, Pencil, Trash2 } from 'lucide-react';
import { LAYER_TYPES } from './mapConfig';

const TOOLS = [
  { key: 'place',  label: 'Place',  icon: Crosshair },
  { key: 'edit',   label: 'Edit',   icon: Pencil },
  { key: 'delete', label: 'Delete', icon: Trash2 },
];

export default function GMDrawer({
  state,
  activeTool,
  activePlaceLayer,
  onToolChange,
  onPlaceLayerChange,
  onToggleLayer,
  onToggleRevealHidden,
  onExport,
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className={cn(
      "absolute top-4 right-0 z-20 flex items-start transition-all duration-300",
    )}>
      {/* Toggle tab */}
      <button
        onClick={() => setOpen(o => !o)}
        className="h-10 w-7 bg-slate-900/95 border border-r-0 border-violet-500/40 rounded-l-lg flex items-center justify-center text-violet-400 hover:text-white hover:bg-slate-800 transition-colors mt-2"
      >
        {open ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* Drawer panel */}
      <div className={cn(
        "bg-slate-900/95 border border-violet-500/40 rounded-l-xl shadow-2xl overflow-hidden transition-all duration-300",
        open ? "w-56 opacity-100" : "w-0 opacity-0 pointer-events-none"
      )}>
        <div className="p-3 space-y-4 w-56">
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-slate-700 pb-2">
            <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-xs font-bold text-violet-300 uppercase tracking-widest">GM Control</span>
          </div>

          {/* Tool selector */}
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Active Tool</p>
            <div className="grid grid-cols-3 gap-1">
              {TOOLS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => onToolChange(key)}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2 rounded-lg border text-xs transition-all",
                    activeTool === key
                      ? "bg-violet-600 border-violet-400 text-white"
                      : "bg-slate-800 border-slate-600 text-slate-400 hover:text-white hover:border-slate-500"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Place layer selector */}
          {activeTool === 'place' && (
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Place Type</p>
              <div className="space-y-1">
                {LAYER_TYPES.map(({ key, label, icon, color }) => (
                  <button
                    key={key}
                    onClick={() => onPlaceLayerChange(key)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all",
                      activePlaceLayer === key
                        ? "bg-violet-600/30 border border-violet-500/50 text-white"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    )}
                  >
                    <span>{icon}</span>
                    <span className="truncate">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Layer toggles */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Layers className="h-3 w-3 text-slate-500" />
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Layers</p>
            </div>
            <div className="space-y-1">
              {LAYER_TYPES.map(({ key, label, icon }) => {
                const visible = state.visibleLayers[key];
                return (
                  <button
                    key={key}
                    onClick={() => onToggleLayer(key)}
                    className={cn(
                      "w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs transition-all",
                      visible ? "text-slate-300 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-800"
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      <span>{icon}</span>
                      <span className="truncate">{label}</span>
                    </span>
                    {visible
                      ? <Eye className="h-3 w-3 text-violet-400 flex-shrink-0" />
                      : <EyeOff className="h-3 w-3 flex-shrink-0" />
                    }
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reveal hidden toggle */}
          <button
            onClick={onToggleRevealHidden}
            className={cn(
              "w-full flex items-center gap-2 px-2 py-2 rounded-lg border text-xs transition-all",
              state.revealHidden
                ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                : "bg-slate-800 border-slate-600 text-slate-400 hover:text-white"
            )}
          >
            <Eye className="h-3.5 w-3.5" />
            {state.revealHidden ? 'Hiding Hidden' : 'Reveal Hidden'}
          </button>

          {/* Export */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onExport}
            className="w-full gap-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <Download className="h-3.5 w-3.5" />
            Export Operations Data
          </Button>
        </div>
      </div>
    </div>
  );
}