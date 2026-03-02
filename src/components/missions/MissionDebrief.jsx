import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Loader2, X, FileText, Copy, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';

export default function MissionDebrief({ mission, onClose, colors = {} }) {
  const { accentA = '#00E5FF', panel0 = '#1A1F26', panel1 = '#202833', text0 = '#E6F1FF', text1 = '#8EA0B5', muted = '#5F6E80' } = colors;

  const [debrief, setDebrief] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      let charContext = '';
      try {
        const c = JSON.parse(localStorage.getItem('currentCharacter') || 'null');
        if (c) charContext = `Operative: ${c.name} (Level ${c.level} ${c.classification})`;
      } catch {}

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are A.E.G.I.S., writing a post-mission debrief for Catalyst Core (superhero TTRPG, NYC 2036).

MISSION DATA:
Title: ${mission.title}
Objective: ${mission.objective || 'Unspecified'}
Difficulty: ${mission.difficulty}
Status: ${mission.status}
Location: ${mission.location || 'Unknown'}
Reward XP: ${mission.reward_xp || 0}
Reward Credits: ${mission.reward_credits || 0}
${charContext ? `\n${charContext}` : ''}
${mission.description ? `\nBriefing: ${mission.description}` : ''}

Write a short debrief report (3-5 paragraphs) in A.E.G.I.S. tactical voice. Include: mission recap, key moments (invent plausible ones), lessons learned, and a closing note on the operative's performance. Use markdown headers and keep it punchy. End with a clearance classification stamp.`,
      });

      setDebrief(result);
    } catch {
      setDebrief('// DEBRIEF GENERATION FAILED — SIGNAL CORRUPTED');
    } finally {
      setLoading(false);
    }
  };

  const copyDebrief = () => {
    navigator.clipboard.writeText(debrief);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg rounded-xl border overflow-hidden flex flex-col"
        style={{ background: panel0, borderColor: accentA + '30', maxHeight: '80vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: accentA + '20' }}>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" style={{ color: accentA }} />
            <span className="font-mono font-bold tracking-widest text-sm" style={{ color: text0 }}>MISSION DEBRIEF</span>
          </div>
          <button onClick={onClose}><X className="h-4 w-4" style={{ color: muted }} /></button>
        </div>

        {/* Mission title */}
        <div className="px-5 py-3 flex-shrink-0 border-b" style={{ borderColor: accentA + '10' }}>
          <p className="text-xs font-mono" style={{ color: muted }}>OPERATION:</p>
          <p className="text-sm font-mono font-bold mt-0.5" style={{ color: accentA }}>{mission.title}</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {!debrief && !loading && (
            <div className="text-center py-10">
              <Bot className="h-12 w-12 mx-auto mb-3 opacity-40" style={{ color: 'rgba(167,139,250,0.7)' }} />
              <p className="text-sm font-mono mb-4" style={{ color: muted }}>A.E.G.I.S. will generate a debrief report for this operation.</p>
              <button onClick={generate}
                className="px-5 py-2.5 rounded-lg text-xs font-mono font-bold border transition-all hover:opacity-80"
                style={{ color: 'rgba(167,139,250,0.9)', borderColor: 'rgba(139,92,246,0.5)', background: 'rgba(109,40,217,0.12)' }}>
                GENERATE DEBRIEF
              </button>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-10 gap-2">
              <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'rgba(167,139,250,0.7)' }} />
              <span className="text-xs font-mono" style={{ color: muted }}>Compiling field data...</span>
            </div>
          )}

          {debrief && !loading && (
            <div>
              <ReactMarkdown className="prose prose-sm prose-invert max-w-none text-xs leading-relaxed">
                {debrief}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {debrief && (
          <div className="flex justify-end gap-2 px-5 py-3 border-t flex-shrink-0" style={{ borderColor: accentA + '15' }}>
            <button onClick={generate} className="px-3 py-1.5 rounded text-xs font-mono border" style={{ color: muted, borderColor: muted + '30' }}>
              Regenerate
            </button>
            <button onClick={copyDebrief}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono"
              style={{ background: accentA, color: '#000' }}>
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? 'Copied' : 'Copy Report'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}