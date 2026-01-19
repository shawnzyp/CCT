import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles, Radio, Loader2 } from "lucide-react";
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from "framer-motion";
import useSoundEffects from '@/components/sounds/useSoundEffects';

export default function AegisSuggestions({ type, context, onSelect, label = "Suggestions" }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { play } = useSoundEffects();
  
  const generatePrompt = () => {
    switch (type) {
      case 'name':
        return `Generate 3 compelling vigilante/superhero names for a character with these traits:
Classification: ${context.classification || 'unknown'}
Power Styles: ${context.power_styles?.join(', ') || 'unknown'}
Origin: ${context.origin_story || 'unknown'}

Format: Return only the names, one per line.`;
      
      case 'backstory':
        return `Generate a compelling origin story for a vigilante hero with:
Name: ${context.name}
Classification: ${context.classification}
Power Style: ${context.power_styles?.join(', ')}
Origin: ${context.origin_story}

Format: 2-3 paragraphs describing their origin event and how they became who they are.`;
      
      case 'power':
        return `Generate a tactical power/ability for a vigilante with:
Power Style: ${context.powerStyle}
Cost: ${context.spCost} SP
Range: ${context.range}

Format: Return only the power name, effect description, and tactical use case.`;
      
      case 'tactical':
        return `Analyze this combat situation and provide 2-3 tactical options:
${JSON.stringify(context)}

Format: Each option should include objective, immediate action, and risk assessment.`;
      
      default:
        return `Provide suggestions for: ${label}`;
    }
  };
  
  const generateSuggestions = async () => {
    setLoading(true);
    setShowSuggestions(true);
    play('navigate', 0.2);
    
    try {
      const prompt = generatePrompt();
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are A.E.G.I.S. (Adaptive Executive Governance & Intelligence System), a tactical support AI for O.M.N.I.

Your communication style:
- Short declarative sentences
- Infrastructure nouns
- Probability framing
- No sentiment unless instrumentally relevant
- Label uncertainty plainly

${prompt}`,
        add_context_from_internet: false
      });
      
      if (type === 'name') {
        const names = response.split('\n').filter(n => n.trim());
        setSuggestions(names.slice(0, 3));
      } else if (type === 'tactical') {
        setSuggestions([response]);
      } else {
        setSuggestions([response]);
      }
    } catch (error) {
      console.error('A.E.G.I.S. error:', error);
      setSuggestions(['System error. Telemetry unavailable.']);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-2">
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={generateSuggestions}
          disabled={loading}
          className="w-full border-violet-500/50 text-violet-400 hover:bg-violet-500/10 font-mono"
        >
          {loading ? (
            <>
              <Loader2 className="h-3 w-3 mr-2 animate-spin" />
              A.E.G.I.S. Processing...
            </>
          ) : (
            <>
              <Radio className="h-3 w-3 mr-2" />
              Request A.E.G.I.S. {label}
            </>
          )}
        </Button>
      </motion.div>
      
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            <div className="flex items-center gap-2 text-xs text-violet-400 font-mono uppercase tracking-wider">
              <Radio className="h-3 w-3" />
              A.E.G.I.S. Recommendations
            </div>
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onSelect(suggestion);
                    setShowSuggestions(false);
                    play('click', 0.2);
                  }}
                  className="w-full justify-start text-left h-auto py-2 px-3 hover:bg-violet-500/10 border border-slate-700 hover:border-violet-500/50"
                >
                  <div className="flex flex-col gap-1 w-full">
                    <span className="text-sm text-slate-300">{suggestion}</span>
                  </div>
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}