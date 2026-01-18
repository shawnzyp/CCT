import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function SessionLog({ sessionLog = [], onAddMessage, currentCharacter }) {
  const [message, setMessage] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [sessionLog]);

  const handleSend = () => {
    if (!message.trim() || !currentCharacter) return;
    
    onAddMessage({
      character_id: currentCharacter.id,
      character_name: currentCharacter.name,
      message: message.trim(),
      timestamp: new Date().toISOString()
    });
    setMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!currentCharacter) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="py-12 text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400">Select a character to join the session</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-violet-400" />
          Session Log
          <Badge variant="outline" className="ml-auto text-violet-400">
            Playing as {currentCharacter.name}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages */}
        <ScrollArea ref={scrollRef} className="h-96 pr-4">
          <div className="space-y-3">
            <AnimatePresence>
              {sessionLog.map((entry, index) => {
                const isCurrentPlayer = entry.character_id === currentCharacter.id;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`flex ${isCurrentPlayer ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${isCurrentPlayer ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${isCurrentPlayer ? 'text-violet-400' : 'text-slate-400'}`}>
                          {entry.character_name}
                        </span>
                        <span className="text-xs text-slate-600">
                          {format(new Date(entry.timestamp), 'HH:mm')}
                        </span>
                      </div>
                      <div className={`rounded-2xl px-4 py-2 ${
                        isCurrentPlayer 
                          ? 'bg-violet-500 text-white' 
                          : 'bg-slate-700 text-slate-200'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{entry.message}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message... (Shift+Enter for new line)"
            className="bg-slate-900 border-slate-700 text-white resize-none"
            rows={2}
          />
          <Button 
            onClick={handleSend}
            disabled={!message.trim()}
            className="bg-violet-600 hover:bg-violet-700 shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}