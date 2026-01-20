import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Keyboard } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ShortcutsHelp() {
  const [open, setOpen] = useState(false);

  const shortcuts = [
    { combo: 'R', action: 'Roll dice' },
    { combo: 'N', action: 'Next turn (combat)' },
    { combo: 'I', action: 'Open inventory' },
    { combo: 'J', action: 'Open journal' },
    { combo: 'Ctrl+S', action: 'Quick save notes' },
    { combo: 'Ctrl+E', action: 'End combat' },
    { combo: 'Space', action: 'Pause/Resume timer' },
    { combo: '?', action: 'Show shortcuts' }
  ];

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setOpen(true)}
        className="text-slate-400 hover:text-white gap-2"
      >
        <Keyboard className="h-4 w-4" />
        <span className="hidden sm:inline">Shortcuts</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5 text-violet-400" />
              Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {shortcuts.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-slate-700/50 rounded">
                <span className="text-slate-300 text-sm">{s.action}</span>
                <Badge variant="outline" className="font-mono">
                  {s.combo}
                </Badge>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}