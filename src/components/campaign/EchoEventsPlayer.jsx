import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Radio, Clock, CheckCircle, AlertTriangle, Zap } from "lucide-react";
import { toast } from "sonner";
import useSoundEffects from '@/components/sounds/useSoundEffects';
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";

export default function EchoEventsPlayer({ campaign, currentCharacter, onUpdate }) {
  const [timeRemaining, setTimeRemaining] = useState('');
  const { play } = useSoundEffects();

  const activeEvent = campaign.active_echo_event;
  const hasVoted = activeEvent?.choices.some(c => 
    c.votes.includes(currentCharacter?.name)
  );

  useEffect(() => {
    if (!activeEvent) return;

    const interval = setInterval(() => {
      const remaining = new Date(activeEvent.expires_at) - new Date();
      if (remaining <= 0) {
        setTimeRemaining('Expired');
        return;
      }
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeEvent]);

  const handleVote = (choiceId) => {
    if (!currentCharacter) {
      toast.error('Select a character first');
      return;
    }

    if (hasVoted) {
      toast.error('You have already voted');
      return;
    }

    const updatedChoices = activeEvent.choices.map(choice => {
      if (choice.id === choiceId) {
        return {
          ...choice,
          votes: [...choice.votes, currentCharacter.name]
        };
      }
      return choice;
    });

    onUpdate({
      active_echo_event: {
        ...activeEvent,
        choices: updatedChoices
      }
    });

    play('success', 0.5);
    toast.success('Vote recorded!', {
      description: 'The world shifts with your choice...'
    });
  };

  const getTotalVotes = () => {
    if (!activeEvent) return 0;
    return activeEvent.choices.reduce((sum, c) => sum + c.votes.length, 0);
  };

  const getVotePercentage = (choice) => {
    const total = getTotalVotes();
    if (total === 0) return 0;
    return Math.round((choice.votes.length / total) * 100);
  };

  if (!activeEvent) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="py-12 text-center">
          <Radio className="h-16 w-16 mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400">No active Echo Events</p>
          <p className="text-slate-500 text-sm mt-2">
            The GM will deploy events for you to influence the world
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-4"
    >
      {/* Active Event Header */}
      <Card className="bg-gradient-to-br from-orange-900/50 to-red-900/50 border-2 border-orange-500 shadow-lg shadow-orange-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Radio className="h-5 w-5 text-orange-400 animate-pulse" />
            Echo Event: {activeEvent.title}
          </CardTitle>
          <div className="flex items-center gap-2 text-orange-300 text-sm mt-2">
            <Clock className="h-4 w-4" />
            <span>Time Remaining: {timeRemaining}</span>
          </div>
        </CardHeader>
        <CardContent>
          {activeEvent.description && (
            <div className="p-4 bg-slate-900/50 rounded-lg border border-orange-500/30 mb-4">
              <p className="text-slate-300 text-sm">{activeEvent.description}</p>
            </div>
          )}

          {hasVoted ? (
            <div className="p-4 bg-green-900/20 border-2 border-green-500/50 rounded-lg text-center">
              <CheckCircle className="h-8 w-8 mx-auto text-green-400 mb-2" />
              <p className="text-green-400 font-semibold">You have voted!</p>
              <p className="text-slate-400 text-sm mt-1">
                Watch the results unfold below
              </p>
            </div>
          ) : (
            <div className="p-4 bg-orange-900/20 border-2 border-orange-500/50 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-orange-400 font-semibold text-sm">Your choice matters!</p>
                  <p className="text-slate-300 text-sm mt-1">
                    Select one option below to influence the outcome of this event.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Choices */}
      <div className="grid gap-3">
        <AnimatePresence>
          {activeEvent.choices.map((choice, i) => {
            const percentage = getVotePercentage(choice);
            const isUserChoice = choice.votes.includes(currentCharacter?.name);
            
            return (
              <motion.div
                key={choice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`
                  border-2 transition-all
                  ${isUserChoice 
                    ? 'border-green-500 bg-green-900/20' 
                    : hasVoted 
                      ? 'border-slate-700 bg-slate-800/50' 
                      : 'border-orange-500/30 bg-slate-800 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/20 cursor-pointer'
                  }
                `}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-white font-semibold">{choice.text}</span>
                          {isUserChoice && (
                            <Badge className="bg-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Your Vote
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 italic">
                          Impact: {choice.impact}
                        </p>
                      </div>
                      {!hasVoted && (
                        <Button
                          onClick={() => handleVote(choice.id)}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Vote
                        </Button>
                      )}
                    </div>

                    {/* Vote Progress */}
                    {hasVoted && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">
                            {choice.votes.length} vote{choice.votes.length !== 1 ? 's' : ''}
                          </span>
                          <span className="text-orange-400 font-mono">
                            {percentage}%
                          </span>
                        </div>
                        <Progress 
                          value={percentage} 
                          className="h-2 bg-slate-700"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Stats Footer */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Total Votes Cast:</span>
            <Badge variant="outline" className="text-orange-400 border-orange-400">
              {getTotalVotes()}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}