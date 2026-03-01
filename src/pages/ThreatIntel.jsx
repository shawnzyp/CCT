import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useTheme } from '@/components/theme/useTheme';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Shield, Zap, Eye, EyeOff, Flag, X, Plus, RefreshCw, Radio, Target, Globe, Activity } from 'lucide-react';
import { toast } from 'sonner';

const THREAT_LEVELS = {
  low:      { label: 'LOW',      color: '#00D1B2', bg: '#00D1B215', icon: Shield },
  moderate: { label: 'MODERATE', color: '#FFC857', bg: '#FFC85715', icon: Eye },
  high:     { label: 'HIGH',     color: '#FF8C00', bg: '#FF8C0015', icon: AlertTriangle },
  critical: { label: 'CRITICAL', color: '#FF3B3B', bg: '#FF3B3B15', icon: Zap },
};

const CATEGORIES = {
  enemy_activity:  { label: 'ENEMY ACTIVITY',  icon: Target },
  new_threat:      { label: 'NEW THREAT',       icon: AlertTriangle },
  strategic_intel: { label: 'STRATEGIC INTEL',  icon: Globe },
  asset_update:    { label: 'ASSET UPDATE',     icon: Shield },
  system:          { label: 'SYSTEM',           icon: Radio },
};

function IntelCard({ intel, onFlag, onDismiss, userEmail, colors }) {
  const { accentA, panel0, panel1, text0, text1, muted } = colors;
  const tl = THREAT_LEVELS[intel.threat_level] || THREAT_LEVELS.moderate;
  const cat = CATEGORIES[intel.category] || CATEGORIES.strategic_intel;
  const TLIcon = tl.icon;
  const CatIcon = cat.icon;
  const isFlagged = (intel.flagged_by || []).includes(userEmail);
  const isDismissed = (intel.dismissed_by || []).includes(userEmail);

  if (isDismissed) return null;

  return (
    <motion.div layout initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
      className="relative rounded-xl border p-4 transition-all"
      style={{ background: panel0, borderColor: tl.color + '35', borderLeft: `3px solid ${tl.color}` }}>

      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: tl.bg }}>
          <TLIcon className="h-4 w-4" style={{ color: tl.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-mono font-bold" style={{ color: text0 }}>{intel.title}</span>
            <span className="text-[8px] font-mono px-1.5 py-0.5 rounded font-bold" style={{ background: tl.bg, color: tl.color }}>{tl.label}</span>
            {isFlagged && <span className="text-[8px] font-mono px-1.5 py-0.5 rounded" style={{ background: '#FF8C0020', color: '#FF8C00' }}>FLAGGED</span>}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <CatIcon className="h-3 w-3" style={{ color: muted }} />
            <span className="text-[9px] font-mono" style={{ color: muted }}>{cat.label}</span>
            {intel.source && <span className="text-[9px] font-mono" style={{ color: muted }}>• SRC: {intel.source}</span>}
            {intel.location && <span className="text-[9px] font-mono" style={{ color: muted }}>• {intel.location}</span>}
          </div>
          <p className="text-xs leading-relaxed" style={{ color: text1 }}>{intel.body}</p>
        </div>
        <div className="flex flex-col gap-1 flex-shrink-0">
          <button onClick={() => onFlag(intel)} title={isFlagged ? 'Unflag' : 'Flag'}
            className="p-1.5 rounded hover:opacity-70 transition-all"
            style={{ color: isFlagged ? '#FF8C00' : muted, background: isFlagged ? '#FF8C0018' : 'transparent' }}>
            <Flag className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => onDismiss(intel)} title="Dismiss"
            className="p-1.5 rounded hover:opacity-70 transition-all" style={{ color: muted }}>
            <EyeOff className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function NewIntelForm({ onSave, onCancel, colors }) {
  const { accentA, panel0, panel1, text0, text1, muted } = colors;
  const [form, setForm] = useState({ title: '', body: '', threat_level: 'moderate', category: 'strategic_intel', source: '', location: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md rounded-xl border overflow-hidden" style={{ background: panel0, borderColor: accentA + '30' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: accentA + '20' }}>
          <span className="font-mono font-bold tracking-widest text-sm" style={{ color: text0 }}>NEW INTEL REPORT</span>
          <button onClick={onCancel}><X className="h-4 w-4" style={{ color: muted }} /></button>
        </div>
        <div className="p-5 space-y-3">
          <input className="w-full px-3 py-2 rounded-lg text-sm" placeholder="Intel Title *" value={form.title} onChange={e => set('title', e.target.value)} style={{ background: panel1, color: text0, border: `1px solid ${accentA}25` }} />
          <textarea className="w-full px-3 py-2 rounded-lg text-sm resize-none" rows={4} placeholder="Full Intel Report *" value={form.body} onChange={e => set('body', e.target.value)} style={{ background: panel1, color: text0, border: `1px solid ${accentA}25` }} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] font-mono tracking-widest mb-1 block" style={{ color: muted }}>THREAT LEVEL</label>
              <select className="w-full px-3 py-2 rounded-lg text-sm" value={form.threat_level} onChange={e => set('threat_level', e.target.value)} style={{ background: panel1, color: text0, border: `1px solid ${accentA}25` }}>
                {Object.entries(THREAT_LEVELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] font-mono tracking-widest mb-1 block" style={{ color: muted }}>CATEGORY</label>
              <select className="w-full px-3 py-2 rounded-lg text-sm" value={form.category} onChange={e => set('category', e.target.value)} style={{ background: panel1, color: text0, border: `1px solid ${accentA}25` }}>
                {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input className="w-full px-3 py-2 rounded-lg text-sm" placeholder="Source / Faction" value={form.source} onChange={e => set('source', e.target.value)} style={{ background: panel1, color: text0, border: `1px solid ${accentA}25` }} />
            <input className="w-full px-3 py-2 rounded-lg text-sm" placeholder="Location" value={form.location} onChange={e => set('location', e.target.value)} style={{ background: panel1, color: text0, border: `1px solid ${accentA}25` }} />
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t" style={{ borderColor: accentA + '20' }}>
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-xs font-mono" style={{ color: muted, border: `1px solid ${muted}30` }}>CANCEL</button>
          <button onClick={() => form.title && form.body && onSave(form)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-bold" style={{ background: accentA, color: '#000' }}>
            <Plus className="h-3.5 w-3.5" /> SUBMIT INTEL
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function ThreatIntelPage() {
  const { theme } = useTheme();
  const qc = useQueryClient();
  const c = theme?.colors || {};
  const colors = {
    accentA: c.accentA || '#00E5FF', panel0: c.panel0 || '#1A1F26', panel1: c.panel1 || '#202833',
    text0: c.text0 || '#E6F1FF', text1: c.text1 || '#8EA0B5', muted: c.muted || '#5F6E80',
  };
  const { accentA, panel0, text0, text1, muted } = colors;

  const [filterLevel, setFilterLevel] = useState('all');
  const [filterCat, setFilterCat] = useState('all');
  const [showFlagged, setShowFlagged] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  React.useEffect(() => {
    base44.auth.me().then(u => u && setUserEmail(u.email)).catch(() => {});
  }, []);

  const { data: intel = [], isLoading, refetch } = useQuery({
    queryKey: ['threat_intel'],
    queryFn: () => base44.entities.ThreatIntel.filter({ is_active: true }, '-created_date'),
    refetchInterval: 60000,
  });

  const createIntel = useMutation({
    mutationFn: (data) => base44.entities.ThreatIntel.create({ ...data, is_active: true }),
    onSuccess: () => { qc.invalidateQueries(['threat_intel']); setShowForm(false); toast.success('Intel submitted'); },
  });

  const updateIntel = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ThreatIntel.update(id, data),
    onSuccess: () => qc.invalidateQueries(['threat_intel']),
  });

  const handleFlag = (item) => {
    const flagged_by = item.flagged_by || [];
    const already = flagged_by.includes(userEmail);
    updateIntel.mutate({ id: item.id, data: { flagged_by: already ? flagged_by.filter(e => e !== userEmail) : [...flagged_by, userEmail] } });
  };

  const handleDismiss = (item) => {
    const dismissed_by = item.dismissed_by || [];
    updateIntel.mutate({ id: item.id, data: { dismissed_by: [...dismissed_by, userEmail] } });
    toast.success('Intel dismissed');
  };

  const criticalCount = intel.filter(i => i.threat_level === 'critical' && !(i.dismissed_by || []).includes(userEmail)).length;
  const flaggedCount = intel.filter(i => (i.flagged_by || []).includes(userEmail)).length;

  const filtered = intel.filter(i => {
    if ((i.dismissed_by || []).includes(userEmail)) return false;
    if (showFlagged && !(i.flagged_by || []).includes(userEmail)) return false;
    if (filterLevel !== 'all' && i.threat_level !== filterLevel) return false;
    if (filterCat !== 'all' && i.category !== filterCat) return false;
    return true;
  });

  return (
    <div className="min-h-screen" style={{ background: theme?.background?.gradient || '#0F1216' }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-mono font-bold tracking-widest" style={{ color: text0 }}>THREAT INTEL FEED</h1>
              <Radio className="h-3 w-3 animate-pulse" style={{ color: accentA }} />
              {criticalCount > 0 && (
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full font-bold animate-pulse" style={{ background: '#FF3B3B20', color: '#FF3B3B' }}>
                  {criticalCount} CRITICAL
                </span>
              )}
            </div>
            <p className="text-[10px] font-mono mt-0.5" style={{ color: muted }}>LIVE INTELLIGENCE // AUTO-REFRESH 60s</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => refetch()} className="p-2 rounded-lg hover:opacity-70" style={{ color: muted }}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-mono font-bold"
              style={{ background: accentA, color: '#000' }}>
              <Plus className="h-4 w-4" /> SUBMIT INTEL
            </button>
          </div>
        </div>

        {/* Threat level summary */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {Object.entries(THREAT_LEVELS).map(([key, cfg]) => {
            const count = intel.filter(i => i.threat_level === key && !(i.dismissed_by || []).includes(userEmail)).length;
            return (
              <button key={key} onClick={() => setFilterLevel(filterLevel === key ? 'all' : key)}
                className="rounded-lg border p-2 text-center transition-all"
                style={{ background: filterLevel === key ? cfg.bg : panel0, borderColor: filterLevel === key ? cfg.color + '60' : accentA + '18' }}>
                <div className="text-base font-mono font-bold" style={{ color: cfg.color }}>{count}</div>
                <div className="text-[8px] font-mono tracking-wider" style={{ color: muted }}>{cfg.label}</div>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-5">
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            className="px-3 py-2 rounded-lg text-xs font-mono" style={{ background: panel0, color: text1, border: `1px solid ${accentA}20` }}>
            <option value="all">ALL CATEGORIES</option>
            {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <button onClick={() => setShowFlagged(f => !f)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono transition-all"
            style={{ background: showFlagged ? '#FF8C0020' : panel0, color: showFlagged ? '#FF8C00' : text1, border: `1px solid ${showFlagged ? '#FF8C0060' : accentA + '20'}` }}>
            <Flag className="h-3.5 w-3.5" /> FLAGGED ({flaggedCount})
          </button>
        </div>

        {/* Intel feed */}
        <div className="space-y-3">
          <AnimatePresence>
            {isLoading ? (
              <div className="text-center py-16" style={{ color: muted }}>
                <Activity className="h-8 w-8 mx-auto mb-3 animate-pulse" />
                <p className="text-sm font-mono">SCANNING INTEL FEEDS...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16" style={{ color: muted }}>
                <Shield className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-mono">NO ACTIVE INTEL</p>
                <p className="text-xs font-mono mt-1 opacity-60">All clear or intel has been dismissed</p>
              </div>
            ) : filtered.map(item => (
              <IntelCard key={item.id} intel={item} userEmail={userEmail} colors={colors}
                onFlag={handleFlag} onDismiss={handleDismiss} />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {showForm && <NewIntelForm colors={colors} onSave={d => createIntel.mutate(d)} onCancel={() => setShowForm(false)} />}
    </div>
  );
}