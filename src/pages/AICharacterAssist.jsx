import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useTheme } from '@/components/theme/useTheme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, User, RefreshCw, Copy, ChevronRight, Wand2, RotateCcw, BookOpen, Dices, Shuffle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

const TONE_OPTIONS = ['gritty & realistic', 'hopeful & heroic', 'dark & tragic', 'comedic & lighthearted', 'mysterious & brooding', 'action-packed'];
const ARCHETYPE_OPTIONS = ['lone wolf', 'reluctant hero', 'fallen from grace', 'rising underdog', 'protector', 'vigilante', 'anti-hero', 'legend in hiding'];
const ERA_OPTIONS = ['modern day', 'near future', 'dystopian future', 'alternate history'];

export default function AICharacterAssist() {
  const { theme } = useTheme();
  const c = theme?.colors || {};
  const accentA = c.accentA || '#00E5FF';
  const panel0 = c.panel0 || '#1A1F26';
  const panel1 = c.panel1 || '#202833';
  const text0 = c.text0 || '#E6F1FF';
  const text1 = c.text1 || '#8EA0B5';
  const muted = c.muted || '#5F6E80';

  // Core input — player's own words
  const [playerVision, setPlayerVision] = useState('');

  // Optional refinements
  const [tone, setTone] = useState('');
  const [archetype, setArchetype] = useState('');
  const [era, setEra] = useState('');
  const [mustInclude, setMustInclude] = useState('');
  const [avoidThemes, setAvoidThemes] = useState('');
  // Deeper character keywords
  const [fears, setFears] = useState('');
  const [goals, setGoals] = useState('');
  const [flaws, setFlaws] = useState('');

  // Results
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [variations, setVariations] = useState([]); // store previous results
  const [loadingVariation, setLoadingVariation] = useState(false);
  const [activeVariation, setActiveVariation] = useState(null); // null = current result

  const panelStyle = { background: panel0, border: `1px solid ${accentA}20` };

  const buildPrompt = (forVariation = false) => {
    const base = playerVision.trim();
    const extras = [
      tone && `Tone/mood: ${tone}`,
      archetype && `Character archetype: ${archetype}`,
      era && `Time setting: ${era}`,
      mustInclude && `MUST include these elements: ${mustInclude}`,
      avoidThemes && `Avoid these themes entirely: ${avoidThemes}`,
      fears && `Character's FEARS (must shape their decisions and psychology): ${fears}`,
      goals && `Character's GOALS (what they're striving toward): ${goals}`,
      flaws && `Character's FLAWS (genuine weaknesses, not just quirks): ${flaws}`,
    ].filter(Boolean).join('\n');

    return `You are a creative writing assistant helping a player design their character for "Catalyst Core", a superhero TTRPG.

The player described their vision in their own words. Your job is to AMPLIFY and SERVE their vision — do NOT override it, do not make it generic, do not add clichés they didn't ask for. If they said something specific, preserve it exactly.

PLAYER'S VISION (treat this as gospel):
"${base}"

Additional preferences:
${extras || '(none specified — stick closely to the player vision above)'}

${forVariation ? 'Generate a DIFFERENT take on this same vision — same core concept but different angle, name, and details.' : ''}

Return JSON with:
- names: array of 3 vigilante names that FEEL RIGHT for this specific character (not generic superhero names)
- real_name: a fitting real/secret identity name
- physical_description: 2-3 sentences — vivid, specific, tied directly to their vision
- backstory: 3-4 sentences — deeply personal, directly rooted in the player's stated concept
- personality: array of 5 personality traits (specific, not generic — e.g. "compartmentalizes grief" not just "stoic")
- inner_conflict: one sentence capturing the character's core internal struggle
- recommended_classification: one of: mutant, enhanced_human, magic_user, alien, mystical_being — with reasoning
- recommended_classification_reason: 1 sentence why
- recommended_origin: one of: the_accident, the_experiment, the_legacy, the_awakening, the_pact, the_lost_time, the_exposure, the_rebirth, the_vigil, the_redemption
- recommended_origin_reason: 1 sentence why
- recommended_power_style: one of: physical_powerhouse, energy_manipulator, speedster, telekinetic_psychic, illusionist, shape_shifter, elemental_controller
- recommended_power_style_reason: 1 sentence why
- recommended_alignment: one of: paragon, guardian, vigilante, sentinel, outsider, wildcard, inquisitor, anti_hero, renegade
- recommended_alignment_reason: 1 sentence why
- suggested_primary_stats: object with ALL 6 ability scores as keys (STR, DEX, CON, INT, WIS, CHA) — values are numbers 8-18 reflecting the character concept, with the character's top 2 highlighted by being ≥14
- stat_reasoning: object with same 6 keys, values are 1-sentence reasons why each stat has that value
- signature_move_concept: a unique, flavourful name for their signature ability (e.g. "Resonance Collapse", "Ghostwalk")
- signature_move_description: 1-2 sentences explaining what the move does in the fiction
- suggested_skills: array of 4-6 skill names this character would naturally be proficient in, drawn from: Athletics, Acrobatics, Stealth, Perception, Investigation, Insight, Persuasion, Intimidation, Deception, Medicine, Technology, Survival, History, Arcana
- skill_reasoning: object where keys are skill names from suggested_skills and values are 1-sentence reasons based on background/stats`;
  };

  const handleGenerate = async () => {
    if (!playerVision.trim()) return;
    setLoading(true);
    setResult(null);
    setVariations([]);
    setActiveVariation(null);

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: buildPrompt(false),
      response_json_schema: getSchema(),
    });

    setResult(res);
    setLoading(false);
  };

  const handleVariation = async () => {
    if (!result) return;
    setLoadingVariation(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: buildPrompt(true),
      response_json_schema: getSchema(),
    });
    setVariations(prev => [...prev, res]);
    setActiveVariation(variations.length); // point to new one
    setLoadingVariation(false);
  };

  const getSchema = () => ({
    type: 'object',
    properties: {
      names: { type: 'array', items: { type: 'string' } },
      real_name: { type: 'string' },
      physical_description: { type: 'string' },
      backstory: { type: 'string' },
      personality: { type: 'array', items: { type: 'string' } },
      inner_conflict: { type: 'string' },
      recommended_classification: { type: 'string' },
      recommended_classification_reason: { type: 'string' },
      recommended_origin: { type: 'string' },
      recommended_origin_reason: { type: 'string' },
      recommended_power_style: { type: 'string' },
      recommended_power_style_reason: { type: 'string' },
      recommended_alignment: { type: 'string' },
      recommended_alignment_reason: { type: 'string' },
      suggested_primary_stats: { type: 'object' },
      signature_move_concept: { type: 'string' },
    }
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  const currentResult = activeVariation !== null ? variations[activeVariation] : result;

  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-3xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: accentA + '20', border: `1px solid ${accentA}40` }}>
          <Wand2 className="h-5 w-5" style={{ color: accentA }} />
        </div>
        <div>
          <h1 className="font-mono font-bold text-lg tracking-wider" style={{ color: text0 }}>AI CHARACTER ASSIST</h1>
          <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: muted }}>Your vision, amplified by AI</p>
        </div>
      </div>

      {/* ① Main Vision Input */}
      <div className="rounded-lg p-4 mb-4" style={panelStyle}>
        <div className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: accentA }}>Your Character Vision</div>
        <p className="text-xs mb-2" style={{ color: muted }}>Describe your character in your own words — personality, backstory concept, powers, vibe, anything. The AI will stay true to your vision.</p>
        <Textarea
          value={playerVision}
          onChange={e => setPlayerVision(e.target.value)}
          placeholder="e.g. A former army medic who was exposed to an experimental serum. She's haunted by the people she couldn't save. Now she can absorb injuries from others but can't heal herself. She's cold on the outside but fiercely loyal to those who earn her trust."
          className="min-h-[100px] text-sm resize-none"
          style={{ background: panel1, color: text0, borderColor: accentA + '30' }}
        />
      </div>

      {/* ② Optional Refinements */}
      <div className="rounded-lg p-4 mb-4" style={panelStyle}>
        <div className="text-[10px] font-mono uppercase tracking-widest mb-3" style={{ color: muted }}>Optional Refinements</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
          {[
            { label: 'TONE', value: tone, set: setTone, options: TONE_OPTIONS },
            { label: 'ARCHETYPE', value: archetype, set: setArchetype, options: ARCHETYPE_OPTIONS },
            { label: 'ERA', value: era, set: setEra, options: ERA_OPTIONS },
          ].map(({ label, value, set, options }) => (
            <div key={label}>
              <div className="text-[9px] font-mono uppercase tracking-widest mb-1" style={{ color: muted }}>{label}</div>
              <Select value={value} onValueChange={set}>
                <SelectTrigger className="h-8 text-xs" style={{ background: panel1, borderColor: accentA + '30', color: value ? text0 : muted }}>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">Any</SelectItem>
                  {options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="text-[9px] font-mono uppercase tracking-widest mb-1" style={{ color: muted }}>MUST INCLUDE</div>
            <Input value={mustInclude} onChange={e => setMustInclude(e.target.value)} placeholder="e.g. a mentor, a code name from her unit" className="text-xs h-8" style={{ background: panel1, color: text0, borderColor: accentA + '30' }} />
          </div>
          <div>
            <div className="text-[9px] font-mono uppercase tracking-widest mb-1" style={{ color: muted }}>AVOID THEMES</div>
            <Input value={avoidThemes} onChange={e => setAvoidThemes(e.target.value)} placeholder="e.g. no romance subplot, avoid magic" className="text-xs h-8" style={{ background: panel1, color: text0, borderColor: accentA + '30' }} />
          </div>
          <div>
            <div className="text-[9px] font-mono uppercase tracking-widest mb-1" style={{ color: muted }}>FEARS</div>
            <Input value={fears} onChange={e => setFears(e.target.value)} placeholder="e.g. losing control, becoming her abuser" className="text-xs h-8" style={{ background: panel1, color: text0, borderColor: accentA + '30' }} />
          </div>
          <div>
            <div className="text-[9px] font-mono uppercase tracking-widest mb-1" style={{ color: muted }}>GOALS</div>
            <Input value={goals} onChange={e => setGoals(e.target.value)} placeholder="e.g. find her missing brother, earn redemption" className="text-xs h-8" style={{ background: panel1, color: text0, borderColor: accentA + '30' }} />
          </div>
          <div className="sm:col-span-2">
            <div className="text-[9px] font-mono uppercase tracking-widest mb-1" style={{ color: muted }}>FLAWS</div>
            <Input value={flaws} onChange={e => setFlaws(e.target.value)} placeholder="e.g. reckless when angry, distrusts authority figures" className="text-xs h-8" style={{ background: panel1, color: text0, borderColor: accentA + '30' }} />
          </div>
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={loading || !playerVision.trim()}
        className="w-full mb-6 gap-2"
        style={{ background: accentA, color: '#000' }}
      >
        {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {loading ? 'GENERATING...' : 'GENERATE CHARACTER CONCEPT'}
      </Button>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

            {/* Variation switcher */}
            {(variations.length > 0 || result) && (
              <div className="rounded-lg p-3" style={panelStyle}>
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: muted }}>
                    Viewing: {activeVariation === null ? 'Original' : `Variation ${activeVariation + 1}`}
                    {variations.length > 0 && ` of ${variations.length + 1}`}
                  </div>
                  <div className="flex gap-2">
                    {variations.length > 0 && (
                      <div className="flex gap-1">
                        <button onClick={() => setActiveVariation(null)} className="px-2 py-1 rounded text-[10px] font-mono" style={{ background: activeVariation === null ? accentA + '30' : panel1, color: activeVariation === null ? accentA : muted }}>Orig</button>
                        {variations.map((_, i) => (
                          <button key={i} onClick={() => setActiveVariation(i)} className="px-2 py-1 rounded text-[10px] font-mono" style={{ background: activeVariation === i ? accentA + '30' : panel1, color: activeVariation === i ? accentA : muted }}>V{i + 1}</button>
                        ))}
                      </div>
                    )}
                    <Button onClick={handleVariation} disabled={loadingVariation} size="sm" variant="outline" className="gap-1.5 text-xs h-7">
                      {loadingVariation ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Shuffle className="h-3 w-3" />}
                      New Take
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {currentResult && (
              <>
                {/* Names + Identity */}
                <div className="rounded-lg p-4" style={panelStyle}>
                  <div className="text-[10px] font-mono uppercase tracking-widest mb-3" style={{ color: accentA }}>Identity</div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {currentResult.names?.map(name => (
                      <button key={name} onClick={() => copyToClipboard(name)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-mono font-bold transition-all hover:opacity-80"
                        style={{ background: accentA + '15', color: text0, border: `1px solid ${accentA}30` }}>
                        {name} <Copy className="h-3 w-3" style={{ color: muted }} />
                      </button>
                    ))}
                  </div>
                  {currentResult.real_name && <p className="text-xs" style={{ color: text1 }}>Secret Identity: <span style={{ color: text0 }}>{currentResult.real_name}</span></p>}
                  {currentResult.signature_move_concept && (
                    <div className="mt-2 px-3 py-1.5 rounded inline-block" style={{ background: accentA + '10', border: `1px solid ${accentA}25` }}>
                      <span className="text-[9px] font-mono uppercase" style={{ color: muted }}>Signature Move: </span>
                      <span className="text-xs font-mono font-bold" style={{ color: accentA }}>{currentResult.signature_move_concept}</span>
                    </div>
                  )}
                </div>

                {/* Physical + Backstory */}
                <div className="rounded-lg p-4" style={panelStyle}>
                  <div className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: accentA }}>Description</div>
                  <p className="text-sm leading-relaxed mb-3" style={{ color: text1 }}>{currentResult.physical_description}</p>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: accentA }}>Backstory</div>
                    <button onClick={() => copyToClipboard(currentResult.backstory)} style={{ color: muted }}><Copy className="h-3.5 w-3.5" /></button>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: text1 }}>{currentResult.backstory}</p>
                  {currentResult.inner_conflict && (
                    <div className="mt-3 p-2 rounded border-l-2" style={{ borderColor: accentA + '50', background: accentA + '08' }}>
                      <div className="text-[9px] font-mono uppercase" style={{ color: muted }}>Inner Conflict</div>
                      <p className="text-xs italic mt-0.5" style={{ color: text1 }}>{currentResult.inner_conflict}</p>
                    </div>
                  )}
                  {currentResult.personality?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {currentResult.personality.map(trait => (
                        <span key={trait} className="px-2 py-0.5 rounded text-[10px] font-mono" style={{ background: accentA + '10', color: accentA }}>{trait}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recommended Build with reasoning */}
                <div className="rounded-lg p-4" style={panelStyle}>
                  <div className="text-[10px] font-mono uppercase tracking-widest mb-3" style={{ color: accentA }}>Recommended Build</div>
                  <div className="space-y-2">
                    {[
                      ['Classification', currentResult.recommended_classification, currentResult.recommended_classification_reason],
                      ['Power Style', currentResult.recommended_power_style, currentResult.recommended_power_style_reason],
                      ['Origin', currentResult.recommended_origin, currentResult.recommended_origin_reason],
                      ['Alignment', currentResult.recommended_alignment, currentResult.recommended_alignment_reason],
                    ].map(([label, val, reason]) => (
                      <div key={label} className="rounded p-2.5" style={{ background: panel1 }}>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[9px] font-mono uppercase" style={{ color: muted }}>{label}</span>
                          <span className="text-xs font-mono font-bold capitalize" style={{ color: text0 }}>{val?.replace(/_/g, ' ')}</span>
                        </div>
                        {reason && <p className="text-[11px] italic" style={{ color: text1 }}>{reason}</p>}
                      </div>
                    ))}
                  </div>
                  {currentResult.suggested_primary_stats && (
                    <div className="mt-3">
                      <div className="text-[9px] font-mono uppercase mb-1" style={{ color: muted }}>Suggested Primary Stats</div>
                      {Object.entries(currentResult.suggested_primary_stats).map(([stat, reason]) => (
                        <div key={stat} className="flex items-center gap-2 text-xs mb-1">
                          <span className="font-mono font-bold w-8" style={{ color: accentA }}>{stat}</span>
                          <span style={{ color: text1 }}>{reason}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Link to={createPageUrl('CreateCharacter')} className="block">
                  <Button className="w-full gap-2" style={{ background: accentA, color: '#000' }}>
                    <User className="h-4 w-4" />
                    BUILD THIS CHARACTER
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}