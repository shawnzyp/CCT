import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Wand2, X, Loader2, Copy, Check, ChevronDown, ChevronUp, Shield, Package, AlertTriangle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const THREAT_LEVELS = ['low', 'moderate', 'high', 'critical'];
const MISSION_TYPES = ['infiltration', 'extraction', 'elimination', 'sabotage', 'reconnaissance', 'protection', 'rescue', 'heist'];
const ENVIRONMENTS = ['urban', 'industrial', 'underground', 'coastal', 'corporate', 'military base', 'wilderness', 'space station'];

export default function AIMissionBriefing({ colors, characters, onApply, onClose }) {
  const { accentA, panel0, panel1, text0, text1, muted } = colors;

  const [params, setParams] = useState({
    objective: '', location: '', threat_level: 'high',
    mission_type: 'infiltration', environment: 'urban',
    num_operatives: 2, extra_notes: '',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLoadout, setShowLoadout] = useState(true);
  const [showModifiers, setShowModifiers] = useState(true);

  const set = (k, v) => setParams(p => ({ ...p, [k]: v }));

  const generate = async () => {
    if (!params.objective) { toast.error('Please enter an objective'); return; }
    setLoading(true);
    setResult(null);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a tactical mission briefing AI for a superhero TTRPG called Catalyst Core. 
Generate a detailed, atmospheric mission briefing with the following parameters:
- Objective: ${params.objective}
- Location: ${params.location || 'unspecified'}
- Threat Level: ${params.threat_level.toUpperCase()}
- Mission Type: ${params.mission_type}
- Environment: ${params.environment}
- Number of operatives: ${params.num_operatives}
- Additional notes: ${params.extra_notes || 'none'}

Available operatives: ${characters.map(c => `${c.name} (${c.classification || 'unknown'}, powers: ${(c.power_styles || []).join(', ')})`).join('; ') || 'none registered'}

Respond with a JSON object matching the schema exactly. Be creative, tactical, and thematic. Use military/spy thriller tone.`,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          codename: { type: 'string' },
          description: { type: 'string' },
          objective: { type: 'string' },
          mission_summary: { type: 'string' },
          intel_briefing: { type: 'string' },
          complications: { type: 'array', items: { type: 'string' } },
          modifiers: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, effect: { type: 'string' }, severity: { type: 'string' } } } },
          recommended_loadout: {
            type: 'object',
            properties: {
              primary_weapons: { type: 'array', items: { type: 'string' } },
              utility_items: { type: 'array', items: { type: 'string' } },
              recommended_powers: { type: 'array', items: { type: 'string' } },
              avoid: { type: 'array', items: { type: 'string' } },
            }
          },
          operative_suggestions: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, role: { type: 'string' }, reason: { type: 'string' } } } },
          reward_xp: { type: 'number' },
          reward_credits: { type: 'number' },
          time_limit: { type: 'string' },
          difficulty: { type: 'string' },
        }
      }
    });
    setResult(res);
    setLoading(false);
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.intel_briefing || result.description || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (!result) return;
    onApply({
      title: result.title || '',
      description: result.description || '',
      objective: result.objective || '',
      difficulty: result.difficulty || params.threat_level === 'critical' ? 'deadly' : params.threat_level === 'high' ? 'hard' : params.threat_level === 'moderate' ? 'medium' : 'easy',
      location: params.location,
      reward_xp: result.reward_xp || 0,
      reward_credits: result.reward_credits || 0,
      time_limit: result.time_limit || '',
      generated_by_ai: true,
      ai_mission_data: result,
    });
    onClose();
    toast.success('AI briefing applied to mission form');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl rounded-xl border overflow-hidden flex flex-col" style={{ background: panel0, borderColor: accentA + '40', maxHeight: '90vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0" style={{ borderColor: accentA + '25', background: panel0 }}>
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" style={{ color: accentA }} />
            <span className="font-mono font-bold tracking-widest text-sm" style={{ color: text0 }}>A.I. MISSION GENERATOR</span>
          </div>
          <button onClick={onClose}><X className="h-4 w-4" style={{ color: muted }} /></button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Params form */}
          <div className="p-5 space-y-3 border-b" style={{ borderColor: accentA + '15' }}>
            <div className="text-[9px] font-mono tracking-widest mb-2" style={{ color: accentA }}>MISSION PARAMETERS</div>
            <textarea className="w-full px-3 py-2 rounded-lg text-sm resize-none" rows={2}
              placeholder="Primary objective * (e.g. Extract the scientist from NEMESIS facility)" value={params.objective}
              onChange={e => set('objective', e.target.value)} style={{ background: panel1, color: text0, border: `1px solid ${accentA}25` }} />
            <input className="w-full px-3 py-2 rounded-lg text-sm" placeholder="Location (e.g. Downtown financial district)"
              value={params.location} onChange={e => set('location', e.target.value)} style={{ background: panel1, color: text0, border: `1px solid ${accentA}25` }} />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: 'THREAT', key: 'threat_level', opts: THREAT_LEVELS },
                { label: 'TYPE', key: 'mission_type', opts: MISSION_TYPES },
                { label: 'ENVIRONMENT', key: 'environment', opts: ENVIRONMENTS },
              ].map(({ label, key, opts }) => (
                <div key={key}>
                  <label className="text-[8px] font-mono tracking-widest mb-1 block" style={{ color: muted }}>{label}</label>
                  <select className="w-full px-2 py-1.5 rounded-lg text-xs font-mono" value={params[key]} onChange={e => set(key, e.target.value)}
                    style={{ background: panel1, color: text0, border: `1px solid ${accentA}25` }}>
                    {opts.map(o => <option key={o} value={o}>{o.toUpperCase()}</option>)}
                  </select>
                </div>
              ))}
              <div>
                <label className="text-[8px] font-mono tracking-widest mb-1 block" style={{ color: muted }}>OPERATIVES</label>
                <input type="number" min={1} max={6} className="w-full px-2 py-1.5 rounded-lg text-xs font-mono"
                  value={params.num_operatives} onChange={e => set('num_operatives', +e.target.value)}
                  style={{ background: panel1, color: text0, border: `1px solid ${accentA}25` }} />
              </div>
            </div>
            <input className="w-full px-3 py-2 rounded-lg text-sm" placeholder="Additional notes (optional)"
              value={params.extra_notes} onChange={e => set('extra_notes', e.target.value)} style={{ background: panel1, color: text0, border: `1px solid ${accentA}25` }} />
            <button onClick={generate} disabled={loading || !params.objective}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-mono font-bold transition-all disabled:opacity-50"
              style={{ background: loading ? accentA + '60' : accentA, color: '#000' }}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              {loading ? 'GENERATING BRIEFING...' : 'GENERATE MISSION BRIEFING'}
            </button>
          </div>

          {/* Result */}
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-5 space-y-4">
                {/* Title / codename */}
                <div>
                  <div className="text-[9px] font-mono tracking-widest mb-1" style={{ color: accentA }}>MISSION DESIGNATION</div>
                  <div className="text-base font-mono font-bold" style={{ color: text0 }}>{result.title}</div>
                  {result.codename && <div className="text-xs font-mono" style={{ color: muted }}>CODENAME: {result.codename}</div>}
                </div>

                {/* Intel briefing */}
                <div className="p-3 rounded-lg border" style={{ background: panel1, borderColor: accentA + '20' }}>
                  <div className="text-[9px] font-mono tracking-widest mb-2" style={{ color: accentA }}>INTEL BRIEFING</div>
                  <p className="text-xs leading-relaxed" style={{ color: text1 }}>{result.intel_briefing || result.description}</p>
                </div>

                {/* Complications */}
                {result.complications?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <AlertTriangle className="h-3.5 w-3.5" style={{ color: '#FF8C00' }} />
                      <span className="text-[9px] font-mono tracking-widest" style={{ color: '#FF8C00' }}>COMPLICATIONS</span>
                    </div>
                    <div className="space-y-1">
                      {result.complications.map((c, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs px-2 py-1 rounded" style={{ background: '#FF8C0010' }}>
                          <span className="text-[9px] font-mono mt-0.5 flex-shrink-0" style={{ color: '#FF8C00' }}>•</span>
                          <span style={{ color: text1 }}>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mission modifiers */}
                {result.modifiers?.length > 0 && (
                  <div>
                    <button className="flex items-center gap-2 w-full mb-2" onClick={() => setShowModifiers(m => !m)}>
                      <Sparkles className="h-3.5 w-3.5" style={{ color: '#FFC857' }} />
                      <span className="text-[9px] font-mono tracking-widest" style={{ color: '#FFC857' }}>MISSION MODIFIERS ({result.modifiers.length})</span>
                      {showModifiers ? <ChevronUp className="h-3 w-3 ml-auto" style={{ color: muted }} /> : <ChevronDown className="h-3 w-3 ml-auto" style={{ color: muted }} />}
                    </button>
                    {showModifiers && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {result.modifiers.map((m, i) => (
                          <div key={i} className="p-2 rounded-lg border" style={{ background: panel1, borderColor: '#FFC85730' }}>
                            <div className="text-[9px] font-mono font-bold mb-0.5" style={{ color: '#FFC857' }}>{m.name}</div>
                            <div className="text-[10px]" style={{ color: text1 }}>{m.effect}</div>
                            {m.severity && <div className="text-[8px] font-mono mt-1" style={{ color: muted }}>SEVERITY: {m.severity?.toUpperCase()}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Recommended loadout */}
                {result.recommended_loadout && (
                  <div>
                    <button className="flex items-center gap-2 w-full mb-2" onClick={() => setShowLoadout(l => !l)}>
                      <Package className="h-3.5 w-3.5" style={{ color: '#5CCFFF' }} />
                      <span className="text-[9px] font-mono tracking-widest" style={{ color: '#5CCFFF' }}>RECOMMENDED LOADOUT</span>
                      {showLoadout ? <ChevronUp className="h-3 w-3 ml-auto" style={{ color: muted }} /> : <ChevronDown className="h-3 w-3 ml-auto" style={{ color: muted }} />}
                    </button>
                    {showLoadout && (
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { key: 'primary_weapons', label: 'WEAPONS', color: '#FF8C00' },
                          { key: 'utility_items', label: 'UTILITY', color: '#5CCFFF' },
                          { key: 'recommended_powers', label: 'POWERS', color: accentA },
                          { key: 'avoid', label: 'AVOID', color: '#FF3B3B' },
                        ].map(({ key, label, color }) => result.recommended_loadout[key]?.length > 0 && (
                          <div key={key} className="p-2 rounded-lg border" style={{ background: panel1, borderColor: color + '25' }}>
                            <div className="text-[8px] font-mono tracking-widest mb-1.5" style={{ color }}>{label}</div>
                            {result.recommended_loadout[key].map((item, i) => (
                              <div key={i} className="text-[10px] flex items-center gap-1" style={{ color: text1 }}>
                                <span style={{ color }}>›</span> {item}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Operative suggestions */}
                {result.operative_suggestions?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Shield className="h-3.5 w-3.5" style={{ color: accentA }} />
                      <span className="text-[9px] font-mono tracking-widest" style={{ color: accentA }}>OPERATIVE RECOMMENDATIONS</span>
                    </div>
                    <div className="space-y-1.5">
                      {result.operative_suggestions.map((s, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 rounded-lg" style={{ background: panel1 }}>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-mono font-bold" style={{ color: text0 }}>{s.name}</span>
                            <span className="text-[9px] font-mono ml-2" style={{ color: accentA }}>{s.role}</span>
                            <p className="text-[10px] mt-0.5" style={{ color: text1 }}>{s.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rewards */}
                {(result.reward_xp || result.reward_credits) && (
                  <div className="flex gap-3">
                    {result.reward_xp > 0 && <span className="text-xs font-mono px-2 py-1 rounded" style={{ background: '#FFC85720', color: '#FFC857' }}>⭐ {result.reward_xp} XP</span>}
                    {result.reward_credits > 0 && <span className="text-xs font-mono px-2 py-1 rounded" style={{ background: '#00D1B220', color: '#00D1B2' }}>💳 {result.reward_credits} CR</span>}
                    {result.time_limit && <span className="text-xs font-mono px-2 py-1 rounded" style={{ background: accentA + '18', color: accentA }}>⏱ {result.time_limit}</span>}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex justify-between gap-2 px-5 py-4 border-t flex-shrink-0" style={{ borderColor: accentA + '20' }}>
          <div className="flex gap-2">
            {result && (
              <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono border"
                style={{ color: muted, borderColor: muted + '30' }}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'COPIED' : 'COPY'}
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs font-mono" style={{ color: muted, border: `1px solid ${muted}30` }}>CLOSE</button>
            {result && (
              <button onClick={handleApply} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-bold" style={{ background: accentA, color: '#000' }}>
                <Check className="h-3.5 w-3.5" /> APPLY TO FORM
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}