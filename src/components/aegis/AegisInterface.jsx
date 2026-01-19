import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Radio, AlertTriangle, Target, Clock, FileText, Shield, Zap, Loader2, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { base44 } from '@/api/base44Client';
import useSoundEffects from '@/components/sounds/useSoundEffects';
import { useAegis } from './AegisContext';

const INTERVENTION_TIERS = [
  { level: 0, name: 'Observe', color: 'slate', description: 'No direct action. Collect telemetry.' },
  { level: 1, name: 'Advise', color: 'blue', description: 'Issue guidance to field team.' },
  { level: 2, name: 'Assist', color: 'green', description: 'Limited support assets authorized.' },
  { level: 3, name: 'Contain', color: 'yellow', description: 'Cordons and emergency measures.' },
  { level: 4, name: 'Suppress', color: 'orange', description: 'Heavy response assets authorized.' },
  { level: 5, name: 'Black', color: 'red', description: 'Off-ledger operations. Severe risk.' }
];

export default function AegisInterface({ campaignId = null, combatState = null }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [incidentInput, setIncidentInput] = useState('');
  const { missionState, activeClocks, addClock, tickClock } = useAegis();
  const { play } = useSoundEffects();
  
  const analyzeIncident = async () => {
    setAnalyzing(true);
    play('navigate', 0.2);
    
    try {
      const operationalFrame = {
        incident: incidentInput,
        combatState,
        campaignId,
        timestamp: new Date().toISOString()
      };
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are A.E.G.I.S. (Adaptive Executive Governance & Intelligence System).

OPERATIONAL FRAME:
${JSON.stringify(operationalFrame, null, 2)}

Analyze this incident and provide:

1. THREAT ASSESSMENT
- Threat tier (0-5): Street, Specialist, Elite, Boss, Mythic, Existential
- Primary vectors: kinetic, energy, psychic, memetic, environmental
- Civilian risk: count band (0, 1-10, 11-50, 51-200, 200+)
- Infrastructure at risk
- Time pressure (minutes to failure)

2. INTERVENTION TIER RECOMMENDATION
Recommend tier 0-5 with justification.

3. TACTICAL OPTIONS (2-3)
For each option provide:
- Objective
- Immediate next action (1-3 steps)
- Risk tradeoff
- SP economy consideration
- Success criteria

4. CONSEQUENCE CLOCKS
Identify 2-3 countdown clocks:
- Clock name
- Segments (4-8)
- Trigger condition
- Consequence

5. EVIDENCE
- Key assumptions
- Missing telemetry
- Confidence level (low/medium/high)

FORMAT AS JSON with keys: threat_assessment, intervention_tier, tactical_options, clocks, evidence, player_brief, gm_notes`,
        response_json_schema: {
          type: "object",
          properties: {
            threat_assessment: {
              type: "object",
              properties: {
                tier: { type: "number" },
                tier_name: { type: "string" },
                vectors: { type: "array", items: { type: "string" } },
                civilian_risk: { type: "string" },
                time_pressure: { type: "string" }
              }
            },
            intervention_tier: {
              type: "object",
              properties: {
                recommended: { type: "number" },
                justification: { type: "string" }
              }
            },
            tactical_options: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  objective: { type: "string" },
                  actions: { type: "array", items: { type: "string" } },
                  risk: { type: "string" },
                  sp_consideration: { type: "string" }
                }
              }
            },
            clocks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  segments: { type: "number" },
                  trigger: { type: "string" },
                  consequence: { type: "string" }
                }
              }
            },
            evidence: {
              type: "object",
              properties: {
                assumptions: { type: "array", items: { type: "string" } },
                missing: { type: "array", items: { type: "string" } },
                confidence: { type: "string" }
              }
            },
            player_brief: { type: "string" },
            gm_notes: { type: "string" }
          }
        }
      });
      
      setAnalysis(response);
      
      // Auto-add clocks
      response.clocks?.forEach(clock => {
        addClock({
          id: `clock_${Date.now()}_${Math.random()}`,
          name: clock.name,
          current: 0,
          max: clock.segments,
          trigger: clock.trigger,
          consequence: clock.consequence
        });
      });
      
    } catch (error) {
      console.error('A.E.G.I.S. analysis failed:', error);
      setAnalysis({
        threat_assessment: { tier: 0, tier_name: 'Unknown' },
        player_brief: 'System error. Telemetry unavailable. Recommend manual assessment.',
        evidence: { confidence: 'low', assumptions: [], missing: ['All telemetry'] }
      });
    } finally {
      setAnalyzing(false);
    }
  };
  
  const getTierColor = (tier) => {
    const colors = ['slate', 'blue', 'green', 'yellow', 'orange', 'red'];
    return colors[tier] || 'slate';
  };
  
  return (
    <div className="space-y-4">
      <Tabs defaultValue="brief" className="w-full">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="brief" className="data-[state=active]:bg-violet-600">
            <FileText className="h-3 w-3 mr-2" />
            Brief
          </TabsTrigger>
          <TabsTrigger value="tactical" className="data-[state=active]:bg-violet-600">
            <Target className="h-3 w-3 mr-2" />
            Tactical
          </TabsTrigger>
          <TabsTrigger value="clocks" className="data-[state=active]:bg-violet-600">
            <Clock className="h-3 w-3 mr-2" />
            Clocks
          </TabsTrigger>
          <TabsTrigger value="ledger" className="data-[state=active]:bg-violet-600">
            <Shield className="h-3 w-3 mr-2" />
            Ledger
          </TabsTrigger>
        </TabsList>
        
        {/* BRIEF TAB */}
        <TabsContent value="brief" className="space-y-3">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-sm font-mono uppercase tracking-wider text-violet-400 flex items-center gap-2">
                <Radio className="h-4 w-4" />
                Incident Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Describe incident, threat, or tactical situation..."
                value={incidentInput}
                onChange={(e) => setIncidentInput(e.target.value)}
                className="bg-slate-900 border-slate-700 text-white font-mono text-sm h-24"
              />
              <Button
                onClick={analyzeIncident}
                disabled={analyzing || !incidentInput.trim()}
                className="w-full bg-violet-600 hover:bg-violet-700"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Request Analysis
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
          
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {/* Threat Assessment */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-sm font-mono uppercase tracking-wider text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-400" />
                      Threat Assessment
                    </span>
                    <Badge className={cn(
                      "font-mono",
                      `bg-${getTierColor(analysis.threat_assessment?.tier)}-600`
                    )}>
                      Tier {analysis.threat_assessment?.tier} - {analysis.threat_assessment?.tier_name}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {analysis.threat_assessment?.vectors && (
                    <div>
                      <span className="text-slate-400">Vectors:</span>
                      <div className="flex gap-1 flex-wrap mt-1">
                        {analysis.threat_assessment.vectors.map((v, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {v}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {analysis.threat_assessment?.civilian_risk && (
                    <div>
                      <span className="text-slate-400">Civilian Risk:</span>
                      <span className="text-white ml-2">{analysis.threat_assessment.civilian_risk}</span>
                    </div>
                  )}
                  {analysis.threat_assessment?.time_pressure && (
                    <div>
                      <span className="text-slate-400">Time Pressure:</span>
                      <span className="text-orange-400 ml-2 font-mono">{analysis.threat_assessment.time_pressure}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Player Brief */}
              <Card className="bg-gradient-to-br from-violet-900/20 to-purple-900/20 border-violet-500/50">
                <CardHeader>
                  <CardTitle className="text-sm font-mono uppercase tracking-wider text-violet-400">
                    Operational Brief
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {analysis.player_brief}
                  </p>
                </CardContent>
              </Card>
              
              {/* Intervention Tier */}
              {analysis.intervention_tier && (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-sm font-mono uppercase tracking-wider text-white">
                      Recommended Response: Tier {analysis.intervention_tier.recommended}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 text-sm">{analysis.intervention_tier.justification}</p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </TabsContent>
        
        {/* TACTICAL TAB */}
        <TabsContent value="tactical" className="space-y-3">
          {analysis?.tactical_options?.length > 0 ? (
            <div className="space-y-2">
              {analysis.tactical_options.map((option, i) => (
                <Card key={i} className="bg-slate-800/50 border-slate-700 hover:border-violet-500/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-sm font-mono text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-xs">
                        {i + 1}
                      </span>
                      {option.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>
                      <span className="text-violet-400 font-mono">OBJECTIVE:</span>
                      <p className="text-slate-300 mt-1">{option.objective}</p>
                    </div>
                    <div>
                      <span className="text-violet-400 font-mono">ACTIONS:</span>
                      <ol className="text-slate-300 mt-1 ml-4 list-decimal">
                        {option.actions?.map((action, j) => (
                          <li key={j}>{action}</li>
                        ))}
                      </ol>
                    </div>
                    <div>
                      <span className="text-orange-400 font-mono">RISK:</span>
                      <p className="text-slate-300 mt-1">{option.risk}</p>
                    </div>
                    {option.sp_consideration && (
                      <div>
                        <span className="text-green-400 font-mono">SP ECONOMY:</span>
                        <p className="text-slate-300 mt-1">{option.sp_consideration}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="py-8 text-center">
                <Target className="h-12 w-12 mx-auto text-slate-600 mb-2" />
                <p className="text-slate-500 text-sm">Request analysis to generate tactical options</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* CLOCKS TAB */}
        <TabsContent value="clocks" className="space-y-3">
          {activeClocks.length > 0 ? (
            <div className="space-y-2">
              {activeClocks.map((clock) => (
                <Card key={clock.id} className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-sm font-mono text-white flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-400" />
                        {clock.name}
                      </span>
                      <span className="text-xs text-slate-400">
                        {clock.current}/{clock.max}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Clock segments */}
                    <div className="flex gap-1">
                      {Array.from({ length: clock.max }).map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "flex-1 h-3 rounded",
                            i < clock.current
                              ? "bg-orange-500"
                              : "bg-slate-700"
                          )}
                        />
                      ))}
                    </div>
                    
                    <div className="text-xs space-y-1">
                      <div>
                        <span className="text-slate-400">Trigger:</span>
                        <p className="text-slate-300">{clock.trigger}</p>
                      </div>
                      <div>
                        <span className="text-orange-400">Consequence:</span>
                        <p className="text-slate-300">{clock.consequence}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          tickClock(clock.id, 1);
                          play('error', 0.2);
                        }}
                        disabled={clock.current >= clock.max}
                        className="flex-1"
                      >
                        <ChevronRight className="h-3 w-3 mr-1" />
                        Tick
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          tickClock(clock.id, -1);
                          play('click', 0.1);
                        }}
                        disabled={clock.current <= 0}
                        className="flex-1"
                      >
                        Reset
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="py-8 text-center">
                <Clock className="h-12 w-12 mx-auto text-slate-600 mb-2" />
                <p className="text-slate-500 text-sm">No active countdown clocks</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* LEDGER TAB */}
        <TabsContent value="ledger" className="space-y-3">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-sm font-mono uppercase tracking-wider text-violet-400">
                Evidence & Provenance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {analysis?.evidence ? (
                <>
                  <div>
                    <span className="text-slate-400 font-mono">CONFIDENCE:</span>
                    <Badge className={cn(
                      "ml-2",
                      analysis.evidence.confidence === 'high' ? 'bg-green-600' :
                      analysis.evidence.confidence === 'medium' ? 'bg-yellow-600' :
                      'bg-red-600'
                    )}>
                      {analysis.evidence.confidence?.toUpperCase()}
                    </Badge>
                  </div>
                  
                  {analysis.evidence.assumptions?.length > 0 && (
                    <div>
                      <span className="text-slate-400 font-mono">ASSUMPTIONS:</span>
                      <ul className="text-slate-300 mt-1 ml-4 list-disc">
                        {analysis.evidence.assumptions.map((a, i) => (
                          <li key={i}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {analysis.evidence.missing?.length > 0 && (
                    <div>
                      <span className="text-orange-400 font-mono">MISSING TELEMETRY:</span>
                      <ul className="text-slate-300 mt-1 ml-4 list-disc">
                        {analysis.evidence.missing.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {analysis.gm_notes && (
                    <div className="pt-3 border-t border-slate-700">
                      <span className="text-red-400 font-mono">GM NOTES (CLEARANCE REQUIRED):</span>
                      <p className="text-slate-400 mt-1 text-xs italic">{analysis.gm_notes}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-slate-500 text-center py-4">No analysis data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}