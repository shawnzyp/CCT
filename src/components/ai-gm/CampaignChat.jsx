import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, MessageSquare } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

export default function CampaignChat({ session_id, campaign_id, accentA, panel0, panel1, text0, text1, muted }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch messages
  useEffect(() => {
    const loadMessages = async () => {
      const msgs = await base44.entities.AIGameMessage.filter({
        session_id,
        channel: 'campaign'
      }, '-created_date', 50);
      setMessages(msgs);
    };
    loadMessages();
  }, [session_id]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsub = base44.entities.AIGameMessage.subscribe((event) => {
      if (event.type !== 'create' || event.data?.session_id !== session_id || event.data?.channel !== 'campaign') return;
      setMessages(prev => [...prev, event.data]);
    });
    return unsub;
  }, [session_id]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const user = await base44.auth.me();
    setLoading(true);

    try {
      // Add player message
      const playerMsg = await base44.entities.AIGameMessage.create({
        session_id,
        campaign_id,
        sender_id: user.email,
        sender_name: user.full_name,
        sender_type: 'player',
        message_type: 'chat',
        content: input,
        channel: 'campaign'
      });

      setMessages(prev => [...prev, playerMsg]);
      setInput('');

      // Get AI response
      const { data } = await base44.functions.invoke('aiGameMasterResponse', {
        session_id,
        player_message: input,
        channel: 'campaign',
        action_type: 'chat'
      });

      if (data?.success) {
        const aiMsg = await base44.entities.AIGameMessage.filter({ id: data.message_id });
        if (aiMsg.length) setMessages(prev => [...prev, aiMsg[0]]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full rounded-xl border" style={{ background: panel0, borderColor: accentA + '25' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: accentA + '15' }}>
        <MessageSquare className="h-4 w-4" style={{ color: accentA }} />
        <span className="text-[10px] font-mono tracking-widest uppercase font-bold" style={{ color: text0 }}>Campaign Chat</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-1"
            >
              <div className="flex items-baseline gap-2">
                <span className="text-[9px] font-mono font-bold" style={{ color: msg.sender_type === 'ai_gm' ? accentA : text1 }}>
                  {msg.sender_name}
                </span>
                <span className="text-[8px] font-mono" style={{ color: muted }}>
                  {new Date(msg.created_date).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-[10px] leading-relaxed" style={{ color: text1 }}>
                {msg.content}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-3 space-y-2" style={{ borderColor: accentA + '15' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Say something..."
          className="w-full px-3 py-2 rounded text-[10px] font-mono bg-[var(--cc-panel1)] text-[var(--cc-text0)] outline-none"
          disabled={loading}
        />
        <Button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          size="sm"
          className="w-full gap-2"
          style={{ background: accentA, color: '#000' }}
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
          {loading ? 'GM Thinking...' : 'Send'}
        </Button>
      </div>
    </div>
  );
}