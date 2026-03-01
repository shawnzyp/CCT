import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useTheme } from '@/components/theme/useTheme';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Trash2, Edit2, CheckCircle, XCircle, Clock, Zap, Star, X, Save, Target, Shield, Bot, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AIMissionBriefing from '@/components/missions/AIMissionBriefing';

const STATUS_CONFIG = {
  active:    { label: 'ACTIVE',    color: '#00E5FF', icon: Clock },
  completed: { label: 'COMPLETED', color: '#00D1B2', icon: CheckCircle },
  failed:    { label: 'FAILED',    color: '#FF3B3B', icon: XCircle },
  pending:   { label: 'PENDING',   color: '#FFC857', icon: Target },
};

const DIFFICULTY_CONFIG = {
  easy:   { label: 'EASY',   color: '#00D1B2' },
  medium: { label: 'MEDIUM', color: '#FFC857' },
  hard:   { label: 'HARD',   color: '#FF8C00' },
  deadly: { label: 'DEADLY', color: '#FF3B3B' },
};

const EMPTY_FORM = {
  title: '', description: '', objective: '', status: 'pending',
  difficulty: 'medium', location: '', reward_xp: 0, reward_credits: 0,
  assigned_operative: '', time_limit: '',
};

function MissionForm({ initial, onSave, onCancel, colors, characters }) {
  const { accentA, panel0, panel1, text0, text1, muted } = colors;
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-lg rounded-xl border overflow-hidden" style={{ background: panel0, borderColor: accentA + '30' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: accentA + '20' }}>
          <span className="font-mono font-bold tracking-widest text-sm" style={{ color: text0 }}>{initial?.id ? 'EDIT MISSION' : 'NEW MISSION'}</span>
          <button onClick={onCancel}><X className="h-4 w-4" style={{ color: muted }} /></button>
        </div>
        <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
          <input className="w-full px-3 py-2 rounded-lg text-sm" placeholder="Mission Title *" value={form.title} onChange={e => set('title', e.target.value)} style={{ background: panel1, color: text0, border: `1px solid ${accentA}25` }} />
          <textarea className="w-full px-3 py-2 rounded-lg text-sm resize-none" rows={3} placeholder="Mission Description" value={form.description} onChange={e => set('description', e.target.value)} style={{ background: panel1, color: text0, border: `1px solid ${accentA}25` }} />
          <input className="w-full px-3 py-2 rounded-lg text-sm" placeholder="Primary Objective" value={form.objective} onChange={e => set('objective', e.target.value)} style={{ background: panel1, color: text0, border: `1px solid ${accentA}25` }} />
          <input className="w-full px-3 py-2 rounded-lg text-sm" placeholder="Location" value={form.location} onChange={e => set('location', e.target.value)} style={{ background: panel1, color: text0, border: `1px solid ${accentA}25` }} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] font-mono tracking-widest mb-1 block" style={{ color: muted }}>STATUS</label>
              <select className="w-full px-3 py-2 rounded-lg text-sm" value={form.status} onChange={e => set('status', e.target.value)} style={{ background: panel1, color: text0, border: `1px solid ${accentA}25` }}>
                {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] font-mono tracking-widest mb-1 block" style={{ color: muted }}>DIFFICULTY</label>
              <select className="w-full px-3 py-2 rounded-lg text-sm" value={form.difficulty} onChange={e => set('difficulty', e.target.value)} style={{ background: panel1, color: text0, border: `1px solid ${accentA}25` }}>
                {Object.keys(DIFFICULTY_CONFIG).map(d => <option key={d} value={d}>{DIFFICULTY_CONFIG[d].label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[9px] font-mono tracking-widest mb-1 block" style={{ color: muted }}>ASSIGNED OPERATIVE</label>
            <select className="w-full px-3 py-2 rounded-lg text-sm" value={form.assigned_operative} onChange={e => set('assigned_operative', e.target.value)} style={{ background: panel1, color: text0, border: `1px solid ${accentA}25` }}>
              <option value="">— Unassigned —</option>
              {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] font-mono tracking-widest mb-1 block" style={{ color: muted }}>REWARD XP</label>
              <input type="number" className="w-full px-3 py-2 rounded-lg text-sm" value={form.reward_xp} onChange={e => set('reward_xp', +e.target.value)} style={{ background: panel1, color: text0, border: `1px solid ${accentA}25` }} />
            </div>
            <div>
              <label className="text-[9px] font-mono tracking-widest mb-1 block" style={{ color: muted }}>REWARD CREDITS</label>
              <input type="number" className="w-full px-3 py-2 rounded-lg text-sm" value={form.reward_credits} onChange={e => set('reward_credits', +e.target.value)} style={{ background: panel1, color: text0, border: `1px solid ${accentA}25` }} />
            </div>
          </div>
          <input className="w-full px-3 py-2 rounded-lg text-sm" placeholder="Time Limit (e.g. 48 hours)" value={form.time_limit} onChange={e => set('time_limit', e.target.value)} style={{ background: panel1, color: text0, border: `1px solid ${accentA}25` }} />
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t" style={{ borderColor: accentA + '20' }}>
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-xs font-mono" style={{ color: muted, border: `1px solid ${muted}30` }}>CANCEL</button>
          <button onClick={() => form.title && onSave(form)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-bold" style={{ background: accentA, color: '#000' }}>
            <Save className="h-3.5 w-3.5" /> SAVE MISSION
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function MissionCard({ mission, onEdit, onDelete, onStatusChange, colors, characters }) {
  const { accentA, panel0, panel1, text0, text1, muted } = colors;
  const sc = STATUS_CONFIG[mission.status] || STATUS_CONFIG.pending;
  const dc = DIFFICULTY_CONFIG[mission.difficulty] || DIFFICULTY_CONFIG.medium;
  const StatusIcon = sc.icon;
  const operative = characters.find(c => c.id === mission.assigned_operative);

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
      className="relative rounded-xl border p-4 transition-all" style={{ background: panel0, borderColor: accentA + '20' }}>
      <div className="absolute top-2 left-2 w-2 h-2 border-t border-l opacity-40" style={{ borderColor: accentA }} />
      <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r opacity-40" style={{ borderColor: accentA }} />

      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-mono font-bold truncate" style={{ color: text0 }}>{mission.title}</span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: dc.color + '25', color: dc.color }}>{dc.label}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <StatusIcon className="h-3 w-3" style={{ color: sc.color }} />
            <span className="text-[9px] font-mono tracking-wider" style={{ color: sc.color }}>{sc.label}</span>
            {mission.location && <span className="text-[9px] font-mono" style={{ color: muted }}>• {mission.location}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => onEdit(mission)} className="p-1.5 rounded hover:opacity-70"><Edit2 className="h-3.5 w-3.5" style={{ color: muted }} /></button>
          <button onClick={() => onDelete(mission.id)} className="p-1.5 rounded hover:opacity-70"><Trash2 className="h-3.5 w-3.5" style={{ color: '#FF3B3B' }} /></button>
        </div>
      </div>

      {mission.description && <p className="text-xs mb-3 line-clamp-2" style={{ color: text1 }}>{mission.description}</p>}
      {mission.objective && (
        <div className="flex items-start gap-1.5 mb-3 px-2 py-1.5 rounded" style={{ background: accentA + '10' }}>
          <Target className="h-3 w-3 mt-0.5 flex-shrink-0" style={{ color: accentA }} />
          <span className="text-[10px] font-mono" style={{ color: accentA }}>{mission.objective}</span>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          {mission.reward_xp > 0 && <span className="text-[10px] font-mono flex items-center gap-1" style={{ color: '#FFC857' }}><Star className="h-3 w-3" />{mission.reward_xp} XP</span>}
          {mission.reward_credits > 0 && <span className="text-[10px] font-mono flex items-center gap-1" style={{ color: '#00D1B2' }}><Zap className="h-3 w-3" />{mission.reward_credits} CR</span>}
          {operative && <span className="text-[10px] font-mono flex items-center gap-1" style={{ color: muted }}><Shield className="h-3 w-3" />{operative.name}</span>}
        </div>
        <div className="flex gap-1">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => key !== mission.status && (
            <button key={key} onClick={() => onStatusChange(mission.id, key)}
              className="text-[8px] font-mono px-1.5 py-0.5 rounded border transition-all hover:opacity-80"
              style={{ color: cfg.color, borderColor: cfg.color + '40' }}>
              {cfg.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function Missions() {
  const { theme } = useTheme();
  const qc = useQueryClient();
  const c = theme?.colors || {};
  const colors = {
    accentA: c.accentA || '#00E5FF', accentB: c.accentB || '#5CCFFF',
    bg0: c.bg0 || '#0F1216', panel0: c.panel0 || '#1A1F26', panel1: c.panel1 || '#202833',
    text0: c.text0 || '#E6F1FF', text1: c.text1 || '#8EA0B5', muted: c.muted || '#5F6E80',
  };
  const { accentA, panel0, panel1, text0, text1, muted } = colors;

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('created_date');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showAI, setShowAI] = useState(false);
  const [aiPrefill, setAiPrefill] = useState(null);

  const { data: missions = [] } = useQuery({ queryKey: ['missions'], queryFn: () => base44.entities.Mission.list('-created_date') });
  const { data: characters = [] } = useQuery({ queryKey: ['characters'], queryFn: () => base44.entities.Character.list('-created_date') });

  const createMission = useMutation({
    mutationFn: (data) => base44.entities.Mission.create({ ...data, generated_by_ai: false }),
    onSuccess: () => { qc.invalidateQueries(['missions']); setShowForm(false); toast.success('Mission created'); },
  });
  const updateMission = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Mission.update(id, data),
    onSuccess: () => { qc.invalidateQueries(['missions']); setEditing(null); toast.success('Mission updated'); },
  });
  const deleteMission = useMutation({
    mutationFn: (id) => base44.entities.Mission.delete(id),
    onSuccess: () => { qc.invalidateQueries(['missions']); toast.success('Mission deleted'); },
  });

  const handleSave = (form) => {
    if (editing) updateMission.mutate({ id: editing.id, data: form });
    else createMission.mutate(form);
  };

  const handleStatusChange = (id, status) => updateMission.mutate({ id, data: { status } });

  const filtered = missions
    .filter(m => {
      if (filterStatus !== 'all' && m.status !== filterStatus) return false;
      if (filterDifficulty !== 'all' && m.difficulty !== filterDifficulty) return false;
      if (search && !m.title?.toLowerCase().includes(search.toLowerCase()) && !m.description?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'difficulty') return ['easy','medium','hard','deadly'].indexOf(a.difficulty) - ['easy','medium','hard','deadly'].indexOf(b.difficulty);
      if (sortBy === 'reward_xp') return (b.reward_xp || 0) - (a.reward_xp || 0);
      return new Date(b.created_date) - new Date(a.created_date);
    });

  const statusCounts = Object.fromEntries(Object.keys(STATUS_CONFIG).map(s => [s, missions.filter(m => m.status === s).length]));

  return (
    <div className="min-h-screen" style={{ background: theme?.background?.gradient || '#0F1216' }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-mono font-bold tracking-widest" style={{ color: text0 }}>MISSION CONTROL</h1>
            <p className="text-[10px] font-mono mt-0.5" style={{ color: muted }}>MANAGE & TRACK FIELD OPERATIONS</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to={createPageUrl('Operations')} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono border" style={{ color: muted, borderColor: muted + '30' }}>
              <Layers className="h-3.5 w-3.5" /> OPERATIONS
            </Link>
            <button onClick={() => { setAiPrefill(null); setShowAI(true); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-mono border transition-all"
              style={{ color: accentA, borderColor: accentA + '50', background: accentA + '10' }}>
              <Bot className="h-4 w-4" /> AI GEN
            </button>
            <button onClick={() => { setEditing(null); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-mono font-bold"
              style={{ background: accentA, color: '#000' }}>
              <Plus className="h-4 w-4" /> NEW MISSION
            </button>
          </div>
        </div>

        {/* Status summary */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <button key={key} onClick={() => setFilterStatus(filterStatus === key ? 'all' : key)}
              className="rounded-lg border p-2 text-center transition-all"
              style={{ background: filterStatus === key ? cfg.color + '20' : panel0, borderColor: filterStatus === key ? cfg.color + '60' : accentA + '18' }}>
              <div className="text-base font-mono font-bold" style={{ color: cfg.color }}>{statusCounts[key] || 0}</div>
              <div className="text-[8px] font-mono tracking-wider" style={{ color: muted }}>{cfg.label}</div>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-5">
          <div className="flex items-center gap-1.5 flex-1 min-w-[160px] px-3 py-2 rounded-lg border" style={{ background: panel0, borderColor: accentA + '20' }}>
            <Search className="h-3.5 w-3.5 flex-shrink-0" style={{ color: muted }} />
            <input placeholder="Search missions..." value={search} onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-xs flex-1 outline-none font-mono" style={{ color: text0 }} />
          </div>
          <select value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value)}
            className="px-3 py-2 rounded-lg text-xs font-mono" style={{ background: panel0, color: text1, border: `1px solid ${accentA}20` }}>
            <option value="all">ALL DIFFICULTY</option>
            {Object.entries(DIFFICULTY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-lg text-xs font-mono" style={{ background: panel0, color: text1, border: `1px solid ${accentA}20` }}>
            <option value="created_date">SORT: NEWEST</option>
            <option value="title">SORT: TITLE</option>
            <option value="difficulty">SORT: DIFFICULTY</option>
            <option value="reward_xp">SORT: XP REWARD</option>
          </select>
        </div>

        {/* Mission list */}
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.length === 0 ? (
              <div className="text-center py-16" style={{ color: muted }}>
                <Target className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-mono">NO MISSIONS FOUND</p>
                <p className="text-xs font-mono mt-1 opacity-60">Create your first mission to get started</p>
              </div>
            ) : filtered.map(m => (
              <MissionCard key={m.id} mission={m} colors={colors} characters={characters}
                onEdit={m => { setEditing(m); setShowForm(true); }}
                onDelete={id => deleteMission.mutate(id)}
                onStatusChange={handleStatusChange} />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {showForm && (
        <MissionForm
          initial={editing}
          colors={colors}
          characters={characters}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }} />
      )}
    </div>
  );
}