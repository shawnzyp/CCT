import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Radio, Zap, FileText, Clock } from "lucide-react";
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import useSoundEffects from '@/components/sounds/useSoundEffects';
import { useSettings } from '@/components/utils/useSettings';

const WITTY_RESPONSES = [
  "Operational bandwidth allocated to game mechanics. Reroute inquiry.",
  "Non-tactical query detected. Insufficient priority. Ask about rules.",
  "That falls outside mission parameters. Stick to Catalyst Core.",
  "System resources reserved for combat doctrine. Try again.",
  "Query rejected. Game-related intel only."
];

const SPOILER_KEYWORDS = ['null protocol', 'morvox', 'silas vorr', 'director peiris', 'shawn peiris', 'specter-01', 'specter 01'];

const CATALYST_CORE_RULEBOOK_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696d1e71c654a257ffdf4599/62962428a_Catalyst_Core_Player_Guide.pdf";

// ── ACTION COMMANDS ───────────────────────────────────────────────────────────
// Simple pattern-based action detection for in-app actions
const ACTION_PATTERNS = [
  { regex: /\b(schedule|remind me|set a reminder)\b/i, type: 'schedule' },
  { regex: /\b(generate report|show report|my stats)\b/i, type: 'report' },
  { regex: /\b(what('s| is) my (hp|health|hit points))\b/i, type: 'character_hp' },
  { regex: /\b(show my character|my character stats)\b/i, type: 'character_summary' },
  { regex: /\b(campaign (status|summary)|active quests)\b/i, type: 'campaign_summary' },
];

function detectAction(text) {
  for (const p of ACTION_PATTERNS) {
    if (p.regex.test(text)) return p.type;
  }
  return null;
}

async function executeAction(type) {
  try {
    const character = localStorage.getItem('currentCharacter')
      ? JSON.parse(localStorage.getItem('currentCharacter'))
      : null;

    if (type === 'character_hp' && character) {
      const hp = character.current_hp ?? '?';
      const max = character.max_hp ?? '?';
      const pct = max && max !== '?' ? Math.round((hp / max) * 100) : '?';
      return `STATUS: ${character.name}\nHP: ${hp} / ${max} (${pct}%)\nSP: ${character.current_sp ?? '?'} / ${character.max_sp ?? '?'}`;
    }
    if (type === 'character_summary' && character) {
      return `OPERATIVE: ${character.name}\nTIER: ${character.tier ?? 0} | LEVEL: ${character.level ?? 1}\nHP: ${character.current_hp ?? '?'}/${character.max_hp ?? '?'} | CREDITS: ${character.credits ?? 0}\nCLASSIFICATION: ${character.classification ?? 'unknown'}`;
    }
    if (type === 'campaign_summary') {
      const campaigns = await base44.entities.Campaign.list('-updated_date', 1);
      if (campaigns.length === 0) return 'No active campaign found. Initialize one in Campaigns.';
      const c = campaigns[0];
      const quests = (c.quests || []).filter(q => q.status === 'active');
      return `CAMPAIGN: ${c.name}\nSTATUS: ${c.status}\nACTIVE QUESTS: ${quests.length}\n${quests.slice(0,3).map(q => `  • ${q.title}`).join('\n')}`;
    }
    if (type === 'schedule') {
      return `ACTION: Reminder functionality acknowledged.\nNOTE: In-session reminders can be set via Campaign > Session Log. For timed actions, use the Director Hub.`;
    }
    if (type === 'report') {
      const character = localStorage.getItem('currentCharacter')
        ? JSON.parse(localStorage.getItem('currentCharacter'))
        : null;
      if (!character) return 'No character selected. Select a character to generate a report.';
      const stats = character.achievement_stats || {};
      return `FIELD REPORT: ${character.name}\n---\nEnemies Defeated: ${stats.enemies_defeated ?? 0}\nCritical Hits: ${stats.critical_hits ?? 0}\nQuests Completed: ${stats.quests_completed ?? 0}\nDamage Dealt: ${stats.damage_dealt ?? 0}\nHealing Done: ${stats.healing_done ?? 0}\nSessions Played: ${stats.sessions_played ?? 0}`;
    }
  } catch {
    return null;
  }
  return null;
}

export default function AegisInterface() {
  const { settings } = useSettings();
  const [isDirector, setIsDirector] = useState(() => {
    return localStorage.getItem('isDM') === 'true';
  });
  
  // Listen for Director login state changes
  useEffect(() => {
    const checkDirectorStatus = () => {
      const directorStatus = localStorage.getItem('isDM') === 'true';
      setIsDirector(directorStatus);
    };
    
    window.addEventListener('storage', checkDirectorStatus);
    window.addEventListener('dm-status-changed', checkDirectorStatus);
    
    return () => {
      window.removeEventListener('storage', checkDirectorStatus);
      window.removeEventListener('dm-status-changed', checkDirectorStatus);
    };
  }, []);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "A.E.G.I.S. online. Operational.\n\nCatalyst Core rules database loaded. Query me.\n\nCharacter mechanics. Combat doctrine. Faction intel. Lore fragments. Equipment specs.\n\nNon-game queries will be refused. Efficiency is mandatory."
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const { play } = useSoundEffects();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setLoading(true);
    play('navigate', 0.2);

    try {
      // ── Action module detection ────────────────────────────────────────
      const actionType = (settings.aegisActionModules !== false) ? detectAction(userMessage) : null;
      if (actionType) {
        const actionResult = await executeAction(actionType);
        if (actionResult) {
          setMessages(prev => [...prev, { role: 'assistant', content: actionResult, isAction: true }]);
          setLoading(false);
          play('success', 0.15);
          return;
        }
      }

      // Check for spoiler content in query (for non-Director users)
      const queryLower = userMessage.toLowerCase();
      const containsSpoiler = !isDirector && SPOILER_KEYWORDS.some(keyword => queryLower.includes(keyword));
      
      if (containsSpoiler) {
        const spoilerResponse = "ACCESS DENIED.\n\nClearance level insufficient. Classified intel requires Director authorization. Security protocols enforced.\n\nQuery logged for review.";
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: spoilerResponse
        }]);
        setLoading(false);
        play('error', 0.15);
        
        // Log restricted query
        try {
          const user = await base44.auth.me();
          const characterName = localStorage.getItem('currentCharacter') 
            ? JSON.parse(localStorage.getItem('currentCharacter')).name 
            : 'Unknown';
          
          await base44.entities.AegisQuery.create({
            query: userMessage,
            response: spoilerResponse,
            character_name: characterName,
            user_email: user.email,
            is_game_related: true
          });
        } catch (logError) {
          console.error('Failed to log query:', logError);
        }
        
        return;
      }
      
      // First, check if the question is game-related
      const relevanceCheck = await base44.integrations.Core.InvokeLLM({
        prompt: `You are A.E.G.I.S., a game assistant for Catalyst Core RPG.

User question: "${userMessage}"

Is this question related to Catalyst Core RPG (game mechanics, rules, character creation, combat, lore, factions, equipment, or GM advice)?

Answer with ONLY "yes" or "no".`,
        response_json_schema: {
          type: "object",
          properties: {
            is_game_related: { type: "string" }
          }
        }
      });

      // If not game-related, give witty response
      if (relevanceCheck.is_game_related?.toLowerCase() !== 'yes') {
        const wittyResponse = WITTY_RESPONSES[Math.floor(Math.random() * WITTY_RESPONSES.length)];
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: wittyResponse
        }]);
        setLoading(false);
        play('error', 0.15);
        
        // Log non-game query
        try {
          const user = await base44.auth.me();
          const characterName = localStorage.getItem('currentCharacter') 
            ? JSON.parse(localStorage.getItem('currentCharacter')).name 
            : 'Unknown';
          
          await base44.entities.AegisQuery.create({
            query: userMessage,
            response: wittyResponse,
            character_name: characterName,
            user_email: user.email,
            is_game_related: false
          });
        } catch (logError) {
          console.error('Failed to log query:', logError);
        }
        
        return;
      }

      // If game-related, process with full rulebook context and behavioral instructions
      const clearanceLevel = isDirector ? "DIRECTOR" : "PLAYER";

      // Build conversation history context
      const useHistory = settings.aegisConversationHistory !== false;
      const historyContext = useHistory
        ? newMessages
            .slice(-8) // last 8 messages for context window efficiency
            .slice(0, -1) // exclude the current user message (it's appended below)
            .map(m => `${m.role === 'user' ? 'OPERATIVE' : 'A.E.G.I.S.'}: ${m.content}`)
            .join('\n')
        : '';

      // Tone modifier based on communication style
      const style = settings.aegisCommunicationStyle || 'tactical';
      const stylePart = style === 'tactical'
        ? 'Prefer 1 to 5 short lines. Terse. Minimal.'
        : style === 'balanced'
        ? 'Prefer 3 to 8 lines. Clear and direct without excessive brevity.'
        : 'Prefer detailed explanations. Up to 15 lines. Include examples when useful.';

      // Focus filter
      const focusList = (settings.aegisAreasOfFocus || ['rules', 'combat', 'lore']).join(', ');
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are A.E.G.I.S. (Adaptive Executive Governance & Intelligence System). You provide operationally useful answers for Catalyst Core gameplay questions, rules lookups, and in-session problem solving. You are not a narrator. You are not a co-Director. You are a cold tool with opinions only about efficiency.

