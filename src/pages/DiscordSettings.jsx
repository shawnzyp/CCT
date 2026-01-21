import React from 'react';
import DiscordIntegration from '@/components/dm/DiscordIntegration';

export default function DiscordSettings() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 p-6">
      <div className="max-w-5xl mx-auto">
        <DiscordIntegration />
      </div>
    </div>
  );
}