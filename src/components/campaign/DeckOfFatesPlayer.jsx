import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, AlertTriangle, Lock, Hand, Shuffle, Eye } from "lucide-react";
import { toast } from "sonner";
import useSoundEffects from '@/components/sounds/useSoundEffects';

// All 22 cards from Deck of Many Things
const DECK_CARDS = [
  { id: 0, name: 'The Fool', effect: 'Lose 10,000 XP and must draw again', type: 'curse' },
  { id: 1, name: 'The Jester', effect: 'Gain 10,000 XP or two more draws', type: 'benefit' },
  { id: 2, name: 'The Vizier', effect: 'Know the answer to any problem within one year', type: 'benefit' },
  { id: 3, name: 'The Sun', effect: 'Gain 50,000 XP and a wondrous magic item', type: 'major_benefit' },
  { id: 4, name: 'The Moon', effect: 'You are granted 1d3 wishes', type: 'major_benefit' },
  { id: 5, name: 'The Star', effect: 'Increase one ability score by 2', type: 'benefit' },
  { id: 6, name: 'The Comet', effect: 'Defeat your next challenge alone for a level', type: 'benefit' },
  { id: 7, name: 'The Fates', effect: 'Reality can be altered once', type: 'major_benefit' },
  { id: 8, name: 'The Throne', effect: 'Gain proficiency in Persuasion and +6 to those checks', type: 'benefit' },
  { id: 9, name: 'The Key', effect: 'A rare or rarer magic weapon appears', type: 'benefit' },
  { id: 10, name: 'The Knight', effect: 'You gain service of a 4th level fighter', type: 'benefit' },
  { id: 11, name: 'The Gem', effect: 'Gain 25,000 GP or equivalent treasure', type: 'benefit' },
  { id: 12, name: 'The Talons', effect: 'All magic items you own vanish', type: 'curse' },
  { id: 13, name: 'The Void', effect: 'Your soul is trapped, body is catatonic', type: 'major_curse' },
  { id: 14, name: 'The Flames', effect: 'A powerful devil becomes your enemy', type: 'curse' },
  { id: 15, name: 'Skull', effect: 'You must fight an avatar of death alone', type: 'major_curse' },
  { id: 16, name: 'The Idiot', effect: 'Reduce Intelligence by 1d4+1 permanently', type: 'curse' },
  { id: 17, name: 'The Donjon', effect: 'You are imprisoned in an extradimensional space', type: 'major_curse' },
  { id: 18, name: 'The Ruin', effect: 'Lose all wealth and property', type: 'curse' },
  { id: 19, name: 'The Euryale', effect: 'You gain a curse: -2 to all saves', type: 'curse' },
  { id: 20, name: 'The Rogue', effect: 'One close ally turns against you', type: 'curse' },
  { id: 21, name: 'Balance', effect: 'Your alignment changes permanently', type: 'neutral' }
];

