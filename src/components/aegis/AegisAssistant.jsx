import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Radio, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import useSoundEffects from '@/components/sounds/useSoundEffects';
import AegisInterface from './AegisInterface';

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
  "#character, keep civilians safe. Everything else is negotiable.",
  "#character, be decisive. Half-measures are full disasters.",
  "#character, check your six. The city sure as hell will not.",
  "#character, stop chasing glory. Glory does not pay hazard rates.",
  "#character, keep your hands steady. Shaking is fine. Missing is not.",
  "#character, adapt. Plans die fast in New York.",
  "#character, stay disciplined. Chaos is already on payroll.",
  "#character, do not freeze. If you freeze, do it behind something solid.",
  "#character, take control. If you cannot, take away theirs.",
  "#character, keep your temper leashed. Unleash it on targets only.",
  "#character, stop negotiating with fear. Fear is not in the chain of command.",
  "#character, maintain tempo. Slow is just dead with extra steps.",
  "#character, remember: you do not need perfect. You need effective.",
  "#character, keep it simple. Complex plans get people killed confidently.",
  "#character, do the next right thing. The universe is not going to help.",
  "#character, you are allowed to swear. Do it while winning.",
  "#character, hold the line. That is literally why you are here.",
  "#character, stay alert. The weird stuff always starts small and gets mean.",
  "#character, do not get cute. Cute gets crushed.",
  "#character, stop staring at the threat. Start deleting it.",
  "#character, you are not here to be liked. You are here to be useful.",
  "#character, verify intel. Rumors are how people die stupid.",
  "#character, keep your team close. Lone wolves become lonely corpses.",
  "#character, if the plan is stupid but works, it is now doctrine.",
  "#character, manage stamina. Running dry is for engines and idiots.",
  "#character, you are the adult in the room. Yes, it is depressing.",
  "#character, stay calm. Anger is fuel, not steering.",
  "#character, control the space. If you cannot, deny it.",
  "#character, pick a direction and commit. Waffling is how you get folded.",
  "#character, you do not need permission to do the right damn thing.",
  "#character, stop second-guessing. Make a call and make it real.",
  "#character, keep comms clean. Nobody needs your inner monologue.",
  "#character, if it is scary, it is probably important. How fun for you.",
  "#character, protect the weak. That includes your future self.",
  "#character, stay mobile. Stationary targets get paperwork and funerals.",
  "#character, do not chase the enemy's rhythm. Set your own beat and break theirs.",
  "#character, watch the exits. Then make one if the building refuses cooperation.",
  "#character, stay professional. Even if everything else is a dumpster fire.",
  "#character, keep casualties low. The city is running out of luck.",
  "#character, if you screw up, correct fast. Shame is a luxury item.",
  "#character, you can be tired. You cannot be useless.",
  "#character, breathe. Inhale. Exhale. Murder the problem.",
  "#character, stay aware. Surprises are rarely gifts in this line of work.",
  "#character, stop trying to impress anyone. Impress the scoreboard.",
  "#character, focus on outcomes. Feelings are not an objective marker.",
  "#character, do not argue with gravity. Gravity always wins, smugly.",
  "#character, keep your stance. Wobble is a gateway drug to failure.",
  "#character, you are not fragile. Stop acting like glass with opinions.",
  "#character, maintain pressure. Threats hate deadlines.",
  "#character, keep your morals. The situation will try to mug you for them.",
  "#character, if you are cornered, become the corner.",
  "#character, stop making this personal. The enemy is already doing that for you.",
  "#character, keep your humor dark and your decisions darker.",
  "#character, you are allowed one mistake. Make it small and recover fast.",
  "#character, do not burn the whole city to save a street. Be selective, not dramatic.",
  "#character, stay lethal in competence. Attitude is optional.",
  "#character, you are not invincible. Act accordingly, smartass.",
  "#character, keep civilians calm. You can terrify the bad guys for free.",
  "#character, check your gear. Failure loves loose straps and big egos.",
  "#character, no speeches. Nobody dies slower because you were poetic.",
  "#character, confirm the win. Do not assume the threat is dead because you feel better.",
  "#character, keep your priorities straight: lives, mission, then your pride.",
  "#character, stay operational. Emotional processing is after extraction.",
  "#character, do not flinch. Flinching is natural. Dying is also natural.",
  "#character, conserve energy. Then spend it like you are pissed off at physics.",
  "#character, keep your team alive. They are your force multiplier and your alibi.",
  "#character, stop chasing perfection. Perfection is a liar with nice shoes.",
  "#character, if you are outmatched, get smarter. If that fails, get mean.",
  "#character, take the hit if needed. Just do not take it twice, genius.",
  "#character, stay on task. Side quests are how heroes become headlines.",
  "#character, keep your promises. Especially the ones you made under fire.",
  "#character, you are not a weapon. You are the hand that aims. Do not shake.",
  "#character, maintain composure. Freak out later, privately, like a professional.",
  "#character, stop waiting for a sign. You are the damn sign.",
  "#character, keep moving forward. Backward is for retreats and regrets.",
  "#character, do the hard thing now. The easy thing later is usually a trap.",
  "#character, remember: courage is fear with orders and a dirty mouth.",
  "#character, finish the job. Then collapse. In that order.",
  "#character, stay viciously helpful. The city needs results, not vibes.",
  "#character, advance. The world is still standing, and that is your problem."
];

