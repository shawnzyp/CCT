import React, { useState } from 'react';
import PageWrapper from '@/components/utils/PageWrapper';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Gift, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import RewardManager from '@/components/dm/RewardManager';

export default function RewardCenter() {
  const [selectedCampaignId, setSelectedCampaignId] = useState('');

  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => base44.entities.Campaign.list('-created_date'),
  });

  return (
    <PageWrapper className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link to={createPageUrl('DMHub')}>
            <Button variant="ghost" className="gap-2 text-slate-400 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Back to GM Hub
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
              <Gift className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Quest Reward Center</h1>
              <p className="text-slate-400">Create and distribute rewards to your vigilantes</p>
            </div>
          </div>
        </div>

        <Card className="bg-slate-900/50 border-violet-500/30 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Select Campaign</CardTitle>
            <CardDescription>Choose which campaign to manage rewards for</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-md">
              <Label>Campaign</Label>
              <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a campaign..." />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map(campaign => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {selectedCampaignId && <RewardManager campaignId={selectedCampaignId} />}

        {!selectedCampaignId && (
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-12 text-center">
              <Gift className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Select a campaign above to manage rewards</p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
}