import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const PAGE_HINTS = {
  CreateCharacter: 'New to Catalyst Core? Ask A.E.G.I.S. anything about character creation, classifications, or origin stories.',
  CharacterSheet: 'Ask A.E.G.I.S. to explain your powers, suggest upgrades, or calculate your next level bonuses.',
  Rules: 'Confused by a rule? Open A.E.G.I.S. and ask for a plain-English explanation with a combat example.',
  Missions: 'Ask the A.I. Director to narrate your current mission briefing or suggest tactical approaches.',
  Campaigns: 'Ask A.E.G.I.S. to summarize your active campaign, quests, or faction standings.',
  DiceRoller: 'Ask A.E.G.I.S. what modifiers apply to your next roll based on your character stats.',
  ThreatIntel: 'Ask A.E.G.I.S. to analyze a threat and suggest countermeasures based on your operative\'s build.',
  Economy: 'Ask A.E.G.I.S. which gear is best value for your build and current credits.',
  Factions: 'Ask A.E.G.I.S. how to improve your faction standing or which faction best suits your alignment.',
};

const INACTIVITY_MS = 90_000; // 90 seconds before hint fires

export default function AegisContextWatcher() {
  const location = useLocation();
  const timerRef = useRef(null);
  const firedRef = useRef(new Set());

  useEffect(() => {
    clearTimeout(timerRef.current);

    const pageName = Object.keys(PAGE_HINTS).find(p => location.pathname.includes(p));
    if (!pageName || firedRef.current.has(pageName)) return;

    const hint = PAGE_HINTS[pageName];

    timerRef.current = setTimeout(() => {
      if (firedRef.current.has(pageName)) return;
      firedRef.current.add(pageName);

      // Use the existing advisory system
      window.dispatchEvent(new CustomEvent('aegis:contextHint', { detail: { message: hint } }));
    }, INACTIVITY_MS);

    return () => clearTimeout(timerRef.current);
  }, [location.pathname]);

  return null;
}