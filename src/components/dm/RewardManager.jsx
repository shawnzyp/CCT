import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Gift, Plus, Send, Trash2, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function RewardManager({ campaignId }) {
  const [showCreate, setShowCreate] = useState(false);
  const [newReward, setNewReward] = useState({
    reward_name: '',
    reward_type: 'xp',
    distribution_type: 'manual',
    reward_data: { amount: 0 },
    recipient_character_ids: [],
    quest_id: '',
    distribution_date: ''
  });

  const queryClient = useQueryClient();

  const { data: rewards = [] } = useQuery({
    queryKey: ['questRewards', campaignId],
    queryFn: () => base44.entities.QuestReward.filter({ campaign_id: campaignId }, '-created_date'),
  });

  const { data: characters = [] } = useQuery({
    queryKey: ['characters', campaignId],
    queryFn: () => base44.entities.Character.filter({ campaign_id: campaignId }),
  });

  const { data: campaign } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: async () => {
      const campaigns = await base44.entities.Campaign.filter({ id: campaignId });
      return campaigns[0];
    },
  });

  const createRewardMutation = useMutation({
    mutationFn: (rewardData) => base44.entities.QuestReward.create({
      ...rewardData,
      campaign_id: campaignId
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questRewards'] });
      setShowCreate(false);
      setNewReward({
        reward_name: '',
        reward_type: 'xp',
        distribution_type: 'manual',
        reward_data: { amount: 0 },
        recipient_character_ids: [],
        quest_id: '',
        distribution_date: ''
      });
      toast.success('Reward created');
    },
  });

  const distributeRewardMutation = useMutation({
    mutationFn: (rewardId) => base44.functions.invoke('distributeReward', { reward_id: rewardId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questRewards'] });
      queryClient.invalidateQueries({ queryKey: ['characters'] });
      toast.success('Reward distributed!');
    },
  });

  const deleteRewardMutation = useMutation({
    mutationFn: (rewardId) => base44.entities.QuestReward.delete(rewardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questRewards'] });
      toast.success('Reward deleted');
    },
  });

  const handleCreateReward = () => {
    createRewardMutation.mutate(newReward);
  };

  const toggleRecipient = (charId) => {
    setNewReward(prev => ({
      ...prev,
      recipient_character_ids: prev.recipient_character_ids.includes(charId)
        ? prev.recipient_character_ids.filter(id => id !== charId)
        : [...prev.recipient_character_ids, charId]
    }));
  };

  const rewardTypeIcons = {
    xp: '⭐',
    credits: '💰',
    item: '📦',
    equipment: '⚔️',
    custom_item: '✨'
  };

  return (
    <Card className="bg-slate-900/50 border-violet-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-violet-400 flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Reward Manager
            </CardTitle>
            <CardDescription>Set up and distribute rewards for players</CardDescription>
          </div>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Reward
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {rewards.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No rewards created yet. Click "Create Reward" to start.
          </div>
        ) : (
          <div className="space-y-3">
            {rewards.map(reward => (
              <div
                key={reward.id}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{rewardTypeIcons[reward.reward_type]}</span>
                      <h3 className="font-semibold text-white">{reward.reward_name}</h3>
                      {reward.distributed && (
                        <Badge variant="secondary" className="bg-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Distributed
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-slate-400 space-y-1">
                      <div>Type: {reward.reward_type}</div>
                      {reward.reward_type === 'xp' && (
                        <div>Amount: {reward.reward_data.amount} XP</div>
                      )}
                      {reward.reward_type === 'credits' && (
                        <div>Amount: {reward.reward_data.amount} Credits</div>
                      )}
                      <div>Recipients: {reward.recipient_character_ids.length} characters</div>
                      <div className="flex items-center gap-1">
                        {reward.distribution_type === 'manual' && (
                          <>
                            <Send className="h-3 w-3" />
                            Manual Distribution
                          </>
                        )}
                        {reward.distribution_type === 'auto_quest_complete' && (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            Auto (Quest Complete)
                          </>
                        )}
                        {reward.distribution_type === 'auto_scheduled' && (
                          <>
                            <Clock className="h-3 w-3" />
                            Scheduled: {new Date(reward.distribution_date).toLocaleString()}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!reward.distributed && reward.distribution_type === 'manual' && (
                      <Button
                        size="sm"
                        onClick={() => distributeRewardMutation.mutate(reward.id)}
                        disabled={distributeRewardMutation.isPending}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Distribute
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteRewardMutation.mutate(reward.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Reward</DialogTitle>
            <DialogDescription>Set up a new reward for your players</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Reward Name</Label>
              <Input
                value={newReward.reward_name}
                onChange={(e) => setNewReward({ ...newReward, reward_name: e.target.value })}
                placeholder="e.g., Dragon Slayer Bonus"
              />
            </div>

            <div>
              <Label>Reward Type</Label>
              <Select
                value={newReward.reward_type}
                onValueChange={(value) => setNewReward({ 
                  ...newReward, 
                  reward_type: value,
                  reward_data: value === 'xp' || value === 'credits' ? { amount: 0 } : {}
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xp">⭐ Experience Points</SelectItem>
                  <SelectItem value="credits">💰 Credits</SelectItem>
                  <SelectItem value="item">📦 Item</SelectItem>
                  <SelectItem value="equipment">⚔️ Equipment</SelectItem>
                  <SelectItem value="custom_item">✨ Custom Item</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(newReward.reward_type === 'xp' || newReward.reward_type === 'credits') && (
              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  value={newReward.reward_data.amount || 0}
                  onChange={(e) => setNewReward({
                    ...newReward,
                    reward_data: { amount: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>
            )}

            <div>
              <Label>Distribution Type</Label>
              <Select
                value={newReward.distribution_type}
                onValueChange={(value) => setNewReward({ ...newReward, distribution_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual (DM clicks distribute)</SelectItem>
                  <SelectItem value="auto_quest_complete">Auto (Quest Completion)</SelectItem>
                  <SelectItem value="auto_scheduled">Scheduled (Date & Time)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newReward.distribution_type === 'auto_scheduled' && (
              <div>
                <Label>Distribution Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={newReward.distribution_date}
                  onChange={(e) => setNewReward({ ...newReward, distribution_date: e.target.value })}
                />
              </div>
            )}

            {newReward.distribution_type === 'auto_quest_complete' && (
              <div>
                <Label>Quest (Optional - leave empty for any quest)</Label>
                <Select
                  value={newReward.quest_id}
                  onValueChange={(value) => setNewReward({ ...newReward, quest_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any quest" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Any quest</SelectItem>
                    {campaign?.quests?.map(quest => (
                      <SelectItem key={quest.id} value={quest.id}>
                        {quest.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Recipients (Select Characters)</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {characters.map(char => (
                  <Button
                    key={char.id}
                    type="button"
                    variant={newReward.recipient_character_ids.includes(char.id) ? 'default' : 'outline'}
                    onClick={() => toggleRecipient(char.id)}
                    className="justify-start"
                  >
                    {newReward.recipient_character_ids.includes(char.id) && (
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    )}
                    {char.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateReward}
              disabled={!newReward.reward_name || newReward.recipient_character_ids.length === 0}
            >
              Create Reward
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}