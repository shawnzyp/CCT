import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, User, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function NPCGenerator() {
  const [generating, setGenerating] = useState(false);
  const [npc, setNpc] = useState(null);
  const [params, setParams] = useState({
    role: 'ally',
    archetype: 'custom',
    customPrompt: ''
  });

  const roles = {
    ally: 'Helpful ally or mentor',
    neutral: 'Neutral party or informant',
    villain: 'Antagonist or villain',
    rival: 'Rival or competitor',
    victim: 'Victim or person in need'
  };

  const archetypes = {
    custom: 'Custom (use prompt)',
    vigilante: 'Street-level vigilante',
    corporate: 'Corporate executive',
    scientist: 'Scientist or researcher',
    government: 'Government agent',
    criminal: 'Criminal or gang member',
    civilian: 'Ordinary civilian',
    powered: 'Powered individual'
  };

  const handleGenerate = async () => {
    setGenerating(true);
    
    const prompt = params.customPrompt || `Generate a ${archetypes[params.archetype]} NPC who is a ${roles[params.role]}.

Create a compelling NPC for a Catalyst Core superhero TTRPG with:
- Name and alias (if applicable)
- Role/occupation
- Brief personality description
- Appearance details
- Motivation and goals
- Relationship to heroes (${roles[params.role]})
- Notable abilities or resources
- A hook or secret`;

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            alias: { type: "string" },
            role: { type: "string" },
            personality: { type: "string" },
            appearance: { type: "string" },
            motivation: { type: "string" },
            relationship: { type: "string" },
            abilities: { type: "string" },
            hook: { type: "string" }
          }
        }
      });
      
      setNpc(result);
      toast.success('NPC generated!');
    } catch (error) {
      toast.error('Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    const text = `${npc.name}${npc.alias ? ` (${npc.alias})` : ''}
Role: ${npc.role}
Personality: ${npc.personality}
Appearance: ${npc.appearance}
Motivation: ${npc.motivation}
Relationship: ${npc.relationship}
Abilities: ${npc.abilities}
Hook: ${npc.hook}`;
    
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="space-y-4">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">AI NPC Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Role</label>
              <Select value={params.role} onValueChange={(val) => setParams({ ...params, role: val })}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roles).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Archetype</label>
              <Select value={params.archetype} onValueChange={(val) => setParams({ ...params, archetype: val })}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(archetypes).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">Custom Prompt (optional)</label>
            <Textarea
              value={params.customPrompt}
              onChange={(e) => setParams({ ...params, customPrompt: e.target.value })}
              placeholder="e.g., 'Create a mysterious information broker who operates in the shadows...'"
              className="bg-slate-900 border-slate-700 text-white min-h-[80px]"
            />
          </div>

          <Button 
            onClick={handleGenerate}
            disabled={generating}
            className="w-full bg-violet-600 hover:bg-violet-700 gap-2"
          >
            {generating ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Generating...</>
            ) : (
              <><Sparkles className="h-4 w-4" />Generate NPC</>
            )}
          </Button>
        </CardContent>
      </Card>

      {npc && (
        <Card className="bg-slate-800/50 border-violet-500">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-white text-2xl">
                  {npc.name}
                  {npc.alias && <span className="text-violet-400 ml-2">({npc.alias})</span>}
                </CardTitle>
                <Badge className="mt-2 bg-violet-500/20 text-violet-400">{npc.role}</Badge>
              </div>
              <Button size="sm" variant="outline" onClick={copyToClipboard} className="gap-2">
                <Copy className="h-3 w-3" />
                Copy
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-400 uppercase mb-1">Personality</h4>
              <p className="text-slate-300">{npc.personality}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-slate-400 uppercase mb-1">Appearance</h4>
              <p className="text-slate-300">{npc.appearance}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-slate-400 uppercase mb-1">Motivation</h4>
              <p className="text-slate-300">{npc.motivation}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-slate-400 uppercase mb-1">Relationship to Heroes</h4>
              <p className="text-slate-300">{npc.relationship}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-slate-400 uppercase mb-1">Abilities & Resources</h4>
              <p className="text-slate-300">{npc.abilities}</p>
            </div>
            
            <div className="bg-violet-500/10 rounded-lg p-3 border border-violet-500/30">
              <h4 className="text-sm font-semibold text-violet-400 uppercase mb-1">Hook / Secret</h4>
              <p className="text-slate-300">{npc.hook}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}