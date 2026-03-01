import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useTheme } from '@/components/theme/useTheme';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Edit2, ChevronDown, ChevronRight, CheckCircle, XCircle, Clock,
  Target, Shield, Star, Zap, X, Save, Award, Map, Link2, ArrowRight, Flag
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const OP_STATUS = {
  planning:  { label: 'PLANNING',  color: '#5CCFFF' },
  active:    { label: 'ACTIVE',    color: '#00E5FF' },
  completed: { label: 'COMPLETED', color: '#00D1B2' },
  failed:    { label: 'FAILED',    color: '#FF3B3B' },
  on_hold:   { label: 'ON HOLD',   color: '#FFC857' },
};

const MISSION_STATUS_COLOR = { pending: '#FFC857', active: '#00E5FF', completed: '#00D1B2', failed: '#FF3B3B', in_progress: '#00E5FF' };

function ProgressBar({ value, max, color, colors }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="w-full h-1.5 rounded-full" style={{ background: colors.muted + '30' }}>
      <motion.div className="h-full rounded-full" style={{ background: color }}
        initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
    </div>
  );
}

function OperationForm({ initial, onSave, onCancel, missions, colors }) {
  const { accentA, panel0, panel1, text0, text1, muted } = colors;
  const [form, setForm] = useState(initial || {
    name: '', codename: '', description: '', status: 'planning',
    threat_level: 'moderate', faction: '', reward_xp: 0, reward_credits: 0,
    notes: '', mission_ids: [], objectives: [],
  });
  const [newObj, setNewObj] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleMission = (id) => {
    const ids = form.mission_ids || [];
    set('mission_ids', ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]);
  };

  const addObjective = () => {
    if (!newObj.trim()) return;
    set('objectives', [...(form.objectives || []), { text: newObj.trim(), completed: false }]);
    setNewObj('');
  };

  const removeObjective = (idx) => set('objectives', form.objectives.filter((_, i) => i !== idx));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)' }}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-xl rounded-xl border overflow-hidden flex flex-col" style={{ background: panel0, borderColor: accentA + '35', maxHeight: '88vh' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0" style={{ borderColor: accentA + '20' }}>
          <span className="font-mono font-bold tracking-widest text-sm" style={{ color: text0 }}>{initial?.id ? 'EDIT OPERATION' : 'NEW OPERATION'}</span>
          <button onClick={onCancel}><X className="h-4 w-4" style={{ color: muted }} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input className="w-full px-3 py-2 rounded-lg text-sm col-span-2" placeholder="Operation Name *" value={form.name} onChange={e => set('name', e.target.value)} style={{ background: panel1, color: text0, border: `1px solid ${accentA}25` }} />
            <input className="px-3 py-2 rounded-lg text-sm" placeholder="Codename" value={form.codename} onChange={e => set('codename', e.target.value)} style={{ background: panel1, color: text0, border: `1px solid ${accentA}25` }} />
            <input className="px-3 py-2 rounded-lg text-sm" placeholder="Enemy Faction" value={form.faction} onChange={e => set('faction', e.target.value)} style={{ background: panel1, color: text0, border: `1px solid ${accentA}25` }} />
          </div>
          <textarea className="w-full px-3 py-2 rounded-lg text-sm resize-none" rows={3} placeholder="Operation description / overview" value={form.description} onChange={e => set('description', e.target.value)} style={{ background: panel1, color: text0, border: `1px solid ${accentA}25` }} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] font-mono tracking-widest mb-1 block" style={{ color: muted }}>STATUS</label>
              <select className="w-full px-3 py-2 rounded-lg text-sm" value={form.status} onChange={e => set('status', e.target.value)} style={{ background: panel1, color: text0, border: `1px solid ${accentA}25` }}>
                {Object.entries(OP_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] font-mono tracking-widest mb-1 block" style={{ color: muted }}>THREAT LEVEL</label>
              <select className="w-full px-3 py-2 rounded-lg text-sm" value={form.threat_level} onChange={e => set('threat_level', e.target.value)} style={{ background: panel1, color: text0, border: `1px solid ${accentA}25` }}>
                {['low','moderate','high','critical'].map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] font-mono tracking-widest mb-1 block" style={{ color: muted }}>BONUS XP (ON COMPLETION)</label>
              <input type="number" className="w-full px-3 py-2 rounded-lg text-sm" value={form.reward_xp} onChange={e => set('reward_xp', +e.target.value)} style={{ background: panel1, color: text0, border: `1px solid ${accentA}25` }} />
            </div>
            <div>
              <label className="text-[9px] font-mono tracking-widest mb-1 block" style={{ color: muted }}>BONUS CREDITS</label>
              <input type="number" className="w-full px-3 py-2 rounded-lg text-sm" value={form.reward_credits} onChange={e => set('reward_credits', +e.target.value)} style={{ background: panel1, color: text0, border: `1px solid ${accentA}25` }} />
            </div>
          </div>

          {/* Objectives */}
          <div>
            <label className="text-[9px] font-mono tracking-widest mb-2 block" style={{ color: muted }}>OPERATION OBJECTIVES</label>
            <div className="flex gap-2 mb-2">
              <input className="flex-1 px-3 py-2 rounded-lg text-sm" placeholder="Add objective..." value={newObj} onChange={e => setNewObj(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addObjective()}
                style={{ background: panel1, color: text0, border: `1px solid ${accentA}25` }} />
              <button onClick={addObjective} className="px-3 py-2 rounded-lg text-xs font-mono" style={{ background: accentA + '20', color: accentA, border: `1px solid ${accentA}40` }}><Plus className="h-4 w-4" /></button>
            </div>
            {(form.objectives || []).map((obj, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5 px-2 rounded mb-1" style={{ background: panel1 }}>
                <Target className="h-3 w-3 flex-shrink-0" style={{ color: accentA }} />
                <span className="flex-1 text-xs" style={{ color: text1 }}>{obj.text}</span>
                <button onClick={() => removeObjective(i)}><X className="h-3 w-3" style={{ color: muted }} /></button>
              </div>
            ))}
          </div>

          {/* Link missions */}
          <div>
            <label className="text-[9px] font-mono tracking-widest mb-2 block" style={{ color: muted }}>LINKED MISSIONS ({(form.mission_ids || []).length} selected)</label>
            <div className="max-h-36 overflow-y-auto space-y-1 rounded-lg border p-2" style={{ borderColor: accentA + '20', background: panel1 }}>
              {missions.length === 0 ? (
                <p className="text-[10px] text-center py-2 font-mono" style={{ color: muted }}>No missions available. Create missions first.</p>
              ) : missions.map(m => (
                <label key={m.id} className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:opacity-80">
                  <input type="checkbox" checked={(form.mission_ids || []).includes(m.id)} onChange={() => toggleMission(m.id)}
                    style={{ accentColor: accentA }} />
                  <span className="text-xs font-mono" style={{ color: text0 }}>{m.title}</span>
                  <span className="text-[9px] ml-auto" style={{ color: MISSION_STATUS_COLOR[m.status] || muted }}>{(m.status || '').toUpperCase()}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t flex-shrink-0" style={{ borderColor: accentA + '20' }}>
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-xs font-mono" style={{ color: muted, border: `1px solid ${muted}30` }}>CANCEL</button>
          <button onClick={() => form.name && onSave(form)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-bold" style={{ background: accentA, color: '#000' }}>
            <Save className="h-3.5 w-3.5" /> SAVE OPERATION
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function OperationCard({ op, missions, onEdit, onDelete, colors }) {
  const { accentA, panel0, panel1, text0, text1, muted } = colors;
  const [expanded, setExpanded] = useState(false);
  const sc = OP_STATUS[op.status] || OP_STATUS.planning;

  const linkedMissions = (op.mission_ids || []).map(id => missions.find(m => m.id === id)).filter(Boolean);
  const completedMissions = linkedMissions.filter(m => m.status === 'completed').length;
  const completedObjectives = (op.objectives || []).filter(o => o.completed).length;
  const totalObjectives = (op.objectives || []).length;
  const progress = linkedMissions.length > 0 ? Math.round((completedMissions / linkedMissions.length) * 100) : 0;

  const threatColors = { low: '#00D1B2', moderate: '#FFC857', high: '#FF8C00', critical: '#FF3B3B' };
  const threatColor = threatColors[op.threat_level] || '#FFC857';

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
      className="rounded-xl border overflow-hidden" style={{ background: panel0, borderColor: sc.color + '30' }}>

      {/* Top bar - status color accent */}
      <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${sc.color}, transparent)` }} />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="font-mono font-bold text-sm" style={{ color: text0 }}>{op.name}</span>
              {op.codename && <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: accentA + '15', color: accentA }}>OP: {op.codename}</span>}
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold" style={{ background: sc.color + '20', color: sc.color }}>{sc.label}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {op.faction && <span className="text-[9px] font-mono" style={{ color: muted }}>vs {op.faction}</span>}
              <span className="text-[9px] font-mono px-1 py-0.5 rounded" style={{ background: threatColor + '18', color: threatColor }}>
                THREAT: {(op.threat_level || '').toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => onEdit(op)} className="p-1.5 rounded hover:opacity-70"><Edit2 className="h-3.5 w-3.5" style={{ color: muted }} /></button>
            <button onClick={() => onDelete(op.id)} className="p-1.5 rounded hover:opacity-70"><Trash2 className="h-3.5 w-3.5" style={{ color: '#FF3B3B' }} /></button>
          </div>
        </div>

        {op.description && <p className="text-xs mb-3 line-clamp-2" style={{ color: text1 }}>{op.description}</p>}

        {/* Progress */}
        <div className="mb-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-mono tracking-wider" style={{ color: muted }}>MISSION PROGRESS</span>
            <span className="text-[10px] font-mono font-bold" style={{ color: progress === 100 ? '#00D1B2' : accentA }}>{completedMissions}/{linkedMissions.length} ({progress}%)</span>
          </div>
          <ProgressBar value={completedMissions} max={linkedMissions.length} color={progress === 100 ? '#00D1B2' : accentA} colors={colors} />
          {totalObjectives > 0 && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-mono tracking-wider" style={{ color: muted }}>OBJECTIVES</span>
                <span className="text-[10px] font-mono" style={{ color: muted }}>{completedObjectives}/{totalObjectives}</span>
              </div>
              <ProgressBar value={completedObjectives} max={totalObjectives} color="#FFC857" colors={colors} />
            </>
          )}
        </div>

        {/* Rewards */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {op.reward_xp > 0 && <span className="text-[10px] font-mono flex items-center gap-1" style={{ color: '#FFC857' }}><Star className="h-3 w-3" />+{op.reward_xp} XP</span>}
            {op.reward_credits > 0 && <span className="text-[10px] font-mono flex items-center gap-1" style={{ color: '#00D1B2' }}><Zap className="h-3 w-3" />+{op.reward_credits} CR</span>}
          </div>
          <button onClick={() => setExpanded(e => !e)} className="flex items-center gap-1 text-[9px] font-mono" style={{ color: muted }}>
            {linkedMissions.length} MISSIONS
            {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
        </div>

        {/* Mission pipeline */}
        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="mt-3 pt-3 border-t" style={{ borderColor: accentA + '15' }}>
                {/* Objectives */}
                {(op.objectives || []).length > 0 && (
                  <div className="mb-3">
                    <div className="text-[8px] font-mono tracking-widest mb-1.5" style={{ color: muted }}>OBJECTIVES</div>
                    {op.objectives.map((obj, i) => (
                      <div key={i} className="flex items-center gap-2 mb-1">
                        {obj.completed
                          ? <CheckCircle className="h-3 w-3 flex-shrink-0" style={{ color: '#00D1B2' }} />
                          : <Target className="h-3 w-3 flex-shrink-0" style={{ color: muted }} />}
                        <span className="text-[10px] font-mono" style={{ color: obj.completed ? '#00D1B2' : text1, textDecoration: obj.completed ? 'line-through' : 'none' }}>{obj.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Mission pipeline */}
                <div className="text-[8px] font-mono tracking-widest mb-2" style={{ color: muted }}>MISSION PIPELINE</div>
                {linkedMissions.length === 0 ? (
                  <p className="text-[10px] font-mono" style={{ color: muted }}>No missions linked. Edit operation to add missions.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {linkedMissions.map((m, i) => {
                      const mColor = MISSION_STATUS_COLOR[m.status] || muted;
                      const isCompleted = m.status === 'completed';
                      const isFailed = m.status === 'failed';
                      return (
                        <div key={m.id} className="flex items-center gap-2">
                          {/* connector line */}
                          <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-mono font-bold border-2`}
                              style={{ borderColor: mColor, background: isCompleted ? mColor + '30' : 'transparent', color: mColor }}>
                              {isCompleted ? '✓' : isFailed ? '✗' : i + 1}
                            </div>
                            {i < linkedMissions.length - 1 && <div className="w-0.5 h-3 opacity-30" style={{ background: accentA }} />}
                          </div>
                          <div className="flex-1 min-w-0 px-2 py-1.5 rounded border" style={{ background: panel1, borderColor: mColor + '25' }}>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-mono truncate" style={{ color: text0 }}>{m.title}</span>
                              <span className="text-[8px] font-mono flex-shrink-0" style={{ color: mColor }}>{(m.status || '').toUpperCase()}</span>
                            </div>
                            {m.location && <div className="text-[9px] mt-0.5" style={{ color: muted }}>{m.location}</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function Operations() {
  const { theme } = useTheme();
  const qc = useQueryClient();
  const c = theme?.colors || {};
  const colors = {
    accentA: c.accentA || '#00E5FF', panel0: c.panel0 || '#1A1F26', panel1: c.panel1 || '#202833',
    text0: c.text0 || '#E6F1FF', text1: c.text1 || '#8EA0B5', muted: c.muted || '#5F6E80',
  };
  const { accentA, panel0, panel1, text0, text1, muted } = colors;

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: operations = [] } = useQuery({ queryKey: ['operations'], queryFn: () => base44.entities.Operation.list('-created_date') });
  const { data: missions = [] } = useQuery({ queryKey: ['missions'], queryFn: () => base44.entities.Mission.list('-created_date') });

  const createOp = useMutation({
    mutationFn: (data) => base44.entities.Operation.create(data),
    onSuccess: () => { qc.invalidateQueries(['operations']); setShowForm(false); toast.success('Operation created'); },
  });
  const updateOp = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Operation.update(id, data),
    onSuccess: () => { qc.invalidateQueries(['operations']); setEditing(null); toast.success('Operation updated'); },
  });
  const deleteOp = useMutation({
    mutationFn: (id) => base44.entities.Operation.delete(id),
    onSuccess: () => { qc.invalidateQueries(['operations']); toast.success('Operation deleted'); },
  });

  const handleSave = (form) => {
    if (editing) updateOp.mutate({ id: editing.id, data: form });
    else createOp.mutate(form);
  };

  const filtered = operations.filter(op => filterStatus === 'all' || op.status === filterStatus);

  const totalCompleted = operations.filter(op => op.status === 'completed').length;
  const totalActive = operations.filter(op => op.status === 'active').length;
  const totalMissionsLinked = [...new Set(operations.flatMap(op => op.mission_ids || []))].length;

  return (
    <div className="min-h-screen" style={{ background: theme?.background?.gradient || '#0F1216' }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-mono font-bold tracking-widest" style={{ color: text0 }}>OPERATIONS</h1>
            <p className="text-[10px] font-mono mt-0.5" style={{ color: muted }}>MULTI-STAGE CAMPAIGN MANAGEMENT</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to={createPageUrl('Missions')} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono border" style={{ color: muted, borderColor: muted + '30' }}>
              <Target className="h-3.5 w-3.5" /> MISSIONS
            </Link>
            <button onClick={() => { setEditing(null); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-mono font-bold"
              style={{ background: accentA, color: '#000' }}>
              <Plus className="h-4 w-4" /> NEW OPERATION
            </button>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'ACTIVE OPS', value: totalActive, color: accentA },
            { label: 'COMPLETED', value: totalCompleted, color: '#00D1B2' },
            { label: 'MISSIONS LINKED', value: totalMissionsLinked, color: '#FFC857' },
          ].map(s => (
            <div key={s.label} className="rounded-lg border p-3 text-center" style={{ background: panel0, borderColor: accentA + '18' }}>
              <div className="text-2xl font-mono font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[8px] font-mono tracking-widest mt-0.5" style={{ color: muted }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Status filter pills */}
        <div className="flex gap-2 flex-wrap mb-5">
          {['all', ...Object.keys(OP_STATUS)].map(key => {
            const cfg = key === 'all' ? { label: 'ALL', color: accentA } : OP_STATUS[key];
            return (
              <button key={key} onClick={() => setFilterStatus(key)}
                className="px-3 py-1 rounded-full text-[9px] font-mono font-bold border transition-all"
                style={{ background: filterStatus === key ? cfg.color + '20' : 'transparent', color: cfg.color, borderColor: filterStatus === key ? cfg.color + '60' : cfg.color + '30' }}>
                {cfg.label}
              </button>
            );
          })}
        </div>

        {/* Operations list */}
        <div className="space-y-4">
          <AnimatePresence>
            {filtered.length === 0 ? (
              <div className="text-center py-16" style={{ color: muted }}>
                <Map className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-mono">NO OPERATIONS FOUND</p>
                <p className="text-xs font-mono mt-1 opacity-60">Create your first multi-stage operation</p>
              </div>
            ) : filtered.map(op => (
              <OperationCard key={op.id} op={op} missions={missions} colors={colors}
                onEdit={op => { setEditing(op); setShowForm(true); }}
                onDelete={id => deleteOp.mutate(id)} />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {showForm && (
        <OperationForm initial={editing} missions={missions} colors={colors}
          onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />
      )}
    </div>
  );
}