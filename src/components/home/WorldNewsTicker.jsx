import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Radio, Zap } from 'lucide-react';

const REFRESH_INTERVAL = 5 * 60 * 1000; // regenerate headlines every 5 min
const SCROLL_SPEED = 60; // px/sec

// Fallback headlines used while AI loads or on error
const FALLBACK_HEADLINES = [
  'A.I. WORLD FEED INITIALIZING — CONNECTING TO O.M.N.I. NETWORK...',
  'ALL OPERATIVES ON STANDBY — AWAITING MISSION ASSIGNMENTS',
  'CATALYST CORE SYSTEMS NOMINAL — FIELD OPERATIONS CONTINUING',
  'THREAT INTELLIGENCE FEED ACTIVE — MONITOR HOSTILE ACTIVITY',
];

async function generateHeadlines(characters, missions, campaigns) {
  const activeMissions = (missions || []).filter(m => ['in_progress', 'active', 'accepted'].includes(m.status));
  const completedMissions = (missions || []).filter(m => m.status === 'completed').slice(0, 5);
  const activeCampaigns = (campaigns || []).filter(c => c.status === 'active');

  const contextLines = [];
  if (characters?.length) {
    contextLines.push(`Active operatives: ${characters.map(c => `${c.name} (Level ${c.level || 1} ${c.classification || ''})`).join(', ')}`);
  }
  if (activeMissions.length) {
    contextLines.push(`Missions in progress: ${activeMissions.map(m => m.title).join(', ')}`);
  }
  if (completedMissions.length) {
    contextLines.push(`Recently completed missions: ${completedMissions.map(m => m.title).join(', ')}`);
  }
  if (activeCampaigns.length) {
    contextLines.push(`Active campaigns: ${activeCampaigns.map(c => c.name).join(', ')}`);
  }

  const prompt = `You are an AI news anchor for O.M.N.I. (an organization of superpowered operatives / vigilantes) in a cyberpunk/superhero TTRPG world.
Generate 8 short, punchy news ticker headlines (each 10-20 words) that feel like a live newscast from this world.
Make them dramatic and world-relevant. Reference specific operative names, mission names, and campaign names from the context below when possible.
Include a mix of: field reports, geopolitical events, faction movements, threat alerts, and operative spotlights.
Always use uppercase for proper nouns and codenames.

Context:
${contextLines.join('\n') || 'No active operatives or missions on record.'}

Return ONLY a JSON array of strings, no other text. Example: ["HEADLINE ONE", "HEADLINE TWO"]`;

  try {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: { headlines: { type: 'array', items: { type: 'string' } } },
        required: ['headlines']
      }
    });
    return result?.headlines?.length ? result.headlines : FALLBACK_HEADLINES;
  } catch {
    return FALLBACK_HEADLINES;
  }
}

export default function WorldNewsTicker({ accentA, bg0, muted, text0 }) {
  const [headlines, setHeadlines] = useState(FALLBACK_HEADLINES);
  const [isLoading, setIsLoading] = useState(true);
  const trackRef = useRef(null);
  const animRef = useRef(null);
  const posRef = useRef(0);
  const lastTimestampRef = useRef(null);

  const loadHeadlines = useCallback(async () => {
    setIsLoading(true);
    try {
      const [characters, missions, campaigns] = await Promise.all([
        base44.entities.Character.list('-updated_date', 20),
        base44.entities.Mission.list('-updated_date', 30),
        base44.entities.Campaign.list('-updated_date', 10),
      ]);
      const h = await generateHeadlines(characters, missions, campaigns);
      setHeadlines(h);
      // Push the first headline as a high-priority feed notification
      if (h?.length && typeof window.__ccNotify === 'function') {
        window.__ccNotify({ type: 'feed', title: 'NEWS FEED UPDATE', body: h[0] });
      }
    } catch {
      setHeadlines(FALLBACK_HEADLINES);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHeadlines();
    const interval = setInterval(loadHeadlines, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [loadHeadlines]);

  // CSS marquee animation — restart when headlines change
  useEffect(() => {
    if (!trackRef.current) return;
    // Reset position
    posRef.current = 0;
    lastTimestampRef.current = null;
    if (animRef.current) cancelAnimationFrame(animRef.current);

    const track = trackRef.current;
    const totalWidth = track.scrollWidth / 2; // duplicated content

    const step = (ts) => {
      if (lastTimestampRef.current == null) lastTimestampRef.current = ts;
      const delta = ts - lastTimestampRef.current;
      lastTimestampRef.current = ts;
      posRef.current += (SCROLL_SPEED * delta) / 1000;
      if (posRef.current >= totalWidth) posRef.current -= totalWidth;
      track.style.transform = `translateX(-${posRef.current}px)`;
      animRef.current = requestAnimationFrame(step);
    };

    animRef.current = requestAnimationFrame(step);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [headlines]);

  const ticker = headlines.join('   ◆   ');
  const accent = accentA || '#00E5FF';
  const bg = bg0 || '#0F1216';

  return (
    <div
      className="w-full overflow-hidden relative flex items-center"
      style={{
        height: 32,
        background: `linear-gradient(90deg, ${bg}FF 0%, ${accent}10 50%, ${bg}FF 100%)`,
        borderTop: `1px solid ${accent}30`,
        borderBottom: `1px solid ${accent}30`,
        boxShadow: `0 0 16px ${accent}15`,
      }}
    >
      {/* Label */}
      <div
        className="flex-shrink-0 flex items-center gap-1.5 px-3 z-10 h-full border-r"
        style={{
          background: `${accent}18`,
          borderColor: `${accent}30`,
          minWidth: 'fit-content',
        }}
      >
        <Radio className="h-3 w-3 animate-pulse" style={{ color: accent }} />
        <span className="text-[9px] font-mono font-bold tracking-[0.2em] whitespace-nowrap" style={{ color: accent }}>
          NEWS FEED
        </span>
        {isLoading && (
          <Zap className="h-2.5 w-2.5 animate-spin" style={{ color: accent, opacity: 0.7 }} />
        )}
      </div>

      {/* Scrolling content */}
      <div className="overflow-hidden flex-1 relative h-full flex items-center">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
          style={{ background: `linear-gradient(90deg, ${bg}FF, transparent)` }} />
        <div className="absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
          style={{ background: `linear-gradient(270deg, ${bg}FF, transparent)` }} />

        <div
          ref={trackRef}
          className="flex items-center whitespace-nowrap will-change-transform"
          style={{ gap: 0 }}
        >
          {/* Duplicate for seamless loop */}
          {[0, 1].map(idx => (
            <span key={idx} className="font-mono text-[10px] tracking-wide pr-16" style={{ color: text0 || '#E6F1FF', opacity: 0.85 }}>
              {ticker}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}