import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useTheme } from '@/components/theme/useTheme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, User, Zap, RefreshCw, Copy, ChevronRight, Wand2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

const KEYWORD_SUGGESTIONS = ['soldier', 'scientist', 'artist', 'hacker', 'rebel', 'healer', 'detective', 'exile'];

export default function AICharacterAssist() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const c = theme?.colors || {};
  const accentA = c.accentA || '#00E5FF';
  const panel0 = c.panel0 || '#1A1F26';
  const panel1 = c.panel1 || '#202833';
  const text0 = c.text0 || '#E6F1FF';
  const text1 = c.text1 || '#8EA0B5';
  const muted = c.muted || '#5F6E80';

  const [keywords, setKeywords] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const toggleKeyword = (kw) => {
    setSelectedKeywords(prev => prev.includes(kw) ? prev.filter(k => k !== kw) : [...prev, kw]);
  };

  const handleGenerate = async () => {
    const allKeywords = [...selectedKeywords, ...keywords.split(',').map(k => k.trim()).filter(Boolean)];
    if (!allKeywords.length) return;
    setLoading(true);
    setResult(null);

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a TTRPG character creation assistant for a superhero game called "Catalyst Core". 
Generate a character concept based on these keywords: ${allKeywords.join(', ')}.

Return JSON with:
- names: array of 3 vigilante name suggestions (e.g. "Shadow Strike", "Nova")
- real_name: a plausible real/secret identity name
- physical_description: 2-3 sentence vivid physical description
- backstory: 3-4 sentence compelling origin backstory
- personality: key personality traits (array of 4 words)
- recommended_classification: one of: mutant, enhanced_human, magic_user, alien, mystical_being
- recommended_origin: one of: the_accident, the_experiment, the_legacy, the_awakening, the_pact, the_lost_time, the_exposure, the_rebirth, the_vigil, the_redemption
- recommended_power_style: one of: physical_powerhouse, energy_manipulator, speedster, telekinetic_psychic, illusionist, shape_shifter, elemental_controller
- recommended_alignment: one of: paragon, guardian, vigilante, sentinel, outsider, wildcard, inquisitor, anti_hero, renegade
- stat_reasoning: brief explanation of which stats should be highest and why`,
      response_json_schema: {
        type: 'object',
        properties: {
          names: { type: 'array', items: { type: 'string' } },
          real_name: { type: 'string' },
          physical_description: { type: 'string' },
          backstory: { type: 'string' },
          personality: { type: 'array', items: { type: 'string' } },
          recommended_classification: { type: 'string' },
          recommended_origin: { type: 'string' },
          recommended_power_style: { type: 'string' },
          recommended_alignment: { type: 'string' },
          stat_reasoning: { type: 'string' },
        }
      }
    });

    setResult(res);
    setLoading(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  const panelStyle = { background: panel0, border: `1px solid ${accentA}20` };

  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-3xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: accentA + '20', border: `1px solid ${accentA}40` }}>
          <Wand2 className="h-5 w-5" style={{ color: accentA }} />
        </div>
        <div>
          <h1 className="font-mono font-bold text-lg tracking-wider" style={{ color: text0 }}>AI CHARACTER ASSIST</h1>
          <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: muted }}>Generate backstories, names & builds</p>
        </div>
      </div>

      {/* Input */}
      <div className="rounded-lg p-4 mb-4" style={panelStyle}>
        <p className="text-xs font-mono mb-3" style={{ color: text1 }}>Enter keywords that describe your character concept:</p>
        <Input
          value={keywords}
          onChange={e => setKeywords(e.target.value)}
          placeholder="e.g. scientist, tragic past, urban vigilante"
          className="mb-3"
          style={{ background: panel1, color: text0, borderColor: accentA + '30' }}
          onKeyDown={e => e.key === 'Enter' && handleGenerate()}
        />
        <div className="flex flex-wrap gap-2">
          {KEYWORD_SUGGESTIONS.map(kw => (
            <button
              key={kw}
              onClick={() => toggleKeyword(kw)}
              className="px-2.5 py-1 rounded text-[11px] font-mono uppercase tracking-wide transition-all"
              style={{
                background: selectedKeywords.includes(kw) ? accentA + '25' : panel1,
                color: selectedKeywords.includes(kw) ? accentA : muted,
                border: `1px solid ${selectedKeywords.includes(kw) ? accentA + '60' : muted + '30'}`,
              }}
            >
              {kw}
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={loading || (!keywords.trim() && !selectedKeywords.length)}
        className="w-full mb-6 gap-2"
        style={{ background: accentA, color: '#000' }}
      >
        {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {loading ? 'GENERATING...' : 'GENERATE CHARACTER CONCEPT'}
      </Button>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

            {/* Names */}
            <div className="rounded-lg p-4" style={panelStyle}>
              <div className="text-[10px] font-mono uppercase tracking-widest mb-3" style={{ color: accentA }}>Suggested Names</div>
              <div className="flex flex-wrap gap-2">
                {result.names?.map(name => (
                  <button
                    key={name}
                    onClick={() => copyToClipboard(name)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-mono font-bold transition-all hover:opacity-80"
                    style={{ background: accentA + '15', color: text0, border: `1px solid ${accentA}30` }}
                  >
                    {name}
                    <Copy className="h-3 w-3" style={{ color: muted }} />
                  </button>
                ))}
              </div>
              {result.real_name && (
                <p className="text-xs mt-2" style={{ color: text1 }}>Secret Identity: <span style={{ color: text0 }}>{result.real_name}</span></p>
              )}
            </div>

            {/* Physical Description */}
            <div className="rounded-lg p-4" style={panelStyle}>
              <div className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: accentA }}>Physical Description</div>
              <p className="text-sm leading-relaxed" style={{ color: text1 }}>{result.physical_description}</p>
            </div>

            {/* Backstory */}
            <div className="rounded-lg p-4" style={panelStyle}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: accentA }}>Backstory</div>
                <button onClick={() => copyToClipboard(result.backstory)} style={{ color: muted }}>
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: text1 }}>{result.backstory}</p>
              {result.personality?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {result.personality.map(trait => (
                    <span key={trait} className="px-2 py-0.5 rounded text-[10px] font-mono uppercase" style={{ background: accentA + '10', color: accentA }}>{trait}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Recommended Build */}
            <div className="rounded-lg p-4" style={panelStyle}>
              <div className="text-[10px] font-mono uppercase tracking-widest mb-3" style={{ color: accentA }}>Recommended Build</div>
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                {[
                  ['Classification', result.recommended_classification],
                  ['Power Style', result.recommended_power_style],
                  ['Origin', result.recommended_origin],
                  ['Alignment', result.recommended_alignment],
                ].map(([label, val]) => (
                  <div key={label} className="rounded p-2" style={{ background: panel1 }}>
                    <div className="font-mono uppercase tracking-wide" style={{ color: muted }}>{label}</div>
                    <div className="font-semibold mt-0.5 capitalize" style={{ color: text0 }}>{val?.replace(/_/g, ' ')}</div>
                  </div>
                ))}
              </div>
              {result.stat_reasoning && (
                <p className="text-xs" style={{ color: text1 }}><span style={{ color: accentA }}>Stats: </span>{result.stat_reasoning}</p>
              )}
            </div>

            <Link to={createPageUrl('CreateCharacter')} className="block">
              <Button className="w-full gap-2" style={{ background: accentA, color: '#000' }}>
                <User className="h-4 w-4" />
                CREATE THIS CHARACTER
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}