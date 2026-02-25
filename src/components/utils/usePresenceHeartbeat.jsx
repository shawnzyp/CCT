import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Heartbeat hook to update player/director presence at regular intervals
 */
export function usePresenceHeartbeat(campaignId, sessionId) {
  useEffect(() => {
    if (!campaignId || !sessionId) return;

    const updatePresence = async () => {
      try {
        await base44.functions.invoke('updatePresence', {
          campaignId,
          sessionId,
          status: 'online'
        });
      } catch (error) {
        console.error('Failed to update presence:', error);
      }
    };

    // Update immediately
    updatePresence();

    // Update every 20 seconds
    const interval = setInterval(updatePresence, 20000);

    // Set to idle on visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        base44.functions.invoke('updatePresence', {
          campaignId,
          sessionId,
          status: 'idle'
        }).catch(console.error);
      } else {
        updatePresence();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [campaignId, sessionId]);
}