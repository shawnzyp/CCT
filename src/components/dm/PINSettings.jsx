import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Check, X } from "lucide-react";
import { toast } from "sonner";

export default function PINSettings({ currentPIN, onPINChange, open, onOpenChange }) {
  const [oldPIN, setOldPIN] = useState('');
  const [newPIN, setNewPIN] = useState('');
  const [confirmPIN, setConfirmPIN] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (oldPIN !== currentPIN) {
      setError('Current PIN is incorrect');
      return;
    }

    if (newPIN.length !== 4 || !/^\d{4}$/.test(newPIN)) {
      setError('New PIN must be exactly 4 digits');
      return;
    }

    if (newPIN !== confirmPIN) {
      setError('New PINs do not match');
      return;
    }

    onPINChange(newPIN);
    toast.success('PIN changed successfully!');
    setOldPIN('');
    setNewPIN('');
    setConfirmPIN('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-violet-500 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-violet-400" />
            Change DM PIN
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-slate-300">Current PIN</Label>
            <Input
              type="password"
              value={oldPIN}
              onChange={(e) => setOldPIN(e.target.value)}
              placeholder="Enter current PIN"
              maxLength={4}
              className="bg-slate-800 border-slate-700 text-white text-center text-lg tracking-widest mt-1"
            />
          </div>

          <div>
            <Label className="text-slate-300">New PIN</Label>
            <Input
              type="password"
              value={newPIN}
              onChange={(e) => setNewPIN(e.target.value)}
              placeholder="Enter new 4-digit PIN"
              maxLength={4}
              className="bg-slate-800 border-slate-700 text-white text-center text-lg tracking-widest mt-1"
            />
          </div>

          <div>
            <Label className="text-slate-300">Confirm New PIN</Label>
            <Input
              type="password"
              value={confirmPIN}
              onChange={(e) => setConfirmPIN(e.target.value)}
              placeholder="Confirm new PIN"
              maxLength={4}
              className="bg-slate-800 border-slate-700 text-white text-center text-lg tracking-widest mt-1"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-2 rounded">
              <X className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-violet-600 hover:bg-violet-700 gap-2">
              <Check className="h-4 w-4" />
              Change PIN
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}