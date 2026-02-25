import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, BookOpen, Play, Pause, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import CreateCampaignDialog from "@/components/campaign/CreateCampaignDialog";
import PullToRefresh from "@/components/utils/PullToRefresh";
import { useSettings } from '@/components/utils/useSettings';
import { useTheme } from '@/components/theme/useTheme';

const STATUS_ICONS = {
  planning: Pause,
  active: Play,
  completed: CheckCircle,
  on_hold: Pause
};

export default function Campaigns() {
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const queryClient = useQueryClient();
  const { settings } = useSettings();
  const { theme } = useTheme();
  
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
          
          {/* Search */}
          <div className="relative mb-6" style={{ opacity: 0.9 }}>
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
                        <div className="flex items-center gap-3 text-[10px] sm:text-xs font-mono" style={{ color: muted }}>
                          <span>📔 {campaign.journal_entries?.length || 0}</span>
                          <span>•</span>
                          <span>🌍 {campaign.world_events?.length || 0}</span>
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