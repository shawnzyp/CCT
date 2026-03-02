import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { BookOpen, Users, Play, Pause, CheckCircle, TrendingUp, Coins, FileText, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CampaignDashboardOverview({ campaigns, theme }) {
  const accentA = theme?.colors?.accentA || '#00E5FF';
  const panel0 = theme?.colors?.panel0 || '#1A1F26';
  const panel1 = theme?.colors?.panel1 || '#202833';
  const text0 = theme?.colors?.text0 || '#E6F1FF';
  const text1 = theme?.colors?.text1 || '#8EA0B5';
  const muted = theme?.colors?.muted || '#5F6E80';

  const active = campaigns.filter(c => c.status === 'active');
  const planning = campaigns.filter(c => c.status === 'planning');
  const completed = campaigns.filter(c => c.status === 'completed');
  const onHold = campaigns.filter(c => c.status === 'on_hold');

  const totalSessions = campaigns.reduce((s, c) => s + (c.session_count || 0), 0);
  const totalLore = campaigns.reduce((s, c) => s + (c.world_lore?.length || 0), 0);
  const totalEvents = campaigns.reduce((s, c) => s + (c.world_events?.length || 0), 0);

  const stats = [
    { label: 'Active', value: active.length, color: '#00D1B2', icon: Play },
    { label: 'Planning', value: planning.length, color: muted, icon: Pause },
    { label: 'Completed', value: completed.length, color: '#60A5FA', icon: CheckCircle },
    { label: 'Sessions', value: totalSessions, color: accentA, icon: TrendingUp },
  ];

  if (campaigns.length === 0) return null;

  return (
    <div className="mb-6 space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-lg border p-2 sm:p-3 text-center"
            style={{ background: panel0, borderColor: `${s.color}30` }}
          >
            <s.icon className="h-4 w-4 mx-auto mb-1" style={{ color: s.color }} />
            <p className="text-base sm:text-xl font-bold font-mono" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider mt-0.5" style={{ color: muted }}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Active campaigns spotlight */}
      {active.length > 0 && (
        <div>
          <h3 className="text-[10px] font-mono uppercase tracking-widest mb-2 flex items-center gap-1.5" style={{ color: accentA }}>
            <span className="inline-block h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: '#00D1B2' }} />
            Active Campaigns
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {active.slice(0, 4).map(c => (
              <Link key={c.id} to={createPageUrl(`CampaignDetail?id=${c.id}`)}>
                <div
                  className="rounded-lg border p-3 hover:border-opacity-60 transition-all cursor-pointer"
                  style={{ background: panel1, borderColor: `${accentA}25` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold font-mono truncate" style={{ color: text0 }}>{c.name}</p>
                      <p className="text-[10px] mt-0.5 truncate" style={{ color: text1 }}>{c.description || 'No description'}</p>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-2 text-[10px] font-mono" style={{ color: muted }}>
                      <span>📔 {c.journal_entries?.length || 0}</span>
                      <span>🌍 {c.world_events?.length || 0}</span>
                    </div>
                  </div>
                  {c.last_session_date && (
                    <p className="text-[10px] mt-2 font-mono" style={{ color: muted }}>
                      Last session: {new Date(c.last_session_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}