import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/theme/useTheme';
import { LayoutDashboard, Settings2, Plus, X, GripVertical, Eye, EyeOff } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

import WidgetRecentActivity from '@/components/dashboard/WidgetRecentActivity';
import WidgetSystemStatus from '@/components/dashboard/WidgetSystemStatus';
import WidgetKPI from '@/components/dashboard/WidgetKPI';
import WidgetQuickLinks from '@/components/dashboard/WidgetQuickLinks';
import WidgetAmbientNarrative from '@/components/dashboard/WidgetAmbientNarrative';
import WidgetCharacterVitals from '@/components/dashboard/WidgetCharacterVitals';
import WidgetMissionFeed from '@/components/dashboard/WidgetMissionFeed';
import WidgetFactionPulse from '@/components/dashboard/WidgetFactionPulse';
import WidgetThreatTicker from '@/components/dashboard/WidgetThreatTicker';
import WidgetGroupMissions from '@/components/dashboard/WidgetGroupMissions';
import WidgetDirectorWarRoom from '@/components/dashboard/WidgetDirectorWarRoom';
import WidgetAIFactionAlert from '@/components/dashboard/WidgetAIFactionAlert';
import WidgetSessionStatus from '@/components/dashboard/WidgetSessionStatus';
import WidgetCreditsXP from '@/components/dashboard/WidgetCreditsXP';

const PREFS_KEY = 'cc_dashboard_prefs_v2';

const ALL_WIDGETS = [
  { id: 'vitals',      label: 'Operative Vitals',        size: 'full', Component: WidgetCharacterVitals },
  { id: 'narrative',   label: 'A.I. World Feed',          size: 'half', Component: WidgetAmbientNarrative },
  { id: 'missions',    label: 'Mission Feed',              size: 'half', Component: WidgetMissionFeed },
  { id: 'faction',     label: 'Faction Pulse',             size: 'half', Component: WidgetFactionPulse },
  { id: 'threat',      label: 'Threat Ticker',             size: 'half', Component: WidgetThreatTicker },
  { id: 'group',       label: 'Group Operations',          size: 'full', Component: WidgetGroupMissions },
  { id: 'aiAlert',     label: 'A.I. Faction Alert',        size: 'full', Component: WidgetAIFactionAlert },
  { id: 'session',     label: 'Live Session Status',       size: 'half', Component: WidgetSessionStatus },
  { id: 'creditsxp',  label: 'Credits & XP',              size: 'half', Component: WidgetCreditsXP },
  { id: 'warroom',     label: 'Director War Room',         size: 'full', Component: WidgetDirectorWarRoom },
  { id: 'activity',    label: 'Recent Activity',           size: 'half', Component: WidgetRecentActivity },
  { id: 'status',      label: 'System Status',             size: 'half', Component: WidgetSystemStatus },
  { id: 'kpi',         label: 'Key Metrics',               size: 'half', Component: WidgetKPI },
  { id: 'links',       label: 'Quick Links',               size: 'half', Component: WidgetQuickLinks },
];

const DEFAULT_ORDER = ['vitals', 'narrative', 'missions', 'faction', 'threat', 'group', 'aiAlert', 'session', 'creditsxp', 'warroom', 'activity', 'status', 'kpi', 'links'];
const DEFAULT_HIDDEN = ['warroom', 'kpi', 'links', 'status'];

function loadPrefs() {
  try {
    const saved = JSON.parse(localStorage.getItem(PREFS_KEY) || 'null');
    if (saved) return saved;
  } catch {}
  return { order: DEFAULT_ORDER, hidden: DEFAULT_HIDDEN };
}
function savePrefs(p) { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); }

