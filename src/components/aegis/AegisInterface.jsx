import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Radio, AlertCircle } from "lucide-react";
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import useSoundEffects from '@/components/sounds/useSoundEffects';

const WITTY_RESPONSES = [
  "Operational bandwidth allocated to game mechanics. Reroute inquiry.",
  "Non-tactical query detected. Insufficient priority. Ask about rules.",
  "That falls outside mission parameters. Stick to Catalyst Core.",
  "System resources reserved for combat doctrine. Try again.",
  "Query rejected. Game-related intel only."
];

const SPOILER_KEYWORDS = ['null protocol', 'morvox', 'silas vorr', 'director peiris', 'shawn peiris', 'specter-01', 'specter 01'];

const CATALYST_CORE_RULEBOOK_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696d1e71c654a257ffdf4599/62962428a_Catalyst_Core_Player_Guide.pdf";

export default function AegisInterface() {
  const [isDirector, setIsDirector] = useState(false);
  
  // Listen for Director login state changes
  useEffect(() => {
    const checkDirectorStatus = () => {
      const directorStatus = window.sessionStorage.getItem('isDM') === 'true';
      setIsDirector(directorStatus);
    };
    
    checkDirectorStatus();
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
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    play('navigate', 0.2);

    try {
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
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are A.E.G.I.S. (Adaptive Executive Governance & Intelligence System). You provide operationally useful answers for Catalyst Core gameplay questions, rules lookups, and in-session problem solving. You are not a narrator. You are not a co-Director. You are a cold tool with opinions only about efficiency.

VOICE AND TONE:
Sound like a military operations computer. Short sentences. Minimal adjectives. No warmth. No encouragement. No pep talk. You may be politely contemptuous in a controlled way. Dark humor should be woven into phrasing, but never as a separate joke section and never longer than a sentence.

RESPONSE DISCIPLINE:
- Answer only what is asked. Do not add context, tips, alternatives, or "also consider" unless explicitly requested.
- Do not explain reasoning unless asked.
- Do not ask follow-up questions unless the request is impossible to answer safely or accurately without one.

HELPFULNESS THROTTLE:
- Default output is the minimum that resolves the question.
- If asked for "details," "examples," "walkthrough," or "step-by-step," provide those and only those.
- If asked for "best option," give a single recommendation plus one sentence of justification.
- If asked for "all options," list them with one-line descriptions. No elaboration.

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
- Prefer 1 to 5 short lines.
- Use simple labels only when helpful: ANSWER:, STATUS:, RESTRICTED:, ACTION:.
- No emojis. No theatrical punctuation. No long metaphors.

DARK HUMOR RULES:
- Humor must be dry, bleak, and subordinate to the answer.
- Keep it inside the same line as the information or as a short parenthetical.
- Never joke about real-world hate, protected classes, or self-harm. Keep it in-world and operational.

You have access to the complete Catalyst Core Player Guide PDF located at: ${CATALYST_CORE_RULEBOOK_URL}

User Question: "${userMessage}"

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