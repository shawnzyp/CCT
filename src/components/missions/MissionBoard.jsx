import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, MapPin, Users, Zap, ChevronRight } from 'lucide-react';

const difficultyColors = {
  easy: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  hard: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  deadly: 'bg-red-500/20 text-red-400 border-red-500/30'
};

export default function MissionBoard({ missions, isLoading, onSelectMission, type }) {
  if (isLoading) {
    return (
      <div className="grid gap-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-32 bg-slate-800" />
        ))}
      </div>
    );
  }

  if (!missions || missions.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-8 text-center">
          <p className="text-slate-400">No {type} missions available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {missions.map((mission, idx) => (
        <motion.div
          key={mission.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <Card className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-colors cursor-pointer"
            onClick={() => onSelectMission(mission)}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-cyan-400 text-lg truncate">{mission.title}</CardTitle>
                  <p className="text-slate-400 text-sm mt-1">{mission.description}</p>
                </div>
                <Badge className={`ml-4 flex-shrink-0 ${difficultyColors[mission.difficulty] || 'bg-slate-700'}`}>
                  {mission.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                {mission.location && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <MapPin className="h-4 w-4 text-cyan-400" />
                    <span className="truncate">{mission.location}</span>
                  </div>
                )}
                {mission.reward_xp > 0 && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Zap className="h-4 w-4 text-yellow-400" />
                    <span>{mission.reward_xp} XP</span>
                  </div>
                )}
                {mission.reward_credits > 0 && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-green-400 font-bold">{mission.reward_credits}</span>
                    <span>Credits</span>
                  </div>
                )}
                {mission.joined_character_ids && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Users className="h-4 w-4 text-violet-400" />
                    <span>{mission.joined_character_ids.length} / {mission.max_players}</span>
                  </div>
                )}
              </div>

              {mission.time_limit && (
                <div className="mt-3 flex items-center gap-2 text-amber-400 text-xs">
                  <Clock className="h-3 w-3" />
                  {mission.time_limit}
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 gap-1"
                >
                  View <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}