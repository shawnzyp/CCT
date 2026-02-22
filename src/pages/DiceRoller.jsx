import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dices, Plus, Minus, RotateCcw, TrendingUp, TrendingDown, Coins } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useSoundEffects from '@/components/sounds/useSoundEffects';
import { useHaptic } from '@/components/utils/useHaptic';
import { postRollToDiscord } from '@/components/utils/postRollToDiscord';

export default function DiceRoller() {
  const [numDice, setNumDice] = useState(1);
  const [diceType, setDiceType] = useState('d20');
  const [modifier, setModifier] = useState(0);
  const [advantage, setAdvantage] = useState(false);
  const [disadvantage, setDisadvantage] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(null);
  const [history, setHistory] = useState([]);
  const { play } = useSoundEffects();
  const { haptic } = useHaptic();

  const diceTypes = [
    { value: 'd2', label: 'Coin (d2)', sides: 2 },
    { value: 'd4', label: 'd4', sides: 4 },
    { value: 'd6', label: 'd6', sides: 6 },
    { value: 'd8', label: 'd8', sides: 8 },
    { value: 'd10', label: 'd10', sides: 10 },
    { value: 'd10p', label: 'd10%', sides: 10, percentile: true },
    { value: 'd12', label: 'd12', sides: 12 },
    { value: 'd20', label: 'd20', sides: 20 },
    { value: 'd100', label: 'd100', sides: 100 }
  ];

  const getDiceConfig = () => diceTypes.find(d => d.value === diceType);

  const rollDice = () => {
    const config = getDiceConfig();
    const rolls = [];
    
    if (advantage || disadvantage) {
      // Roll twice for advantage/disadvantage
      const roll1 = Math.floor(Math.random() * config.sides) + 1;
      const roll2 = Math.floor(Math.random() * config.sides) + 1;
      
      if (advantage) {
        rolls.push({ value: roll1, kept: roll1 >= roll2 });
        rolls.push({ value: roll2, kept: roll2 > roll1 });
      } else {
        rolls.push({ value: roll1, kept: roll1 <= roll2 });
        rolls.push({ value: roll2, kept: roll2 < roll1 });
      }
    } else {
      // Normal roll
      for (let i = 0; i < numDice; i++) {
        if (config.percentile) {
          const value = (Math.floor(Math.random() * 10)) * 10;
          rolls.push({ value: value === 0 ? (Math.random() < 0.1 ? 100 : 0) : value, kept: true });
        } else {
          rolls.push({ value: Math.floor(Math.random() * config.sides) + 1, kept: true });
        }
      }
    }

    setRolling(true);
    haptic('dice');
    play('dice');

    setTimeout(() => {
      setResults(rolls);
      const sum = rolls.filter(r => r.kept).reduce((acc, r) => acc + r.value, 0);
      const finalTotal = sum + parseInt(modifier || 0);
      setTotal(finalTotal);
      setRolling(false);

      // Add to history
      const historyEntry = {
        rolls,
        diceType: config.label,
        numDice,
        modifier: parseInt(modifier || 0),
        advantage,
        disadvantage,
        total: finalTotal,
        timestamp: new Date()
      };
      setHistory(prev => [historyEntry, ...prev].slice(0, 20));

      const isCrit = config.sides === 20 && rolls.some(r => r.kept && r.value === 20);
      const isFail = config.sides === 20 && rolls.some(r => r.kept && r.value === 1);

      // Check for critical
      if (isCrit) {
        play('critical_hit');
        haptic('success');
      } else if (isFail) {
        play('error');
      }

      // Post to Discord
      const storedChar = localStorage.getItem('currentCharacter');
      const charName = storedChar ? JSON.parse(storedChar).name : undefined;
      postRollToDiscord({
        characterName: charName,
        diceLabel: `${numDice}×${config.label}`,
        rolls: rolls.filter(r => r.kept).map(r => r.value),
        modifier: parseInt(modifier || 0),
        total: finalTotal,
        isCrit,
        isFail,
        advantage,
        disadvantage,
      });
    }, 600);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const getDiceColor = (value, sides) => {
    if (sides === 20) {
      if (value === 20) return 'text-emerald-400 font-bold';
      if (value === 1) return 'text-red-400 font-bold';
    }
    if (sides === 2) {
      return value === 1 ? 'text-amber-400' : 'text-slate-400';
    }
    return 'text-white';
  };

  const getCoinFace = (value) => {
    return value === 1 ? '👑 Heads' : '⚔️ Tails';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Dices className="h-8 w-8 text-violet-400" />
            Dice Roller
          </h1>
          <p className="text-slate-400 mt-2">Roll polyhedral dice with modifiers and advantage</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Dice Configuration */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Configure Roll</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Dice Type */}
              <div>
                <Label className="text-slate-300 mb-2 block">Dice Type</Label>
                <Select value={diceType} onValueChange={setDiceType}>
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {diceTypes.map(dice => (
                      <SelectItem key={dice.value} value={dice.value}>
                        {dice.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Number of Dice */}
              <div>
                <Label className="text-slate-300 mb-2 block">Number of Dice</Label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setNumDice(Math.max(1, numDice - 1))}
                    className="border-slate-700"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={numDice}
                    onChange={(e) => setNumDice(Math.max(1, parseInt(e.target.value) || 1))}
                    className="bg-slate-900 border-slate-700 text-white text-center"
                    min="1"
                    max="99"
                    autoFocus={false}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setNumDice(Math.min(99, numDice + 1))}
                    className="border-slate-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Modifier */}
              <div>
                <Label className="text-slate-300 mb-2 block">Modifier</Label>
                <Input
                  type="number"
                  value={modifier}
                  onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="bg-slate-900 border-slate-700 text-white"
                  autoFocus={false}
                />
              </div>

              {/* Advantage/Disadvantage */}
              {diceType === 'd20' && (
                <div className="space-y-3 pt-2 border-t border-slate-700">
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                      <Label className="text-slate-300 cursor-pointer">Advantage</Label>
                    </div>
                    <Switch
                      checked={advantage}
                      onCheckedChange={(v) => {
                        setAdvantage(v);
                        if (v) setDisadvantage(false);
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-400" />
                      <Label className="text-slate-300 cursor-pointer">Disadvantage</Label>
                    </div>
                    <Switch
                      checked={disadvantage}
                      onCheckedChange={(v) => {
                        setDisadvantage(v);
                        if (v) setAdvantage(false);
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Roll Button */}
              <Button
                onClick={rollDice}
                disabled={rolling}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white py-6 text-lg"
              >
                {rolling ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
                  >
                    <Dices className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <>
                    <Dices className="h-6 w-6 mr-2" />
                    Roll {getDiceConfig()?.label}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Results</CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {total !== null ? (
                  <motion.div
                    key={total}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="space-y-4"
                  >
                    {/* Total */}
                    <div className="text-center p-8 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-xl border-2 border-violet-500/50">
                      <div className="text-6xl font-bold text-white mb-2">{total}</div>
                      <div className="text-sm text-slate-400">Total Result</div>
                    </div>

                    {/* Individual Rolls */}
                    <div>
                      <div className="text-sm text-slate-400 mb-2">Individual Rolls:</div>
                      <div className="flex flex-wrap gap-2">
                        {results.map((roll, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                          >
                            <Badge
                              className={`text-lg px-4 py-2 ${
                                !roll.kept 
                                  ? 'bg-slate-700 text-slate-500 line-through' 
                                  : 'bg-slate-700'
                              }`}
                            >
                              {diceType === 'd2' ? (
                                <span className={getDiceColor(roll.value, 2)}>
                                  {getCoinFace(roll.value)}
                                </span>
                              ) : (
                                <span className={getDiceColor(roll.value, getDiceConfig().sides)}>
                                  {roll.value}
                                </span>
                              )}
                            </Badge>
                          </motion.div>
                        ))}
                        {modifier !== 0 && (
                          <Badge className="text-lg px-4 py-2 bg-violet-600">
                            {modifier > 0 ? '+' : ''}{modifier}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div className="text-xs text-slate-500 text-center">
                      {results.filter(r => r.kept).map(r => r.value).join(' + ')}
                      {modifier !== 0 && ` ${modifier > 0 ? '+' : ''}${modifier}`} = {total}
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <Dices className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p>Roll the dice to see results</p>
                  </div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        {/* Roll History */}
        {history.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700 mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Roll History</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="text-slate-400 hover:text-white"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {history.map((entry, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        {entry.numDice}×{entry.diceType}
                      </Badge>
                      {entry.advantage && (
                        <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">ADV</Badge>
                      )}
                      {entry.disadvantage && (
                        <Badge className="bg-red-500/20 text-red-400 text-xs">DIS</Badge>
                      )}
                      <span className="text-slate-400">
                        {entry.rolls.filter(r => r.kept).map(r => r.value).join(', ')}
                        {entry.modifier !== 0 && ` ${entry.modifier > 0 ? '+' : ''}${entry.modifier}`}
                      </span>
                    </div>
                    <div className="font-bold text-white text-lg">{entry.total}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}