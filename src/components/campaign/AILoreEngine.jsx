import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, BookOpen, Lightbulb, RefreshCw, Plus, ChevronDown, ChevronUp, Wand2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { useTheme } from '@/components/theme/useTheme';

export default function AILoreEngine({ campaign, characters = [], onUpdate }) {
  const { theme } = useTheme();
  const accentA = theme?.colors?.accentA || '#00E5FF';
  const panel0 = theme?.colors?.panel0 || '#1A1F26';
  const panel1 = theme?.colors?.panel1 || '#202833';
  const text0 = theme?.colors?.text0 || '#E6F1FF';
  const text1 = theme?.colors?.text1 || '#8EA0B5';
  const muted = theme?.colors?.muted || '#5F6E80';

  const [loading, setLoading] = useState(false);
  const [plotHooksLoading, setPlotHooksLoading] = useState(false);
  const [context, setContext] = useState('');
  const [generatedLore, setGeneratedLore] = useState(null);
  const [plotHooks, setPlotHooks] = useState([]);
  const [showPlotHooks, setShowPlotHooks] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [loreToSave, setLoreToSave] = useState(null);
  const [expandedHook, setExpandedHook] = useState(null);

  const existingLoreTitles = (campaign.world_lore || []).map(l => l.title).join(', ');
  const characterNames = characters.map(c => c.name).join(', ');
  const recentEvents = (campaign.session_log || []).slice(-3).map(e => e.content || e.message || '').join(' | ');

  const generateLore = async () => {
    setLoading(true);
    setGeneratedLore(null);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a master lore writer for a superhero TTRPG campaign called "${campaign.name}".

Campaign Description: ${campaign.description || 'No description.'}
Active Characters: ${characterNames || 'None'}
Recent Events: ${recentEvents || 'None recorded'}
Existing Lore Entries: ${existingLoreTitles || 'None yet'}
DM Context / Player Action: ${context || 'General world lore generation'}

Generate a rich, immersive lore entry that:
1. Feels organically connected to the campaign's existing narrative
2. References player characters or recent events if relevant
3. Opens new story possibilities without locking the DM in
4. Has a compelling title
5. Is 2-4 paragraphs, written in an in-world document/codex style

Respond in JSON with: { "title": string, "content": string, "tags": string[], "connected_to": string }
where connected_to is a brief note on what existing element this lore ties into.`,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          content: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
          connected_to: { type: "string" }
        }
      }
    });
    setGeneratedLore(result);
    setLoading(false);
  };

  const generatePlotHooks = async () => {
    setPlotHooksLoading(true);
    setPlotHooks([]);
    const loreSummary = (campaign.world_lore || []).map(l => `${l.title}: ${(l.content || '').slice(0, 100)}`).join('\n');
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a narrative director for a superhero TTRPG campaign called "${campaign.name}".

Campaign Description: ${campaign.description || 'No description.'}
Active Characters: ${characterNames || 'None'}
Recent Events: ${recentEvents || 'None recorded'}
World Lore: ${loreSummary || 'No lore yet'}
Story Arcs: ${(campaign.story_arcs || []).map(a => a.title).join(', ') || 'None'}
DM Context: ${context || 'Suggest plot hooks based on current campaign state'}

Generate exactly 4 compelling plot hooks for the DM. Each should:
- Stem naturally from existing lore, events, or character backstories
- Present a clear inciting action or mystery
- Have an estimated difficulty/scale
- Include a brief "if players bite..." consequence note

Respond in JSON with: { "hooks": [ { "title": string, "description": string, "difficulty": string, "consequence": string, "lore_connection": string } ] }`,
      response_json_schema: {
        type: "object",
        properties: {
          hooks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                difficulty: { type: "string" },
                consequence: { type: "string" },
                lore_connection: { type: "string" }
              }
            }
          }
        }
      }
    });
    setPlotHooks(result.hooks || []);
    setShowPlotHooks(true);
    setPlotHooksLoading(false);
  };

  const saveLoreEntry = (lore) => {
    const newLore = [...(campaign.world_lore || []), {
      id: Date.now().toString(),
      title: lore.title,
      content: lore.content,
      tags: lore.tags || [],
      connected_to: lore.connected_to || '',
      ai_generated: true,
      generated_at: new Date().toISOString()
    }];
    onUpdate({ world_lore: newLore });
    setGeneratedLore(null);
    setLoreToSave(null);
    setShowSaveDialog(false);
  };

  const difficultyColor = (d) => {
    const map = { low: '#00D1B2', medium: accentA, high: '#FFC857', deadly: '#FF3B3B' };
    return map[d?.toLowerCase()] || accentA;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-4 w-4" style={{ color: accentA }} />
        <span className="text-xs font-mono font-semibold uppercase tracking-widest" style={{ color: accentA }}>
          AI Lore Engine
        </span>
      </div>

      {/* Context Input */}
      <div className="rounded-lg border p-4 space-y-3" style={{ background: panel1, borderColor: accentA + '25' }}>
        <p className="text-xs font-mono" style={{ color: text1 }}>
          Describe a recent player action, event, or area you want lore generated for (optional):
        </p>
        <Textarea
          placeholder="e.g. 'The party discovered a hidden O.M.N.I. facility beneath Harrow District...'"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          rows={2}
          className="text-xs resize-none"
          style={{ background: panel0, borderColor: accentA + '20', color: text0 }}
        />
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={generateLore}
            disabled={loading}
            size="sm"
            className="gap-1.5 text-xs font-mono"
            style={{ background: accentA, color: '#000' }}
          >
            {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <BookOpen className="h-3.5 w-3.5" />}
            {loading ? 'Generating...' : 'Generate Lore Entry'}
          </Button>
          <Button
            onClick={generatePlotHooks}
            disabled={plotHooksLoading}
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs font-mono"
            style={{ borderColor: accentA + '40', color: accentA }}
          >
            {plotHooksLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Lightbulb className="h-3.5 w-3.5" />}
            {plotHooksLoading ? 'Thinking...' : 'Suggest Plot Hooks'}
          </Button>
        </div>
      </div>

      {/* Generated Lore Preview */}
      {generatedLore && (
        <div className="rounded-lg border p-4 space-y-3" style={{ background: panel0, borderColor: accentA + '40' }}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Wand2 className="h-3.5 w-3.5" style={{ color: accentA }} />
                <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: accentA }}>AI Generated</span>
              </div>
              <h4 className="text-sm font-mono font-bold" style={{ color: text0 }}>{generatedLore.title}</h4>
              {generatedLore.connected_to && (
                <p className="text-[10px] mt-0.5 font-mono" style={{ color: muted }}>↳ Ties into: {generatedLore.connected_to}</p>
              )}
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <Button
                size="sm"
                onClick={() => saveLoreEntry(generatedLore)}
                className="gap-1 text-xs h-7 px-2"
                style={{ background: accentA, color: '#000' }}
              >
                <Plus className="h-3 w-3" /> Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={generateLore}
                className="gap-1 text-xs h-7 px-2"
                style={{ borderColor: accentA + '40', color: text1 }}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="text-xs leading-relaxed prose-invert" style={{ color: text1 }}>
            <ReactMarkdown>{generatedLore.content}</ReactMarkdown>
          </div>
          {generatedLore.tags?.length > 0 && (
            <div className="flex gap-1 flex-wrap pt-1">
              {generatedLore.tags.map((tag, i) => (
                <span key={i} className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: accentA + '15', color: accentA }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Plot Hooks */}
      {showPlotHooks && plotHooks.length > 0 && (
        <div className="rounded-lg border p-4 space-y-3" style={{ background: panel0, borderColor: '#FFC85730' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-3.5 w-3.5" style={{ color: '#FFC857' }} />
              <span className="text-[10px] font-mono uppercase tracking-widest font-semibold" style={{ color: '#FFC857' }}>
                DM Plot Hooks ({plotHooks.length})
              </span>
            </div>
            <button onClick={() => setShowPlotHooks(false)} style={{ color: muted }}>
              <ChevronUp className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2">
            {plotHooks.map((hook, i) => (
              <div key={i} className="rounded border p-3 cursor-pointer transition-all"
                style={{ background: panel1, borderColor: difficultyColor(hook.difficulty) + '30' }}
                onClick={() => setExpandedHook(expandedHook === i ? null : i)}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-mono font-semibold truncate" style={{ color: text0 }}>{hook.title}</span>
                    <Badge className="text-[9px] px-1.5 py-0 h-4 flex-shrink-0 font-mono"
                      style={{ background: difficultyColor(hook.difficulty) + '20', color: difficultyColor(hook.difficulty), border: `1px solid ${difficultyColor(hook.difficulty)}40` }}>
                      {hook.difficulty}
                    </Badge>
                  </div>
                  {expandedHook === i ? <ChevronUp className="h-3.5 w-3.5 flex-shrink-0" style={{ color: muted }} /> : <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" style={{ color: muted }} />}
                </div>
                {expandedHook === i && (
                  <div className="mt-2 space-y-2">
                    <p className="text-xs leading-relaxed" style={{ color: text1 }}>{hook.description}</p>
                    {hook.lore_connection && (
                      <p className="text-[10px] font-mono" style={{ color: muted }}>↳ Lore tie-in: {hook.lore_connection}</p>
                    )}
                    {hook.consequence && (
                      <div className="rounded p-2 mt-1" style={{ background: panel0, borderLeft: `2px solid ${accentA}40` }}>
                        <p className="text-[10px] font-mono uppercase mb-0.5" style={{ color: accentA }}>If players bite...</p>
                        <p className="text-xs" style={{ color: text1 }}>{hook.consequence}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}