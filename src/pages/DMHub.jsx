import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Shield, Users, Zap, Settings, Coins, BookOpen,
  Trophy, Package, Store, MapPin, Calendar, FileText, Radio, Webhook, Gift
} from 'lucide-react';
import MedalsAchievementsManager from '@/components/dm/MedalsAchievementsManager';

export default function DMHub() {
  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => base44.entities.Campaign.list('-created_date')
  });

  const { data: characters = [] } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.Character.list('-created_date')
  });

  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const totalSessions = campaigns.reduce((sum, c) => sum + (c.session_count || 0), 0);
  const selectedCampaign = campaigns[0]?.id;
  
  // Count total achievements across all campaigns
  const totalAchievements = campaigns.reduce((sum, c) => {
    return sum + (c.achievement_definitions?.length || 0);
  }, 0);
  const toolCategories = [
    {
      title: 'Campaign Management',
      icon: BookOpen,
      color: 'violet',
      tools: [
        { name: 'Campaigns', path: 'Campaigns', icon: BookOpen, description: 'Manage your campaigns' },
        { name: 'Quest Rewards', path: 'RewardCenter', icon: Gift, description: 'Create and distribute rewards to players' },
      ]
    },
    {
      title: 'Character & Combat',
      icon: Users,
      color: 'blue',
      tools: [
        { name: 'All Characters', path: 'Characters', icon: Users, description: 'View all characters' },
      ]
    },
    {
      title: 'Economy & Items',
      icon: Coins,
      color: 'emerald',
      tools: [
        { name: 'Economy & Trading', path: 'Economy', icon: Coins, description: 'Full economy system with trading & marketplace' },
      ]
    },
    {
      title: 'Configuration',
      icon: Settings,
      color: 'amber',
      tools: [
        { name: 'Settings', path: 'Settings', icon: Settings, description: 'App configuration' },
        { name: 'Discord Integration', path: 'DiscordSettings', icon: Webhook, description: 'Configure Discord webhook notifications' },
        { name: 'A.E.G.I.S. Logs', path: 'AegisLogs', icon: Radio, description: 'View all player queries to A.E.G.I.S.' },
        { name: 'Rules Reference', path: 'Rules', icon: BookOpen, description: 'Game rules & mechanics' },
      ]
    }
  ];

  const colorClasses = {
    violet: {
      border: 'border-violet-500/30',
      bg: 'bg-violet-900/20',
      text: 'text-violet-400',
      button: 'bg-violet-600 hover:bg-violet-700'
    },
    blue: {
      border: 'border-blue-500/30',
      bg: 'bg-blue-900/20',
      text: 'text-blue-400',
      button: 'bg-blue-600 hover:bg-blue-700'
    },
    emerald: {
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-900/20',
      text: 'text-emerald-400',
      button: 'bg-emerald-600 hover:bg-emerald-700'
    },
    amber: {
      border: 'border-amber-500/30',
      bg: 'bg-amber-900/20',
      text: 'text-amber-400',
      button: 'bg-amber-600 hover:bg-amber-700'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">GM Control Center</h1>
              <p className="text-slate-400">Full access to all campaign tools and settings</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-violet-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-violet-400" />
                <div>
                  <p className="text-xs text-slate-400 uppercase">Active Campaigns</p>
                  <p className="text-2xl font-bold text-white">{activeCampaigns.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-blue-400" />
                <div>
                  <p className="text-xs text-slate-400 uppercase">Total Characters</p>
                  <p className="text-2xl font-bold text-white">{characters.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-emerald-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-emerald-400" />
                <div>
                  <p className="text-xs text-slate-400 uppercase">Sessions Played</p>
                  <p className="text-2xl font-bold text-white">{totalSessions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-amber-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-amber-400" />
                <div>
                  <p className="text-xs text-slate-400 uppercase">Achievements</p>
                  <p className="text-2xl font-bold text-white">{totalAchievements}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tool Categories */}
        <div className="grid md:grid-cols-2 gap-6">
          {toolCategories.map((category) => {
            const Icon = category.icon;
            const colors = colorClasses[category.color];
            
            return (
              <Card key={category.title} className={`bg-slate-800/50 border-2 ${colors.border}`}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${colors.text}`}>
                    <Icon className="h-5 w-5" />
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {category.tools.map((tool) => {
                    const ToolIcon = tool.icon;
                    return (
                      <Link key={tool.name} to={createPageUrl(tool.path)}>
                        <div className={`p-4 rounded-lg border ${colors.border} ${colors.bg} hover:bg-opacity-30 transition-all group cursor-pointer`}>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className={`w-10 h-10 rounded-lg ${colors.button} flex items-center justify-center flex-shrink-0`}>
                                <ToolIcon className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h3 className="text-white font-semibold group-hover:text-opacity-80 transition-colors">
                                  {tool.name}
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">{tool.description}</p>
                              </div>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button size="sm" className={colors.button}>
                                Open
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Medals & Achievements Manager */}
        <div className="mt-8">
          <MedalsAchievementsManager campaignId={selectedCampaign} />
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card className="bg-slate-800/50 border-violet-500/30">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link to={createPageUrl('CreateCharacter')}>
                  <Button className="w-full bg-violet-600 hover:bg-violet-700 gap-2">
                    <Users className="h-4 w-4" />
                    New Character
                  </Button>
                </Link>
                <Link to={createPageUrl('Campaigns')}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-2">
                    <BookOpen className="h-4 w-4" />
                    New Campaign
                  </Button>
                </Link>
                <Link to={createPageUrl('Economy')}>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2">
                    <Store className="h-4 w-4" />
                    Create Vendor
                  </Button>
                </Link>
                <Link to={createPageUrl('Settings')}>
                  <Button className="w-full bg-amber-600 hover:bg-amber-700 gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}