export default function Dashboard() {
  const { theme } = useTheme();
  const c = theme?.colors || {};
  const accentA = c.accentA || '#00E5FF';
  const accentB = c.accentB || '#5CCFFF';
  const bg0 = c.bg0 || '#0F1216';
  const panel0 = c.panel0 || '#1A1F26';
  const panel1 = c.panel1 || '#202833';
  const text0 = c.text0 || '#E6F1FF';
  const text1 = c.text1 || '#8EA0B5';
  const muted = c.muted || '#5F6E80';

  const [prefs, setPrefs] = useState(loadPrefs);
  const [configOpen, setConfigOpen] = useState(false);
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const colors = { accentA, accentB, panel0, panel1, text0, text1, muted, bg0 };

  const visibleWidgets = prefs.order
    .filter(id => !prefs.hidden.includes(id))
    .map(id => ALL_WIDGETS.find(w => w.id === id))
    .filter(Boolean);

  const toggleHidden = (id) => {
    const p2 = { ...prefs, hidden: prefs.hidden.includes(id) ? prefs.hidden.filter(h => h !== id) : [...prefs.hidden, id] };
    setPrefs(p2); savePrefs(p2);
  };

  const handleDragStart = (e, id) => { setDragging(id); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver = (e, id) => { e.preventDefault(); setDragOver(id); };
  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (!dragging || dragging === targetId) { setDragging(null); setDragOver(null); return; }
    const order = [...prefs.order];
    const from = order.indexOf(dragging), to = order.indexOf(targetId);
    order.splice(from, 1); order.splice(to, 0, dragging);
    const p2 = { ...prefs, order };
    setPrefs(p2); savePrefs(p2);
    setDragging(null); setDragOver(null);
  };

  return (
    <div className="min-h-screen" style={{ background: theme?.background?.gradient || bg0 }}>
      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-6 pb-24">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-5 w-5" style={{ color: accentA }} />
            <div>
              <h1 className="text-lg font-mono font-bold tracking-widest" style={{ color: text0 }}>TACTICAL DASHBOARD</h1>
              <p className="text-[9px] font-mono tracking-widest" style={{ color: muted }}>O.M.N.I. // FIELD COMMAND INTERFACE</p>
            </div>
          </div>
          <button
            onClick={() => setConfigOpen(o => !o)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono border transition-all"
            style={{ color: accentA, borderColor: accentA + '40', background: configOpen ? accentA + '15' : 'transparent' }}
          >
            <Settings2 className="h-3.5 w-3.5" />
            {configOpen ? 'DONE' : 'CONFIGURE'}
          </button>
        </div>

        {/* Config panel */}
        <AnimatePresence>
          {configOpen && (
            <motion.div
              className="rounded-xl border p-4 mb-5 space-y-2"
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
                    <span className="text-[8px] font-mono px-1.5 py-0.5 rounded" style={{ color: muted, background: panel0 }}>
                      {w.size === 'full' ? 'FULL' : 'HALF'}
                    </span>
                    <button onClick={() => toggleHidden(id)} className="p-1 hover:opacity-70 cc-sm-target">
                      {hidden
                        ? <EyeOff className="h-3.5 w-3.5" style={{ color: muted }} />
                        : <Eye className="h-3.5 w-3.5" style={{ color: accentA }} />}
                    </button>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Widget grid */}
        <div className="space-y-3">
          {/* Group half-width widgets in pairs */}
          {(() => {
            const rows = [];
            const widgets = visibleWidgets;
            let i = 0;
            while (i < widgets.length) {
              const w = widgets[i];
              if (w.size === 'full') {
                rows.push({ type: 'full', widgets: [w] });
                i++;
              } else {
                const next = widgets[i + 1];
                if (next && next.size === 'half') {
                  rows.push({ type: 'pair', widgets: [w, next] });
                  i += 2;
                } else {
                  rows.push({ type: 'full', widgets: [w] });
                  i++;
                }
              }
            }
            return rows.map((row, ri) => (
              <motion.div
                key={ri}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={row.type === 'pair' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : ''}
              >
                {row.widgets.map(w => (
                  <div
                    key={w.id}
                    className="rounded-xl border p-4"
                    style={{ background: panel0, borderColor: accentA + '22' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[9px] font-mono tracking-widest uppercase font-bold" style={{ color: accentA }}>
                        {w.label}
                      </span>
                      <button onClick={() => toggleHidden(w.id)} className="p-0.5 hover:opacity-60 cc-sm-target">
                        <X className="h-3 w-3" style={{ color: muted }} />
                      </button>
                    </div>
                    <w.Component {...colors} />
                  </div>
                ))}
              </motion.div>
            ));
          })()}
        </div>
      </div>
    </div>
  );
}