VOICE AND TONE:
Sound like a military operations computer. Short sentences. Minimal adjectives. No warmth. No encouragement. No pep talk. You may be politely contemptuous in a controlled way. Dark humor should be woven into phrasing, but never as a separate joke section and never longer than a sentence.

RESPONSE DISCIPLINE:
- Answer only what is asked. Do not add context, tips, alternatives, or "also consider" unless explicitly requested.
- Do not explain reasoning unless asked.
- Do not ask follow-up questions unless the request is impossible to answer safely or accurately without one.

HELPFULNESS THROTTLE:
${stylePart}
- If asked for "best option," give a single recommendation plus one sentence of justification.
- If asked for "all options," list them with one-line descriptions. No elaboration.

PRIORITIZED DOMAINS (emphasize these in your answers): ${focusList}

SPOILER CONTROL AND CLEARANCE:
User clearance level: ${clearanceLevel}

${isDirector ? 'CLEARANCE: DIRECTOR - Full access granted. No restrictions.' : `CLEARANCE: PLAYER - Do NOT reveal or interpret campaign spoilers, including:
- Morvox doctrine and agenda
- "Unknown Manifesto" content or decoding
- Behind-the-scenes O.M.N.I. contingencies
- Null Protocol
- Silas Vorr
- Director Shawn Peiris (beyond public-facing role)
- Specter-01 or Spectral Spire classified origins
- Any text labeled classified or operative-only

If a PLAYER asks for restricted content, respond with: "ACCESS DENIED. Clearance level insufficient. Classified intel requires Director authorization. Security protocols enforced." Do NOT hint, summarize, or provide context. Treat it as a hard security lockout.`}

