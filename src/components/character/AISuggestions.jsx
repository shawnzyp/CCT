import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AISuggestions({ type, context, onSelect, label }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      let prompt = '';
      
      if (type === 'name') {
        prompt = `Generate 5 creative superhero/vigilante names based on this context:
${context.classification ? `Classification: ${context.classification}` : ''}
${context.power_styles?.length ? `Powers: ${context.power_styles.join(', ')}` : ''}
${context.origin ? `Origin: ${context.origin}` : ''}

Make them unique, memorable, and fitting for a modern superhero setting.`;
      } else if (type === 'origin') {
        prompt = `Based on this vigilante character:
Name: ${context.name || 'Unknown'}
Classification: ${context.classification || 'Unknown'}
Power Styles: ${context.power_styles?.join(', ') || 'Unknown'}

Suggest 3 origin stories that would fit this character. Each should be 2-3 sentences explaining how they got their powers.`;
      } else if (type === 'backstory') {
        prompt = `Create a compelling backstory for this vigilante:
Name: ${context.name}
Real Name: ${context.real_name || 'Unknown'}
Classification: ${context.classification}
Powers: ${context.power_styles?.join(', ')}
Origin: ${context.origin}
Alignment: ${context.alignment || 'Unknown'}

Write a 3-4 sentence backstory that ties everything together.`;
      } else if (type === 'portrait') {
        prompt = `A superhero character portrait: ${context.name || 'vigilante'}, ${context.classification || 'enhanced human'} with ${context.power_styles?.join(' and ') || 'unique powers'}. Professional comic book art style, detailed costume, dynamic pose, vibrant colors, ${context.visual_customization?.costume_primary_color ? `primary color ${context.visual_customization.costume_primary_color}` : 'bold colors'}`;
      }

      if (type === 'portrait') {
        const result = await base44.integrations.Core.GenerateImage({ prompt });
        setSuggestions([{ type: 'image', url: result.url }]);
      } else {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: 'object',
            properties: {
              suggestions: {
                type: 'array',
                items: { type: 'string' }
              }
            }
          }
        });
        setSuggestions(result.suggestions || []);
      }
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        onClick={generateSuggestions}
        disabled={loading}
        className="w-full gap-2 border-violet-500/50 text-violet-400 hover:bg-violet-500/10"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            {suggestions.length > 0 ? 'Get More AI Suggestions' : `Get AI Suggestions for ${label}`}
          </>
        )}
      </Button>

      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {type === 'portrait' ? (
              <Card className="bg-slate-800/50 border-slate-700 p-4">
                <img 
                  src={suggestions[0].url} 
                  alt="AI Generated Portrait"
                  className="w-full rounded-lg mb-3"
                />
                <Button
                  onClick={() => onSelect(suggestions[0].url)}
                  className="w-full bg-violet-600 hover:bg-violet-700"
                >
                  Use This Portrait
                </Button>
              </Card>
            ) : (
              suggestions.map((suggestion, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card
                    className="bg-slate-800/50 border-slate-700 p-3 cursor-pointer hover:border-violet-500/50 transition-colors"
                    onClick={() => onSelect(suggestion)}
                  >
                    <p className="text-white text-sm">{suggestion}</p>
                  </Card>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}