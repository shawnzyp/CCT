import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { X, Radio, ChevronRight, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import useSoundEffects from '@/components/sounds/useSoundEffects';
import AegisInterface from './AegisInterface';

// ── STATES ───────────────────────────────────────────────────────────────────
const STATE = { CLOSED: 'CLOSED', DOCKED: 'DOCKED', CHAT: 'CHAT' };
const AUTO_HIDE_MS = 60_000;
const BUBBLE_DURATION_MS = 8_000;

// ── ENCOURAGEMENTS ───────────────────────────────────────────────────────────
const ENCOURAGEMENTS = [
  "#character, status: alive. Keep it that way, hero.",
  "#character, move your ass. Standing still is how you become a memorial.",
  "#character, breathe. Panic is for amateurs and talk shows.",
  "#character, confirm objective. Vibes are not tactical data.",
  "#character, you have one job: make the problem smaller.",
  "#character, keep your head up. The city loves cheap shots.",
  "#character, lock in. The universe is trying to clown you.",
  "#character, focus. Your feelings can file a complaint later.",
  "#character, no drama. Save it for the debrief and the bottle.",
  "#character, eyes up. Threats do not announce themselves like decent people.",
  "#character, execute. Overthinking is just fear wearing glasses.",
  "#character, stay sharp. Dull heroes get used as examples.",
  "#character, you are not outmatched. You are underprepared. Fix it.",
  "#character, keep comms short. Syllables save lives.",
  "#character, stop hesitating. The clock does not give a damn.",
  "#character, use cover. Bravery is not armor.",
  "#character, you can be scared. Just do not be stupid about it.",
  "#character, tighten your plan. Loose plans bleed.",
  "#character, you are the solution. Act like it.",
  "#character, keep moving. Gravity is undefeated and petty.",
  "#character, adapt. Plans die fast in New York.",
  "#character, stay disciplined. Chaos is already on payroll.",
  "#character, do not freeze. If you freeze, do it behind something solid.",
  "#character, take control. If you cannot, take away theirs.",
  "#character, remember: you do not need perfect. You need effective.",
  "#character, keep it simple. Complex plans get people killed confidently.",
  "#character, hold the line. That is literally why you are here.",
  "#character, you are not invincible. Act accordingly, smartass.",
  "#character, stop second-guessing. Make a call and make it real.",
  "#character, if it is scary, it is probably important. How fun for you.",
  "#character, stay mobile. Stationary targets get paperwork and funerals.",
  "#character, courage is fear with orders and a dirty mouth.",
  "#character, finish the job. Then collapse. In that order.",
];

// ── EXPRESSIONS ──────────────────────────────────────────────────────────────
const EXPRESSIONS = {
  neutral:   { eyeScale: 1,   mouthWidth: 24, mouthY: 0, mouthCurve: 0,  eyeSpacing: 6 },
  happy:     { eyeScale: 1.1, mouthWidth: 28, mouthY: 2, mouthCurve: 4,  eyeSpacing: 6 },
  thinking:  { eyeScale: 0.7, mouthWidth: 16, mouthY: 0, mouthCurve: -2, eyeSpacing: 5 },
  confident: { eyeScale: 0.8, mouthWidth: 26, mouthY: 1, mouthCurve: 3,  eyeSpacing: 6 },
  analyzing: { eyeScale: 1.1, mouthWidth: 20, mouthY: 0, mouthCurve: 0,  eyeSpacing: 6 },
  alert:     { eyeScale: 1.3, mouthWidth: 20, mouthY: 0, mouthCurve: 1,  eyeSpacing: 7 },
  focused:   { eyeScale: 0.5, mouthWidth: 22, mouthY: 0, mouthCurve: 0,  eyeSpacing: 5 },
  calm:      { eyeScale: 0.8, mouthWidth: 24, mouthY: 0, mouthCurve: 1,  eyeSpacing: 6 },
  amused:    { eyeScale: 0.9, mouthWidth: 24, mouthY: 1, mouthCurve: 2,  eyeSpacing: 6 },
  serious:   { eyeScale: 0.7, mouthWidth: 20, mouthY: -1,mouthCurve: 0,  eyeSpacing: 5 },
};

// ── AEGIS FACE SVG ────────────────────────────────────────────────────────────
function AegisFace({ expression, isTalking, size = 56 }) {
  const expr = EXPRESSIONS[expression] || EXPRESSIONS.neutral;
  return (
    <div
      className="relative rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
      style={{
        width: size, height: size,
        background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
        border: '2px solid rgba(167,139,250,0.7)',
        boxShadow: '0 0 14px rgba(139,92,246,0.45)',
      }}
    >
      {/* Scan line */}
      <motion.div
        animate={{ y: ['-100%', '100%'] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0"
        style={{ background: 'linear-gradient(transparent, rgba(167,139,250,0.25), transparent)' }}
      />
      {/* Pulse ring */}
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 rounded-full"
        style={{ border: '2px solid rgba(167,139,250,0.6)' }}
      />
      {/* Face */}
      <div className="relative z-10 flex flex-col items-center justify-center" style={{ gap: 4 }}>
        {/* Eyes */}
        <div className="flex" style={{ gap: expr.eyeSpacing }}>
          {[0, 1].map(i => (
            <motion.div
              key={i}
              className="bg-white rounded-full"
              style={{ width: 9, height: 9 }}
              animate={{ scaleY: expr.eyeScale }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
        {/* Mouth */}
        <svg width={size * 0.5} height={10} style={{ overflow: 'visible' }}>
          <motion.path
            d={`M 2 ${6 - expr.mouthY} Q ${size * 0.25} ${6 + expr.mouthCurve - expr.mouthY} ${expr.mouthWidth} ${6 - expr.mouthY}`}
            stroke="rgba(255,255,255,0.85)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            animate={isTalking ? {
              d: [
                `M 2 6 Q ${size * 0.25} 6 ${expr.mouthWidth} 6`,
                `M 2 6 Q ${size * 0.25} 9 ${expr.mouthWidth} 6`,
                `M 2 6 Q ${size * 0.25} 3 ${expr.mouthWidth} 6`,
                `M 2 6 Q ${size * 0.25} 9 ${expr.mouthWidth} 6`,
                `M 2 6 Q ${size * 0.25} 6 ${expr.mouthWidth} 6`,
              ]
            } : {}}
            transition={{ duration: 0.5, repeat: isTalking ? Infinity : 0, ease: 'easeInOut' }}
          />
        </svg>
      </div>
    </div>
  );
}

// ── ADVISORY BUBBLE ───────────────────────────────────────────────────────────
function AdvisoryBubble({ message, anchorType, onDismiss }) {
  // anchorType: 'tab' (pointing down-left toward tab) | 'face' (pointing left toward face)
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
      className="relative max-w-[240px]"
      style={{ pointerEvents: 'auto' }}
    >
      <div
        className="relative rounded-xl p-3 shadow-xl"
        style={{
          background: 'var(--cc-panel0, #1A1F26)',
          border: '1.5px solid rgba(139,92,246,0.55)',
          boxShadow: '0 4px 24px rgba(139,92,246,0.22)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5">
            <Radio className="h-3 w-3 text-violet-400" />
            <span className="text-[10px] font-mono text-violet-400 uppercase tracking-widest">
              A.E.G.I.S. Advisory
            </span>
          </div>
          <button
            onClick={onDismiss}
            className="cc-sm-target w-5 h-5 min-h-0 min-w-0 flex items-center justify-center rounded-full hover:bg-violet-500/20 transition-colors"
          >
            <X className="h-3 w-3 text-violet-300" />
          </button>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--cc-text1, #8EA0B5)' }}>
          {message}
        </p>

        {/* Tail */}
        {anchorType === 'tab' ? (
          /* Points left toward the tab */
          <div
            className="absolute"
            style={{
              left: -7, top: '50%', marginTop: -6,
              width: 12, height: 12,
              background: 'var(--cc-panel0, #1A1F26)',
              border: '1.5px solid rgba(139,92,246,0.55)',
              transform: 'rotate(45deg)',
              borderTop: 'none', borderRight: 'none',
            }}
          />
        ) : (
          /* Points left toward face */
          <div
            className="absolute"
            style={{
              left: -7, top: '50%', marginTop: -6,
              width: 12, height: 12,
              background: 'var(--cc-panel0, #1A1F26)',
              border: '1.5px solid rgba(139,92,246,0.55)',
              transform: 'rotate(45deg)',
              borderTop: 'none', borderRight: 'none',
            }}
          />
        )}
      </div>
    </motion.div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function AegisAssistant() {
  const [panelState, setPanelState] = useState(STATE.CLOSED);
  const [expression, setExpression] = useState('neutral');
  const [isTalking, setIsTalking] = useState(false);
  const [advisory, setAdvisory] = useState(null); // { message, id }
  const [hasUnread, setHasUnread] = useState(false);
  const { play } = useSoundEffects();

  const autoHideTimerRef = useRef(null);
  const advisoryTimerRef = useRef(null);

  // ── Expression cycling
  useEffect(() => {
    const keys = Object.keys(EXPRESSIONS);
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % keys.length;
      setExpression(keys[i]);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  // ── Auto-hide timer (DOCKED only)
  const startAutoHide = useCallback(() => {
    clearTimeout(autoHideTimerRef.current);
    autoHideTimerRef.current = setTimeout(() => {
      setPanelState(STATE.CLOSED);
    }, AUTO_HIDE_MS);
  }, []);

  const resetAutoHide = useCallback(() => {
    if (panelState === STATE.DOCKED) startAutoHide();
  }, [panelState, startAutoHide]);

  const clearAutoHide = useCallback(() => {
    clearTimeout(autoHideTimerRef.current);
  }, []);

  useEffect(() => {
    if (panelState === STATE.DOCKED) {
      startAutoHide();
    } else {
      clearAutoHide();
    }
    return clearAutoHide;
  }, [panelState, startAutoHide, clearAutoHide]);

  // ── Advisory message system
  const showAdvisory = useCallback(() => {
    const stored = localStorage.getItem('currentCharacter');
    let name = 'Hero';
    if (stored) {
      try {
        const c = JSON.parse(stored);
        name = c.name || 'Hero';
        if (name.toLowerCase().startsWith('the ')) name = name.slice(4);
      } catch {}
    }
    const tpl = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
    const msg = tpl.replace(/#character/g, name);

    setAdvisory({ message: msg, id: Date.now() });
    setIsTalking(true);
    setExpression('happy');
    play('navigate', 0.1);

    // Mark unread only when closed
    setPanelState(s => {
      if (s === STATE.CLOSED) setHasUnread(true);
      return s;
    });

    clearTimeout(advisoryTimerRef.current);
    advisoryTimerRef.current = setTimeout(() => {
      setAdvisory(null);
      setIsTalking(false);
      setExpression('neutral');
    }, BUBBLE_DURATION_MS);
  }, [play]);

  useEffect(() => {
    const first = setTimeout(showAdvisory, 12_000);
    const recurring = setInterval(showAdvisory, 90_000 + Math.random() * 60_000);
    return () => { clearTimeout(first); clearInterval(recurring); };
  }, [showAdvisory]);

  // ── Interaction handlers
  const handleTabPress = useCallback(() => {
    play('click', 0.2);
    setPanelState(s => {
      if (s === STATE.CLOSED) return STATE.DOCKED;
      if (s === STATE.DOCKED) return STATE.CLOSED;
      if (s === STATE.CHAT) return STATE.DOCKED;
      return STATE.CLOSED;
    });
    setHasUnread(false);
  }, [play]);

  const handleFacePress = useCallback(() => {
    if (panelState === STATE.DOCKED) {
      play('click', 0.2);
      setPanelState(STATE.CHAT);
      clearAutoHide();
      resetAutoHide(); // reset, but it'll be cleared immediately since state changes to CHAT
    }
  }, [panelState, play, clearAutoHide, resetAutoHide]);

  const handleCloseChat = useCallback(() => {
    play('click', 0.15);
    setPanelState(STATE.DOCKED);
    // timer restarts via the useEffect watching panelState
  }, [play]);

  const handleAegisInteraction = useCallback(() => {
    resetAutoHide();
  }, [resetAutoHide]);

  // Determine panel translateX
  const isVisible = panelState !== STATE.CLOSED;
  const isChatOpen = panelState === STATE.CHAT;

  // Panel width
  const FACE_W = 80;   // px – face dock
  const CHAT_W = 320;  // px – chat panel

  // TAB_W must match the tab button width
  const TAB_W = 32;

  return (
    <>
      {/* ── EDGE TAB (slides OFF when panel is visible) ───────────────────── */}
      <motion.div
        className="fixed z-[60]"
        animate={{ x: isVisible ? -(TAB_W + 4) : 0 }}
        initial={{ x: 0 }}
        transition={{ duration: 0.27, ease: [0.2, 0.8, 0.2, 1] }}
        style={{
          left: 0,
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 72px)',
          willChange: 'transform',
        }}
      >
        <button
          onClick={handleTabPress}
          aria-label="Open A.E.G.I.S."
          className="relative flex flex-col items-center justify-center gap-0.5 rounded-r-xl"
          style={{
            width: TAB_W,
            paddingTop: 10,
            paddingBottom: 10,
            minHeight: 72,
            background: 'var(--cc-panel0, #1A1F26)',
            border: '1.5px solid rgba(139,92,246,0.5)',
            borderLeft: 'none',
            boxShadow: hasUnread
              ? '0 0 12px rgba(139,92,246,0.7), 2px 0 12px rgba(139,92,246,0.4)'
              : '2px 0 10px rgba(139,92,246,0.2)',
            transition: 'box-shadow 300ms ease',
          }}
        >
          {/* Unread dot */}
          <AnimatePresence>
            {hasUnread && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                exit={{ scale: 0 }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-violet-400"
                style={{ boxShadow: '0 0 6px rgba(167,139,250,0.8)' }}
              />
            )}
          </AnimatePresence>

          {/* Vertical label */}
          <span
            className="font-mono text-[9px] font-bold uppercase"
            style={{
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
              color: hasUnread ? '#a78bfa' : 'rgba(139,92,246,0.8)',
              letterSpacing: '0.15em',
              lineHeight: 1,
            }}
          >
            A.E.G.I.S.
          </span>
          <ChevronRight className="h-3 w-3 text-violet-400" />
        </button>
      </motion.div>

      {/* ── DOCKED: bare face floating beside the tab position ─────────── */}
      {!isChatOpen && (
        <motion.div
          aria-label="A.E.G.I.S. face"
          animate={{ x: panelState === STATE.DOCKED ? 0 : -(FACE_W + 8) }}
          initial={{ x: -(FACE_W + 8) }}
          transition={{ duration: 0.27, ease: [0.2, 0.8, 0.2, 1] }}
          className="fixed z-[60]"
          style={{
            left: 0,
            // Vertically centred on the tab: tab bottom = 72px + safe, tab minH = 72px → centre = 72 + 36 = 108px from bottom
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 72px)',
            pointerEvents: panelState === STATE.DOCKED ? 'auto' : 'none',
            willChange: 'transform',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}
          onClick={handleAegisInteraction}
        >
          {/* Face — tap to open chat */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Open A.E.G.I.S. Chat"
            className="cursor-pointer"
            onClick={handleFacePress}
            onKeyDown={e => e.key === 'Enter' && handleFacePress()}
          >
            <AegisFace expression={expression} isTalking={isTalking} size={52} />
          </div>
          {/* ONLINE + chat hint */}
          <div className="text-center" style={{ lineHeight: 1.2 }}>
            <div className="text-[8px] font-mono text-violet-400 uppercase tracking-widest">ONLINE</div>
            <div className="flex items-center justify-center gap-0.5 mt-0.5" style={{ color: 'rgba(139,92,246,0.6)' }}>
              <MessageSquare style={{ width: 7, height: 7 }} />
              <span className="text-[7px] font-mono uppercase tracking-wide">Chat</span>
            </div>
          </div>
          {/* Close */}
          <button
            onClick={e => { e.stopPropagation(); setPanelState(STATE.CLOSED); play('click', 0.15); }}
            aria-label="Close A.E.G.I.S."
            className="cc-sm-target w-5 h-5 min-h-0 min-w-0 flex items-center justify-center rounded-full hover:bg-violet-500/20 transition-colors"
          >
            <X className="h-3 w-3 text-violet-400" />
          </button>
        </motion.div>
      )}

      {/* ── CHAT PANEL (only when CHAT_OPEN) ─────────────────────────────── */}
      <motion.div
        aria-label="A.E.G.I.S. panel"
        animate={{ x: isChatOpen ? 0 : -(CHAT_W + 8) }}
        initial={{ x: -(CHAT_W + 8) }}
        transition={{ duration: 0.27, ease: [0.2, 0.8, 0.2, 1] }}
        className="fixed z-[60]"
        style={{
          left: 0,
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 64px)',
          top: 'calc(env(safe-area-inset-top, 0px) + 56px)',
          width: CHAT_W,
          maxHeight: 'calc(100dvh - 56px - 64px)',
          pointerEvents: isChatOpen ? 'auto' : 'none',
          willChange: 'transform',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={handleAegisInteraction}
      >
        <div
          className="flex flex-col h-full rounded-r-xl overflow-hidden"
          style={{
            background: 'var(--cc-panel0, #1A1F26)',
            border: '1.5px solid rgba(139,92,246,0.45)',
            borderLeft: 'none',
            boxShadow: '4px 0 24px rgba(139,92,246,0.2)',
          }}
        >
          {/* Chat header with face anchor */}
          <div
            className="flex-shrink-0 flex flex-col items-center py-3 gap-1"
            style={{ borderBottom: '1px solid rgba(139,92,246,0.25)', background: 'linear-gradient(180deg, rgba(109,40,217,0.12) 0%, transparent 100%)' }}
          >
            <div className="w-full flex items-center justify-between px-3">
              <div className="flex items-center gap-2">
                <AegisFace expression={expression} isTalking={isTalking} size={36} />
                <div>
                  <div className="text-xs font-bold font-mono text-violet-300">A.E.G.I.S.</div>
                  <div className="text-[9px] font-mono text-violet-500 uppercase tracking-widest">Adaptive Intelligence</div>
                </div>
              </div>
              <button
                onClick={handleCloseChat}
                aria-label="Close A.E.G.I.S. Chat"
                className="cc-sm-target h-7 w-7 min-h-0 min-w-0 flex items-center justify-center rounded-lg hover:bg-violet-500/20 transition-colors"
              >
                <X className="h-4 w-4 text-violet-300" />
              </button>
            </div>
          </div>

          {/* Chat interface */}
          <div
            className="flex-1 overflow-hidden"
            onClick={handleAegisInteraction}
            onScroll={handleAegisInteraction}
            onKeyDown={handleAegisInteraction}
          >
            <AegisInterface compact />
          </div>
        </div>
      </motion.div>

      {/* ── ADVISORY BUBBLE ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {advisory && (
          <div
            key={advisory.id}
            className="fixed z-[61] pointer-events-none"
            style={{
              // Always to the right of whatever is on the left edge
              left: isVisible ? (isChatOpen ? CHAT_W : 60) + 10 : TAB_W + 10,
              // Vertically aligned with the tab centre
              bottom: 'calc(env(safe-area-inset-bottom, 0px) + 90px)',
              pointerEvents: 'none',
            }}
          >
            <AdvisoryBubble
              message={advisory.message}
              anchorType={!isVisible ? 'tab' : 'face'}
              onDismiss={() => {
                setAdvisory(null);
                setIsTalking(false);
                setHasUnread(false);
              }}
            />
          </div>
        )}
      </AnimatePresence>
    </>
  );
}