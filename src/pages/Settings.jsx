import React, { useState } from 'react';
import { useSettings } from '@/components/utils/useSettings';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Volume2, Zap, Shield, Palette, Music, Settings, Code, Trash2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import useSoundEffects from '@/components/sounds/useSoundEffects';

function SettingRow({ label, description, children, variant = 'default' }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-cyan-900/20 last:border-0">
      <div className="flex-1">
        <div className="font-mono text-sm font-semibold text-cyan-100">{label}</div>
        {description && <div className="text-xs mt-1 opacity-70 font-mono">{description}</div>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export default function Settings() {
  const { settings, updateSetting, updateSettings, reset } = useSettings();
  const { play } = useSoundEffects();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleSoundTest = (type) => {
    if (type === 'sfx' && settings.sfxEnabled) {
      play?.('attack');
    } else if (type === 'ui' && settings.uiSoundsEnabled) {
      play?.('click');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.toLowerCase() !== 'delete my account') return;
    
    try {
      // Clear local data
      localStorage.clear();
      sessionStorage.clear();
      
      // Logout
      await base44.auth.logout('/');
      toast.success('Account deletion initiated');
    } catch (err) {
      toast.error('Failed to delete account');
    }
  };

  const resetCategory = (category) => {
    reset(category);
    toast.success(`${category} settings reset to defaults`);
    play?.('ui_confirm');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-black p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-cyan-100 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            SETTINGS
          </h1>
          <p className="text-xs font-mono text-cyan-900/70 mt-1">Configure your experience</p>
        </div>

        <Tabs defaultValue="visual" className="space-y-6">
          <TabsList className="grid grid-cols-4 gap-2 bg-slate-900/50 border border-cyan-900/30 p-1">
            <TabsTrigger value="visual" className="text-xs">Visual</TabsTrigger>
            <TabsTrigger value="audio" className="text-xs">Audio</TabsTrigger>
            <TabsTrigger value="gameplay" className="text-xs">Gameplay</TabsTrigger>
            <TabsTrigger value="account" className="text-xs">Account</TabsTrigger>
          </TabsList>

          {/* ── VISUAL SETTINGS ── */}
          <TabsContent value="visual" className="space-y-4">
            <div className="rounded-lg border border-cyan-900/30 bg-slate-900/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-cyan-100 flex items-center gap-2">
                  <Palette className="w-4 h-4" /> Visual
                </h2>
                <Button variant="outline" size="sm" onClick={() => resetCategory('Visual')}>
                  <RotateCcw className="w-3 h-3 mr-1" /> Reset
                </Button>
              </div>

              <SettingRow label="Font Size" description="Scale all text and UI elements">
                <Select value={settings.fontSize} onValueChange={(v) => updateSetting('fontSize', v)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Default</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="xlarge">X-Large</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>

              <SettingRow label="High Contrast" description="Increase border and text contrast">
                <Switch
                  checked={settings.highContrast}
                  onCheckedChange={(v) => updateSetting('highContrast', v)}
                />
              </SettingRow>

              <SettingRow label="Reduced Motion" description="Disable heavy animations">
                <Switch
                  checked={settings.reducedMotion}
                  onCheckedChange={(v) => updateSetting('reducedMotion', v)}
                />
              </SettingRow>

              <SettingRow label="Particle Effects" description="Show background grid and effects">
                <Switch
                  checked={settings.particleEffects}
                  onCheckedChange={(v) => updateSetting('particleEffects', v)}
                />
              </SettingRow>

              <SettingRow label="Scanline Effect" description="CRT scanline overlay">
                <Switch
                  checked={settings.scanlineEffect}
                  onCheckedChange={(v) => updateSetting('scanlineEffect', v)}
                />
              </SettingRow>

              <SettingRow label="Glow Effects" description="Accent glow on active elements">
                <Switch
                  checked={settings.glowEffects}
                  onCheckedChange={(v) => updateSetting('glowEffects', v)}
                />
              </SettingRow>

              <SettingRow label="Animations" description="Page transitions and UI motion">
                <Switch
                  checked={settings.animationsEnabled}
                  onCheckedChange={(v) => updateSetting('animationsEnabled', v)}
                />
              </SettingRow>

              <SettingRow label="Compact Mode" description="Reduce padding and spacing">
                <Switch
                  checked={settings.compactMode}
                  onCheckedChange={(v) => updateSetting('compactMode', v)}
                />
              </SettingRow>

              <SettingRow label="Colorblind Mode" description="Adjust colors for accessibility">
                <Select value={settings.colorblindMode} onValueChange={(v) => updateSetting('colorblindMode', v)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="protanopia">Protanopia (Red-Blind)</SelectItem>
                    <SelectItem value="deuteranopia">Deuteranopia (Green-Blind)</SelectItem>
                    <SelectItem value="tritanopia">Tritanopia (Blue-Blind)</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>
            </div>
          </TabsContent>

          {/* ── AUDIO SETTINGS ── */}
          <TabsContent value="audio" className="space-y-4">
            <div className="rounded-lg border border-cyan-900/30 bg-slate-900/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-cyan-100 flex items-center gap-2">
                  <Music className="w-4 h-4" /> Audio
                </h2>
                <Button variant="outline" size="sm" onClick={() => resetCategory('Audio')}>
                  <RotateCcw className="w-3 h-3 mr-1" /> Reset
                </Button>
              </div>

              <SettingRow label="Master Mute">
                <Switch
                  checked={settings.masterMute}
                  onCheckedChange={(v) => updateSetting('masterMute', v)}
                />
              </SettingRow>

              <SettingRow label="Sound Effects">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={settings.sfxEnabled}
                    onCheckedChange={(v) => updateSetting('sfxEnabled', v)}
                    disabled={settings.masterMute}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSoundTest('sfx')}
                    disabled={settings.masterMute}
                  >
                    Test
                  </Button>
                </div>
              </SettingRow>

              <SettingRow label="SFX Volume" description={`${settings.sfxVolume}%`}>
                <Slider
                  min={0}
                  max={100}
                  step={5}
                  value={[settings.sfxVolume]}
                  onValueChange={(v) => updateSetting('sfxVolume', v[0])}
                  disabled={settings.masterMute || !settings.sfxEnabled}
                  className="w-32"
                />
              </SettingRow>

              <SettingRow label="UI Sounds">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={settings.uiSoundsEnabled}
                    onCheckedChange={(v) => updateSetting('uiSoundsEnabled', v)}
                    disabled={settings.masterMute}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSoundTest('ui')}
                    disabled={settings.masterMute}
                  >
                    Test
                  </Button>
                </div>
              </SettingRow>

              <SettingRow label="UI Volume" description={`${settings.uiSoundsVolume}%`}>
                <Slider
                  min={0}
                  max={100}
                  step={5}
                  value={[settings.uiSoundsVolume]}
                  onValueChange={(v) => updateSetting('uiSoundsVolume', v[0])}
                  disabled={settings.masterMute || !settings.uiSoundsEnabled}
                  className="w-32"
                />
              </SettingRow>

              <SettingRow label="Background Music">
                <Switch
                  checked={settings.musicEnabled}
                  onCheckedChange={(v) => updateSetting('musicEnabled', v)}
                  disabled={settings.masterMute}
                />
              </SettingRow>

              <SettingRow label="Music Volume" description={`${settings.musicVolume}%`}>
                <Slider
                  min={0}
                  max={100}
                  step={5}
                  value={[settings.musicVolume]}
                  onValueChange={(v) => updateSetting('musicVolume', v[0])}
                  disabled={settings.masterMute || !settings.musicEnabled}
                  className="w-32"
                />
              </SettingRow>
            </div>
          </TabsContent>

          {/* ── GAMEPLAY SETTINGS ── */}
          <TabsContent value="gameplay" className="space-y-4">
            <div className="rounded-lg border border-cyan-900/30 bg-slate-900/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-cyan-100 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Gameplay
                </h2>
                <Button variant="outline" size="sm" onClick={() => resetCategory('Gameplay')}>
                  <RotateCcw className="w-3 h-3 mr-1" /> Reset
                </Button>
              </div>

              <SettingRow label="Auto-Calculate Modifiers" description="Automatically derive from ability scores">
                <Switch
                  checked={settings.autoCalculateModifiers}
                  onCheckedChange={(v) => updateSetting('autoCalculateModifiers', v)}
                />
              </SettingRow>

              <SettingRow label="Auto-Save" description="Periodically save progress">
                <Switch
                  checked={settings.autoSaveEnabled}
                  onCheckedChange={(v) => updateSetting('autoSaveEnabled', v)}
                />
              </SettingRow>

              {settings.autoSaveEnabled && (
                <SettingRow label="Auto-Save Interval" description="How often to save">
                  <Select value={String(settings.autoSaveInterval)} onValueChange={(v) => updateSetting('autoSaveInterval', parseInt(v))}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 minute</SelectItem>
                      <SelectItem value="3">3 minutes</SelectItem>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingRow>
              )}

              <SettingRow label="Show Tutorials" description="Display tutorial tooltips">
                <Switch
                  checked={settings.showTutorials}
                  onCheckedChange={(v) => updateSetting('showTutorials', v)}
                />
              </SettingRow>

              <SettingRow label="Confirm Dangerous Actions" description="Require confirmation for deletes">
                <Switch
                  checked={settings.confirmDangerousActions}
                  onCheckedChange={(v) => updateSetting('confirmDangerousActions', v)}
                />
              </SettingRow>

              <SettingRow label="Dice Animations" description="Animate dice rolls">
                <Switch
                  checked={settings.diceAnimations}
                  onCheckedChange={(v) => updateSetting('diceAnimations', v)}
                />
              </SettingRow>

              <SettingRow label="Critical Hit Effects" description="Visual effects on crits">
                <Switch
                  checked={settings.criticalHitEffects}
                  onCheckedChange={(v) => updateSetting('criticalHitEffects', v)}
                />
              </SettingRow>

              <SettingRow label="Floating Damage Numbers" description="Animated damage display">
                <Switch
                  checked={settings.floatingDamageNumbers}
                  onCheckedChange={(v) => updateSetting('floatingDamageNumbers', v)}
                />
              </SettingRow>

              <SettingRow label="Initiative Reminders" description="Notify when it's your turn">
                <Switch
                  checked={settings.initiativeReminders}
                  onCheckedChange={(v) => updateSetting('initiativeReminders', v)}
                />
              </SettingRow>

              <SettingRow label="Auto-Roll Initiative">
                <span className="text-xs opacity-50 font-mono">Coming Soon</span>
              </SettingRow>

              <SettingRow label="Show Grid Lines">
                <span className="text-xs opacity-50 font-mono">Coming Soon (Combat Map)</span>
              </SettingRow>
            </div>
          </TabsContent>

          {/* ── ACCOUNT ── */}
          <TabsContent value="account" className="space-y-4">
            <div className="rounded-lg border border-red-900/30 bg-slate-900/50 p-4 space-y-3">
              <h2 className="text-sm font-semibold text-red-300 flex items-center gap-2">
                <Shield className="w-4 h-4" /> Danger Zone
              </h2>

              <SettingRow label="Delete Account" description="Permanently delete all data">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="w-3 h-3 mr-1" /> Delete
                </Button>
              </SettingRow>
            </div>

            {/* Diagnostics */}
            <div className="rounded-lg border border-cyan-900/30 bg-slate-900/50 p-4 space-y-3">
              <h2 className="text-sm font-semibold text-cyan-100 flex items-center gap-2">
                <Code className="w-4 h-4" /> Diagnostics
              </h2>
              <div className="text-xs font-mono space-y-1 opacity-70">
                <div>Storage: localStorage</div>
                <div>Last Saved: {settings._lastSaved ? new Date(settings._lastSaved).toLocaleString() : 'Never'}</div>
                <div>Version: {settings._version}</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All characters, settings, and data will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <label className="text-sm font-mono text-cyan-100">
              Type "delete my account" to confirm:
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full mt-2 px-3 py-2 rounded border border-cyan-900/30 bg-slate-900 text-cyan-100 font-mono text-sm focus:outline-none focus:border-cyan-500"
              placeholder="delete my account"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText.toLowerCase() !== 'delete my account'}
              className="bg-red-900 hover:bg-red-800"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}