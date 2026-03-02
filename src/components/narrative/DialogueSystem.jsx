import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Users, MessageSquare, MessageCircle } from 'lucide-react';

export default function DialogueSystem() {
  const [selectedNPC, setSelectedNPC] = useState(null);
  const [dialogueHistory, setDialogueHistory] = useState([]);

  const { data: npcs = [], isLoading } = useQuery({
    queryKey: ['npcs'],
    queryFn: () => base44.entities.NPC.list(),
    staleTime: 10 * 60 * 1000
  });

  const handleTalkToNPC = (npc) => {
    setSelectedNPC(npc);
    setDialogueHistory([
      {
        type: 'npc',
        text: npc.dialogue_options?.[0] || `Hello there! I'm ${npc.name}.`,
        npcName: npc.name
      }
    ]);
  };

  const handleDialogueChoice = (choice) => {
    setDialogueHistory([
      ...dialogueHistory,
      { type: 'player', text: choice },
      {
        type: 'npc',
        text: `That's interesting. Let me think about that...`,
        npcName: selectedNPC.name
      }
    ]);
  };

  const dialogueOptions = [
    'Tell me about yourself',
    'What do you know about this place?',
    'Can you help me?',
    'I need to go',
    'Ask about rumors'
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-40 bg-slate-800" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* NPC List */}
      <div className="md:col-span-1 space-y-3 max-h-[600px] overflow-y-auto">
        <h3 className="text-sm font-medium text-slate-300 px-2 sticky top-0 bg-slate-900 py-2">
          Available NPCs ({npcs.length})
        </h3>
        {npcs.map((npc) => (
          <motion.div
            key={npc.id}
            whileHover={{ x: 4 }}
          >
            <Card
              onClick={() => handleTalkToNPC(npc)}
              className={`cursor-pointer transition-all ${
                selectedNPC?.id === npc.id
                  ? 'bg-violet-600/20 border-violet-500'
                  : 'bg-slate-800/50 border-slate-700 hover:border-violet-500/50'
              }`}
            >
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  {npc.portrait_url ? (
                    <img
                      src={npc.portrait_url}
                      alt={npc.name}
                      className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <Users className="h-10 w-10 text-cyan-400/50 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-cyan-400 text-sm truncate">{npc.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{npc.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Dialogue Tree */}
      <div className="md:col-span-2">
        {selectedNPC ? (
          <Card className="bg-slate-800/50 border-slate-700 flex flex-col h-[600px]">
            <CardHeader className="border-b border-slate-700">
              <div className="flex items-center gap-3">
                {selectedNPC.portrait_url && (
                  <img
                    src={selectedNPC.portrait_url}
                    alt={selectedNPC.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <CardTitle className="text-cyan-400">{selectedNPC.name}</CardTitle>
                  <p className="text-xs text-slate-400 capitalize">{selectedNPC.role}</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
              {dialogueHistory.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.type === 'player' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      msg.type === 'player'
                        ? 'bg-violet-600/30 text-violet-200 border border-violet-500/30'
                        : 'bg-slate-700/50 text-slate-200 border border-slate-600/30'
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </CardContent>

            {/* Dialogue Choices */}
            <div className="border-t border-slate-700 p-4 space-y-2">
              {dialogueOptions.map((choice, idx) => (
                <Button
                  key={idx}
                  onClick={() => handleDialogueChoice(choice)}
                  variant="outline"
                  className="w-full justify-start text-left border-slate-600 text-slate-300 hover:bg-violet-500/10 hover:border-violet-500 h-auto py-2"
                >
                  <MessageCircle className="h-3 w-3 mr-2 flex-shrink-0" />
                  <span className="truncate">{choice}</span>
                </Button>
              ))}
            </div>
          </Card>
        ) : (
          <Card className="bg-slate-800/50 border-slate-700 h-[600px] flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-slate-500 mx-auto mb-2" />
              <p className="text-slate-400">Select an NPC to start dialogue</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}