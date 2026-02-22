import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, BookOpen, Play, Pause, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import CreateCampaignDialog from "@/components/campaign/CreateCampaignDialog";
import PullToRefresh from "@/components/utils/PullToRefresh";

const STATUS_ICONS = {
  planning: Pause,
  active: Play,
  completed: CheckCircle,
  on_hold: Pause
};

const STATUS_COLORS = {
  planning: 'bg-slate-500/20 text-slate-400 border-slate-500/50',
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
  completed: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  on_hold: 'bg-amber-500/20 text-amber-400 border-amber-500/50'
};

export default function Campaigns() {
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const queryClient = useQueryClient();
  
  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => base44.entities.Campaign.list('-created_date')
  });

  const handleRefresh = async () => {
    await queryClient.refetchQueries({ queryKey: ['campaigns'] });
  };
  
  const filteredCampaigns = campaigns.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>
      
      <PullToRefresh onRefresh={handleRefresh} className="relative z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-violet-500/20">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-violet-400" />
              </div>
              Campaigns
            </h1>
            <p className="text-sm sm:text-base text-slate-400 mt-1">Manage your adventures and stories</p>
          </div>
          
          <Button onClick={() => setShowCreate(true)} className="bg-violet-600 hover:bg-violet-700 gap-1.5 sm:gap-2 text-sm sm:text-base w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            <span>New Campaign</span>
          </Button>
        </div>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-slate-800/50 border-slate-700 text-white"
            autoFocus={false}
          />
        </div>
        
        {filteredCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredCampaigns.map((campaign, index) => {
              const StatusIcon = STATUS_ICONS[campaign.status];
              return (
                <Link key={campaign.id} to={createPageUrl(`CampaignDetail?id=${campaign.id}`)}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card className="bg-slate-800/50 border-slate-700 hover:border-violet-500/50 transition-all cursor-pointer group">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-white group-hover:text-violet-300 transition-colors">
                            {campaign.name}
                          </CardTitle>
                          <Badge className={cn("text-xs", STATUS_COLORS[campaign.status])}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {campaign.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-400 line-clamp-2 mb-3">
                          {campaign.description || 'No description'}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span>{campaign.journal_entries?.length || 0} entries</span>
                          <span>•</span>
                          <span>{campaign.world_events?.length || 0} events</span>
                        </div>
                      </CardContent>
                      </Card>
                      </motion.div>
                      </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <BookOpen className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No Campaigns Yet</h2>
            <p className="text-slate-400 mb-6">Create your first campaign to begin</p>
            <Button onClick={() => setShowCreate(true)} className="bg-violet-600 hover:bg-violet-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </div>
        )}
      </div>
      
      </PullToRefresh>
      {showCreate && <CreateCampaignDialog onClose={() => setShowCreate(false)} />}
    </div>
  );
}