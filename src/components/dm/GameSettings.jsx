import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings, Radio, Sparkles, BookOpen, Target, Zap } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function GameSettings({ campaign, onUpdate }) {
  const [discordWebhook, setDiscordWebhook] = useState(
    localStorage.getItem('discord_webhook_url') || ''
  );
  const [webhookName, setWebhookName] = useState(
    localStorage.getItem('discord_webhook_name') || 'O.M.N.I. S.C. REPORT'
  );
  const [webhookEvents, setWebhookEvents] = useState({
    combat_start: true,
    combat_end: true,
    level_up: true,
    character_death: true,
    critical_roll: true,
    quest_complete: true,
    adventure_complete: true,
    deck_draw: true,
    echo_vote: true,
    achievement_unlock: true
  });

  const saveDiscordSettings = () => {
    localStorage.setItem('discord_webhook_url', discordWebhook);
    localStorage.setItem('discord_webhook_name', webhookName);
    localStorage.setItem('discord_webhook_events', JSON.stringify(webhookEvents));
    toast.success('Discord settings saved');
  };

  const toggleWebhookEvent = (event) => {
    const updated = { ...webhookEvents, [event]: !webhookEvents[event] };
    setWebhookEvents(updated);
    localStorage.setItem('discord_webhook_events', JSON.stringify(updated));
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="discord" className="w-full">
        <TabsList className="bg-slate-800 border border-slate-700 grid grid-cols-3 w-full">
          <TabsTrigger value="discord">
            <Radio className="h-4 w-4 mr-2" />
            Discord
          </TabsTrigger>
          <TabsTrigger value="features">
            <Sparkles className="h-4 w-4 mr-2" />
            Features
          </TabsTrigger>
          <TabsTrigger value="gameplay">
            <Target className="h-4 w-4 mr-2" />
            Gameplay
          </TabsTrigger>
        </TabsList>

        {/* Discord Settings */}
        <TabsContent value="discord" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">Discord Webhook Integration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-slate-400">Webhook URL</Label>
                <Input
                  value={discordWebhook}
                  onChange={(e) => setDiscordWebhook(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..."
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <Label className="text-slate-400">Bot Name</Label>
                <Input
                  value={webhookName}
                  onChange={(e) => setWebhookName(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-400">Events to Post</Label>
                <ScrollArea className="h-[300px] rounded border border-slate-700 p-3">
                  <div className="space-y-3">
                    {Object.entries(webhookEvents).map(([event, enabled]) => (
                      <div key={event} className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                        <span className="text-sm text-slate-300 capitalize">
                          {event.replace(/_/g, ' ')}
                        </span>
                        <Switch
                          checked={enabled}
                          onCheckedChange={() => toggleWebhookEvent(event)}
                        />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <Button onClick={saveDiscordSettings} className="w-full bg-violet-600 hover:bg-violet-700">
                Save Discord Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feature Toggles */}
        <TabsContent value="features" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">Campaign Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded">
                <div>
                  <p className="text-white font-medium">Shards of Many Fates</p>
                  <p className="text-xs text-slate-400">Allow players to draw fate shards</p>
                </div>
                <Switch
                  checked={campaign.shards_enabled || false}
                  onCheckedChange={(checked) => onUpdate({ shards_enabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded">
                <div>
                  <p className="text-white font-medium">Achievement System</p>
                  <p className="text-xs text-slate-400">Track and award player achievements</p>
                </div>
                <Switch
                  checked={campaign.achievements_enabled || false}
                  onCheckedChange={(checked) => onUpdate({ achievements_enabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded">
                <div>
                  <p className="text-white font-medium">Cinematic Action Points</p>
                  <p className="text-xs text-slate-400">Allow once-per-session hero moments</p>
                </div>
                <Switch
                  checked={campaign.cinematic_actions_enabled !== false}
                  onCheckedChange={(checked) => onUpdate({ cinematic_actions_enabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded">
                <div>
                  <p className="text-white font-medium">Death Saves</p>
                  <p className="text-xs text-slate-400">Require death saving throws at 0 HP</p>
                </div>
                <Switch
                  checked={campaign.death_saves_enabled !== false}
                  onCheckedChange={(checked) => onUpdate({ death_saves_enabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded">
                <div>
                  <p className="text-white font-medium">Faction Reputation</p>
                  <p className="text-xs text-slate-400">Track standing with organizations</p>
                </div>
                <Switch
                  checked={campaign.faction_reputation_enabled !== false}
                  onCheckedChange={(checked) => onUpdate({ faction_reputation_enabled: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gameplay Settings */}
        <TabsContent value="gameplay" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">Gameplay Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-slate-400">Starting Credits</Label>
                <Input
                  type="number"
                  value={campaign.starting_credits || 500}
                  onChange={(e) => onUpdate({ starting_credits: parseInt(e.target.value) })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <Label className="text-slate-400">XP per Level</Label>
                <Input
                  type="number"
                  value={campaign.xp_per_level || 1000}
                  onChange={(e) => onUpdate({ xp_per_level: parseInt(e.target.value) })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <Label className="text-slate-400">Max Character Level</Label>
                <Input
                  type="number"
                  value={campaign.max_level || 20}
                  onChange={(e) => onUpdate({ max_level: parseInt(e.target.value) })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <Label className="text-slate-400">Rest Healing (HP %)</Label>
                <Input
                  type="number"
                  value={campaign.rest_healing_percent || 100}
                  onChange={(e) => onUpdate({ rest_healing_percent: parseInt(e.target.value) })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded">
                <div>
                  <p className="text-white font-medium">Critical Hit Confirmation</p>
                  <p className="text-xs text-slate-400">Require confirmation roll for crits</p>
                </div>
                <Switch
                  checked={campaign.critical_confirmation || false}
                  onCheckedChange={(checked) => onUpdate({ critical_confirmation: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded">
                <div>
                  <p className="text-white font-medium">Flanking Advantage</p>
                  <p className="text-xs text-slate-400">Grant advantage when flanking</p>
                </div>
                <Switch
                  checked={campaign.flanking_advantage || false}
                  onCheckedChange={(checked) => onUpdate({ flanking_advantage: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}