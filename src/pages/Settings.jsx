import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Settings as SettingsIcon, Play, Trash2, AlertTriangle, ShieldAlert, Palette, Monitor, FlaskConical, Radio } from "lucide-react";
import AegisSettings from '@/components/aegis/AegisSettings';
import SessionLinkPanel from '@/components/session/SessionLinkPanel';
import EventInbox from '@/components/session/EventInbox';
import PlayerSignalButton from '@/components/session/PlayerSignalButton';
import { usePresenceHeartbeat } from '@/components/utils/usePresenceHeartbeat';
import VisualQA from '@/components/theme/VisualQA';
import { toast } from "sonner";
import { useSettings } from '@/components/utils/useSettings';
import useSoundEffects from '@/components/sounds/useSoundEffects';
import { base44 } from '@/api/base44Client';
import ThemeSwitcher from '@/components/theme/ThemeSwitcher';
import { useTheme } from '@/components/theme/useTheme';

export default function Settings() {
  const { settings, updateSettings } = useSettings();
  const { play } = useSoundEffects();
  const { theme } = useTheme();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showQA, setShowQA] = useState(false);
  const [linkedSession, setLinkedSession] = useState(null);
  
  // Initialize presence heartbeat
  useEffect(() => {
    const stored = localStorage.getItem('linkedSession');
    if (stored) {
      try {
        setLinkedSession(JSON.parse(stored));
      } catch {}
    }
  }, []);
  usePresenceHeartbeat(linkedSession?.campaignId, linkedSession?.sessionId);
  
  const handleGlitchChange = (value) => {
    const newSettings = { ...settings, glitchIntensity: value };
    updateSettings(newSettings);
  };

  const accentA = theme?.colors?.accentA || '#00E5FF';
  const panel0 = theme?.colors?.panel0 || '#1A1F26';

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
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 font-mono tracking-wider"
            style={{ color: theme?.colors?.text0 || '#E6F1FF' }}>
            <SettingsIcon className="h-7 w-7" style={{ color: accentA }} />
            SYSTEM SETTINGS
          </h1>
          <p className="mt-1 text-sm font-mono" style={{ color: theme?.colors?.muted || '#5F6E80' }}>
            Customize your Catalyst Core field interface
          </p>
        </div>

        {/* Faction Theme */}
        <div className="rounded-xl border mb-4 overflow-hidden"
          style={{ background: panel0, borderColor: accentA + '30' }}>
          <div className="px-4 py-3 border-b flex items-center gap-2"
            style={{ borderColor: accentA + '20' }}>
            <Palette className="h-4 w-4" style={{ color: accentA }} />
            <span className="text-xs font-mono font-bold uppercase tracking-[0.15em]"
              style={{ color: theme?.colors?.text0 }}>Faction Theme</span>
          </div>
          <div className="p-4">
            <ThemeSwitcher />
          </div>
        </div>

        {/* Boot Sequence */}
        <div className="rounded-xl border mb-4 overflow-hidden"
          style={{ background: panel0, borderColor: accentA + '30' }}>
          <div className="px-4 py-3 border-b flex items-center gap-2"
            style={{ borderColor: accentA + '20' }}>
            <Monitor className="h-4 w-4" style={{ color: accentA }} />
            <span className="text-xs font-mono font-bold uppercase tracking-[0.15em]"
              style={{ color: theme?.colors?.text0 }}>Boot Sequence</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm font-medium" style={{ color: theme?.colors?.text0 }}>Startup Boot Sequence</div>
                <div className="text-xs mt-0.5" style={{ color: theme?.colors?.muted }}>Show faction boot screen on startup</div>
              </div>
              <Switch
                checked={settings.bootEnabled !== false}
                onCheckedChange={(v) => updateSetting('bootEnabled', v)}
              />
            </div>
            {settings.bootEnabled !== false && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  sessionStorage.removeItem('bootShown');
                  window.location.reload();
                }}
                className="text-xs"
                style={{ borderColor: accentA + '50', color: accentA, background: 'transparent' }}
              >
                Preview Boot Sequence
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-xl border mb-4 overflow-hidden"
          style={{ background: panel0, borderColor: accentA + '30' }}>
          <div className="px-4 py-3 border-b"
            style={{ borderColor: accentA + '20' }}>
            <span className="text-xs font-mono font-bold uppercase tracking-[0.15em]"
              style={{ color: theme?.colors?.text0 }}>🎨 Visual Settings</span>
          </div>
          <div className="p-4 space-y-4">
                <SettingRow label="Font Size" desc="UI text scale">
                  <Select value={settings.fontSize} onValueChange={(v) => updateSetting('fontSize', v)}>
                    <SelectTrigger className="w-36 text-xs" style={{ background: theme?.colors?.bg0, borderColor: accentA + '40', color: theme?.colors?.text0 }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="xlarge">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingRow>
                <SettingRow label="Colorblind Mode" desc="Accessibility filter">
                  <Select value={settings.colorblindMode} onValueChange={(v) => updateSetting('colorblindMode', v)}>
                    <SelectTrigger className="w-36 text-xs" style={{ background: theme?.colors?.bg0, borderColor: accentA + '40', color: theme?.colors?.text0 }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="protanopia">Protanopia</SelectItem>
                      <SelectItem value="deuteranopia">Deuteranopia</SelectItem>
                      <SelectItem value="tritanopia">Tritanopia</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingRow>
                <SettingRow label="Animations" desc="Page transitions and UI motion">
                  <Switch checked={settings.animationsEnabled} onCheckedChange={(v) => updateSetting('animationsEnabled', v)} />
                </SettingRow>
                <SettingRow label="Particle Effects" desc="Background grid and particle FX">
                  <Switch checked={settings.particleEffects} onCheckedChange={(v) => updateSetting('particleEffects', v)} />
                </SettingRow>
                <SettingRow label="High Contrast" desc="Increase text/background contrast">
                  <Switch checked={settings.highContrast} onCheckedChange={(v) => updateSetting('highContrast', v)} />
                </SettingRow>
                <SettingRow label="Reduced Motion" desc="Minimize all animations">
                  <Switch checked={settings.reducedMotion} onCheckedChange={(v) => updateSetting('reducedMotion', v)} />
                </SettingRow>
                <SettingRow label="Scanline Effect" desc="CRT scanline overlay">
                  <Switch checked={settings.scanlineEffect} onCheckedChange={(v) => updateSetting('scanlineEffect', v)} />
                </SettingRow>
                <SettingRow label="Glow Effects" desc="Accent glow on active elements">
                  <Switch checked={settings.glowEffects} onCheckedChange={(v) => updateSetting('glowEffects', v)} />
                </SettingRow>
          </div>
        </div>

        {/* Audio */}
        <div className="rounded-xl border mb-4 overflow-hidden"
          style={{ background: panel0, borderColor: accentA + '30' }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: accentA + '20' }}>
            <span className="text-xs font-mono font-bold uppercase tracking-[0.15em]"
              style={{ color: theme?.colors?.text0 }}>🔊 Audio Settings</span>
          </div>
          <div className="p-4 space-y-3">
            <SettingRow label="Sound Effects" desc="Combat and action sounds">
              <Switch checked={settings.soundEffects} onCheckedChange={(v) => updateSetting('soundEffects', v)} />
            </SettingRow>
            {settings.soundEffects && (
              <div className="pl-4 border-l-2 space-y-2" style={{ borderColor: accentA + '60' }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono" style={{ color: theme?.colors?.text1 }}>SFX Volume: {settings.sfxVolume}%</span>
                  <button onClick={testSound} className="text-xs px-2 py-1 rounded border" style={{ color: accentA, borderColor: accentA + '50' }}>
                    <Play className="h-3 w-3" />
                  </button>
                </div>
                <Slider value={[settings.sfxVolume]} onValueChange={([v]) => updateSetting('sfxVolume', v)} max={100} step={5} />
              </div>
            )}
            <SettingRow label="UI Sounds" desc="Button clicks and navigation">
              <Switch checked={settings.uiSounds} onCheckedChange={(v) => updateSetting('uiSounds', v)} />
            </SettingRow>
            {settings.uiSounds && (
              <div className="pl-4 border-l-2 space-y-2" style={{ borderColor: accentA + '60' }}>
                <span className="text-xs font-mono" style={{ color: theme?.colors?.text1 }}>UI Volume: {settings.uiVolume}%</span>
                <Slider value={[settings.uiVolume]} onValueChange={([v]) => updateSetting('uiVolume', v)} max={100} step={5} />
              </div>
            )}
            <SettingRow label="Background Music" desc="Ambient soundtrack">
              <Switch checked={settings.backgroundMusic} onCheckedChange={(v) => updateSetting('backgroundMusic', v)} />
            </SettingRow>
            {settings.backgroundMusic && (
              <div className="pl-4 border-l-2 space-y-2" style={{ borderColor: accentA + '60' }}>
                <span className="text-xs font-mono" style={{ color: theme?.colors?.text1 }}>Music Volume: {settings.musicVolume}%</span>
                <Slider value={[settings.musicVolume]} onValueChange={([v]) => updateSetting('musicVolume', v)} max={100} step={5} />
              </div>
            )}
          </div>
        </div>

        {/* Gameplay */}
        <div className="rounded-xl border mb-4 overflow-hidden"
          style={{ background: panel0, borderColor: accentA + '30' }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: accentA + '20' }}>
            <span className="text-xs font-mono font-bold uppercase tracking-[0.15em]"
              style={{ color: theme?.colors?.text0 }}>🎮 Gameplay Settings</span>
          </div>
          <div className="p-4 space-y-3">
            <SettingRow label="Auto-Calculate Modifiers" desc="Add skill and stat bonuses automatically">
              <Switch checked={settings.autoCalculateModifiers} onCheckedChange={(v) => updateSetting('autoCalculateModifiers', v)} />
            </SettingRow>
            <SettingRow label="Auto-Save" desc="Save character progress automatically">
              <Switch checked={settings.autoSave} onCheckedChange={(v) => updateSetting('autoSave', v)} />
            </SettingRow>
            {settings.autoSave && (
              <div className="pl-4 border-l-2" style={{ borderColor: accentA + '60' }}>
                <Select value={settings.autoSaveInterval.toString()} onValueChange={(v) => updateSetting('autoSaveInterval', parseInt(v))}>
                  <SelectTrigger className="w-40 text-xs" style={{ background: theme?.colors?.bg0, borderColor: accentA + '40', color: theme?.colors?.text0 }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Every 1 min</SelectItem>
                    <SelectItem value="3">Every 3 min</SelectItem>
                    <SelectItem value="5">Every 5 min</SelectItem>
                    <SelectItem value="10">Every 10 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <SettingRow label="Show Tutorials" desc="Helpful tooltips and guides">
              <Switch checked={settings.showTutorials} onCheckedChange={(v) => updateSetting('showTutorials', v)} />
            </SettingRow>
            <SettingRow label="Confirm Dangerous Actions" desc="Require confirmation for deletions">
              <Switch checked={settings.confirmDangerousActions} onCheckedChange={(v) => updateSetting('confirmDangerousActions', v)} />
            </SettingRow>
            <SettingRow label="Dice Roll Animations" desc="Animated dice effects">
              <Switch checked={settings.showDiceAnimations} onCheckedChange={(v) => updateSetting('showDiceAnimations', v)} />
            </SettingRow>
            <SettingRow label="Critical Hit Effects" desc="Special FX for critical hits">
              <Switch checked={settings.criticalHitEffects} onCheckedChange={(v) => updateSetting('criticalHitEffects', v)} />
            </SettingRow>
            <SettingRow label="Floating Damage Numbers" desc="Animated damage display">
              <Switch checked={settings.damageNumbersFloat} onCheckedChange={(v) => updateSetting('damageNumbersFloat', v)} />
            </SettingRow>
            <SettingRow label="Initiative Reminders" desc="Notify when it's your turn">
              <Switch checked={settings.initiativeReminders} onCheckedChange={(v) => updateSetting('initiativeReminders', v)} />
            </SettingRow>
            <SettingRow label="Auto-Roll Initiative" desc="Roll initiative automatically">
              <Switch checked={settings.autoRollInitiative} onCheckedChange={(v) => updateSetting('autoRollInitiative', v)} />
            </SettingRow>
            <SettingRow label="Compact Mode" desc="Reduced spacing and padding">
              <Switch checked={settings.compactMode} onCheckedChange={(v) => updateSetting('compactMode', v)} />
            </SettingRow>
            <SettingRow label="Show Grid Lines" desc="Tactical grid on combat map">
              <Switch checked={settings.showGridLines} onCheckedChange={(v) => updateSetting('showGridLines', v)} />
            </SettingRow>
          </div>
        </div>

        {/* Account Security */}
        <div className="rounded-xl border mb-4 overflow-hidden"
          style={{ background: panel0, borderColor: (theme?.colors?.danger || '#FF3B3B') + '40' }}>
          <div className="px-4 py-3 border-b flex items-center gap-2"
            style={{ borderColor: (theme?.colors?.danger || '#FF3B3B') + '30' }}>
            <ShieldAlert className="h-4 w-4" style={{ color: theme?.colors?.danger || '#FF3B3B' }} />
            <span className="text-xs font-mono font-bold uppercase tracking-[0.15em]"
              style={{ color: theme?.colors?.text0 }}>Account Security</span>
          </div>
          <div className="p-4">
            <SettingRow label="Delete Account" desc="Permanently delete account and all data">
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border"
                style={{ color: theme?.colors?.danger || '#FF3B3B', borderColor: (theme?.colors?.danger || '#FF3B3B') + '60', background: 'transparent' }}
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </SettingRow>
          </div>
        </div>

        {/* Session Link Status */}
        <div className="rounded-xl border mb-4 overflow-hidden"
          style={{ background: panel0, borderColor: 'rgba(139,92,246,0.3)' }}>
          <div className="px-4 py-3 border-b flex items-center gap-2"
            style={{ borderColor: 'rgba(139,92,246,0.2)' }}>
            <Radio className="h-4 w-4" style={{ color: '#a78bfa' }} />
            <span className="text-xs font-mono font-bold uppercase tracking-[0.15em]"
              style={{ color: theme?.colors?.text0 }}>Session Connection</span>
          </div>
          <div className="p-4 space-y-4">
            <SessionLinkPanel />
            <div className="pt-3 border-t border-slate-700">
              <div className="text-xs font-mono uppercase text-slate-400 mb-3">Event Inbox</div>
              <EventInbox />
            </div>
            <div className="pt-3 border-t border-slate-700">
              <PlayerSignalButton />
            </div>
          </div>
        </div>

        {/* A.E.G.I.S. Settings */}
        <div className="rounded-xl border mb-4 overflow-hidden"
          style={{ background: panel0, borderColor: 'rgba(139,92,246,0.3)' }}>
          <div className="px-4 py-3 border-b flex items-center gap-2"
            style={{ borderColor: 'rgba(139,92,246,0.2)' }}>
            <Radio className="h-4 w-4" style={{ color: '#a78bfa' }} />
            <span className="text-xs font-mono font-bold uppercase tracking-[0.15em]"
              style={{ color: theme?.colors?.text0 }}>A.E.G.I.S. Configuration</span>
          </div>
          <div className="p-4">
            <AegisSettings />
          </div>
        </div>

        {/* Director Boot Settings */}
        {isDM && (
          <div className="rounded-xl border mb-4 overflow-hidden"
            style={{ background: panel0, borderColor: accentA + '30' }}>
            <div className="px-4 py-3 border-b flex items-center gap-2"
              style={{ borderColor: accentA + '20' }}>
              <Shield className="h-4 w-4" style={{ color: accentA }} />
              <span className="text-xs font-mono font-bold uppercase tracking-[0.15em]"
                style={{ color: theme?.colors?.text0 }}>Biometric Boot Settings</span>
            </div>
            <div className="p-4 space-y-3">
              <SettingRow label="Biometric Glitch Intensity" desc="Visual glitch intensity during scan (0-1)">
                <Slider
                  value={[settings.glitchIntensity || 0.3]}
                  onValueChange={(v) => handleGlitchChange(v[0])}
                  min={0}
                  max={1}
                  step={0.1}
                  className="w-40"
                />
              </SettingRow>
            </div>
          </div>
        )}

        {/* Visual QA Toggle */}
        <div className="rounded-xl border mb-4 overflow-hidden"
          style={{ background: panel0, borderColor: (theme?.colors?.accentB || '#5CCFFF') + '30' }}>
          <div className="px-4 py-3 border-b flex items-center gap-2"
            style={{ borderColor: (theme?.colors?.accentB || '#5CCFFF') + '20' }}>
            <FlaskConical className="h-4 w-4" style={{ color: theme?.colors?.accentB || '#5CCFFF' }} />
            <span className="text-xs font-mono font-bold uppercase tracking-[0.15em]"
              style={{ color: theme?.colors?.text0 }}>Developer</span>
          </div>
          <div className="p-4">
            <SettingRow label="Visual QA Mode" desc="Highlight layout bounds and token values">
              <Switch checked={showQA} onCheckedChange={setShowQA} />
            </SettingRow>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg border text-center"
          style={{ borderColor: accentA + '25', background: accentA + '08' }}>
          <p className="text-xs font-mono" style={{ color: theme?.colors?.muted }}>
            SETTINGS AUTO-SAVED // FIELD CONFIG PERSISTENT
          </p>
        </div>
      </div>

      {showQA && <VisualQA onClose={() => setShowQA(false)} />}

      {/* Delete Confirmation */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md" style={{ background: panel0, borderColor: (theme?.colors?.danger || '#FF3B3B') + '60' }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: theme?.colors?.danger || '#FF3B3B' }}>
              <AlertTriangle className="h-5 w-5" />
              Delete Account
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 rounded-lg border" style={{ borderColor: (theme?.colors?.danger || '#FF3B3B') + '40', background: (theme?.colors?.danger || '#FF3B3B') + '10' }}>
              <p className="text-sm" style={{ color: theme?.colors?.text1 }}>
                This will permanently delete your account and <strong style={{ color: theme?.colors?.danger }}>all associated data</strong> including characters, campaigns, and settings. This action <strong style={{ color: theme?.colors?.danger }}>cannot be undone</strong>.
              </p>
            </div>
            <div>
              <Label className="text-xs" style={{ color: theme?.colors?.muted }}>
                Type <strong style={{ color: theme?.colors?.danger }}>DELETE</strong> to confirm
              </Label>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE here"
                className="mt-1"
                style={{ background: theme?.colors?.bg0, borderColor: (theme?.colors?.danger || '#FF3B3B') + '40', color: theme?.colors?.text0 }}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }} className="flex-1">
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleteConfirmText !== 'DELETE' || isDeleting} className="flex-1">
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Shared row component
function SettingRow({ label, desc, children }) {
  const { theme } = useTheme();
  return (
    <div className="flex items-center justify-between py-2.5 border-b last:border-b-0"
      style={{ borderColor: (theme?.colors?.accentA || '#00E5FF') + '12' }}>
      <div>
        <div className="text-sm font-medium" style={{ color: theme?.colors?.text0 || '#E6F1FF' }}>{label}</div>
        {desc && <div className="text-xs mt-0.5" style={{ color: theme?.colors?.muted || '#5F6E80' }}>{desc}</div>}
      </div>
      <div className="flex-shrink-0 ml-4">{children}</div>
    </div>
  );
}