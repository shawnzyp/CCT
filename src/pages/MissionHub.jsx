import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Compass, Brain, PlusCircle } from 'lucide-react';
import PageWrapper from '@/components/utils/PageWrapper';
import MissionBoard from '@/components/missions/MissionBoard';
import NarrativeJournal from '@/components/narrative/NarrativeJournal';
import DialogueSystem from '@/components/narrative/DialogueSystem';
import ProceduralMissionGenerator from '@/components/missions/ProceduralMissionGenerator';

export default function MissionHub() {
  const [selectedMission, setSelectedMission] = useState(null);
  const [showMissionGenerator, setShowMissionGenerator] = useState(false);
  const queryClient = useQueryClient();

  const { data: missions = [], isLoading: missionsLoading } = useQuery({
    queryKey: ['missions'],
    queryFn: () => base44.entities.Mission.list('-created_date'),
    staleTime: 5 * 60 * 1000
  });

  const { data: journalEntries = [], isLoading: journalLoading } = useQuery({
    queryKey: ['journal-entries'],
    queryFn: () => base44.entities.Character.list().then(chars => {
      if (chars.length === 0) return [];
      const current = chars[0];
      return current.player_journal || [];
    }),
    staleTime: 5 * 60 * 1000
  });

  const generatorMutation = useMutation({
    mutationFn: async (params) => {
      const res = await base44.functions.invoke('generateProceduralMission', params);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      setShowMissionGenerator(false);
    }
  });

  const availableMissions = missions.filter(m => m.status === 'available' || m.status === 'pending');
  const activeMissions = missions.filter(m => m.status === 'accepted' || m.status === 'in_progress');
  const completedMissions = missions.filter(m => m.status === 'completed');

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Compass className="h-8 w-8 text-cyan-400" />
              <h1 className="text-3xl font-bold text-cyan-400">Mission Command</h1>
            </div>
            <Button
              onClick={() => setShowMissionGenerator(true)}
              className="bg-violet-600 hover:bg-violet-700 gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Generate Quest
            </Button>
          </div>
          <p className="text-slate-400 text-sm">Manage campaigns, track narrative progress, and interact with the world</p>
        </div>

        <Tabs defaultValue="active" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="active" className="gap-2">
              <span className="hidden sm:inline">Active</span>
              {activeMissions.length > 0 && (
                <span className="bg-cyan-500 text-black text-xs rounded-full px-2 py-0.5">
                  {activeMissions.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="available" className="gap-2">
              <span className="hidden sm:inline">Available</span>
              {availableMissions.length > 0 && (
                <span className="bg-violet-500 text-white text-xs rounded-full px-2 py-0.5">
                  {availableMissions.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="journal" className="gap-2">
              <BookOpen className="h-4 w-4 sm:h-0 sm:w-0" />
              <span className="hidden sm:inline">Journal</span>
            </TabsTrigger>
            <TabsTrigger value="dialogue" className="gap-2">
              <Brain className="h-4 w-4 sm:h-0 sm:w-0" />
              <span className="hidden sm:inline">NPCs</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <MissionBoard
              missions={activeMissions}
              isLoading={missionsLoading}
              onSelectMission={setSelectedMission}
              type="active"
            />
          </TabsContent>

          <TabsContent value="available">
            <MissionBoard
              missions={availableMissions}
              isLoading={missionsLoading}
              onSelectMission={setSelectedMission}
              type="available"
            />
          </TabsContent>

          <TabsContent value="journal">
            <NarrativeJournal entries={journalEntries} isLoading={journalLoading} />
          </TabsContent>

          <TabsContent value="dialogue">
            <DialogueSystem />
          </TabsContent>
        </Tabs>

        {/* Mission Generator Modal */}
        {showMissionGenerator && (
          <ProceduralMissionGenerator
            onGenerate={(params) => generatorMutation.mutate(params)}
            onClose={() => setShowMissionGenerator(false)}
            isLoading={generatorMutation.isPending}
          />
        )}
      </div>
    </PageWrapper>
  );
}