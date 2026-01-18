import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollText, Target, Users, Heart, Zap, TrendingUp, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CampaignDashboard({ campaign, characters }) {
  const activeQuests = (campaign.quests || []).filter(q => q.status === 'active');
  const completedQuests = (campaign.quests || []).filter(q => q.status === 'completed');
  const activeArcs = (campaign.story_arcs || []).filter(a => a.status === 'in_progress');
  
  const avgCharLevel = characters.length > 0 
    ? Math.round(characters.reduce((sum, c) => sum + (c.level || 1), 0) / characters.length)
    : 1;
  
  const totalXP = characters.reduce((sum, c) => sum + (c.current_xp || 0), 0);
  
  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                <ScrollText className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{activeQuests.length}</div>
                <div className="text-xs text-slate-400">Active Quests</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Target className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{activeArcs.length}</div>
                <div className="text-xs text-slate-400">Story Arcs</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{characters.length}</div>
                <div className="text-xs text-slate-400">Characters</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">Lvl {avgCharLevel}</div>
                <div className="text-xs text-slate-400">Avg Level</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Active Quests */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-violet-400" />
            Active Quests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeQuests.length > 0 ? (
            <div className="space-y-3">
              {activeQuests.map((quest, i) => {
                const completed = quest.objectives?.filter(o => o.completed).length || 0;
                const total = quest.objectives?.length || 1;
                const progress = (completed / total) * 100;
                
                return (
                  <div key={i} className="bg-slate-700/50 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-white">{quest.title}</h4>
                        <p className="text-xs text-slate-400">{quest.description}</p>
                      </div>
                      <Badge variant="outline" className="border-violet-500 text-violet-400">
                        {completed}/{total}
                      </Badge>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-4">No active quests</p>
          )}
        </CardContent>
      </Card>
      
      {/* Player Status */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-400" />
            Player Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {characters.map((char) => {
              const hpPercent = ((char.current_hp || char.max_hp) / char.max_hp) * 100;
              const isLowHP = hpPercent < 30;
              
              return (
                <div key={char.id} className="flex items-center gap-3 bg-slate-700/50 rounded-lg p-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white">{char.name}</span>
                      <Badge variant="outline" className="text-xs border-amber-500 text-amber-400">
                        Lvl {char.level || 1}
                      </Badge>
                      {isLowHP && (
                        <AlertCircle className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                    <div className="flex gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3 text-red-400" />
                        <span className={cn("text-slate-400", isLowHP && "text-red-400 font-semibold")}>
                          {char.current_hp || char.max_hp}/{char.max_hp} HP
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-violet-400" />
                        <span className="text-slate-400">{char.current_xp || 0} XP</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Quest Progress Summary */}
      {completedQuests.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Campaign Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Completed Quests</span>
              <span className="text-2xl font-bold text-green-400">{completedQuests.length}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}