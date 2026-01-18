import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Zap, ArrowUp, Star, Plus } from "lucide-react";

const UPGRADE_OPTIONS = [
  { label: 'Reduce SP Cost', field: 'sp_cost', change: -1, min: 0 },
  { label: 'Reduce Cooldown', field: 'cooldown', change: -1, min: 0 },
  { label: 'Increase Range', effect: 'Improved range and area of effect' },
  { label: 'Enhanced Effect', effect: 'Stronger power effects and damage' },
];

export default function PowerUpgradeDialog({ power, onUpgrade, onClose }) {
  const [selectedUpgrade, setSelectedUpgrade] = useState(null);
  const upgradeLevel = power.upgrade_level || 0;
  
  const handleConfirm = () => {
    if (!selectedUpgrade) return;
    
    const upgradedPower = { ...power };
    upgradedPower.upgrade_level = upgradeLevel + 1;
    upgradedPower.upgraded_at_level = upgradedPower.upgraded_at_level || [];
    
    const option = UPGRADE_OPTIONS[selectedUpgrade];
    if (option.field) {
      const currentValue = upgradedPower[option.field] || 0;
      const newValue = Math.max(option.min, currentValue + option.change);
      upgradedPower[option.field] = newValue;
    } else {
      // Add effect description to custom tags
      if (!upgradedPower.custom_effect_tags) {
        upgradedPower.custom_effect_tags = [];
      }
      upgradedPower.custom_effect_tags.push({
        name: option.label,
        description: option.effect
      });
    }
    
    onUpgrade(upgradedPower);
  };
  
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-violet-500 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <ArrowUp className="h-5 w-5 text-white" />
            </div>
            Upgrade Power
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Power Info */}
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-white text-lg">{power.name}</h3>
              <div className="flex gap-1">
                {[...Array(upgradeLevel)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
            </div>
            <p className="text-sm text-slate-400">{power.description}</p>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="text-xs">SP: {power.sp_cost}</Badge>
              {power.cooldown > 0 && (
                <Badge variant="outline" className="text-xs">Cooldown: {power.cooldown}</Badge>
              )}
            </div>
          </div>
          
          <Separator className="bg-slate-700" />
          
          {/* Upgrade Options */}
          <div>
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Plus className="h-4 w-4 text-violet-400" />
              Select Upgrade
            </h4>
            <div className="space-y-2">
              {UPGRADE_OPTIONS.map((option, index) => {
                const isDisabled = option.field && (power[option.field] || 0) + option.change < option.min;
                return (
                  <button
                    key={index}
                    onClick={() => !isDisabled && setSelectedUpgrade(index)}
                    disabled={isDisabled}
                    className={cn(
                      "w-full p-3 rounded-lg border-2 text-left transition-all",
                      selectedUpgrade === index
                        ? "border-violet-500 bg-violet-500/20"
                        : "border-slate-700 bg-slate-800/50 hover:border-slate-600",
                      isDisabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-white">{option.label}</div>
                        {option.effect && (
                          <div className="text-xs text-slate-400 mt-1">{option.effect}</div>
                        )}
                        {option.field && (
                          <div className="text-xs text-violet-400 mt-1">
                            {power[option.field] || 0} → {Math.max(option.min, (power[option.field] || 0) + option.change)}
                          </div>
                        )}
                      </div>
                      {selectedUpgrade === index && (
                        <Zap className="h-5 w-5 text-violet-400" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-slate-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={selectedUpgrade === null}
              className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            >
              Upgrade Power
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}