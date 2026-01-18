import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Sparkles, Coins, Gift, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const RARITY_COLORS = {
  common: { border: 'border-slate-500', bg: 'bg-slate-500/10', text: 'text-slate-400', glow: 'shadow-slate-500/20' },
  uncommon: { border: 'border-green-500', bg: 'bg-green-500/10', text: 'text-green-400', glow: 'shadow-green-500/20' },
  rare: { border: 'border-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-400', glow: 'shadow-blue-500/20' },
  epic: { border: 'border-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-400', glow: 'shadow-purple-500/20' },
  legendary: { border: 'border-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-400', glow: 'shadow-amber-500/20' }
};

export default function LootDialog({ loot, onClaim, onClose }) {
  const handleClaim = () => {
    onClaim(loot);
    onClose();
  };
  
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-violet-500 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Gift className="h-5 w-5 text-violet-400" />
            Loot Acquired!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Gold */}
          {loot.gold > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-gradient-to-r from-amber-900/30 to-yellow-900/30 border-2 border-amber-500 rounded-lg"
            >
              <div className="flex items-center justify-center gap-3">
                <Coins className="h-8 w-8 text-amber-400" />
                <div className="text-3xl font-bold text-amber-400">
                  +{loot.gold} Gold
                </div>
              </div>
            </motion.div>
          )}
          
          {/* XP */}
          {loot.xp > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-4 bg-gradient-to-r from-violet-900/30 to-purple-900/30 border-2 border-violet-500 rounded-lg"
            >
              <div className="flex items-center justify-center gap-3">
                <Sparkles className="h-8 w-8 text-violet-400" />
                <div className="text-3xl font-bold text-violet-400">
                  +{loot.xp} XP
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Items */}
          {loot.items?.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Items</h3>
              {loot.items.map((item, index) => {
                const rarity = RARITY_COLORS[item.rarity] || RARITY_COLORS.common;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className={cn(
                      "p-3 rounded-lg border-2 shadow-lg",
                      rarity.border, rarity.bg, rarity.glow
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-white">{item.name}</h4>
                          <Badge className={cn("text-xs capitalize", rarity.text)}>
                            {item.rarity}
                          </Badge>
                        </div>
                        {item.description && (
                          <p className="text-sm text-slate-400 mt-1">{item.description}</p>
                        )}
                        {item.bonus && (
                          <p className="text-xs text-violet-400 mt-1 font-medium">{item.bonus}</p>
                        )}
                        {item.magical_properties?.length > 0 && (
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            <Sparkles className="h-3 w-3 text-purple-400" />
                            {item.magical_properties.map((prop, i) => (
                              <Badge key={i} className="bg-purple-500/20 text-purple-300 text-xs">
                                {prop}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      {item.quantity > 1 && (
                        <Badge variant="outline" className="ml-2">x{item.quantity}</Badge>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
          
          <Button
            onClick={handleClaim}
            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Claim Loot
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}