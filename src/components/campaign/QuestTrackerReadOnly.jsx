import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ScrollText, CheckCircle2, Clock, XCircle, ChevronDown, ChevronRight, Award } from "lucide-react";

const STATUS_CONFIG = {
  active: { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Active' },
  completed: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/20', label: 'Completed' },
  failed: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Failed' },
  abandoned: { icon: XCircle, color: 'text-slate-400', bg: 'bg-slate-500/20', label: 'Abandoned' }
};

export default function QuestTrackerReadOnly({ quests = [] }) {
  const [expandedQuest, setExpandedQuest] = useState(null);

  const activeQuests = quests.filter(q => q.status === 'active');
  const completedQuests = quests.filter(q => q.status === 'completed');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-semibold text-white">Quest Log</h3>
        <Badge variant="outline" className="text-violet-400">{activeQuests.length} Active</Badge>
        <Badge variant="outline" className="text-green-400">{completedQuests.length} Completed</Badge>
      </div>

      {quests.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="py-12 text-center">
            <ScrollText className="h-12 w-12 mx-auto mb-3 text-slate-600" />
            <p className="text-slate-400">No quests yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {quests.map((quest, index) => {
            const statusConfig = STATUS_CONFIG[quest.status];
            const StatusIcon = statusConfig.icon;
            const isExpanded = expandedQuest === index;
            const completedObjectives = quest.objectives?.filter(o => o.completed).length || 0;
            const totalObjectives = quest.objectives?.length || 0;

            return (
              <Card key={index} className={cn("bg-slate-800/50 border-2 transition-all", statusConfig.bg.replace('/20', '/10'))}>
                <CardContent className="p-4">
                  <div
                    className="flex items-start justify-between cursor-pointer"
                    onClick={() => setExpandedQuest(isExpanded ? null : index)}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <StatusIcon className={cn("h-5 w-5 mt-0.5", statusConfig.color)} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-white">{quest.title}</h4>
                          <Badge className={cn("text-xs", statusConfig.bg, statusConfig.color)}>
                            {statusConfig.label}
                          </Badge>
                        </div>
                        {totalObjectives > 0 && (
                          <p className="text-xs text-slate-400 mt-1">
                            {completedObjectives}/{totalObjectives} objectives completed
                          </p>
                        )}
                      </div>
                    </div>
                    {isExpanded ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pl-8 space-y-3">
                      {quest.description && (
                        <p className="text-sm text-slate-300">{quest.description}</p>
                      )}

                      {quest.objectives?.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-xs font-semibold text-slate-400 uppercase">Objectives</h5>
                          {quest.objectives.map((obj, objIndex) => (
                            <div key={objIndex} className="flex items-start gap-2">
                              <Checkbox checked={obj.completed} disabled className="mt-0.5" />
                              <span className={cn("text-sm", obj.completed ? "line-through text-slate-500" : "text-slate-300")}>
                                {obj.description}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {quest.rewards && (
                        <div className="flex items-center gap-2 text-sm">
                          <Award className="h-4 w-4 text-amber-400" />
                          <span className="text-amber-400 font-medium">Rewards:</span>
                          <span className="text-slate-300">{quest.rewards}</span>
                        </div>
                      )}
                      
                      {quest.player_suggestions?.length > 0 && (
                        <div className="bg-violet-500/10 rounded-lg p-3 border border-violet-500/30">
                          <div className="text-xs font-semibold text-violet-400 mb-2">Player Suggestions:</div>
                          {quest.player_suggestions.map((sug, si) => (
                            <div key={si} className="text-xs text-slate-300 mb-1">
                              • {sug.text} <span className="text-slate-500">- {sug.author?.split('@')[0]}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}