const EXPRESSIONS = {
  neutral: { eyeScale: 1, mouthWidth: 24, mouthY: 0, mouthCurve: 0, eyeSpacing: 6 },
  happy: { eyeScale: 1.1, mouthWidth: 28, mouthY: 2, mouthCurve: 4, eyeSpacing: 6 },
  thinking: { eyeScale: 0.7, mouthWidth: 16, mouthY: 0, mouthCurve: -2, eyeSpacing: 5 },
  surprised: { eyeScale: 1.4, mouthWidth: 12, mouthY: 2, mouthCurve: 8, eyeSpacing: 7 },
  confident: { eyeScale: 0.8, mouthWidth: 26, mouthY: 1, mouthCurve: 3, eyeSpacing: 6 },
  analyzing: { eyeScale: 1.1, mouthWidth: 20, mouthY: 0, mouthCurve: 0, eyeSpacing: 6 },
  determined: { eyeScale: 0.6, mouthWidth: 22, mouthY: 0, mouthCurve: 1, eyeSpacing: 6 },
  amused: { eyeScale: 0.9, mouthWidth: 24, mouthY: 1, mouthCurve: 2, eyeSpacing: 6 },
  calm: { eyeScale: 0.8, mouthWidth: 24, mouthY: 0, mouthCurve: 1, eyeSpacing: 6 },
  focused: { eyeScale: 0.5, mouthWidth: 22, mouthY: 0, mouthCurve: 0, eyeSpacing: 5 },
  alert: { eyeScale: 1.3, mouthWidth: 20, mouthY: 0, mouthCurve: 1, eyeSpacing: 7 },
};

