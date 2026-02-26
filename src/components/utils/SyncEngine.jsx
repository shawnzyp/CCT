import { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

// Entities to watch for real-time sync
const WATCHED = ['Character', 'Campaign', 'GameEvent', 'SessionLink', 'PlayerSignal', 'Presence'];

/**
 * SyncEngine — mounts once in Layout.
 * Subscribes to key entity changes and dispatches window events
 * so any component can react without a page refresh.
 */
export default function SyncEngine() {
  const subs = useRef([]);

  useEffect(() => {
    WATCHED.forEach(name => {
      const entity = base44.entities[name];
      if (!entity?.subscribe) return;

      const unsub = entity.subscribe((event) => {
        // Generic entity changed event — any component can listen
        window.dispatchEvent(new CustomEvent('entityChanged', {
          detail: { entity: name, ...event }
        }));

        // Trigger save-dot green pulse for character/campaign changes
        if (name === 'Character' || name === 'Campaign') {
          window.dispatchEvent(new CustomEvent('appSaved'));
        }
      });

      subs.current.push(unsub);
    });

    return () => {
      subs.current.forEach(fn => fn());
      subs.current = [];
    };
  }, []);

  return null;
}