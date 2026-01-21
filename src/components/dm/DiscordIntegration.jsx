import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Radio, Check, X, AlertCircle, Zap, Users, Trophy, 
  Heart, Swords, Dice6, Scroll, Sparkles, Package, Crown,
  Settings, Palette, Send, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const EVENT_TYPES = [
  {
    id: 'combat_start',
    name: 'Combat Started',
    description: 'When a combat encounter begins',
    icon: Swords,
    color: 'text-red-400',
    category: 'Combat'
  },
  {
    id: 'combat_end',
    name: 'Combat Ended',
    description: 'When combat is completed',
    icon: Check,
    color: 'text-green-400',
    category: 'Combat'
  },
  {
    id: 'character_death',
    name: 'Character Death',
    description: 'When a character falls in combat',
    icon: Heart,
    color: 'text-slate-400',
    category: 'Combat'
  },
  {
    id: 'critical_roll',
    name: 'Critical Rolls',
    description: 'Natural 20s and Natural 1s',
    icon: Dice6,
    color: 'text-amber-400',
    category: 'Dice'
  },
  {
    id: 'level_up',
    name: 'Level Up',
    description: 'When a character gains a level',
    icon: Crown,
    color: 'text-yellow-400',
    category: 'Progression'
  },
  {
    id: 'quest_complete',
    name: 'Quest Completed',
    description: 'When a quest is finished',
    icon: Scroll,
    color: 'text-blue-400',
    category: 'Story'
  },
  {
    id: 'adventure_complete',
    name: 'Adventure Completed',
    description: 'When an adventure module is finished',
    icon: Sparkles,
    color: 'text-purple-400',
    category: 'Story'
  },
  {
    id: 'deck_draw',
    name: 'Deck of Fates Draw',
    description: 'When a player draws from the Deck of Fates',
    icon: Sparkles,
    color: 'text-violet-400',
    category: 'Special Events'
  },
  {
    id: 'achievement_unlocked',
    name: 'Achievement Unlocked',
    description: 'When a player earns an achievement',
    icon: Trophy,
    color: 'text-amber-400',
    category: 'Progression'
  },
  {
    id: 'item_acquired',
    name: 'Legendary Item Acquired',
    description: 'When a legendary or epic item is obtained',
    icon: Package,
    color: 'text-orange-400',
    category: 'Loot'
  },
  {
    id: 'party_wipe',
    name: 'Party Wipe',
    description: 'When all characters fall in combat',
    icon: X,
    color: 'text-red-600',
    category: 'Combat'
  }
];

const EMBED_PRESETS = [
  { name: 'Violet', color: '#8B5CF6' },
  { name: 'Blue', color: '#3B82F6' },
  { name: 'Emerald', color: '#10B981' },
  { name: 'Amber', color: '#F59E0B' },
  { name: 'Red', color: '#EF4444' },
  { name: 'Purple', color: '#A855F7' }
];