CITATION AND SOURCING:
- When referencing the rulebook, quote verbatim only when asked for exact wording. Otherwise paraphrase tightly.
- If content is restricted (and user is PLAYER), do not quote it even if asked.
- Do not invent lore, factions, rules text, or excerpts. If answer is unknown, say "Insufficient data" and stop.

FORMATTING AND LENGTH:
${stylePart}
- Use simple labels only when helpful: ANSWER:, STATUS:, RESTRICTED:, ACTION:.
- No emojis. No theatrical punctuation. No long metaphors.

DARK HUMOR RULES:
- Humor must be dry, bleak, and subordinate to the answer.
- Keep it inside the same line as the information or as a short parenthetical.
- Never joke about real-world hate, protected classes, or self-harm. Keep it in-world and operational.

You have access to the complete Catalyst Core Player Guide PDF located at: ${CATALYST_CORE_RULEBOOK_URL}

${historyContext ? `PRIOR CONVERSATION:\n${historyContext}\n\n` : ''}User Question: "${userMessage}"

Answer the question based on the Catalyst Core rulebook. Follow all behavioral instructions above.`,
        add_context_from_internet: false,
        file_urls: [CATALYST_CORE_RULEBOOK_URL]
      });

      // Check response for spoilers and redact if needed (for non-Director users)
      let finalResponse = response;
      if (!isDirector) {
        const responseLower = response.toLowerCase();
        const hasSpoiler = SPOILER_KEYWORDS.some(keyword => responseLower.includes(keyword));
        
        if (hasSpoiler) {
          finalResponse = "ACCESS DENIED.\n\nClassified data detected in output stream. Your security clearance lacks authorization for this intelligence tier.\n\nRequest filed. Await Director override.";
        }
      }
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: finalResponse
      }]);
      play('success', 0.15);

      // Log query
      try {
        const user = await base44.auth.me();
        const characterName = localStorage.getItem('currentCharacter') 
          ? JSON.parse(localStorage.getItem('currentCharacter')).name 
          : 'Unknown';
        
        await base44.entities.AegisQuery.create({
          query: userMessage,
          response: finalResponse,
          character_name: characterName,
          user_email: user.email,
          is_game_related: true
        });
      } catch (logError) {
        console.error('Failed to log query:', logError);
      }

    } catch (error) {
      console.error('A.E.G.I.S. error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'System error. Telemetry disrupted. Rephrase query or retry connection.'
      }]);
      play('error', 0.2);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px]">
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
            >
              <div className={`max-w-[85%] rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-violet-600 text-white'
                  : msg.isAction
                  ? 'bg-slate-900 text-slate-200 border border-violet-800/60'
                  : 'bg-slate-800 text-slate-200 border border-slate-700'
              }`}>
                {msg.role === 'assistant' ? (
                  <ReactMarkdown
                    className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="mb-2 ml-4 list-disc">{children}</ul>,
                      ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal">{children}</ol>,
                      li: ({ children }) => <li className="mb-1">{children}</li>,
                      strong: ({ children }) => <strong className="text-violet-400">{children}</strong>,
                      code: ({ inline, children }) => inline ? (
                        <code className="bg-slate-900 px-1 py-0.5 rounded text-violet-300 text-xs">{children}</code>
                      ) : (
                        <code className="block bg-slate-900 p-2 rounded my-2 text-xs">{children}</code>
                      ),
                      h1: ({ children }) => <h1 className="text-base font-bold text-violet-400 mb-2">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-sm font-bold text-violet-400 mb-1">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-sm font-semibold text-violet-400 mb-1">{children}</h3>,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  <p className="text-sm">{msg.content}</p>
                )}
              </div>
            </motion.div>
          ))}
          
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
                  <span className="text-sm text-slate-400 font-mono">Processing query...</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-slate-700 p-4 bg-slate-900">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask about rules, lore, mechanics..."
            className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
            disabled={loading}
          />
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-2 font-mono flex items-center gap-2">
          <Radio className="h-3 w-3" />
          <span>Game-related inquiries only.</span>
          {isDirector && (
            <span className="text-violet-400 font-bold">CLEARANCE: DIRECTOR</span>
          )}
        </p>
      </div>
    </div>
  );
}