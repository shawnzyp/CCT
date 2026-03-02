import React from 'react';
import PageWrapper from '@/components/utils/PageWrapper';
import DiscordIntegration from '@/components/dm/DiscordIntegration';

export default function DiscordSettings() {
  return (
    <PageWrapper className="p-6">
      <div className="max-w-5xl mx-auto">
        <DiscordIntegration />
      </div>
    </PageWrapper>
  );
}