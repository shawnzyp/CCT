import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, User } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';
import useSoundEffects from '@/components/sounds/useSoundEffects';

export default function NPCRoleplayModal({ npc, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `*${npc.name} looks up as you approach.*\n\n"..."`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const { play } = useSoundEffects();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // Opening line from NPC on mount
  useEffect(() => {
    generateOpening();
  }, []);

  const generateOpening = async () => {
    setLoading(true);
    try {
      const charContext = (() => {
        try { const c = JSON.parse(localStorage.getItem('currentCharacter') || 'null'); return c ? `The player's operative is ${c.name} (${c.classification}).` : ''; } catch { return ''; }
      })();

      const opener = await base44.integrations.Core.InvokeLLM({
        prompt: `You are roleplaying as ${npc.name}, an NPC in a superhero TTRPG (Catalyst Core) set in NYC 2036.

NPC PROFILE:
Name: ${npc.name}
Role: ${npc.role}
Description: ${npc.description || 'No description.'}
Personality: ${npc.personality || 'Unknown.'}
Motivation: ${npc.motivation || 'Unknown.'}
${npc.ai_prompt ? `Additional instructions: ${npc.ai_prompt}` : ''}

${charContext}

Generate a short opening line (1-2 sentences) as this NPC greeting the operative. Stay in character. No quotes needed around the dialogue.`,
      });
      setMessages([{ role: 'assistant', content: opener }]);
    } catch {
      setMessages([{ role: 'assistant', content: `*${npc.name} nods cautiously.* "What do you want?"` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput('');

    const updated = [...messages, { role: 'user', content: msg }];
    setMessages(updated);
    setLoading(true);
    play('navigate', 0.15);

    try {
      const historyText = updated.slice(-8, -1).map(m => `${m.role === 'user' ? 'OPERATIVE' : npc.name.toUpperCase()}: ${m.content}`).join('\n');

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are roleplaying as ${npc.name} in Catalyst Core TTRPG (NYC 2036).

NPC: ${npc.name} | Role: ${npc.role} | Personality: ${npc.personality || 'Unknown'} | Motivation: ${npc.motivation || 'Unknown'}
${npc.ai_prompt ? `Persona instructions: ${npc.ai_prompt}` : ''}

CONVERSATION HISTORY:
${historyText}

OPERATIVE SAYS: "${msg}"

Respond as ${npc.name}. Stay in character. 1-3 sentences. No quotes around dialogue. Can include brief action descriptions in *asterisks*.`,
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      play('success', 0.1);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '*No response.*' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        className="w-full sm:max-w-md flex flex-col rounded-t-2xl sm:rounded-2xl overflow-hidden"
        style={{ background: '#1A1F26', border: '1.5px solid rgba(139,92,246,0.4)', maxHeight: '75vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(139,92,246,0.2)', background: 'linear-gradient(180deg, rgba(109,40,217,0.15) 0%, transparent 100%)' }}>
          <div className="flex items-center gap-2">
            {npc.portrait_url
              ? <img src={npc.portrait_url} alt={npc.name} className="w-8 h-8 rounded-full object-cover border border-violet-500/50" />
              : <div className="w-8 h-8 rounded-full bg-violet-800/60 flex items-center justify-center"><User className="h-4 w-4 text-violet-300" /></div>
            }
            <div>
              <div className="text-xs font-mono font-bold text-violet-300">{npc.name}</div>
              <div className="text-[9px] font-mono text-violet-500 uppercase tracking-widest">{npc.role}</div>
            </div>
          </div>
          <button onClick={onClose} className="cc-sm-target h-7 w-7 min-h-0 min-w-0 flex items-center justify-center rounded-lg hover:bg-violet-500/20 transition-colors">
            <X className="h-4 w-4 text-violet-300" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${
                msg.role === 'user' ? 'bg-violet-700 text-white' : 'bg-slate-800 text-slate-200 border border-slate-700'
              }`}>
                <ReactMarkdown className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">
                <Loader2 className="h-3 w-3 animate-spin text-violet-400" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex-shrink-0 p-3 border-t" style={{ borderColor: 'rgba(139,92,246,0.2)', background: '#0F1216' }}>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder={`Say something to ${npc.name}...`}
              className="flex-1 px-3 py-2 rounded-lg text-xs font-mono outline-none"
              style={{ background: '#1A1F26', color: '#E6F1FF', border: '1px solid rgba(139,92,246,0.3)' }}
              disabled={loading}
            />
            <button onClick={handleSend} disabled={loading || !input.trim()}
              className="w-8 h-8 min-h-0 min-w-0 flex items-center justify-center rounded-lg disabled:opacity-40 transition-all flex-shrink-0"
              style={{ background: 'rgba(109,40,217,0.7)' }}>
              {loading ? <Loader2 className="h-3 w-3 animate-spin text-white" /> : <Send className="h-3 w-3 text-white" />}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}