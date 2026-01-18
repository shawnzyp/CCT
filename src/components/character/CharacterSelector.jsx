import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, User, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function CharacterSelector({ characters, onSelect, onClose }) {
  const [search, setSearch] = useState('');

  const filteredCharacters = characters.filter(char =>
    char.name?.toLowerCase().includes(search.toLowerCase()) ||
    char.real_name?.toLowerCase().includes(search.toLowerCase())
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
                  onClick={() => onSelect(char)}
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
    </Dialog>
  );
}