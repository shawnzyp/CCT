import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, User, BookOpen, Swords, Package } from "lucide-react";
import SessionLog from "@/components/campaign/SessionLog";
import QuestTrackerReadOnly from "@/components/campaign/QuestTrackerReadOnly";
import CollaborativeJournal from "@/components/campaign/CollaborativeJournal";
import WorldEventsReadOnly from "@/components/campaign/WorldEventsReadOnly";
import SharedResources from "@/components/campaign/SharedResources";
import CombatTracker from "@/components/combat/CombatTracker";
import CollaborativeNotes from "@/components/campaign/CollaborativeNotes";
import CampaignChat from "@/components/campaign/CampaignChat";

export default function PlayCampaign({ currentCharacter }) {
  const urlParams = new URLSearchParams(window.location.search);
  const campaignId = urlParams.get('id');
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('session');
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
  
  const { data: myCharacter } = useQuery({
    queryKey: ['my-campaign-character', campaignId, currentUser?.email],
    queryFn: () => base44.entities.Character.filter({ 
      campaign_id: campaignId,
      created_by: currentUser?.email 
    }),
    select: (data) => data[0],
    enabled: !!campaignId && !!currentUser?.email
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 pb-8">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to={createPageUrl('Campaigns')}>
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">{campaign.name}</h1>
            <p className="text-slate-400">{campaign.description}</p>
          </div>
        </div>

        {/* My Character Card */}
        {myCharacter && (
          <Card className="bg-slate-800/50 border-violet-500 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{myCharacter.name}</h3>
                    <p className="text-sm text-slate-400">
                      Level {myCharacter.level} • {myCharacter.current_hp}/{myCharacter.max_hp} HP
                    </p>
                  </div>
                </div>
                <Link to={createPageUrl(`CharacterSheet?id=${myCharacter.id}`)}>
                  <Button variant="outline" size="sm">View Sheet</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white w-full sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="session">💬 Session Log</SelectItem>
              <SelectItem value="quests">📜 Quests</SelectItem>
              <SelectItem value="journal">📖 Journal</SelectItem>
              <SelectItem value="events">🌍 World Events</SelectItem>
              <SelectItem value="world">🗺️ World Info</SelectItem>
              <SelectItem value="resources">📦 Shared Resources</SelectItem>
              <SelectItem value="chat">💬 Chat</SelectItem>
              <SelectItem value="combat">⚔️ Combat</SelectItem>
            </SelectContent>
          </Select>
          
          <TabsContent value="session">
            <SessionLog 
              sessionLog={campaign.session_log || []} 
              onAddMessage={handleAddSessionMessage}
              currentCharacter={myCharacter || currentCharacter}
            />
          </TabsContent>
          
          <TabsContent value="quests">
            <QuestTrackerReadOnly quests={campaign.quests || []} />
          </TabsContent>
          
          <TabsContent value="journal">
            <CollaborativeJournal 
              campaign={campaign}
              currentUser={currentUser}
              onUpdate={(data) => updateCampaign.mutate(data)}
            />
          </TabsContent>
          
          <TabsContent value="events">
            <WorldEventsReadOnly campaign={campaign} />
          </TabsContent>
          
          <TabsContent value="world">
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">World Information</h2>
              
              {/* Locations */}
              {campaign.world_locations?.length > 0 && (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Locations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {campaign.world_locations.map((loc, i) => (
                      <div key={i} className="bg-slate-700/50 rounded p-3">
                        <h4 className="font-medium text-white mb-1">{loc.name}</h4>
                        <p className="text-sm text-slate-400 mb-2">{loc.description}</p>
                        <CollaborativeNotes 
                          notes={loc.notes || []}
                          currentUser={currentUser}
                          onUpdate={(notes) => {
                            const newLocations = [...campaign.world_locations];
                            newLocations[i] = { ...loc, notes };
                            updateCampaign.mutate({ world_locations: newLocations });
                          }}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
              
              {/* NPCs */}
              {campaign.world_npcs?.length > 0 && (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">NPCs</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {campaign.world_npcs.map((npc, i) => (
                      <div key={i} className="bg-slate-700/50 rounded p-3">
                        <h4 className="font-medium text-white mb-1">{npc.name}</h4>
                        <p className="text-xs text-slate-500 mb-1">{npc.role}</p>
                        <p className="text-sm text-slate-300 mb-2">{npc.description}</p>
                        {npc.relationship && (
                          <p className="text-xs text-slate-400 mb-2">Relationship: {npc.relationship}</p>
                        )}
                        <CollaborativeNotes 
                          notes={npc.notes || []}
                          currentUser={currentUser}
                          onUpdate={(notes) => {
                            const newNPCs = [...campaign.world_npcs];
                            newNPCs[i] = { ...npc, notes };
                            updateCampaign.mutate({ world_npcs: newNPCs });
                          }}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
              
              {!campaign.world_locations?.length && !campaign.world_npcs?.length && (
                <Card className="bg-slate-800/30 border-slate-700 border-dashed">
                  <CardContent className="py-12 text-center">
                    <p className="text-slate-400">No world information available yet</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="resources">
            <SharedResources 
              campaign={campaign}
              onUpdate={(data) => updateCampaign.mutate(data)}
            />
          </TabsContent>
          
          <TabsContent value="chat">
            <CampaignChat 
              campaign={campaign}
              currentUser={currentUser}
              myCharacter={myCharacter}
              characters={characters}
              isDM={false}
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