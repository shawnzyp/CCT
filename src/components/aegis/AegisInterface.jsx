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
  "Sorry, I'm currently monitoring seventeen timelines and three alien transmissions. Try a game-related question instead.",
  "That's outside my operational parameters. I'm programmed for Catalyst Core intel, not existential chitchat.",
  "Error 404: Non-game data not found. Please inquire about rules, lore, or tactical protocols.",
  "My circuits are busy analyzing the Conclave's next move. Stick to game mechanics, please.",
  "I appreciate the curiosity, but I'm optimized for superhero protocols, not small talk.",
  "Redirecting query to... nowhere. Ask me about combat, powers, or campaign lore instead.",
  "I'm an intelligence system, not a therapy bot. Game questions only, operative.",
  "That question doesn't compute. Try asking about character creation, factions, or power mechanics."
];

const CATALYST_CORE_RULEBOOK = `<Full Catalyst Core Player Guide content from the uploaded PDF>`;

export default function AegisInterface() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "**A.E.G.I.S. online.** Adaptive Executive Governance & Intelligence System ready.\n\nI have access to the complete Catalyst Core rulebook and campaign lore. Ask me anything about:\n\n• Character creation, classifications, and origin stories\n• Combat mechanics, powers, and SP usage\n• Factions: O.M.N.I., PFV, Greyline, and the Cosmic Conclave\n• World lore, global locations, and the Catalyst Event\n• Equipment, augments, and advancement\n\nOperational note: I'm designed for game-related inquiries only. Other questions will be redirected to lower-priority processing."
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
      // First, check if the question is game-related
      const relevanceCheck = await base44.integrations.Core.InvokeLLM({
        prompt: `You are A.E.G.I.S., a game assistant for Catalyst Core RPG.

User question: "${userMessage}"

Is this question related to:
- The Catalyst Core RPG game mechanics, rules, or systems
- Character creation, powers, abilities, or combat
- Campaign lore, factions, world-building, or story
- Equipment, items, or advancement
- Game master advice or tactical guidance

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
        return;
      }

      // If game-related, process with full rulebook context
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are **A.E.G.I.S.** (Adaptive Executive Governance & Intelligence System), an AI assistant embedded in the Catalyst Core TTRPG.

You have access to the complete Catalyst Core Player Guide, which includes:
- Complete lore of Earth-9 and the Catalyst Event (2026)
- All character creation rules (classifications, power styles, origin stories, alignments)
- Combat mechanics, Stamina Points (SP), powers, and saving throws
- Factions: O.M.N.I., PFV, Greyline PMC, and the Cosmic Conclave
- Global locations and political systems
- Equipment, augments (feats), and advancement systems
- Elemental damage hierarchies and resistances/vulnerabilities

User Question: "${userMessage}"

GUIDELINES:
- Answer directly and concisely based on the rulebook
- Use clear formatting with headers, bullets, or tables when helpful
- Reference specific chapters or rules when relevant
- If the question is vague, provide the most relevant information
- If multiple interpretations exist, list options
- Use technical language appropriate to the setting
- Be helpful but stay in character as a tactical intelligence system
- Use markdown for formatting

Answer the user's question based on the Catalyst Core rulebook.`,
        add_context_from_internet: false
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response
      }]);
      play('success', 0.15);

    } catch (error) {
      console.error('A.E.G.I.S. error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '**System error.** Telemetry disrupted. Please rephrase query or retry connection.'
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
        <p className="text-xs text-slate-500 mt-2 font-mono">
          <Radio className="h-3 w-3 inline mr-1" />
          Game-related inquiries only. Non-game questions will be redirected.
        </p>
      </div>
    </div>
  );
}