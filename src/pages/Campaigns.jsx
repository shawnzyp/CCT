import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, BookOpen, Play, Pause, CheckCircle, Archive, Copy, LayoutDashboard, SlidersHorizontal, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import CreateCampaignDialog from "@/components/campaign/CreateCampaignDialog";
import CampaignDashboardOverview from "@/components/campaign/CampaignDashboardOverview";
import PullToRefresh from "@/components/utils/PullToRefresh";
import { useSettings } from '@/components/utils/useSettings';
import { useTheme } from '@/components/theme/useTheme';
import { toast } from 'sonner';

const STATUS_ICONS = {
  planning: Pause,
  active: Play,
  completed: CheckCircle,
  on_hold: Pause
};

export default function Campaigns() {
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('-created_date');
  const [showDashboard, setShowDashboard] = useState(true);
  const queryClient = useQueryClient();
  const { settings } = useSettings();
  const { theme } = useTheme();
  
  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => base44.entities.Campaign.list('-created_date')
  });

  const updateCampaignMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Campaign.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['campaigns'] })
  });

  const createCampaignMutation = useMutation({
    mutationFn: (data) => base44.entities.Campaign.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['campaigns'] })
  });

  const handleRefresh = async () => {
    await queryClient.refetchQueries({ queryKey: ['campaigns'] });
  };

  const handleArchive = async (e, campaign) => {
    e.preventDefault(); e.stopPropagation();
    await updateCampaignMutation.mutateAsync({ id: campaign.id, data: { status: 'completed' } });
    toast.success(`"${campaign.name}" archived`);
  };

  const handleDuplicate = async (e, campaign) => {
    e.preventDefault(); e.stopPropagation();
    await createCampaignMutation.mutateAsync({
      name: `${campaign.name} (Copy)`,
      description: campaign.description,
      status: 'planning',
      world_locations: campaign.world_locations || [],
      world_npcs: campaign.world_npcs || [],
      world_lore: campaign.world_lore || [],
      quests: campaign.quests || [],
      story_arcs: campaign.story_arcs || [],
      custom_currencies: campaign.custom_currencies || [],
    });
    toast.success('Campaign duplicated');
  };

  const filteredCampaigns = campaigns
    .filter(c => {
      const matchSearch = c.name?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === '-created_date') return new Date(b.created_date) - new Date(a.created_date);
      if (sortBy === 'created_date') return new Date(a.created_date) - new Date(b.created_date);
      if (sortBy === 'name') return a.name?.localeCompare(b.name);
      if (sortBy === '-session_count') return (b.session_count || 0) - (a.session_count || 0);
      return 0;
    });

  const accentA = theme?.colors?.accentA || '#00E5FF';
  const bg0 = theme?.colors?.bg0 || '#0F1216';
  const panel0 = theme?.colors?.panel0 || '#1A1F26';
  const text0 = theme?.colors?.text0 || '#E6F1FF';
  const text1 = theme?.colors?.text1 || '#8EA0B5';
  const muted = theme?.colors?.muted || '#5F6E80';
  
  return (
    <div
      className="min-h-screen"
      style={{ background: theme?.background?.gradient || bg0 }}
    >
      {settings.particleEffects && (theme?.background?.gridOpacity || 0) > 0 && (
        <div className="fixed inset-0 military-grid opacity-30 pointer-events-none" />
      )}
      
      <PullToRefresh onRefresh={handleRefresh} className="relative z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2" style={{ color: text0 }}>
                  <div className="p-1.5 rounded-lg flex items-center justify-center" style={{ background: `${accentA}20` }}>
                    <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: accentA }} />
                  </div>
                  CAMPAIGNS
                </h1>
                <p className="text-xs sm:text-sm font-mono mt-1" style={{ color: muted }}>Manage your adventures and stories</p>
              </div>
              
              <Button onClick={() => setShowCreate(true)} style={{ background: accentA, color: '#000' }} className="gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                <span>New Campaign</span>
              </Button>
            </div>
          </div>
          
          {/* Dashboard Toggle */}
          <button
            onClick={() => setShowDashboard(v => !v)}
            className="flex items-center gap-2 mb-3 text-xs font-mono transition-opacity hover:opacity-80"
            style={{ color: accentA }}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            {showDashboard ? 'Hide' : 'Show'} Overview
            <ChevronDown className={cn("h-3 w-3 transition-transform", showDashboard && "rotate-180")} />
          </button>

          <AnimatePresence>
            {showDashboard && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <CampaignDashboardOverview campaigns={campaigns} theme={theme} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: muted }} />
              <Input
                placeholder="Search campaigns..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 text-xs sm:text-sm"
                style={{ background: `${panel0}80`, borderColor: `${accentA}25`, color: text0 }}
                autoFocus={false}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-36 text-xs" style={{ background: `${panel0}80`, borderColor: `${accentA}25`, color: text0 }}>
                <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" style={{ color: muted }} />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent style={{ background: panel0 }}>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-40 text-xs" style={{ background: `${panel0}80`, borderColor: `${accentA}25`, color: text0 }}>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent style={{ background: panel0 }}>
                <SelectItem value="-created_date">Newest First</SelectItem>
                <SelectItem value="created_date">Oldest First</SelectItem>
                <SelectItem value="name">Name A–Z</SelectItem>
                <SelectItem value="-session_count">Most Sessions</SelectItem>
              </SelectContent>
            </Select>
          </div>
        
          {/* Campaigns Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                <BookOpen className="h-8 w-8" style={{ color: accentA }} />
              </motion.div>
            </div>
          ) : filteredCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filteredCampaigns.map((campaign, index) => {
                const StatusIcon = STATUS_ICONS[campaign.status];
                const statusConfig = {
                  active: { color: '#00D1B2', label: 'ACTIVE' },
                  planning: { color: muted, label: 'PLANNING' },
                  completed: { color: '#00B4D8', label: 'COMPLETED' },
                  on_hold: { color: '#FFC857', label: 'ON HOLD' }
                }[campaign.status] || { color: muted, label: campaign.status };
                
                return (
                  <Link key={campaign.id} to={createPageUrl(`CampaignDetail?id=${campaign.id}`)}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      whileHover={!settings.reducedMotion ? { y: -4, transition: { duration: 0.2 } } : {}}
                      className="group"
                    >
                      <div
                        className="rounded-lg border p-4 sm:p-5 cursor-pointer transition-all duration-200 h-full flex flex-col"
                        style={{
                          background: panel0,
                          borderColor: `${accentA}20`,
                        }}
                        onMouseEnter={(e) => {
                          if (!settings.reducedMotion) {
                            e.currentTarget.style.borderColor = `${accentA}60`;
                            if (settings.glowEffects) e.currentTarget.style.boxShadow = `0 0 12px ${accentA}40`;
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = `${accentA}20`;
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        {/* Header with name and status */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <h3 className="text-sm sm:text-base font-mono font-semibold flex-1 truncate group-hover:opacity-80 transition-opacity" style={{ color: text0 }}>
                            {campaign.name}
                          </h3>
                          <div className="flex items-center gap-1 px-2 py-1 rounded text-xs font-mono font-semibold flex-shrink-0" style={{ background: `${statusConfig.color}20`, color: statusConfig.color, border: `1px solid ${statusConfig.color}40` }}>
                            <StatusIcon className="h-3 w-3" />
                            <span>{statusConfig.label}</span>
                          </div>
                        </div>
                        
                        {/* Description */}
                        <p className="text-xs sm:text-sm line-clamp-2 mb-3 flex-grow" style={{ color: text1 }}>
                          {campaign.description || 'No description'}
                        </p>
                        
                        {/* Stats footer */}
                         <div className="flex items-center justify-between gap-2 mt-auto pt-2">
                           <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono" style={{ color: muted }}>
                             <span>📔 {campaign.journal_entries?.length || 0}</span>
                             <span>•</span>
                             <span>🌍 {campaign.world_events?.length || 0}</span>
                           </div>
                           <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button
                               onClick={(e) => handleDuplicate(e, campaign)}
                               className="h-6 w-6 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
                               title="Duplicate"
                               style={{ color: muted }}
                             >
                               <Copy className="h-3 w-3" />
                             </button>
                             {campaign.status !== 'completed' && (
                               <button
                                 onClick={(e) => handleArchive(e, campaign)}
                                 className="h-6 w-6 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
                                 title="Archive"
                                 style={{ color: muted }}
                               >
                                 <Archive className="h-3 w-3" />
                               </button>
                             )}
                           </div>
                         </div>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <BookOpen className="h-12 w-12 mx-auto mb-4" style={{ color: muted, opacity: 0.5 }} />
                <h2 className="text-lg sm:text-xl font-mono font-semibold mb-2" style={{ color: text0 }}>No Campaigns Yet</h2>
                <p className="text-xs sm:text-sm mb-6 font-mono" style={{ color: text1 }}>Create your first campaign to begin</p>
                <Button onClick={() => setShowCreate(true)} style={{ background: accentA, color: '#000' }} className="text-xs sm:text-sm font-semibold">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              </motion.div>
            </div>
          )}
        </div>
      </PullToRefresh>
      {showCreate && <CreateCampaignDialog onClose={() => setShowCreate(false)} />}
    </div>
  );
}