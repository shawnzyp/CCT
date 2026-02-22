import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Settings as SettingsIcon, Play, Trash2, AlertTriangle, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useSettings } from '@/components/utils/useSettings';
import useSoundEffects from '@/components/sounds/useSoundEffects';
import { base44 } from '@/api/base44Client';

export default function Settings() {
  const { settings, updateSettings } = useSettings();
  const { play } = useSoundEffects();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const updateSetting = (key, value) => {
    updateSettings({ [key]: value });
    toast.success('Setting updated', { duration: 1000 });
  };
  
  const testSound = () => {
    play('click');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Type DELETE to confirm');
      return;
    }
    setIsDeleting(true);
    try {
      // Clear all local data
      localStorage.clear();
      // Log out
      await base44.auth.logout('/');
      toast.success('Account deleted');
    } catch (error) {
      toast.error('Failed to delete account. Contact support.');
    }
    setIsDeleting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-violet-400" />
            Settings
          </h1>
          <p className="text-slate-400 mt-2">Customize your Catalyst Core experience</p>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              🎨 Visual Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">


                <div className="space-y-2">
                  <Label className="text-slate-300">Theme</Label>
                  <Select value={settings.theme} onValueChange={(v) => updateSetting('theme', v)}>
                    <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dark">Dark (Default)</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="midnight">Midnight Blue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Font Size</Label>
                  <Select value={settings.fontSize} onValueChange={(v) => updateSetting('fontSize', v)}>
                    <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="xlarge">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Colorblind Mode</Label>
                  <Select value={settings.colorblindMode} onValueChange={(v) => updateSetting('colorblindMode', v)}>
                    <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="protanopia">Protanopia</SelectItem>
                      <SelectItem value="deuteranopia">Deuteranopia</SelectItem>
                      <SelectItem value="tritanopia">Tritanopia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                  <div>
                    <Label className="text-slate-300">Animations</Label>
                    <p className="text-xs text-slate-500">Enable page transitions and UI animations</p>
                  </div>
                  <Switch
                    checked={settings.animationsEnabled}
                    onCheckedChange={(v) => updateSetting('animationsEnabled', v)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                  <div>
                    <Label className="text-slate-300">Particle Effects</Label>
                    <p className="text-xs text-slate-500">Background particle animations</p>
                  </div>
                  <Switch
                    checked={settings.particleEffects}
                    onCheckedChange={(v) => updateSetting('particleEffects', v)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                  <div>
                    <Label className="text-slate-300">High Contrast Mode</Label>
                    <p className="text-xs text-slate-500">Increase text contrast for readability</p>
                  </div>
                  <Switch
                    checked={settings.highContrast}
                    onCheckedChange={(v) => updateSetting('highContrast', v)}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                  <div>
                    <Label className="text-slate-300">Reduced Motion</Label>
                    <p className="text-xs text-slate-500">Minimize animations for motion sensitivity</p>
                  </div>
                  <Switch
                    checked={settings.reducedMotion}
                    onCheckedChange={(v) => updateSetting('reducedMotion', v)}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                  <div>
                    <Label className="text-slate-300">Scanline Effect</Label>
                    <p className="text-xs text-slate-500">Retro CRT scanline overlay</p>
                  </div>
                  <Switch
                    checked={settings.scanlineEffect}
                    onCheckedChange={(v) => updateSetting('scanlineEffect', v)}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                  <div>
                    <Label className="text-slate-300">Glow Effects</Label>
                    <p className="text-xs text-slate-500">Card and button glow effects</p>
                  </div>
                  <Switch
                    checked={settings.glowEffects}
                    onCheckedChange={(v) => updateSetting('glowEffects', v)}
                  />
                </div>
              </CardContent>
            </Card>
            
        <Card className="bg-slate-800 border-slate-700 mt-4">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              🔊 Audio Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                  <div>
                    <Label className="text-slate-300">Sound Effects</Label>
                    <p className="text-xs text-slate-500">Combat and action sounds</p>
                  </div>
                  <Switch
                    checked={settings.soundEffects}
                    onCheckedChange={(v) => updateSetting('soundEffects', v)}
                  />
                </div>

                {settings.soundEffects && (
                  <div className="space-y-2 pl-4 border-l-2 border-violet-500">
                    <div className="flex items-center justify-between">
                      <Label className="text-slate-300">SFX Volume: {settings.sfxVolume}%</Label>
                      <Button size="sm" variant="outline" onClick={testSound} className="h-7">
                        <Play className="h-3 w-3" />
                      </Button>
                    </div>
                    <Slider
                      value={[settings.sfxVolume]}
                      onValueChange={([v]) => updateSetting('sfxVolume', v)}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                  <div>
                    <Label className="text-slate-300">UI Sounds</Label>
                    <p className="text-xs text-slate-500">Button clicks and navigation sounds</p>
                  </div>
                  <Switch
                    checked={settings.uiSounds}
                    onCheckedChange={(v) => updateSetting('uiSounds', v)}
                  />
                </div>

                {settings.uiSounds && (
                  <div className="space-y-2 pl-4 border-l-2 border-violet-500">
                    <Label className="text-slate-300">UI Volume: {settings.uiVolume}%</Label>
                    <Slider
                      value={[settings.uiVolume]}
                      onValueChange={([v]) => updateSetting('uiVolume', v)}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                  <div>
                    <Label className="text-slate-300">Background Music</Label>
                    <p className="text-xs text-slate-500">Ambient soundtrack</p>
                  </div>
                  <Switch
                    checked={settings.backgroundMusic}
                    onCheckedChange={(v) => updateSetting('backgroundMusic', v)}
                  />
                </div>

                {settings.backgroundMusic && (
                  <div className="space-y-2 pl-4 border-l-2 border-violet-500">
                    <Label className="text-slate-300">Music Volume: {settings.musicVolume}%</Label>
                    <Slider
                      value={[settings.musicVolume]}
                      onValueChange={([v]) => updateSetting('musicVolume', v)}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
            
        <Card className="bg-slate-800 border-slate-700 mt-4">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              🎮 Gameplay Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                  <div>
                    <Label className="text-slate-300">Auto-Calculate Modifiers</Label>
                    <p className="text-xs text-slate-500">Automatically add skill and stat bonuses</p>
                  </div>
                  <Switch
                    checked={settings.autoCalculateModifiers}
                    onCheckedChange={(v) => updateSetting('autoCalculateModifiers', v)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                  <div>
                    <Label className="text-slate-300">Auto-Save</Label>
                    <p className="text-xs text-slate-500">Automatically save character progress</p>
                  </div>
                  <Switch
                    checked={settings.autoSave}
                    onCheckedChange={(v) => updateSetting('autoSave', v)}
                  />
                </div>

                {settings.autoSave && (
                  <div className="space-y-2 pl-4 border-l-2 border-violet-500">
                    <Label className="text-slate-300">Auto-Save Interval</Label>
                    <Select 
                      value={settings.autoSaveInterval.toString()} 
                      onValueChange={(v) => updateSetting('autoSaveInterval', parseInt(v))}
                    >
                      <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Every 1 minute</SelectItem>
                        <SelectItem value="3">Every 3 minutes</SelectItem>
                        <SelectItem value="5">Every 5 minutes</SelectItem>
                        <SelectItem value="10">Every 10 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                  <div>
                    <Label className="text-slate-300">Show Tutorials</Label>
                    <p className="text-xs text-slate-500">Display helpful tooltips and guides</p>
                  </div>
                  <Switch
                    checked={settings.showTutorials}
                    onCheckedChange={(v) => updateSetting('showTutorials', v)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                  <div>
                    <Label className="text-slate-300">Confirm Dangerous Actions</Label>
                    <p className="text-xs text-slate-500">Require confirmation for deletions and irreversible actions</p>
                  </div>
                  <Switch
                    checked={settings.confirmDangerousActions}
                    onCheckedChange={(v) => updateSetting('confirmDangerousActions', v)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                  <div>
                    <Label className="text-slate-300">Dice Roll Animations</Label>
                    <p className="text-xs text-slate-500">Animated dice rolling effects</p>
                  </div>
                  <Switch
                    checked={settings.showDiceAnimations}
                    onCheckedChange={(v) => updateSetting('showDiceAnimations', v)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                  <div>
                    <Label className="text-slate-300">Critical Hit Effects</Label>
                    <p className="text-xs text-slate-500">Special visual effects for critical hits</p>
                  </div>
                  <Switch
                    checked={settings.criticalHitEffects}
                    onCheckedChange={(v) => updateSetting('criticalHitEffects', v)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                  <div>
                    <Label className="text-slate-300">Floating Damage Numbers</Label>
                    <p className="text-xs text-slate-500">Show damage numbers with animation</p>
                  </div>
                  <Switch
                    checked={settings.damageNumbersFloat}
                    onCheckedChange={(v) => updateSetting('damageNumbersFloat', v)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                  <div>
                    <Label className="text-slate-300">Initiative Reminders</Label>
                    <p className="text-xs text-slate-500">Notify when it's your turn in combat</p>
                  </div>
                  <Switch
                    checked={settings.initiativeReminders}
                    onCheckedChange={(v) => updateSetting('initiativeReminders', v)}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                  <div>
                    <Label className="text-slate-300">Auto-Roll Initiative</Label>
                    <p className="text-xs text-slate-500">Automatically roll initiative in combat</p>
                  </div>
                  <Switch
                    checked={settings.autoRollInitiative}
                    onCheckedChange={(v) => updateSetting('autoRollInitiative', v)}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                  <div>
                    <Label className="text-slate-300">Compact Mode</Label>
                    <p className="text-xs text-slate-500">Reduce spacing and padding throughout app</p>
                  </div>
                  <Switch
                    checked={settings.compactMode}
                    onCheckedChange={(v) => updateSetting('compactMode', v)}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                  <div>
                    <Label className="text-slate-300">Show Grid Lines</Label>
                    <p className="text-xs text-slate-500">Display tactical grid on combat map</p>
                  </div>
                  <Switch
                    checked={settings.showGridLines}
                    onCheckedChange={(v) => updateSetting('showGridLines', v)}
                  />
                </div>
              </CardContent>
            </Card>
            
        {/* Account Security */}
        <Card className="bg-slate-800 border-red-900/50 mt-4">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-400" />
              Account Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-950/20 border border-red-900/40 rounded-lg">
              <div>
                <Label className="text-slate-300">Delete Account</Label>
                <p className="text-xs text-slate-500">Permanently delete your account and all data. This cannot be undone.</p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
                className="ml-3 flex-shrink-0"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-slate-800/50 border border-violet-500/30 rounded-xl">
          <p className="text-sm text-slate-400 text-center">
            ✨ Settings are automatically saved as you change them
          </p>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="bg-slate-900 border-red-500 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Delete Account
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-lg">
              <p className="text-sm text-slate-300">
                This will permanently delete your account and <strong className="text-red-400">all associated data</strong> including characters, campaigns, and settings. This action <strong className="text-red-400">cannot be undone</strong>.
              </p>
            </div>
            <div>
              <Label className="text-slate-400 text-xs">Type <strong className="text-red-400">DELETE</strong> to confirm</Label>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE here"
                className="mt-1 bg-slate-800 border-red-900/50 text-white"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }} className="flex-1 border-slate-600">
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                className="flex-1"
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}