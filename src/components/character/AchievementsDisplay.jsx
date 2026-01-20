import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

export default function AchievementsDisplay({ character, achievementDefinitions = [] }) {
  const achievements = character.achievements || [];
  const stats = character.achievement_stats || {
    enemies_defeated: 0,
    critical_hits: 0,
    quests_completed: 0
  };

  const getProgress = (achievement) => {
    const tiers = achievement.tiers || [];
    const earned = achievements.filter(a => a.achievement_id === achievement.id);
    const currentTier = earned.length > 0 ? Math.max(...earned.map(a => a.tier)) : 0;
    const nextTier = tiers[currentTier];

    if (!nextTier || !nextTier.auto_track) return null;

    const current = stats[nextTier.auto_track.stat] || 0;
    const required = nextTier.auto_track.threshold;
    const percentage = Math.min((current / required) * 100, 100);

    return {
      current,
      required,
      percentage,
      tier: currentTier + 1,
      completed: current >= required
    };
  };

  const getTierBadgeColor = (tier) => {
    switch(tier) {
      case 1: return 'bg-orange-600';
      case 2: return 'bg-purple-600';
      case 3: return 'bg-yellow-600';
      default: return 'bg-slate-600';
    }
  };

  return (
    <div className="space-y-4">
      {/* Earned Achievements */}
      {achievements.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              Unlocked Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {achievements.map((achievement, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-lg"
                >
                  <span className="text-3xl">{achievement.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white">{achievement.name}</p>
                      <Badge className={getTierBadgeColor(achievement.tier)}>
                        Tier {achievement.tier}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400">{achievement.description}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Earned {new Date(achievement.awarded_at).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Achievements */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-violet-400" />
            Available Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="grid gap-3">
              {achievementDefinitions.map((achievement) => {
                const progress = getProgress(achievement);
                const earnedTiers = achievements.filter(a => a.achievement_id === achievement.id).map(a => a.tier);
                const maxEarnedTier = earnedTiers.length > 0 ? Math.max(...earnedTiers) : 0;
                const allTiersComplete = maxEarnedTier === achievement.tiers.length;

                return (
                  <Card key={achievement.id} className={`bg-slate-900/50 border-slate-700 ${allTiersComplete ? 'opacity-60' : ''}`}>
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{achievement.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white">{achievement.name}</p>
                            {allTiersComplete && (
                              <Badge className="bg-green-600">Complete</Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mb-2">{achievement.description}</p>

                          <div className="space-y-2">
                            {achievement.tiers.map((tier, i) => {
                              const isEarned = earnedTiers.includes(tier.level);
                              const isNext = tier.level === maxEarnedTier + 1;

                              return (
                                <div key={i} className={`flex items-center gap-2 p-2 rounded ${isEarned ? 'bg-green-900/20' : 'bg-slate-800/50'}`}>
                                  {isEarned ? (
                                    <Trophy className="h-4 w-4 text-yellow-400" />
                                  ) : (
                                    <Lock className="h-4 w-4 text-slate-600" />
                                  )}
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-slate-300">{tier.requirement}</span>
                                      <Badge variant="outline" className="text-xs">
                                        Tier {tier.level}
                                      </Badge>
                                    </div>
                                    {isNext && progress && (
                                      <div className="mt-1 space-y-1">
                                        <div className="flex justify-between text-xs text-slate-400">
                                          <span>{progress.current} / {progress.required}</span>
                                          <span>{Math.floor(progress.percentage)}%</span>
                                        </div>
                                        <Progress value={progress.percentage} className="h-1" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}