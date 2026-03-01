import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Lock, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useHaptic } from "@/components/utils/useHaptic";
import useSoundEffects from '@/components/sounds/useSoundEffects';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function DMLoginFooter({ isDM, onDMLogin, onDMLogout }) {
  const navigate = useNavigate();
  const [showPINDialog, setShowPINDialog] = useState(false);
  const [pin, setPin] = useState('');
  const { haptic } = useHaptic();
  const { play } = useSoundEffects();

  const handlePINSubmit = () => {
    const storedPIN = localStorage.getItem('dm_pin') || '0000';

    if (pin === storedPIN) {
      localStorage.setItem('isDM', 'true');
      window.dispatchEvent(new Event('dm-status-changed'));
      onDMLogin();
      setShowPINDialog(false);
      setPin('');
      haptic('success');
      play('success', 0.5);
      toast.success('Director Access Granted', {
        description: 'You now have full control over the campaign'
      });
      // Navigate to Director Hub
      navigate(createPageUrl('DMHub'));
    } else {
      haptic('error');
      play('error', 0.3);
      toast.error('Incorrect PIN');
      setPin('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isDM');
    window.dispatchEvent(new Event('dm-status-changed'));
    onDMLogout();
    haptic('medium');
    play('click', 0.3);
    toast.info('Director Session Ended');
  };

  return (
    <>
      {/* Footer Button */}
      <div className="w-full bg-slate-950/95 backdrop-blur-lg border-t border-violet-500/30 mt-12">
        

















      </div>






















      {/* PIN Dialog */}
      <Dialog open={showPINDialog} onOpenChange={setShowPINDialog}>
        <DialogContent className="bg-slate-900 border-2 border-violet-500 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-violet-400">
              <Lock className="h-5 w-5" />
              Director Authentication Required
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-violet-900/20 border border-violet-500/30 rounded-lg">
              <p className="text-sm text-slate-300">
                Enter your 4-digit PIN to access Director tools and full campaign control.
              </p>
              <p className="text-xs text-slate-400 mt-2">Change your PIN in settings.</p>
            </div>

            <div>
              <Input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePINSubmit()}
                placeholder="Enter PIN"
                maxLength={4}
                className="bg-slate-800 border-violet-500/30 text-white text-center text-2xl tracking-[0.5em] font-mono"
                autoFocus />

            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowPINDialog(false);
                  setPin('');
                }}
                variant="outline"
                className="flex-1">

                Cancel
              </Button>
              <Button
                onClick={handlePINSubmit}
                disabled={pin.length !== 4}
                className="flex-1 bg-violet-600 hover:bg-violet-700">

                <Shield className="h-4 w-4 mr-2" />
                Authenticate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>);

}