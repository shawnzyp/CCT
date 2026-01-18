import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Users, BookOpen, Globe, Swords, ScrollText, Milestone, MessageSquare, LayoutDashboard, Map } from "lucide-react";
import CampaignJournal from "@/components/campaign/CampaignJournal";
import CampaignCharacters from "@/components/campaign/CampaignCharacters";
import CampaignEvents from "@/components/campaign/CampaignEvents";
import CombatTracker from "@/components/combat/CombatTracker";
import QuestTracker from "@/components/campaign/QuestTracker";
import StoryArcTracker from "@/components/campaign/StoryArcTracker";
import SessionLog from "@/components/campaign/SessionLog";
import CampaignDashboard from "@/components/campaign/CampaignDashboard";
import WorldBuilder from "@/components/campaign/WorldBuilder";
import WorldEventsManager from "@/components/campaign/WorldEventsManager";
import CollaborativeJournal from "@/components/campaign/CollaborativeJournal";
import SharedResources from "@/components/campaign/SharedResources";

export default function CampaignDetail({ currentCharacter }) {
  const urlParams = new URLSearchParams(window.location.search);
  const campaignId = urlParams.get('id');
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = React.useState(null);
  
  React.useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);
  
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
  
  const updateCampaign = useMutation({
    mutationFn: (data) => base44.entities.Campaign.update(campaignId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
    },
  });
  
  const handleAddSessionMessage = (message) => {
    const sessionLog = [...(campaign.session_log || []), message];
    updateCampaign.mutate({ session_log: sessionLog });
  };
  
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
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white w-full sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dashboard">📊 Dashboard</SelectItem>
              <SelectItem value="log">💬 Session Log</SelectItem>
              <SelectItem value="quests">📜 Quests</SelectItem>
              <SelectItem value="arcs">🎯 Story Arcs</SelectItem>
              <SelectItem value="journal">📖 Journal</SelectItem>
              <SelectItem value="world">🗺️ World</SelectItem>
              <SelectItem value="characters">👥 Characters</SelectItem>
              <SelectItem value="events">🌍 World Events</SelectItem>
              <SelectItem value="resources">📦 Shared Resources</SelectItem>
              <SelectItem value="combat">⚔️ Combat</SelectItem>
            </SelectContent>
          </Select>
          
          <TabsContent value="dashboard">
            <CampaignDashboard campaign={campaign} characters={characters} />
          </TabsContent>
          
          <TabsContent value="world">
            <WorldBuilder 
              campaign={campaign}
              onUpdate={(data) => updateCampaign.mutate(data)}
            />
          </TabsContent>
          
          <TabsContent value="log">
            <SessionLog 
              sessionLog={campaign.session_log || []} 
              onAddMessage={handleAddSessionMessage}
              currentCharacter={currentCharacter}
            />
          </TabsContent>
          
          <TabsContent value="quests">
            <QuestTracker 
              quests={campaign.quests || []} 
              onUpdate={(quests) => updateCampaign.mutate({ quests })}
            />
          </TabsContent>
          
          <TabsContent value="arcs">
            <StoryArcTracker 
              storyArcs={campaign.story_arcs || []} 
              onUpdate={(story_arcs) => updateCampaign.mutate({ story_arcs })}
            />
          </TabsContent>
          
          <TabsContent value="journal">
            <CollaborativeJournal 
              campaign={campaign}
              currentUser={currentUser}
              onUpdate={(data) => updateCampaign.mutate(data)}
            />
          </TabsContent>
          
          <TabsContent value="characters">
            <CampaignCharacters campaignId={campaignId} characters={characters} />
          </TabsContent>
          
          <TabsContent value="events">
            <WorldEventsManager 
              campaign={campaign}
              onUpdate={(data) => updateCampaign.mutate(data)}
            />
          </TabsContent>
          
          <TabsContent value="resources">
            <SharedResources 
              campaign={campaign}
              onUpdate={(data) => updateCampaign.mutate(data)}
            />
          </TabsContent>
          
          <TabsContent value="combat">
            <CombatTracker characters={characters} campaignId={campaignId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}