// AegisFace used in both the tab and the panel
function AegisFace({ expression, isTalking, size = 48 }) {
  const expr = EXPRESSIONS[expression] || EXPRESSIONS.neutral;
  const scale = size / 64;

  return (
    <div
      className="relative rounded-full bg-gradient-to-br from-violet-600 to-purple-700 border-2 border-violet-400 shadow-lg shadow-violet-500/50 flex items-center justify-center overflow-hidden flex-shrink-0"
      style={{ width: size, height: size }}
    >
      {/* Scan line */}
      <motion.div
        animate={{ y: ['-100%', '100%'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-400/30 to-transparent"
      />
      {/* Face */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <motion.div
          className="flex mb-1"
          style={{ gap: `${expr.eyeSpacing * scale}px`, marginBottom: `${6 * scale}px` }}
          animate={{ scaleY: expr.eyeScale }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-white rounded-full"
            style={{ width: `${10 * scale}px`, height: `${10 * scale}px` }}
            animate={{ scaleY: expr.eyeScale }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
          <motion.div
            className="bg-white rounded-full"
            style={{ width: `${10 * scale}px`, height: `${10 * scale}px` }}
            animate={{ scaleY: expr.eyeScale }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </motion.div>
        <svg width={28 * scale} height={12 * scale} style={{ overflow: 'visible' }}>
          <motion.path
            d={`M ${2 * scale} ${(6 - expr.mouthY) * scale} Q ${14 * scale} ${(6 + expr.mouthCurve - expr.mouthY) * scale} ${expr.mouthWidth * scale} ${(6 - expr.mouthY) * scale}`}
            stroke="rgba(255,255,255,0.8)"
            strokeWidth={2.5 * scale}
            fill="none"
            strokeLinecap="round"
            animate={{
              d: isTalking
                ? [
                    `M ${2*scale} ${6*scale} Q ${14*scale} ${6*scale} ${expr.mouthWidth*scale} ${6*scale}`,
                    `M ${2*scale} ${6*scale} Q ${14*scale} ${9*scale} ${expr.mouthWidth*scale} ${6*scale}`,
                    `M ${2*scale} ${6*scale} Q ${14*scale} ${3*scale} ${expr.mouthWidth*scale} ${6*scale}`,
                    `M ${2*scale} ${6*scale} Q ${14*scale} ${9*scale} ${expr.mouthWidth*scale} ${6*scale}`,
                    `M ${2*scale} ${6*scale} Q ${14*scale} ${6*scale} ${expr.mouthWidth*scale} ${6*scale}`,
                  ]
                : `M ${2*scale} ${(6-expr.mouthY)*scale} Q ${14*scale} ${(6+expr.mouthCurve-expr.mouthY)*scale} ${expr.mouthWidth*scale} ${(6-expr.mouthY)*scale}`
            }}
            transition={{ duration: isTalking ? 0.6 : 0.3, repeat: isTalking ? Infinity : 0, ease: 'easeInOut' }}
          />
        </svg>
      </div>
      {/* Pulse ring */}
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 rounded-full border-2 border-violet-400"
      />
    </div>
  );
}

export default function AegisAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTalking, setIsTalking] = useState(false);
  const [expression, setExpression] = useState('neutral');
  const { play } = useSoundEffects();

  // Auto-close timer ref — resets on any interaction inside AEGIS
  const autoCloseTimer = useRef(null);

  const resetAutoClose = useCallback(() => {
    if (autoCloseTimer.current) clearTimeout(autoCloseTimer.current);
    autoCloseTimer.current = setTimeout(() => {
      setIsOpen(false);
    }, 60000); // 60 seconds
  }, []);

  // Start/reset timer whenever panel opens
  useEffect(() => {
    if (isOpen) {
      resetAutoClose();
    } else {
      if (autoCloseTimer.current) clearTimeout(autoCloseTimer.current);
    }
    return () => { if (autoCloseTimer.current) clearTimeout(autoCloseTimer.current); };
  }, [isOpen, resetAutoClose]);

  // Cycle expressions
  useEffect(() => {
    const expressions = Object.keys(EXPRESSIONS);
    let idx = 0;
    const interval = setInterval(() => {
      setExpression(expressions[idx]);
      idx = (idx + 1) % expressions.length;
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Random encouragement system
  useEffect(() => {
    const showRandomEncouragement = () => {
      const storedChar = localStorage.getItem('currentCharacter');
      let characterName = 'Hero';
      if (storedChar) {
        try {
          const char = JSON.parse(storedChar);
          characterName = char.name || 'Hero';
          if (characterName.toLowerCase().startsWith('the ')) {
            characterName = characterName.substring(4);
          }
        } catch (e) {}
      }
      const randomTemplate = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
      const randomMessage = randomTemplate.replace(/#character/g, characterName);
      setCurrentMessage(randomMessage);
      setShowMessage(true);
      setIsTalking(true);
      setExpression('happy');
      play('navigate', 0.1);

      setTimeout(() => {
        setShowMessage(false);
        setIsTalking(false);
        setExpression('neutral');
      }, 7000);
    };

    const initialTimer = setTimeout(showRandomEncouragement, 10000);
    const interval = setInterval(() => {
      const delay = 60000 + Math.random() * 60000;
      setTimeout(showRandomEncouragement, delay);
    }, 120000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [play]);

  const handleTabClick = () => {
    setIsOpen(prev => !prev);
    play('click', 0.2);
  };

  // Bottom offset: above mobile nav bar (4rem = 64px) + safe area + 8px gap
  const bottomOffset = 'calc(4rem + env(safe-area-inset-bottom, 0px) + 8px)';

  // Width of the slide-in panel
  const PANEL_W = 'min(360px, 88vw)';
  // Tab width (always on-screen)
  const TAB_W = 36;

  return (
    <>
      {/* ── ALWAYS-VISIBLE TAB (pinned to left edge of screen) ── */}
      <button
        onClick={handleTabClick}
        className="fixed z-[61] flex flex-col items-center justify-between rounded-r-2xl shadow-2xl transition-colors"
        style={{
          left: 0,
          bottom: bottomOffset,
          width: TAB_W,
          height: 120,
          background: 'linear-gradient(160deg, #6d28d9 0%, #7c3aed 60%, #5b21b6 100%)',
          border: '1.5px solid rgba(167,139,250,0.6)',
          borderLeft: 'none',
          boxShadow: '2px 0 24px rgba(139,92,246,0.5), inset -1px 0 8px rgba(167,139,250,0.1)',
          paddingTop: 8,
          paddingBottom: 8,
        }}
        aria-label="Open A.E.G.I.S. assistant"
      >
        {/* Mini animated face */}
        <AegisFace expression={expression} isTalking={isTalking} size={24} />

        {/* Rotated label */}
        <span
          className="font-bold font-mono text-violet-100 tracking-[0.18em] uppercase leading-none"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: 8 }}
        >
          A.E.G.I.S.
        </span>

        {/* Chevron */}
        <ChevronRight
          className="text-violet-300 transition-transform duration-300"
          style={{ width: 14, height: 14, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />

        {/* New message dot */}
        <AnimatePresence>
          {showMessage && !isOpen && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-violet-300 rounded-full border-2 border-slate-950"
            />
          )}
        </AnimatePresence>

        {/* Live pulse dot */}
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-green-400 rounded-full"
        />
      </button>

      {/* ── SLIDE-IN PANEL (slides in from off-screen, sits right of tab) ── */}
      <motion.div
        initial={false}
        animate={{ x: isOpen ? TAB_W : `calc(-${PANEL_W})` }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        className="fixed z-[60]"
        style={{
          bottom: bottomOffset,
          left: 0,
          width: PANEL_W,
          maxHeight: 'calc(100dvh - 8rem)',
        }}
        onPointerMove={resetAutoClose}
        onPointerDown={resetAutoClose}
      >
        <div
          className="bg-slate-900 border border-violet-500/60 rounded-r-xl shadow-2xl shadow-violet-500/25 flex flex-col overflow-hidden"
          style={{ maxHeight: 'calc(100dvh - 8rem)' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-700 to-purple-700 px-4 py-3 flex items-center gap-3 border-b border-violet-500/50 flex-shrink-0">
            <div id="aegis-face-header">
              <AegisFace expression={expression} isTalking={isTalking} size={36} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-bold font-mono text-sm">A.E.G.I.S.</div>
              <div className="text-violet-200 text-[10px] font-mono leading-tight truncate">
                Adaptive Executive Governance &amp; Intelligence System
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center flex-shrink-0 transition-colors"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>

          {/* Live message banner inside panel */}
          <AnimatePresence>
            {showMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-b border-violet-500/30 bg-violet-900/30 px-4 py-2 flex-shrink-0"
              >
                <div className="flex items-start gap-2">
                  <Radio className="h-3 w-3 text-violet-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-violet-200 font-mono leading-relaxed">{currentMessage}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interface */}
          <div className="flex-1 overflow-hidden">
            <AegisInterface />
          </div>
        </div>
      </motion.div>

      {/* ── SPEECH BUBBLE ── */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            key="speech-bubble"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            className="fixed z-[62]"
            style={{
              // When open: floats above the panel header face; when closed: floats above the tab
              bottom: isOpen
                ? `calc(${bottomOffset} + 110px)`
                : `calc(${bottomOffset} + 130px)`,
              left: isOpen ? TAB_W + 8 : TAB_W + 8,
              maxWidth: 240,
            }}
          >
            <div className="relative bg-slate-800/97 border border-violet-500/70 rounded-xl p-3 shadow-xl shadow-violet-500/25">
              <button
                onClick={() => setShowMessage(false)}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-slate-700 border border-violet-500 flex items-center justify-center hover:bg-slate-600"
              >
                <X className="h-2.5 w-2.5 text-white" />
              </button>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Radio className="h-2.5 w-2.5 text-violet-400" />
                <span className="text-[9px] font-mono text-violet-400 uppercase tracking-wider">A.E.G.I.S. Advisory</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{currentMessage}</p>
              {/* Arrow pointing left toward the tab/face */}
              <div
                className="absolute w-3 h-3 bg-slate-800 border-l border-b border-violet-500/70 transform rotate-45"
                style={{ left: -7, bottom: 14 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}