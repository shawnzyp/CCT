import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Award, Users } from "lucide-react";
import { XP_AWARDS } from '@/components/character/ProgressionData';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function XPAwardPanel({ characters, onAwardXP }) {
  const [selectedType, setSelectedType] = useState('minor');
  const [customXP, setCustomXP] = useState('');
  const [selectedCharacters, setSelectedCharacters] = useState([]);
  
  const xpAmount = customXP || XP_AWARDS[selectedType];
  
  const handleAward = () => {
    if (!xpAmount || selectedCharacters.length === 0) return;
    
    const amount = parseInt(xpAmount);
    selectedCharacters.forEach(charId => {
      onAwardXP(charId, amount);
    });
    
    toast.success(`Awarded ${amount} XP to ${selectedCharacters.length} character(s)!`, {
      icon: '⚡'
    });
    
    setSelectedCharacters([]);
  };
  
  const toggleCharacter = (charId) => {
    setSelectedCharacters(prev =>
      prev.includes(charId)
        ? prev.filter(id => id !== charId)
        : [...prev, charId]
    );
  };
  
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Award className="h-5 w-5 text-amber-400" />
          Award Combat XP
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Encounter Type */}
        <div>
          <label className="text-sm text-slate-400 mb-2 block">Encounter Type</label>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minor">
                <div className="flex items-center justify-between w-full">
                  <span>Minor Skirmish</span>
                  <Badge className="ml-4 bg-slate-700">{XP_AWARDS.minor} XP</Badge>
                </div>
              </SelectItem>
              <SelectItem value="elite">
                <div className="flex items-center justify-between w-full">
                  <span>Elite Foe</span>
                  <Badge className="ml-4 bg-blue-600">{XP_AWARDS.elite} XP</Badge>
                </div>
              </SelectItem>
              <SelectItem value="boss">
                <div className="flex items-center justify-between w-full">
                  <span>Boss Fight</span>
                  <Badge className="ml-4 bg-purple-600">{XP_AWARDS.boss} XP</Badge>
                </div>
              </SelectItem>
              <SelectItem value="apocalyptic">
                <div className="flex items-center justify-between w-full">
                  <span>Apocalyptic Threat</span>
                  <Badge className="ml-4 bg-red-600">{XP_AWARDS.apocalyptic} XP</Badge>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Custom XP */}
        <div>
          <label className="text-sm text-slate-400 mb-2 block">Or Custom Amount</label>
          <Input
            type="number"
            value={customXP}
            onChange={(e) => setCustomXP(e.target.value)}
            placeholder="Enter custom XP amount"
            className="bg-slate-900 border-slate-700 text-white"
          />
        </div>
        
        {/* Character Selection */}
        <div>
          <label className="text-sm text-slate-400 mb-2 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Select Characters ({selectedCharacters.length})
          </label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {characters.map(char => (
              <button
                key={char.id}
                onClick={() => toggleCharacter(char.id)}
                className={cn(
                  "w-full p-3 rounded-lg border-2 transition-all flex items-center gap-3",
                  selectedCharacters.includes(char.id)
                    ? "border-violet-500 bg-violet-500/20"
                    : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                )}
              >
                {char.portrait_url ? (
                  <img src={char.portrait_url} alt={char.name} className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
                    <span className="text-white font-bold">{char.name[0]}</span>
                  </div>
                )}
                <div className="flex-1 text-left">
                  <div className="text-white font-medium">{char.name}</div>
                  <div className="text-xs text-slate-400">Level {char.level || 1} • {char.current_xp || 0} XP</div>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Award Button */}
        <Button
          onClick={handleAward}
          disabled={!xpAmount || selectedCharacters.length === 0}
          className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Award {xpAmount || 0} XP to {selectedCharacters.length} Character(s)
        </Button>
      </CardContent>
    </Card>
  );
}