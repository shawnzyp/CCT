import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Sparkles, Radio } from 'lucide-react';
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
  skeptical: { eyeScale: 0.75, mouthWidth: 20, mouthY: -1, mouthCurve: -1, eyeSpacing: 5 },
  concerned: { eyeScale: 1.2, mouthWidth: 18, mouthY: -1, mouthCurve: -3, eyeSpacing: 6 }
};

export default function AegisAssistant() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [expression, setExpression] = useState('neutral');
  const [isTalking, setIsTalking] = useState(false);
  const { play } = useSoundEffects();
  
  // More frequent expression changes
  useEffect(() => {
    const changeExpression = () => {
      const expressions = ['neutral', 'thinking', 'confident', 'analyzing', 'amused', 'determined', 'happy'];
      const randomExp = expressions[Math.floor(Math.random() * expressions.length)];
      setExpression(randomExp);
      
      setTimeout(() => setExpression('neutral'), 2500);
    };
    
    const expressionInterval = setInterval(changeExpression, 8000 + Math.random() * 7000); // More frequent
    return () => clearInterval(expressionInterval);
  }, []);
  
  // Random encouragement system
  useEffect(() => {
    const showRandomEncouragement = () => {
      // Get current character from localStorage
      const storedChar = localStorage.getItem('currentCharacter');
      let characterName = 'Hero';
      
      if (storedChar) {
        try {
          const char = JSON.parse(storedChar);
          characterName = char.name || 'Hero';
          
          // Remove definite article if present (e.g., "The Batman" -> "Batman")
          if (characterName.toLowerCase().startsWith('the ')) {
            characterName = characterName.substring(4);
          }
        } catch (e) {
          // Use default if parsing fails
        }
      }
      
      const randomTemplate = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
      const randomMessage = randomTemplate.replace(/#character/g, characterName);
      setCurrentMessage(randomMessage);
      setShowEncouragement(true);
      setIsTalking(true);
      setExpression('happy');
      play('navigate', 0.1);
      
      setTimeout(() => {
        setShowEncouragement(false);
        setIsTalking(false);
        setExpression('neutral');
      }, 7000); // Increased from 5000 to 7000 (2 seconds longer)
    };
    
    // Show first encouragement after 10 seconds
    const initialTimer = setTimeout(showRandomEncouragement, 10000);
    
    // Then every 60-120 seconds randomly
    const interval = setInterval(() => {
      const randomDelay = 60000 + Math.random() * 60000; // 60-120 seconds
      setTimeout(showRandomEncouragement, randomDelay);
    }, 120000);
    
    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [play]);
  
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    play('click', 0.2);
  };
  
  return (
    <>
      {/* Floating Assistant Icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed z-50"
        style={{
          bottom: 'max(24px, env(safe-area-inset-bottom, 24px))',
          left: 'max(24px, env(safe-area-inset-left, 24px))'
        }}
      >
        <motion.button
          onClick={toggleExpanded}
          className="relative"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {/* Animated Face Icon - Centered */}
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 border-2 border-violet-400 shadow-lg shadow-violet-500/50 flex items-center justify-center overflow-hidden">
            {/* Scanning effect */}
            <motion.div
              animate={{ y: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-400/30 to-transparent"
            />
            
            {/* Face - animated eyes and mouth - CENTERED */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              {/* Eyes with improved expressiveness */}
              <motion.div
                animate={{
                  scaleY: EXPRESSIONS[expression].eyeScale,
                  gap: EXPRESSIONS[expression].eyeSpacing
                }}
                transition={{ duration: 0.3 }}
                className="flex gap-1.5 mb-1.5"
                style={{ gap: `${EXPRESSIONS[expression].eyeSpacing}px` }}
              >
                <div className="relative">
                  <motion.div 
                    className="w-2.5 h-2.5 bg-white rounded-full relative"
                    animate={{
                      scaleY: EXPRESSIONS[expression].eyeScale,
                      scaleX: expression === 'thinking' ? [1, 0.5, 1] : 1
                    }}
                    transition={{ 
                      scaleY: { duration: 0.3 },
                      scaleX: { duration: 2, repeat: Infinity }
                    }}
                  >
                    {/* Pupil */}
                    <motion.div 
                      className="absolute top-1/2 left-1/2 w-1 h-1 bg-violet-900 rounded-full"
                      style={{ transform: 'translate(-50%, -50%)' }}
                      animate={{
                        scale: isTalking ? [1, 0.9, 1] : 1
                      }}
                      transition={{ duration: 0.2, repeat: isTalking ? Infinity : 0 }}
                    />
                  </motion.div>
                </div>
                <div className="relative">
                  <motion.div 
                    className="w-2.5 h-2.5 bg-white rounded-full relative"
                    animate={{
                      scaleY: EXPRESSIONS[expression].eyeScale,
                      scaleX: expression === 'thinking' ? [1, 0.5, 1] : 1
                    }}
                    transition={{ 
                      scaleY: { duration: 0.3 },
                      scaleX: { duration: 2, repeat: Infinity }
                    }}
                  >
                    {/* Pupil */}
                    <motion.div 
                      className="absolute top-1/2 left-1/2 w-1 h-1 bg-violet-900 rounded-full"
                      style={{ transform: 'translate(-50%, -50%)' }}
                      animate={{
                        scale: isTalking ? [1, 0.9, 1] : 1
                      }}
                      transition={{ duration: 0.2, repeat: isTalking ? Infinity : 0 }}
                    />
                  </motion.div>
                </div>
              </motion.div>
              
              {/* Mouth with talking animation */}
              <svg width="28" height="12" style={{ overflow: 'visible' }}>
                <motion.path
                  d={`M 2 ${6 - EXPRESSIONS[expression].mouthY} Q 14 ${6 + EXPRESSIONS[expression].mouthCurve - EXPRESSIONS[expression].mouthY} ${EXPRESSIONS[expression].mouthWidth} ${6 - EXPRESSIONS[expression].mouthY}`}
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  animate={{
                    d: isTalking 
                      ? [
                          `M 2 ${6 - EXPRESSIONS[expression].mouthY} Q 14 ${6 + EXPRESSIONS[expression].mouthCurve - EXPRESSIONS[expression].mouthY} ${EXPRESSIONS[expression].mouthWidth} ${6 - EXPRESSIONS[expression].mouthY}`,
                          `M 2 ${6 - EXPRESSIONS[expression].mouthY} Q 14 ${10 + EXPRESSIONS[expression].mouthCurve - EXPRESSIONS[expression].mouthY} ${EXPRESSIONS[expression].mouthWidth} ${6 - EXPRESSIONS[expression].mouthY}`,
                          `M 2 ${6 - EXPRESSIONS[expression].mouthY} Q 14 ${6 + EXPRESSIONS[expression].mouthCurve - EXPRESSIONS[expression].mouthY} ${EXPRESSIONS[expression].mouthWidth} ${6 - EXPRESSIONS[expression].mouthY}`
                        ]
                      : `M 2 ${6 - EXPRESSIONS[expression].mouthY} Q 14 ${6 + EXPRESSIONS[expression].mouthCurve - EXPRESSIONS[expression].mouthY} ${EXPRESSIONS[expression].mouthWidth} ${6 - EXPRESSIONS[expression].mouthY}`
                  }}
                  transition={{ 
                    duration: isTalking ? 0.25 : 0.3,
                    repeat: isTalking ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                />
              </svg>
            </div>
            
            {/* Pulse ring */}
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0, 0.5]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full border-2 border-violet-400"
            />
          </div>
          
          {/* Activity indicator */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.6, 1]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-950"
          />
          
          {/* Label */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <div className="text-xs font-mono text-violet-400 uppercase tracking-wider">
              A.E.G.I.S.
            </div>
          </div>
        </motion.button>
      </motion.div>
      
      {/* Encouragement Speech Bubble */}
      <AnimatePresence>
        {showEncouragement && (
          <motion.div
            initial={{ opacity: 0, x: -20, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed z-50 max-w-xs"
            style={{
              bottom: 'max(96px, calc(env(safe-area-inset-bottom, 24px) + 72px))',
              left: 'max(24px, env(safe-area-inset-left, 24px))'
            }}
          >
            <div className="relative bg-slate-800 border-2 border-violet-500 rounded-xl p-4 shadow-xl shadow-violet-500/30">
              {/* Close button */}
              <button
                onClick={() => setShowEncouragement(false)}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-700 border-2 border-violet-500 flex items-center justify-center hover:bg-slate-600"
              >
                <X className="h-3 w-3 text-white" />
              </button>
              
              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                <Radio className="h-3 w-3 text-violet-400" />
                <span className="text-xs font-mono text-violet-400 uppercase tracking-wider">
                  A.E.G.I.S. Advisory
                </span>
              </div>
              
              {/* Message */}
              <p className="text-sm text-slate-300 leading-relaxed">
                {currentMessage}
              </p>
              
              {/* Speech bubble arrow */}
              <div className="absolute -bottom-2 left-8 w-4 h-4 bg-slate-800 border-r-2 border-b-2 border-violet-500 transform rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Expanded Panel (Future: full A.E.G.I.S. interface) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed z-50 w-96 max-h-[600px]"
            style={{
              bottom: 'max(112px, calc(env(safe-area-inset-bottom, 24px) + 88px))',
              left: 'max(24px, env(safe-area-inset-left, 24px))'
            }}
          >
            <div className="bg-slate-900 border-2 border-violet-500 rounded-xl shadow-2xl shadow-violet-500/30 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-4 flex items-center justify-between border-b-2 border-violet-400">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center border-2 border-white/50">
                    <Radio className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-bold font-mono">A.E.G.I.S.</div>
                    <div className="text-xs text-violet-100 font-mono">Adaptive Executive Governance & Intelligence System</div>
                  </div>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="bg-white/20 hover:bg-white/30 text-white rounded-lg p-1 border-2 border-white/30"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-0 max-h-[600px] overflow-hidden">
                <AegisInterface />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}