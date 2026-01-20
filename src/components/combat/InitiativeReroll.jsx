import React from 'react';
import { Button } from "@/components/ui/button";
import { Dices } from "lucide-react";
import { toast } from "sonner";

export default function InitiativeReroll({ initiativeOrder, onReroll }) {
  const handleReroll = () => {
    const updated = initiativeOrder.map(combatant => ({
      ...combatant,
      initiative_roll: Math.floor(Math.random() * 20) + 1 + (combatant.initiative_modifier || 0)
    })).sort((a, b) => b.initiative_roll - a.initiative_roll);
    
    onReroll(updated);
    toast.success('Initiative re-rolled!');
  };

  return (
    <Button
      onClick={handleReroll}
      variant="outline"
      size="sm"
      className="gap-2 border-violet-500 text-violet-400 hover:bg-violet-500/20"
    >
      <Dices className="h-3 w-3" />
      Re-roll Initiative
    </Button>
  );
}