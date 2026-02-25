import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, BookOpen, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useSettings } from '@/components/utils/useSettings';
import { useTheme } from '@/components/theme/useTheme';
import CampaignJournal from "@/components/campaign/CampaignJournal";
import CampaignCharacters from "@/components/campaign/CampaignCharacters";
import CampaignEvents from "@/components/campaign/CampaignEvents";
import CombatTracker from "@/components/combat/CombatTracker";
import QuestTrackerReadOnly from "@/components/campaign/QuestTrackerReadOnly";
import StoryArcTracker from "@/components/campaign/StoryArcTracker";
import WorldEventsReadOnly from "@/components/campaign/WorldEventsReadOnly";
import SessionLog from "@/components/campaign/SessionLog";
import CampaignDashboard from "@/components/campaign/CampaignDashboard";
import WorldBuilder from "@/components/campaign/WorldBuilder";
import WorldEventsManager from "@/components/campaign/WorldEventsManager";
import CollaborativeJournal from "@/components/campaign/CollaborativeJournal";
import SharedResources from "@/components/campaign/SharedResources";
import CampaignChat from "@/components/campaign/CampaignChat";
import { Badge } from "@/components/ui/badge";
import AegisInterface from "@/components/aegis/AegisInterface";
import GMToolsPanel from "@/components/campaign/GMToolsPanel";
import DeckOfFatesPlayer from "@/components/campaign/DeckOfFatesPlayer";
import AdventureModulePlayer from "@/components/campaign/AdventureModulePlayer";
import PlayerDashboard from "@/components/campaign/PlayerDashboard";
import DMLoginFooter from "@/components/dm/DMLoginFooter";
import ShardsOfManyFates from "@/components/campaign/ShardsOfManyFates";
import EchoEventsPlayer from "@/components/campaign/EchoEventsPlayer";
import SessionTimer from "@/components/utils/SessionTimer";
import DiceRollHistory from "@/components/utils/DiceRollHistory";
import CampaignExport from "@/components/campaign/CampaignExport";
import CharacterComparison from "@/components/utils/CharacterComparison";

