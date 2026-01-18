import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, BookOpen, Globe, Swords } from "lucide-react";
import CampaignJournal from "@/components/campaign/CampaignJournal";
import CampaignCharacters from "@/components/campaign/CampaignCharacters";
import CampaignEvents from "@/components/campaign/CampaignEvents";
import CombatTracker from "@/components/combat/CombatTracker";

export default function CampaignDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const campaignId = urlParams.get('id');
  const queryClient = useQueryClient();
  
  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: () => base44.entities.Campaign.filter({ id: campaignId }),
    select: (data) => data[0],
    enabled: !!campaignId
  });
  
  const { data: characters = [] } = useQuery({
    queryKey: ['campaign-characters', campaignId],
    queryFn: () => base44.entities.Character.filter({ campaign_id: campaignId }),
    enabled: !!campaignId
  });
  
  if (isLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>;
  if (!campaign) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Campaign not found</div>;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link to={createPageUrl('Campaigns')}>
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">{campaign.name}</h1>
            <p className="text-slate-400">{campaign.description}</p>
          </div>
        </div>
        
        <Tabs defaultValue="journal" className="space-y-4">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="journal"><BookOpen className="h-4 w-4 mr-2" />Journal</TabsTrigger>
            <TabsTrigger value="characters"><Users className="h-4 w-4 mr-2" />Characters</TabsTrigger>
            <TabsTrigger value="events"><Globe className="h-4 w-4 mr-2" />Events</TabsTrigger>
            <TabsTrigger value="combat"><Swords className="h-4 w-4 mr-2" />Combat</TabsTrigger>
          </TabsList>
          
          <TabsContent value="journal">
            <CampaignJournal campaign={campaign} />
          </TabsContent>
          
          <TabsContent value="characters">
            <CampaignCharacters campaignId={campaignId} characters={characters} />
          </TabsContent>
          
          <TabsContent value="events">
            <CampaignEvents campaign={campaign} />
          </TabsContent>
          
          <TabsContent value="combat">
            <CombatTracker characters={characters} campaignId={campaignId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}