import React, { useState } from 'react';
import { Bot, Loader2, Sparkles, Swords, BarChart2, Scroll, Copy, Check, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

const TOOLS = [
  { id: 'plot_hook', label: 'Suggest Plot Hooks', icon: Sparkles, color: '#a78bfa', desc: '3 narrative hooks based on campaign state' },
  { id: 'balance', label: 'Balance Encounter', icon: Swords, color: '#f87171', desc: 'Enemy composition for your party tier' },
  { id: 'faction_report', label: 'Faction Report', icon: BarChart2, color: '#34d399', desc: 'Faction standing summary across characters' },
  { id: 'session_brief', label: 'Session Brief', icon: Scroll, color: '#fbbf24', desc: 'Opening narration for next session' },
];

export default function AIDirectorPanel() {
  const [activeTool, setActiveTool] = useState(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: campaigns = [] } = useQuery({ queryKey: ['campaigns'], queryFn: () => base44.entities.Campaign.list('-updated_date', 3) });
  const { data: characters = [] } = useQuery({ queryKey: ['characters'], queryFn: () => base44.entities.Character.list('-created_date') });

  const buildCampaignContext = () => {
    const c = campaigns[0];
    if (!c) return 'No active campaign.';
    const quests = (c.quests || []).filter(q => q.status === 'active');
    return `Campaign: ${c.name} | Status: ${c.status} | Active Quests: ${quests.map(q => q.title).join(', ') || 'None'}`;
  };

  const buildPartyContext = () => {
    if (!characters.length) return 'No characters.';
    return characters.slice(0, 6).map(c => `${c.name} (Tier ${c.tier}, Lvl ${c.level}, ${c.classification})`).join(' | ');
  };

  const run = async (toolId) => {
    setActiveTool(toolId);
    setResult('');
    setLoading(true);

    const campaignCtx = buildCampaignContext();
    const partyCtx = buildPartyContext();

    const prompts = {
      plot_hook: `You are an AI Game Director for Catalyst Core (superhero TTRPG, NYC 2036).
Campaign: ${campaignCtx}
Party: ${partyCtx}

Suggest 3 compelling plot hooks for the next session. Each hook should be 2-3 sentences, with a title and a dramatic setup. Format with markdown headers. Make them specific to NYC 2036 and superhero themes.`,

      balance: `You are an AI encounter designer for Catalyst Core (superhero TTRPG).
Party: ${partyCtx}

Design a balanced combat encounter for this party. Include: enemy types (2-4 enemies), their approximate HP/TC/attacks, tactical positioning suggestions, and a dramatic narrative setup. Use markdown formatting.`,

      faction_report: `You are A.E.G.I.S. generating a faction intelligence report for Catalyst Core.
Campaign: ${campaignCtx}
Characters: ${partyCtx}

Generate a faction standing report. List 4 major factions (O.M.N.I., PFV, Greyline Syndicate, Cosmic Conclave), rate each from 1-10 on how they'd view this party based on context, and give one-line intel on their current agenda. Use markdown table format.`,

      session_brief: `You are the narrative voice of A.E.G.I.S. for Catalyst Core (superhero TTRPG, NYC 2036).
Campaign: ${campaignCtx}
Party: ${partyCtx}

Write a dramatic opening narration for the next game session (3-4 paragraphs). Set the scene in NYC 2036, establish tension, reference the party's current situation, and end with a call to action that hooks the players. Second-person address ("You are..."). Use markdown.`,
    };

    try {
      const response = await base44.integrations.Core.InvokeLLM({ prompt: prompts[toolId] });
      setResult(response);
    } catch {
      setResult('// ERROR — A.I. Director offline. Retry.');
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Tool buttons */}
      <div className="grid grid-cols-2 gap-3">
        {TOOLS.map(tool => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button key={tool.id} onClick={() => run(tool.id)} disabled={loading}
              className="flex items-start gap-3 p-3 rounded-xl border text-left transition-all hover:opacity-80 disabled:opacity-40"
              style={{
                background: isActive ? tool.color + '15' : 'rgba(30,36,46,0.8)',
                borderColor: isActive ? tool.color + '60' : 'rgba(139,92,246,0.2)',
              }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: tool.color + '20' }}>
                <Icon className="h-4 w-4" style={{ color: tool.color }} />
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-white">{tool.label}</div>
                <div className="text-[10px] mt-0.5" style={{ color: '#5F6E80' }}>{tool.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Result panel */}
      <AnimatePresence>
        {(loading || result) && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-xl border p-4"
            style={{ background: '#1A1F26', borderColor: 'rgba(139,92,246,0.3)' }}>
            {loading ? (
              <div className="flex items-center gap-2 py-4">
                <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
                <span className="text-xs font-mono text-slate-400">A.I. Director processing...</span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono text-violet-400 uppercase tracking-widest">
                    {TOOLS.find(t => t.id === activeTool)?.label}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => run(activeTool)} className="cc-sm-target h-6 w-6 min-h-0 min-w-0 flex items-center justify-center rounded hover:opacity-70">
                      <RefreshCw className="h-3 w-3 text-slate-400" />
                    </button>
                    <button onClick={copy} className="cc-sm-target h-6 w-6 min-h-0 min-w-0 flex items-center justify-center rounded hover:opacity-70">
                      {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3 text-slate-400" />}
                    </button>
                  </div>
                </div>
                <div className="text-xs">
                  <ReactMarkdown className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0">{result}</ReactMarkdown>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}