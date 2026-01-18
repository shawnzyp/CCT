import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Newspaper, BookOpen, Dumbbell, Search, Heart, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ACTIVITIES = [
  {
    id: 'media_control',
    name: 'Media Control',
    icon: Newspaper,
    modifier: 'CHA',
    description: 'Improve or damage public trust through media engagement',
    benefit: 'Affects faction reputation and public opinion',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'research',
    name: 'Research',
    icon: BookOpen,
    modifier: 'INT/WIS',
    description: 'Discover weaknesses in next threat',
    benefit: 'Gain intel or tactical advantage',
    color: 'from-purple-500 to-violet-500'
  },
  {
    id: 'train_tinker',
    name: 'Train or Tinker',
    icon: Dumbbell,
    modifier: 'STR/INT',
    description: 'Physical training or equipment upgrades',
    benefit: 'Next session +1 SP or minor upgrade',
    color: 'from-red-500 to-orange-500'
  },
  {
    id: 'gather_intel',
    name: 'Gather Intel',
    icon: Search,
    modifier: 'CHA/WIS',
    description: 'Learn secrets or avoid traps',
    benefit: 'Reveal hidden information',
    color: 'from-emerald-500 to-green-500'
  },
  {
    id: 'personal_time',
    name: 'Personal Time',
    icon: Heart,
    modifier: 'WIS/CHA',
    description: 'Rest and recover mentally',
    benefit: 'Reroll one save next session',
    color: 'from-pink-500 to-rose-500'
  }
];

export default function DowntimeActivities({ character, onUpdate }) {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [notes, setNotes] = useState('');
  const [completed, setCompleted] = useState([]);

  const getModifierValue = (modStr) => {
    const mods = modStr.split('/');
    const values = mods.map(m => {
      const score = character.ability_scores?.[m] || 10;
      return Math.floor((score - 10) / 2);
    });
    return Math.max(...values);
  };

  const handleComplete = () => {
    if (!selectedActivity) return;
    
    const activity = ACTIVITIES.find(a => a.id === selectedActivity);
    const modifier = getModifierValue(activity.modifier);
    
    const newActivity = {
      id: selectedActivity,
      name: activity.name,
      modifier: activity.modifier,
      modifierValue: modifier,
      notes,
      timestamp: new Date().toISOString(),
      completed: true
    };

    const updatedActivities = [...(character.downtime_activities || []), newActivity];
    onUpdate({ downtime_activities: updatedActivities });
    
    setCompleted([...completed, selectedActivity]);
    setSelectedActivity(null);
    setNotes('');
  };

  const recentActivities = character.downtime_activities || [];

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Downtime Activities</CardTitle>
        <p className="text-sm text-slate-400">
          Use between missions to pursue side goals or upgrades
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={selectedActivity || 'overview'} onValueChange={setSelectedActivity}>
          <TabsList className="grid grid-cols-3 md:grid-cols-6 gap-1 bg-slate-900/50 p-1">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            {ACTIVITIES.map(activity => (
              <TabsTrigger 
                key={activity.id} 
                value={activity.id}
                className="text-xs relative"
              >
                <activity.icon className="h-3 w-3 mr-1" />
                {activity.name.split(' ')[0]}
                {completed.includes(activity.id) && (
                  <CheckCircle className="h-3 w-3 text-green-500 absolute -top-1 -right-1" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ACTIVITIES.map(activity => {
                const modifier = getModifierValue(activity.modifier);
                const IconComponent = activity.icon;
                
                return (
                  <motion.div
                    key={activity.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className="bg-slate-700/50 border-slate-600 hover:border-violet-500/50 transition-all cursor-pointer"
                      onClick={() => setSelectedActivity(activity.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${activity.color} flex items-center justify-center`}>
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-white text-sm">{activity.name}</h4>
                            <p className="text-xs text-slate-400 mt-1">{activity.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {activity.modifier}
                              </Badge>
                              <span className="text-xs text-emerald-400 font-bold">
                                {modifier >= 0 ? '+' : ''}{modifier}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {recentActivities.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-white mb-2">Recent Activities</h4>
                <div className="space-y-2">
                  {recentActivities.slice(-5).reverse().map((activity, i) => (
                    <div key={i} className="bg-slate-900/50 rounded-lg p-3 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-medium">{activity.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {activity.modifier} {activity.modifierValue >= 0 ? '+' : ''}{activity.modifierValue}
                        </Badge>
                      </div>
                      {activity.notes && (
                        <p className="text-slate-400">{activity.notes}</p>
                      )}
                      <span className="text-slate-600 text-xs">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {ACTIVITIES.map(activity => {
            const modifier = getModifierValue(activity.modifier);
            const IconComponent = activity.icon;
            
            return (
              <TabsContent key={activity.id} value={activity.id} className="space-y-4">
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${activity.color} flex items-center justify-center`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white">{activity.name}</h3>
                      <p className="text-sm text-slate-400">{activity.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Modifier Used</div>
                      <div className="text-xl font-bold text-white">{activity.modifier}</div>
                      <div className="text-sm text-emerald-400 font-bold">
                        {modifier >= 0 ? '+' : ''}{modifier}
                      </div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Session Benefit</div>
                      <div className="text-xs text-slate-300">{activity.benefit}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-slate-300 mb-2 block">Activity Notes (Optional)</label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="What did you accomplish during this downtime?"
                        className="bg-slate-800 border-slate-700 text-white"
                        rows={3}
                      />
                    </div>

                    <Button 
                      onClick={handleComplete}
                      className={`w-full bg-gradient-to-r ${activity.color}`}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Activity
                    </Button>
                  </div>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
}