import React, { useState, useEffect } from 'react';
import { useTutorial } from '@/components/tutorial/TutorialSystem';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, Palette, Volume2, Gamepad2, Save } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('catalystCoreSettings');
    return saved ? JSON.parse(saved) : {
      // Visual Settings
      theme: 'dark',
      animationsEnabled: true,
      particleEffects: true,
      colorblindMode: 'none',
      fontSize: 'medium',
      highContrast: false,
      
      // Audio Settings
      soundEffects: true,
      sfxVolume: 70,
      uiSounds: true,
      uiVolume: 50,
      backgroundMusic: false,
      musicVolume: 30,
      
      // Game Settings
      autoCalculateModifiers: true,
      showTutorials: true,
      confirmDangerousActions: true,
      autoSave: true,
      autoSaveInterval: 3,
      showDiceAnimations: true,
      criticalHitEffects: true,
      damageNumbersFloat: true,
      initiativeReminders: true
    };
  });

  const saveSettings = () => {
    localStorage.setItem('catalystCoreSettings', JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('settingsChanged', { detail: settings }));
    toast.success('Settings saved!');
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  useEffect(() => {
    saveSettings();
  }, [settings]);

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

        <Tabs value={settings.activeTab || 'visual'} className="space-y-4">
          <Select value={settings.activeTab || 'visual'} onValueChange={(v) => updateSetting('activeTab', v)}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="visual">🎨 Visual</SelectItem>
              <SelectItem value="audio">🔊 Audio</SelectItem>
              <SelectItem value="game">🎮 Gameplay</SelectItem>
            </SelectContent>
          </Select>

          {/* Visual Settings */}
          <TabsContent value="visual">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Visual Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audio Settings */}
          <TabsContent value="audio">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Audio Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
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
                    <Label className="text-slate-300">SFX Volume: {settings.sfxVolume}%</Label>
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
          </TabsContent>

          {/* Game Settings */}
          <TabsContent value="game">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Gameplay Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="bg-slate-800 border-slate-700 mt-4">
          <CardContent className="py-4">
            <Button
              onClick={saveSettings}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Save All Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}