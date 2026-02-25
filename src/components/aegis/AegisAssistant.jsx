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

  return (
    <>
      {/* ── SLIDE-IN PANEL (left edge, slides in from off-screen) ── */}
      <motion.div
        initial={false}
        animate={{ x: isOpen ? 0 : 'calc(-100% - 2px)' }}
        transition={{ type: 'spring', stiffness: 280, damping: 30 }}
        className="fixed z-[60] flex"
        style={{
          bottom: bottomOffset,
          left: 0,
          // Panel itself
          width: 'min(360px, 92vw)',
          maxHeight: 'calc(100dvh - 8rem)',
        }}
        // Reset auto-close on any interaction inside the panel
        onPointerMove={resetAutoClose}
        onPointerDown={resetAutoClose}
      >
        {/* Panel body */}
        <div
          className="flex-1 bg-slate-900 border border-violet-500/70 border-r-0 rounded-l-xl shadow-2xl shadow-violet-500/20 flex flex-col overflow-hidden"
          style={{ maxHeight: 'calc(100dvh - 8rem)' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-700 to-purple-700 px-4 py-3 flex items-center gap-3 border-b border-violet-500/50 flex-shrink-0">
            <AegisFace expression={expression} isTalking={isTalking} size={36} />
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

        {/* Tab — attached to RIGHT edge of panel, always visible */}
        <button
          onClick={handleTabClick}
          className="relative flex-shrink-0 flex flex-col items-center justify-between py-3 px-1.5 bg-violet-700 hover:bg-violet-600 border border-violet-500/70 border-l-0 rounded-r-xl shadow-xl transition-colors"
          style={{ width: 28 }}
        >
          {/* Mini face */}
          <AegisFace expression={expression} isTalking={isTalking} size={22} />

          {/* Label rotated */}
          <span
            className="text-[9px] font-bold font-mono text-violet-200 tracking-widest uppercase"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', lineHeight: 1 }}
          >
            A.E.G.I.S.
          </span>

          {/* Chevron direction hint */}
          <ChevronRight
            className="h-3 w-3 text-violet-300"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}
          />

          {/* Message dot indicator when closed */}
          <AnimatePresence>
            {showMessage && !isOpen && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-violet-400 rounded-full border-2 border-slate-950"
              />
            )}
          </AnimatePresence>

          {/* Live indicator dot */}
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-green-400 rounded-full"
          />
        </button>
      </motion.div>

      {/* ── SPEECH BUBBLE (visible when AEGIS is closed, floats near the tab) ── */}
      <AnimatePresence>
        {showMessage && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="fixed z-[59] max-w-[260px]"
            style={{
              bottom: `calc(${bottomOffset} + 36px)`,
              left: 36,
            }}
          >
            <div className="relative bg-slate-800/95 border border-violet-500/70 rounded-xl p-3 shadow-xl shadow-violet-500/20">
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
              {/* Arrow pointing down-left toward tab */}
              <div className="absolute -bottom-1.5 left-4 w-3 h-3 bg-slate-800 border-r border-b border-violet-500/70 transform rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}