import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Sparkles, AlertTriangle, Play, Pause, RotateCcw, Users, ArrowRight, Eye } from "lucide-react";
import { toast } from "sonner";
import useSoundEffects from '@/components/sounds/useSoundEffects';

export default function DeckOfFatesDeployment({ campaign, characters, onUpdate }) {
  const [showDeployDialog, setShowDeployDialog] = useState(false);
  const [turnOrder, setTurnOrder] = useState([]);
  const { play } = useSoundEffects();

  const activeDeck = campaign.active_deck || null;

  const deployDeck = () => {
    // Create turn order from characters
    const order = characters.map((char, idx) => ({
      character_id: char.id,
      character_name: char.name,
      turn_position: idx,
      cards_to_draw: 0,
      cards_declared: false,
      cards_drawn: [],
      completed: false
    }));

    const newDeck = {
      active: true,
      deployed_at: new Date().toISOString(),
      turn_order: order,
      current_turn_index: 0,
      deck_state: Array.from({ length: 22 }, (_, i) => ({ id: i, drawn: false })), // 22 cards like Deck of Many Things
      completed: false
    };

    onUpdate({ active_deck: newDeck });
    setShowDeployDialog(false);
    play('success', 0.5);
    toast.success('Deck of Fates deployed to all players!');
  };

  const endDeck = () => {
    if (!activeDeck) return;
    
    const updatedDeck = {
      ...activeDeck,
      active: false,
      completed: true,
      completed_at: new Date().toISOString()
    };

    // Archive to history
    const history = campaign.deck_history || [];
    history.push(updatedDeck);

    onUpdate({ 
      active_deck: null,
      deck_history: history
    });

    play('error', 0.3);
    toast.success('Deck of Fates session ended');
  };

  const nextTurn = () => {
    if (!activeDeck) return;

    const currentPlayer = activeDeck.turn_order[activeDeck.current_turn_index];
    
    if (!currentPlayer.cards_declared) {
      toast.error('Current player must declare how many cards to draw first');
      return;
    }

    if (currentPlayer.cards_drawn.length < currentPlayer.cards_to_draw) {
      toast.error('Current player must complete their draws first');
      return;
    }

    // Mark current player as completed
    const updatedOrder = [...activeDeck.turn_order];
    updatedOrder[activeDeck.current_turn_index].completed = true;

    const nextIndex = activeDeck.current_turn_index + 1;
    
    if (nextIndex >= updatedOrder.length) {
      // All players done
      onUpdate({
        active_deck: {
          ...activeDeck,
          turn_order: updatedOrder,
          current_turn_index: nextIndex,
          completed: true
        }
      });
      toast.success('All players have drawn from the deck!');
    } else {
      onUpdate({
        active_deck: {
          ...activeDeck,
          turn_order: updatedOrder,
          current_turn_index: nextIndex
        }
      });
      play('navigate', 0.3);
      toast.info(`${updatedOrder[nextIndex].character_name}'s turn`);
    }
  };

  const resetTurn = () => {
    if (!activeDeck) return;

    const updatedOrder = [...activeDeck.turn_order];
    const currentPlayer = updatedOrder[activeDeck.current_turn_index];
    
    // Reset current player's turn
    currentPlayer.cards_to_draw = 0;
    currentPlayer.cards_declared = false;
    currentPlayer.cards_drawn = [];

    // Return their cards to the deck
    currentPlayer.cards_drawn.forEach(cardId => {
      const card = activeDeck.deck_state.find(c => c.id === cardId);
      if (card) card.drawn = false;
    });

    onUpdate({
      active_deck: {
        ...activeDeck,
        turn_order: updatedOrder
      }
    });

    play('click', 0.2);
    toast.info('Turn reset');
  };

  if (!activeDeck) {
    return (
      <div className="space-y-4">
        <Card className="bg-gradient-to-br from-purple-950 to-slate-900 border-2 border-purple-500">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              Deck of Many Fates
            </CardTitle>
            <p className="text-sm text-slate-300">High-stakes D&D-style card drawing system</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-red-900/20 border-2 border-red-600/50 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm text-slate-300">
                  <p className="text-red-400 font-semibold">GM Control Required</p>
                  <p>This system follows D&D Deck of Many Things rules:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Players declare how many cards they want to draw (1-3)</li>
                    <li>• Once declared, they cannot change their mind</li>
                    <li>• They can decline to draw before declaring</li>
                    <li>• Cards must be resolved in the order drawn</li>
                    <li>• Each card is removed from the deck when drawn</li>
                    <li>• Turn order prevents duplicate draws</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-slate-300 text-sm">
                <strong>Current Players:</strong> {characters.length}
              </p>
              {characters.length > 0 && (
                <div className="space-y-1">
                  {characters.map((char, idx) => (
                    <div key={char.id} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded">
                      <Badge variant="outline" className="text-xs">{idx + 1}</Badge>
                      <span className="text-slate-300 text-sm">{char.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={() => setShowDeployDialog(true)}
              disabled={characters.length === 0}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold border-2 border-purple-500"
            >
              <Play className="h-4 w-4 mr-2" />
              Deploy Deck to Players
            </Button>
          </CardContent>
        </Card>

        {/* Deploy Confirmation */}
        <Dialog open={showDeployDialog} onOpenChange={setShowDeployDialog}>
          <DialogContent className="bg-slate-900 border-2 border-purple-500 text-white">
            <DialogHeader>
              <DialogTitle className="text-purple-400 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Deploy Deck of Fates
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-slate-300">
                This will activate the Deck of Fates for all players in turn order.
                Each player will see the interface and can draw cards when it's their turn.
              </p>
              <div className="p-3 bg-purple-900/20 border border-purple-500/50 rounded">
                <p className="text-xs text-purple-300">
                  Once deployed, players must participate in order. You control when to advance turns
                  and can reset a player's turn if needed.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowDeployDialog(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={deployDeck}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  Deploy Deck
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Active deck controls
  const currentTurnPlayer = activeDeck.turn_order[activeDeck.current_turn_index];
  const availableCards = activeDeck.deck_state.filter(c => !c.drawn).length;

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <Card className="bg-gradient-to-br from-purple-950 to-slate-900 border-2 border-purple-500">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
              Deck of Fates - ACTIVE
            </div>
            <Badge className="bg-green-500 text-white">Live</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-800/50 rounded">
              <div className="text-xs text-slate-400 uppercase">Cards Remaining</div>
              <div className="text-2xl font-bold text-white">{availableCards} / 22</div>
            </div>
            <div className="p-3 bg-slate-800/50 rounded">
              <div className="text-xs text-slate-400 uppercase">Current Turn</div>
              <div className="text-lg font-bold text-purple-300 truncate">
                {currentTurnPlayer ? currentTurnPlayer.character_name : 'Complete'}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={nextTurn}
              disabled={!currentTurnPlayer || activeDeck.completed}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Next Turn
            </Button>
            <Button
              onClick={resetTurn}
              disabled={!currentTurnPlayer || activeDeck.completed}
              variant="outline"
              className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Turn
            </Button>
            <Button
              onClick={endDeck}
              variant="outline"
              className="border-red-500 text-red-400 hover:bg-red-500/10"
            >
              <Pause className="h-4 w-4 mr-2" />
              End Session
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Turn Order */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            Turn Order & Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {activeDeck.turn_order.map((player, idx) => (
                <div
                  key={player.character_id}
                  className={cn(
                    "p-3 rounded-lg border-2 transition-all",
                    idx === activeDeck.current_turn_index && !activeDeck.completed
                      ? "border-purple-500 bg-purple-500/10"
                      : player.completed
                      ? "border-slate-600 bg-slate-800/50 opacity-60"
                      : "border-slate-700 bg-slate-800/30"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs",
                          idx === activeDeck.current_turn_index && !activeDeck.completed
                            ? "border-purple-500 text-purple-300"
                            : "border-slate-600"
                        )}
                      >
                        {idx + 1}
                      </Badge>
                      <div className="flex-1">
                        <div className="font-medium text-white">{player.character_name}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {player.completed && (
                            <Badge className="bg-green-600 text-xs">Complete</Badge>
                          )}
                          {player.cards_declared && !player.completed && (
                            <Badge className="bg-blue-600 text-xs">
                              Declared: {player.cards_to_draw} cards
                            </Badge>
                          )}
                          {player.cards_drawn.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              Drawn: {player.cards_drawn.length}/{player.cards_to_draw}
                            </Badge>
                          )}
                          {idx === activeDeck.current_turn_index && !activeDeck.completed && (
                            <Badge className="bg-purple-600 text-xs animate-pulse">
                              Current Turn
                            </Badge>
                          )}
                        </div>
                        {player.cards_drawn.length > 0 && (
                          <div className="mt-2 text-xs text-slate-400">
                            Cards drawn: {player.cards_drawn.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {activeDeck.completed && (
        <Card className="bg-green-900/20 border-2 border-green-500">
          <CardContent className="py-6 text-center">
            <div className="text-green-400 font-bold text-lg mb-2">
              Deck of Fates Session Complete
            </div>
            <p className="text-slate-300 text-sm">
              All players have drawn their cards. Click "End Session" to archive this session.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}