import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, X, GripVertical, Eye, EyeOff } from 'lucide-react';
import WidgetRecentActivity from './WidgetRecentActivity';
import WidgetSystemStatus from './WidgetSystemStatus';
import WidgetKPI from './WidgetKPI';
import WidgetQuickLinks from './WidgetQuickLinks';

const PREFS_KEY = 'cc_widget_prefs';

const ALL_WIDGETS = [
  { id: 'activity',  label: 'Recent Activity',         Component: WidgetRecentActivity },
  { id: 'status',    label: 'System Status Overview',  Component: WidgetSystemStatus  },
  { id: 'kpi',       label: 'Key Performance Indicators', Component: WidgetKPI        },
  { id: 'links',     label: 'Quick Access Links',      Component: WidgetQuickLinks    },
];

function loadPrefs() {
  try {
    const saved = JSON.parse(localStorage.getItem(PREFS_KEY) || 'null');
    if (saved) return saved;
  } catch {}
  return { order: ALL_WIDGETS.map(w => w.id), hidden: [] };
}

function savePrefs(prefs) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export default function DashboardWidgets({ colors }) {
  const { accentA, panel0, panel1, text0, text1, muted, bg0 } = colors;
  const [prefs, setPrefs] = useState(loadPrefs);
  const [configOpen, setConfigOpen] = useState(false);
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const visibleWidgets = prefs.order
    .filter(id => !prefs.hidden.includes(id))
    .map(id => ALL_WIDGETS.find(w => w.id === id))
    .filter(Boolean);

  const toggleHidden = (id) => {
    const prefs2 = {
      ...prefs,
      hidden: prefs.hidden.includes(id)
        ? prefs.hidden.filter(h => h !== id)
        : [...prefs.hidden, id],
    };
    setPrefs(prefs2);
    savePrefs(prefs2);
  };

  const handleDragStart = (e, id) => {
    setDragging(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, id) => {
    e.preventDefault();
    setDragOver(id);
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (!dragging || dragging === targetId) { setDragging(null); setDragOver(null); return; }
    const order = [...prefs.order];
    const from = order.indexOf(dragging);
    const to   = order.indexOf(targetId);
    order.splice(from, 1);
    order.splice(to, 0, dragging);
    const prefs2 = { ...prefs, order };
    setPrefs(prefs2);
    savePrefs(prefs2);
    setDragging(null);
    setDragOver(null);
  };

  const sharedProps = { accentA, panel1, text0, text1, muted, bg0 };

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-3.5 w-3.5" style={{ color: accentA }} />
          <span className="text-[10px] font-mono tracking-widest uppercase" style={{ color: muted }}>DASHBOARD WIDGETS</span>
        </div>
        <button
          onClick={() => setConfigOpen(o => !o)}
          className="text-[9px] font-mono px-2.5 py-1 rounded border transition-all hover:opacity-80"
          style={{ color: accentA, borderColor: accentA + '40', background: configOpen ? accentA + '15' : 'transparent' }}
        >
          {configOpen ? 'DONE' : 'CONFIGURE'}
        </button>
      </div>

      {/* Config panel */}
      <AnimatePresence>
        {configOpen && (
          <motion.div
            className="rounded-xl border p-4 space-y-2"
            style={{ background: panel0, borderColor: accentA + '30' }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p className="text-[9px] font-mono tracking-widest mb-3" style={{ color: muted }}>
              TOGGLE WIDGETS · DRAG TO REORDER
            </p>
            {prefs.order.map(id => {
              const w = ALL_WIDGETS.find(x => x.id === id);
              if (!w) return null;
              const hidden = prefs.hidden.includes(id);
              return (
                <div
                  key={id}
                  draggable
                  onDragStart={e => handleDragStart(e, id)}
                  onDragOver={e => handleDragOver(e, id)}
                  onDrop={e => handleDrop(e, id)}
                  onDragEnd={() => { setDragging(null); setDragOver(null); }}
                  className="flex items-center gap-3 px-3 py-2 rounded transition-all cursor-grab active:cursor-grabbing"
                  style={{
                    background: dragOver === id ? accentA + '15' : panel1,
                    border: `1px solid ${dragOver === id ? accentA + '50' : accentA + '15'}`,
                    opacity: dragging === id ? 0.4 : 1,
                  }}
                >
                  <GripVertical className="h-3.5 w-3.5 flex-shrink-0" style={{ color: muted }} />
                  <span className="flex-1 text-[10px] font-mono" style={{ color: hidden ? muted : text1 }}>{w.label}</span>
                  <button onClick={() => toggleHidden(id)} className="p-1 hover:opacity-70">
                    {hidden
                      ? <EyeOff className="h-3.5 w-3.5" style={{ color: muted }} />
                      : <Eye    className="h-3.5 w-3.5" style={{ color: accentA }} />
                    }
                  </button>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Widget grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {visibleWidgets.map(w => (
          <motion.div
            key={w.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="rounded-xl border p-4"
            style={{ background: panel0, borderColor: accentA + '25' }}
          >
            {/* Widget header */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] font-mono tracking-widest uppercase font-bold" style={{ color: accentA }}>
                {ALL_WIDGETS.find(x => x.id === w.id)?.label}
              </span>
              <button onClick={() => toggleHidden(w.id)} className="p-0.5 hover:opacity-60 cc-sm-target">
                <X className="h-3 w-3" style={{ color: muted }} />
              </button>
            </div>
            <w.Component {...sharedProps} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}