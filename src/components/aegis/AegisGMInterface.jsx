import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import useSoundEffects from '@/components/sounds/useSoundEffects';

const QUICK_PROMPTS = [
  'Narrate our current scene',
  'Describe a random NPC encounter',
  'Suggest a plot twist',
  'Generate a combat event',
];

export default function AegisGMInterface({ initialPrompt, onPromptConsumed }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'A.I. Director online. Feed me context — scene, party state, objective — and I will narrate. What is happening?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const { play } = useSoundEffects();

  useEffect(() => {
    if (initialPrompt) {
      setInput(initialPrompt);
      onPromptConsumed?.();
    }
  }, [initialPrompt]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const buildContext = () => {
    try {
      const char = JSON.parse(localStorage.getItem('currentCharacter') || 'null');
      if (!char) return '';
      return `Active operative: ${char.name} | Level ${char.level} ${char.classification} | HP: ${char.current_hp}/${char.max_hp} | SP: ${char.current_sp}/${char.max_sp}`;
    } catch { return ''; }
  };

  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');

    const history = [...messages, { role: 'user', content: msg }];
    setMessages(history);
    setLoading(true);
    play('navigate', 0.2);

    try {
      const context = buildContext();
      const historyText = history.slice(-6, -1).map(m => `${m.role === 'user' ? 'PLAYER' : 'GM'}: ${m.content}`).join('\n');

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI Game Master (A.I. Director) for Catalyst Core, a superhero TTRPG set in NYC 2036.

STYLE: Immersive, cinematic, second-person narration. Short punchy paragraphs. Describe action consequences with stakes.
${context ? `\nCURRENT OPERATIVE CONTEXT:\n${context}` : ''}
${historyText ? `\nPRIOR EXCHANGE:\n${historyText}` : ''}

PLAYER INPUT: "${msg}"

Respond as GM. Drive the narrative forward. 2-4 sentences max unless the player asks for detail.`,
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      play('success', 0.12);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Transmission lost. Rerouting...' }]);
      play('error', 0.2);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Quick prompts */}
      <div className="flex-shrink-0 px-3 pt-2 flex flex-wrap gap-1">
        {QUICK_PROMPTS.map(qp => (
          <button key={qp} onClick={() => handleSend(qp)}
            className="text-[9px] font-mono px-2 py-0.5 rounded border hover:opacity-80 transition-all"
            style={{ color: 'rgba(167,139,250,0.8)', borderColor: 'rgba(139,92,246,0.3)', background: 'rgba(109,40,217,0.08)' }}>
            {qp}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div className={`max-w-[88%] rounded-lg p-2.5 text-xs ${
              msg.role === 'user'
                ? 'bg-violet-700 text-white'
                : 'bg-slate-800 text-slate-200 border border-slate-700'
            }`}>
              {msg.role === 'assistant'
                ? <ReactMarkdown className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">{msg.content}</ReactMarkdown>
                : <p>{msg.content}</p>}
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-2.5 flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin text-violet-400" />
              <span className="text-[10px] text-slate-400 font-mono">GM narrating...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-slate-700 p-3" style={{ background: '#0F1216' }}>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Describe your action or ask the GM..."
            className="flex-1 px-3 py-2 rounded-lg text-xs font-mono outline-none"
            style={{ background: '#1A1F26', color: '#E6F1FF', border: '1px solid rgba(139,92,246,0.3)' }}
            disabled={loading}
          />
          <button onClick={() => handleSend()} disabled={loading || !input.trim()}
            className="w-8 h-8 min-h-0 min-w-0 flex items-center justify-center rounded-lg disabled:opacity-40 transition-all"
            style={{ background: 'rgba(109,40,217,0.7)' }}>
            {loading ? <Loader2 className="h-3 w-3 animate-spin text-white" /> : <Send className="h-3 w-3 text-white" />}
          </button>
        </div>
      </div>
    </div>
  );
}