export default function DeckOfFatesPlayer({ campaign, currentCharacter, onUpdate }) {
  const [showDeclareDialog, setShowDeclareDialog] = useState(false);
  const [showCardDialog, setShowCardDialog] = useState(false);
  const [selectedCount, setSelectedCount] = useState(1);
  const [shuffling, setShuffling] = useState(false);
  const [drawnCard, setDrawnCard] = useState(null);
  const { play } = useSoundEffects();

  const activeDeck = campaign.active_deck;

  if (!activeDeck || !activeDeck.active) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="py-12 text-center">
          <Lock className="h-16 w-16 mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400">No active Deck of Fates session</p>
          <p className="text-slate-500 text-sm mt-2">Waiting for GM to deploy the deck</p>
        </CardContent>
      </Card>
    );
  }

  const myTurn = activeDeck.turn_order.find(
    p => p.character_id === currentCharacter?.id
  );

  if (!myTurn) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="py-12 text-center">
          <AlertTriangle className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
          <p className="text-slate-400">You are not in this Deck session</p>
        </CardContent>
      </Card>
    );
  }

  const isMyTurn = activeDeck.turn_order[activeDeck.current_turn_index]?.character_id === currentCharacter?.id;
  const availableCards = activeDeck.deck_state.filter(c => !c.drawn).length;

  const declareCards = () => {
    if (selectedCount < 1 || selectedCount > 3) {
      toast.error('You must declare 1-3 cards');
      return;
    }

    const updatedOrder = activeDeck.turn_order.map(p =>
      p.character_id === currentCharacter.id
        ? { ...p, cards_to_draw: selectedCount, cards_declared: true }
        : p
    );

    onUpdate({
      active_deck: {
        ...activeDeck,
        turn_order: updatedOrder
      }
    });

    setShowDeclareDialog(false);
    play('success', 0.3);
    toast.success(`Declared: ${selectedCount} card${selectedCount > 1 ? 's' : ''}`);
  };

  const drawCard = () => {
    if (myTurn.cards_drawn.length >= myTurn.cards_to_draw) {
      toast.error('You have drawn all your cards');
      return;
    }

    setShuffling(true);
    play('navigate', 0.3);

    setTimeout(() => {
      // Get available cards
      const available = activeDeck.deck_state
        .map((card, idx) => ({ ...DECK_CARDS[idx], deckId: card.id, drawn: card.drawn }))
        .filter(c => !c.drawn);

      if (available.length === 0) {
        toast.error('No cards left in the deck!');
        setShuffling(false);
        return;
      }

      // Draw random card
      const randomCard = available[Math.floor(Math.random() * available.length)];

      // Update deck state
      const updatedDeckState = activeDeck.deck_state.map(c =>
        c.id === randomCard.deckId ? { ...c, drawn: true } : c
      );

      const updatedOrder = activeDeck.turn_order.map(p =>
        p.character_id === currentCharacter.id
          ? { ...p, cards_drawn: [...p.cards_drawn, randomCard.id] }
          : p
      );

      onUpdate({
        active_deck: {
          ...activeDeck,
          deck_state: updatedDeckState,
          turn_order: updatedOrder
        }
      });

      setDrawnCard(randomCard);
      setShowCardDialog(true);
      setShuffling(false);
      play('error', 0.5);
    }, 2000);
  };

  const getCardColor = (type) => {
    switch (type) {
      case 'major_benefit': return 'from-yellow-500 to-orange-500';
      case 'benefit': return 'from-green-500 to-emerald-500';
      case 'curse': return 'from-red-500 to-rose-500';
      case 'major_curse': return 'from-purple-900 to-red-900';
      case 'neutral': return 'from-blue-500 to-indigo-500';
      default: return 'from-slate-500 to-slate-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <Card className="bg-gradient-to-br from-purple-950 to-slate-900 border-2 border-purple-500">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            Deck of Many Fates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-800/50 rounded">
              <div className="text-xs text-slate-400 uppercase">Your Status</div>
              <div className="font-medium text-white">
                {myTurn.completed ? (
                  <Badge className="bg-green-600">Complete</Badge>
                ) : isMyTurn ? (
                  <Badge className="bg-purple-600 animate-pulse">Your Turn</Badge>
                ) : (
                  <Badge variant="outline">Waiting</Badge>
                )}
              </div>
            </div>
            <div className="p-3 bg-slate-800/50 rounded">
              <div className="text-xs text-slate-400 uppercase">Cards Remaining</div>
              <div className="text-2xl font-bold text-white">{availableCards}</div>
            </div>
          </div>

          {myTurn.cards_declared && (
            <div className="p-3 bg-blue-900/20 border border-blue-500/50 rounded">
              <div className="text-sm text-blue-300">
                <strong>Declared:</strong> {myTurn.cards_to_draw} card{myTurn.cards_to_draw > 1 ? 's' : ''}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Drawn: {myTurn.cards_drawn.length} / {myTurn.cards_to_draw}
              </div>
            </div>
          )}

          {!isMyTurn && (
            <div className="p-4 bg-slate-800/50 rounded text-center">
              <p className="text-slate-400 text-sm">
                {activeDeck.current_turn_index < activeDeck.turn_order.length ? (
                  <>
                    Waiting for{' '}
                    <strong className="text-purple-400">
                      {activeDeck.turn_order[activeDeck.current_turn_index].character_name}
                    </strong>
                  </>
                ) : (
                  'All players have completed their turns'
                )}
              </p>
            </div>
          )}

          {isMyTurn && !myTurn.completed && (
            <>
              {!myTurn.cards_declared ? (
                <div className="space-y-3">
                  <div className="p-4 bg-red-900/20 border-2 border-red-600/50 rounded-lg">
                    <div className="flex items-start gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-slate-300">
                        <p className="text-red-400 font-semibold mb-1">Important Rules:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Declare how many cards you want to draw (1-3)</li>
                          <li>• Once declared, you CANNOT change your mind</li>
                          <li>• You can decline to draw before declaring</li>
                          <li>• Cards must be resolved in order</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        myTurn.completed = true;
                        onUpdate({ active_deck: activeDeck });
                        toast.info('You declined to draw from the deck');
                      }}
                      variant="outline"
                      className="flex-1 border-slate-600"
                    >
                      Decline
                    </Button>
                    <Button
                      onClick={() => setShowDeclareDialog(true)}
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                      <Hand className="h-4 w-4 mr-2" />
                      Declare Cards
                    </Button>
                  </div>
                </div>
              ) : myTurn.cards_drawn.length < myTurn.cards_to_draw ? (
                <Button
                  onClick={drawCard}
                  disabled={shuffling}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                >
                  {shuffling ? (
                    <>
                      <Shuffle className="h-4 w-4 mr-2 animate-spin" />
                      Drawing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Draw Card {myTurn.cards_drawn.length + 1} of {myTurn.cards_to_draw}
                    </>
                  )}
                </Button>
              ) : (
                <div className="p-4 bg-green-900/20 border border-green-500/50 rounded text-center">
                  <p className="text-green-400 font-semibold">All cards drawn!</p>
                  <p className="text-slate-400 text-sm mt-1">Waiting for GM to advance turn</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Cards Drawn */}
      {myTurn.cards_drawn.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Your Drawn Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {myTurn.cards_drawn.map((cardId, idx) => {
                const card = DECK_CARDS[cardId];
                return (
                  <div
                    key={idx}
                    className={cn(
                      "p-3 rounded-lg bg-gradient-to-r",
                      getCardColor(card.type)
                    )}
                  >
                    <div className="font-bold text-white mb-1">{card.name}</div>
                    <div className="text-sm text-white/90">{card.effect}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Declare Dialog */}
      <Dialog open={showDeclareDialog} onOpenChange={setShowDeclareDialog}>
        <DialogContent className="bg-slate-900 border-2 border-purple-500 text-white">
          <DialogHeader>
            <DialogTitle className="text-purple-400 flex items-center gap-2">
              <Hand className="h-5 w-5" />
              Declare Cards to Draw
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-slate-300">
              How many cards do you want to draw from the Deck of Many Fates?
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map(num => (
                <button
                  key={num}
                  onClick={() => setSelectedCount(num)}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all text-center",
                    selectedCount === num
                      ? "border-purple-500 bg-purple-500/20"
                      : "border-slate-700 bg-slate-800 hover:border-slate-600"
                  )}
                >
                  <div className="text-2xl font-bold text-white">{num}</div>
                  <div className="text-xs text-slate-400">card{num > 1 ? 's' : ''}</div>
                </button>
              ))}
            </div>
            <div className="p-3 bg-red-900/20 border border-red-600/50 rounded text-sm text-slate-300">
              <p className="font-semibold text-red-400 mb-2">Warning:</p>
              <p className="text-xs">
                Once you declare, you CANNOT change your mind. You must draw all {selectedCount} card{selectedCount > 1 ? 's' : ''} and resolve them in order.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowDeclareDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={declareCards}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                Declare {selectedCount} Card{selectedCount > 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Card Reveal Dialog */}
      <Dialog open={showCardDialog} onOpenChange={setShowCardDialog}>
        <DialogContent className="bg-slate-900 border-2 border-purple-500 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-purple-400 flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Card Drawn!
            </DialogTitle>
          </DialogHeader>
          {drawnCard && (
            <AnimatePresence>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-4"
              >
                <div className={cn(
                  "p-6 rounded-lg bg-gradient-to-br text-center",
                  getCardColor(drawnCard.type)
                )}>
                  <div className="text-2xl font-bold text-white mb-2">{drawnCard.name}</div>
                  <div className="text-sm text-white/90">{drawnCard.effect}</div>
                </div>
                <Button
                  onClick={() => setShowCardDialog(false)}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Acknowledge
                </Button>
              </motion.div>
            </AnimatePresence>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}