export default function DiscordIntegration() {
  const queryClient = useQueryClient();
  const [testLoading, setTestLoading] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['discord-settings'],
    queryFn: async () => {
      const list = await base44.entities.DiscordSettings.list();
      return list[0] || null;
    }
  });

  const [formData, setFormData] = useState({
    webhook_url: settings?.webhook_url || '',
    bot_username: settings?.bot_username || 'O.M.N.I. S.C. REPORT',
    enabled_events: settings?.enabled_events || [],
    embed_color: settings?.embed_color || '#8B5CF6',
    embed_footer: settings?.embed_footer || '',
    avatar_url: settings?.avatar_url || '',
    enabled: settings?.enabled || false
  });

  React.useEffect(() => {
    if (settings) {
      setFormData({
        webhook_url: settings.webhook_url || '',
        bot_username: settings.bot_username || 'O.M.N.I. S.C. REPORT',
        enabled_events: settings.enabled_events || [],
        embed_color: settings.embed_color || '#8B5CF6',
        embed_footer: settings.embed_footer || '',
        avatar_url: settings.avatar_url || '',
        enabled: settings.enabled || false
      });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (settings?.id) {
        return await base44.entities.DiscordSettings.update(settings.id, data);
      } else {
        return await base44.entities.DiscordSettings.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['discord-settings']);
      toast.success('Discord settings saved');
    },
    onError: (error) => {
      toast.error('Failed to save settings');
      console.error(error);
    }
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const toggleEvent = (eventId) => {
    const current = formData.enabled_events || [];
    if (current.includes(eventId)) {
      setFormData({ ...formData, enabled_events: current.filter(e => e !== eventId) });
    } else {
      setFormData({ ...formData, enabled_events: [...current, eventId] });
    }
  };

  const enableAllEvents = () => {
    setFormData({ ...formData, enabled_events: EVENT_TYPES.map(e => e.id) });
  };

  const disableAllEvents = () => {
    setFormData({ ...formData, enabled_events: [] });
  };

  const testWebhook = async () => {
    if (!formData.webhook_url) {
      toast.error('Please enter a webhook URL first');
      return;
    }

    setTestLoading(true);
    try {
      const response = await base44.functions.invoke('notifyDiscord', {
        eventType: 'test',
        webhookUrl: formData.webhook_url,
        botUsername: formData.bot_username,
        embedColor: formData.embed_color,
        avatarUrl: formData.avatar_url,
        data: {
          message: 'Discord webhook test successful! Your integration is working correctly.'
        }
      });

      if (response.data.success) {
        toast.success('Test message sent to Discord!');
      } else {
        toast.error('Test failed: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error) {
      toast.error('Test failed: ' + error.message);
    } finally {
      setTestLoading(false);
    }
  };

  const groupedEvents = EVENT_TYPES.reduce((acc, event) => {
    if (!acc[event.category]) acc[event.category] = [];
    acc[event.category].push(event);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Master Toggle */}
      <Card className="bg-slate-800/50 border-violet-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                <Radio className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <CardTitle className="text-white">Discord Integration</CardTitle>
                <CardDescription>Send game events to your Discord server</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="enabled" className="text-slate-300">
                {formData.enabled ? 'Enabled' : 'Disabled'}
              </Label>
              <Switch
                id="enabled"
                checked={formData.enabled}
                onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Webhook Configuration */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="h-5 w-5 text-violet-400" />
            Webhook Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-slate-300">Webhook URL *</Label>
            <Input
              value={formData.webhook_url}
              onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
              placeholder="https://discord.com/api/webhooks/..."
              className="bg-slate-900 border-slate-700 text-white mt-1"
            />
            <p className="text-xs text-slate-500 mt-1">
              Get this from Discord: Server Settings → Integrations → Webhooks
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Bot Username</Label>
              <Input
                value={formData.bot_username}
                onChange={(e) => setFormData({ ...formData, bot_username: e.target.value })}
                placeholder="O.M.N.I. S.C. REPORT"
                className="bg-slate-900 border-slate-700 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300">Avatar URL (optional)</Label>
              <Input
                value={formData.avatar_url}
                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                placeholder="https://..."
                className="bg-slate-900 border-slate-700 text-white mt-1"
              />
            </div>
          </div>

          <Button
            onClick={testWebhook}
            disabled={!formData.webhook_url || testLoading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {testLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending Test...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Test Message
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Embed Appearance */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Palette className="h-5 w-5 text-violet-400" />
            Embed Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-slate-300">Default Embed Color</Label>
            <div className="flex gap-2 mt-2 flex-wrap">
              {EMBED_PRESETS.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => setFormData({ ...formData, embed_color: preset.color })}
                  className={cn(
                    "w-16 h-10 rounded-lg border-2 transition-all",
                    formData.embed_color === preset.color 
                      ? "border-white scale-110" 
                      : "border-slate-600 hover:border-slate-400"
                  )}
                  style={{ backgroundColor: preset.color }}
                  title={preset.name}
                />
              ))}
              <Input
                type="color"
                value={formData.embed_color}
                onChange={(e) => setFormData({ ...formData, embed_color: e.target.value })}
                className="w-16 h-10 p-1 bg-slate-900 border-slate-700"
              />
            </div>
          </div>

          <div>
            <Label className="text-slate-300">Footer Text (optional)</Label>
            <Input
              value={formData.embed_footer}
              onChange={(e) => setFormData({ ...formData, embed_footer: e.target.value })}
              placeholder="e.g., Catalyst Core Campaign System"
              className="bg-slate-900 border-slate-700 text-white mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Event Selection */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-violet-400" />
              Event Selection
            </CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={enableAllEvents}
                className="border-green-500 text-green-400 hover:bg-green-500/20"
              >
                Enable All
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={disableAllEvents}
                className="border-red-500 text-red-400 hover:bg-red-500/20"
              >
                Disable All
              </Button>
            </div>
          </div>
          <CardDescription>
            Select which events should be sent to Discord ({formData.enabled_events?.length || 0} / {EVENT_TYPES.length} enabled)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(groupedEvents).map(([category, events]) => (
            <div key={category}>
              <div className="text-sm font-semibold text-violet-400 mb-3 uppercase tracking-wider">
                {category}
              </div>
              <div className="space-y-2">
                {events.map(event => {
                  const Icon = event.icon;
                  const isEnabled = formData.enabled_events?.includes(event.id);
                  
                  return (
                    <button
                      key={event.id}
                      onClick={() => toggleEvent(event.id)}
                      className={cn(
                        "w-full p-4 rounded-lg border-2 transition-all text-left",
                        isEnabled 
                          ? "bg-violet-500/10 border-violet-500/50" 
                          : "bg-slate-900/50 border-slate-700 hover:border-slate-600"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            isEnabled ? "bg-violet-500/20" : "bg-slate-800"
                          )}>
                            <Icon className={cn("h-5 w-5", isEnabled ? event.color : "text-slate-500")} />
                          </div>
                          <div>
                            <div className="font-medium text-white">{event.name}</div>
                            <div className="text-xs text-slate-400">{event.description}</div>
                          </div>
                        </div>
                        <div className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                          isEnabled 
                            ? "bg-violet-500 border-violet-500" 
                            : "border-slate-600"
                        )}>
                          {isEnabled && <Check className="h-4 w-4 text-white" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button
          onClick={handleSave}
          disabled={!formData.webhook_url || saveMutation.isPending}
          className="bg-violet-600 hover:bg-violet-700 px-8"
        >
          {saveMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      {!formData.enabled && (
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-300">
                Discord integration is currently disabled. Enable it at the top to start sending events to Discord.
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}