import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, User, ChevronRight, Heart, Zap, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getModifier } from "@/components/character/StatBlock";

export default function CharacterSelector({ characters, onSelect, onClose }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  const filteredCharacters = characters.filter(char =>
    char.name?.toLowerCase().includes(search.toLowerCase()) ||
    char.real_name?.toLowerCase().includes(search.toLowerCase()) ||
    char.secret_identity?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-violet-500 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl">Select Your Character</DialogTitle>
          <p className="text-slate-400 text-sm">Choose a character to play in this session</p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search characters..."
              className="pl-10 bg-slate-800 border-slate-700 text-white"
            />
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredCharacters.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No characters found
              </div>
            ) : (
              filteredCharacters.map((char, index) => (
                <motion.div
                  key={char.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 4 }}
                  onClick={() => setSelectedCharacter(char)}
                  className="flex items-center gap-3 p-3 rounded-lg border-2 border-slate-700 hover:border-violet-500 bg-slate-800/50 cursor-pointer transition-all group"
                >
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: char.visual_customization?.costume_primary_color 
                        ? `linear-gradient(135deg, ${char.visual_customization.costume_primary_color}, ${char.visual_customization.costume_secondary_color || char.visual_customization.costume_primary_color})`
                        : 'linear-gradient(135deg, rgb(124, 58, 237), rgb(168, 85, 247))'
                    }}
                  >
                    {char.portrait_url ? (
                      <img src={char.portrait_url} alt={char.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <User className="h-6 w-6 text-white/60" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white group-hover:text-violet-300 transition-colors">
                      {char.name}
                    </h4>
                    <p className="text-xs text-slate-400 truncate">
                      {char.real_name || 'Unknown Identity'}
                    </p>
                  </div>

                  <Badge variant="outline" className="text-xs">
                    Level {char.level || 1}
                  </Badge>

                  <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-violet-400 transition-colors" />
                </motion.div>
              ))
            )}
          </div>
        </div>
      </DialogContent>

      {/* Character Detail Dialog */}
      {selectedCharacter && (
        <Dialog open={!!selectedCharacter} onOpenChange={() => setSelectedCharacter(null)}>
          <DialogContent className="bg-slate-900 border-violet-500 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white text-xl">Character Preview</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Portrait & Name */}
              <div className="flex items-center gap-4">
                <div 
                  className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-violet-500/50"
                  style={{
                    background: selectedCharacter.visual_customization?.costume_primary_color 
                      ? `linear-gradient(135deg, ${selectedCharacter.visual_customization.costume_primary_color}, ${selectedCharacter.visual_customization.costume_secondary_color || selectedCharacter.visual_customization.costume_primary_color})`
                      : 'linear-gradient(135deg, rgb(124, 58, 237), rgb(168, 85, 247))'
                  }}
                >
                  {selectedCharacter.portrait_url ? (
                    <img src={selectedCharacter.portrait_url} alt={selectedCharacter.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <User className="h-10 w-10 text-white/60" />
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{selectedCharacter.name}</h3>
                  <p className="text-sm text-slate-400">{selectedCharacter.secret_identity || 'Unknown Identity'}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge className="bg-violet-600">Level {selectedCharacter.level || 1}</Badge>
                    <Badge variant="outline" className="text-xs">Tier {selectedCharacter.tier}</Badge>
                  </div>
                </div>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="h-4 w-4 text-red-400" />
                    <span className="text-xs text-slate-400 uppercase">HP</span>
                  </div>
                  <div className="text-xl font-bold text-white">
                    {selectedCharacter.current_hp || selectedCharacter.max_hp}/{selectedCharacter.max_hp}
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-4 w-4 text-violet-400" />
                    <span className="text-xs text-slate-400 uppercase">SP</span>
                  </div>
                  <div className="text-xl font-bold text-white">
                    {selectedCharacter.current_sp || (5 + getModifier(selectedCharacter.ability_scores?.CON || 10))}
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="h-4 w-4 text-blue-400" />
                    <span className="text-xs text-slate-400 uppercase">TC</span>
                  </div>
                  <div className="text-xl font-bold text-white">
                    {selectedCharacter.toughness_class}
                  </div>
                </div>
              </div>

              {/* Classification & Powers */}
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700 space-y-2">
                <div>
                  <span className="text-xs text-slate-400 uppercase">Classification</span>
                  <p className="text-white font-medium">{selectedCharacter.classification}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400 uppercase">Power Styles</span>
                  <div className="flex gap-1 flex-wrap mt-1">
                    {selectedCharacter.power_styles?.map((style, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {style}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-400 uppercase">Origin</span>
                  <p className="text-white font-medium text-sm">{selectedCharacter.origin_story}</p>
                </div>
              </div>

              {/* Powers Count */}
              <div className="text-center text-sm text-slate-400">
                {selectedCharacter.powers?.length || 0} Powers • {selectedCharacter.alignment}
              </div>
            </div>

            <DialogFooter className="flex gap-2 sm:gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedCharacter(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  onSelect(selectedCharacter);
                  setSelectedCharacter(null);
                  navigate(createPageUrl(`CharacterSheet?id=${selectedCharacter.id}`));
                }}
                className="flex-1 bg-violet-600 hover:bg-violet-700"
              >
                Load Character
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}