export default function CampaignDetail({ currentCharacter }) {
  const urlParams = new URLSearchParams(window.location.search);
  const campaignId = urlParams.get('id');
  const queryClient = useQueryClient();
  const { settings } = useSettings();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('player');
  const [currentUser, setCurrentUser] = React.useState(null);
  const [isDM, setIsDM] = React.useState(false);

  const accentA = theme?.colors?.accentA || '#00E5FF';
  const bg0 = theme?.colors?.bg0 || '#0F1216';
  const panel0 = theme?.colors?.panel0 || '#1A1F26';
  const panel1 = theme?.colors?.panel1 || '#202833';
  const text0 = theme?.colors?.text0 || '#E6F1FF';
  const text1 = theme?.colors?.text1 || '#8EA0B5';
  const muted = theme?.colors?.muted || '#5F6E80';
  
  React.useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
    const dmSession = localStorage.getItem('dm_session');
    setIsDM(dmSession === 'active');
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
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: theme?.background?.gradient || bg0 }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
          <Zap className="h-8 w-8" style={{ color: accentA }} />
        </motion.div>
      </div>
    );
  }
  
  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: theme?.background?.gradient || bg0 }}>
        <div className="text-center">
          <h2 className="text-xl font-mono font-semibold mb-4" style={{ color: text0 }}>Campaign not found</h2>
          <Link to={createPageUrl('Campaigns')}>
            <Button style={{ background: accentA, color: '#000' }}>Back to Campaigns</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  const handleDMLogin = () => {
    setIsDM(true);
    localStorage.setItem('dm_session', 'active');
  };

  const handleDMLogout = () => {
    setIsDM(false);
    localStorage.removeItem('dm_session');
  };

  return (
    <div className="min-h-screen pb-20" style={{ background: theme?.background?.gradient || bg0 }}>
      {settings.particleEffects && (theme?.background?.gridOpacity || 0) > 0 && (
        <div className="fixed inset-0 military-grid opacity-30 pointer-events-none" />
      )}
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 pb-24 relative z-10">
        
        {/* Header */}
        <div className="flex items-start gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Link to={createPageUrl('Campaigns')}>
            <Button variant="ghost" size="icon" style={{ color: text1 }}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          {campaign.logo_url && (
            <img 
              src={campaign.logo_url} 
              alt={campaign.name}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
              style={{ border: `1px solid ${accentA}30` }}
            />
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-3xl font-mono font-bold truncate" style={{ color: text0 }}>
              {campaign.name}
            </h1>
            <p className="text-xs sm:text-sm line-clamp-2" style={{ color: text1 }}>
              {campaign.description}
            </p>
          </div>
          <div className="flex-shrink-0">
            <CampaignExport campaign={campaign} characters={characters} />
          </div>
        </div>

        {/* Session Timer & Dice History */}
        <div className="grid md:grid-cols-2 gap-3 sm:gap-4 mb-6">
          <SessionTimer />
          <DiceRollHistory />
        </div>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="hidden md:block">
            <TabsList className="grid grid-cols-4 gap-2" style={{ background: `${panel0}80`, border: `1px solid ${accentA}20` }}>
              <TabsTrigger value="player" className="text-xs">Player</TabsTrigger>
              <TabsTrigger value="dashboard" className="text-xs">Dashboard</TabsTrigger>
              <TabsTrigger value="journal" className="text-xs">Journal</TabsTrigger>
              <TabsTrigger value="characters" className="text-xs">Characters</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="md:hidden">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="text-xs sm:text-sm" style={{ background: `${panel0}80`, borderColor: `${accentA}25`, color: text0 }}>
                <SelectValue />
              </SelectTrigger>
                  <SelectItem value="player">Player</SelectItem>
                <SelectItem value="dashboard">Dashboard</SelectItem>
                <SelectItem value="log">Session Log</SelectItem>
                <SelectItem value="quests">Quests</SelectItem>
                <SelectItem value="arcs">Story Arcs</SelectItem>
                <SelectItem value="journal">Journal</SelectItem>
                <SelectItem value="world">World</SelectItem>
                <SelectItem value="characters">Characters</SelectItem>
                <SelectItem value="events">Events</SelectItem>
                <SelectItem value="resources">Resources</SelectItem>
                <SelectItem value="chat">Chat</SelectItem>
                <SelectItem value="aegis">A.E.G.I.S.</SelectItem>
                <SelectItem value="adventure">Adventure</SelectItem>
                <SelectItem value="deck">Deck</SelectItem>
                <SelectItem value="echo">Echo</SelectItem>
                <SelectItem value="gm-tools">GM Tools</SelectItem>
                <SelectItem value="combat">Combat</SelectItem>
                <SelectItem value="compare">Compare</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <TabsContent value="player">
            <PlayerDashboard campaign={campaign} currentCharacter={currentCharacter} />
          </TabsContent>
          
          <TabsContent value="dashboard">
            <CampaignDashboard campaign={campaign} characters={characters} campaignId={campaignId} />
          </TabsContent>
          
          <TabsContent value="world">
            <div className="rounded-lg border p-4 sm:p-6 space-y-6" style={{ background: panel0, borderColor: `${accentA}20` }}>
              <h3 className="text-base sm:text-lg font-mono font-semibold" style={{ color: text0 }}>World Information</h3>
              <div className="space-y-6">
                {campaign.world_locations?.length > 0 && (
                  <div>
                    <h4 className="text-xs sm:text-sm font-mono font-semibold uppercase mb-3" style={{ color: accentA }}>Locations</h4>
                    <div className="space-y-2">
                      {campaign.world_locations.map((loc, i) => (
                        <div key={i} className="rounded p-3" style={{ background: `${panel1}80`, borderLeft: `2px solid ${accentA}40` }}>
                          <div className="font-mono font-semibold text-sm" style={{ color: text0 }}>{loc.name}</div>
                          <p className="text-xs mt-1" style={{ color: text1 }}>{loc.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {campaign.world_npcs?.length > 0 && (
                  <div>
                    <h4 className="text-xs sm:text-sm font-mono font-semibold uppercase mb-3" style={{ color: accentA }}>NPCs</h4>
                    <div className="space-y-2">
                      {campaign.world_npcs.map((npc, i) => (
                        <div key={i} className="rounded p-3" style={{ background: `${panel1}80`, borderLeft: `2px solid ${accentA}40` }}>
                          <div className="font-mono font-semibold text-sm" style={{ color: text0 }}>{npc.name}</div>
                          <p className="text-[10px] sm:text-xs mt-1" style={{ color: muted }}>{npc.role}</p>
                          <p className="text-xs mt-2" style={{ color: text1 }}>{npc.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {!campaign.world_locations?.length && !campaign.world_npcs?.length && (
                  <p className="text-center text-xs sm:text-sm font-mono" style={{ color: muted }}>No world information yet</p>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="log">
            <SessionLog 
              sessionLog={campaign.session_log || []} 
              onAddMessage={handleAddSessionMessage}
              currentCharacter={currentCharacter}
            />
          </TabsContent>
          
          <TabsContent value="quests">
            <QuestTrackerReadOnly quests={campaign.quests || []} />
          </TabsContent>
          
          <TabsContent value="arcs">
            <div className="rounded-lg border p-4 sm:p-6" style={{ background: panel0, borderColor: `${accentA}20` }}>
              <h3 className="text-base sm:text-lg font-mono font-semibold mb-4" style={{ color: text0 }}>Story Arcs</h3>
              {campaign.story_arcs?.length > 0 ? (
                <div className="space-y-3">
                  {campaign.story_arcs.map((arc, i) => (
                    <div key={i} className="rounded-lg p-4" style={{ background: `${panel1}80`, borderLeft: `2px solid ${accentA}40` }}>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-mono font-semibold text-sm" style={{ color: text0 }}>{arc.title}</h4>
                        <span className="text-[10px] sm:text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: `${accentA}20`, color: accentA, border: `1px solid ${accentA}40` }}>
                          {arc.status}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm" style={{ color: text1 }}>{arc.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-xs sm:text-sm font-mono" style={{ color: muted }}>No story arcs yet</p>
              )}
            </div>
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
            <WorldEventsReadOnly campaign={campaign} />
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
              myCharacter={characters.find(c => c.created_by === currentUser?.email)}
              characters={characters}
              isDM={true}
              onUpdate={(data) => updateCampaign.mutate(data)}
            />
          </TabsContent>
          
          <TabsContent value="aegis">
            <AegisInterface campaignId={campaignId} />
          </TabsContent>
          
          <TabsContent value="adventure">
            <AdventureModulePlayer 
              campaign={campaign}
              currentCharacter={currentCharacter}
              onUpdate={(data) => updateCampaign.mutate(data)}
            />
          </TabsContent>

          <TabsContent value="deck">
            <DeckOfFatesPlayer 
              campaign={campaign}
              currentCharacter={currentCharacter}
              onUpdate={(data) => updateCampaign.mutate(data)}
            />
          </TabsContent>

          <TabsContent value="echo">
            <EchoEventsPlayer
              campaign={campaign}
              currentCharacter={currentCharacter}
              onUpdate={(data) => updateCampaign.mutate(data)}
            />
          </TabsContent>
          
          <TabsContent value="gm-tools">
            {isDM ? (
              <GMToolsPanel 
                campaign={campaign} 
                characters={characters}
                onUpdate={(data) => updateCampaign.mutate(data)} 
              />
            ) : (
              <div className="bg-slate-900/50 border-2 border-red-500/50 rounded-xl p-12 text-center">
                <Shield className="h-16 w-16 mx-auto text-red-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">DM Access Required</h3>
                <p className="text-slate-400">
                  You must authenticate as the Dungeon Master to access these tools.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="combat">
            <CombatTracker characters={characters} campaignId={campaignId} />
          </TabsContent>

          <TabsContent value="compare">
            <CharacterComparison characters={characters} />
          </TabsContent>
        </Tabs>
      </div>
      
      <DMLoginFooter 
        isDM={isDM}
        onDMLogin={handleDMLogin}
        onDMLogout={handleDMLogout}
      />
    </div>
  );
}