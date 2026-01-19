import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Radio, Target, Zap, Shield, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from '@/api/base44Client';
import useSoundEffects from '@/components/sounds/useSoundEffects';

export default function AegisCombatAdvisor({ character, enemies, round, onRecommendation }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const { play } = useSoundEffects();
  
  const analyzeTurn = async () => {
    setAnalyzing(true);
    play('navigate', 0.2);
    
    try {
      const combatState = {
        character: {
          name: character.name,
          hp: `${character.current_hp}/${character.max_hp}`,
          sp: `${character.current_sp}/${character.max_sp}`,
          tc: character.toughness_class,
          powers: character.powers?.map(p => ({
            name: p.name,
            sp_cost: p.sp_cost,
            cooldown: p.current_cooldown || 0,
            effect: p.effect
          })),
          conditions: character.active_conditions?.map(c => c.name) || []
        },
        enemies: enemies?.map(e => ({
          name: e.name,
          hp: `${e.hp}/${e.max_hp}`,
          tc: e.tc,
          position: e.position
        })),
        round
      };
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are A.E.G.I.S. combat advisor. Analyze this tactical situation and provide advice.

COMBAT STATE:
${JSON.stringify(combatState, null, 2)}

Provide:
1. PRIORITY TARGET - which enemy to focus
2. RECOMMENDED ACTION - which power or tactic to use
3. SP ECONOMY - whether to spend SP this turn or conserve
4. POSITIONING - movement recommendations
5. REACTION ADVICE - what to save reaction for

Be concise. Use tactical language. Focus on consequence and pressure management.

FORMAT AS JSON:`,
        response_json_schema: {
          type: "object",
          properties: {
            priority_target: { type: "string" },
            recommended_action: { type: "string" },
            sp_economy: { type: "string" },
            positioning: { type: "string" },
            reaction_advice: { type: "string" },
            risk_assessment: { type: "string" }
          }
        }
      });
      
      setRecommendation(response);
      if (onRecommendation) {
        onRecommendation(response);
      }
    } catch (error) {
      console.error('A.E.G.I.S. combat analysis failed:', error);
      setRecommendation({
        recommended_action: 'System error. Manual tactical assessment required.',
        risk_assessment: 'Telemetry unavailable.'
      });
    } finally {
      setAnalyzing(false);
    }
  };
  
  // Auto-analyze at start of each round
  useEffect(() => {
    if (round > 0 && character && enemies?.length > 0) {
      analyzeTurn();
    }
  }, [round]);
  
  return (
    <Card className="bg-gradient-to-br from-violet-900/20 to-purple-900/20 border-violet-500/50">
      <CardHeader>
        <CardTitle className="text-sm font-mono uppercase tracking-wider text-violet-400 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Radio className="h-4 w-4" />
            A.E.G.I.S. Combat Advisor
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={analyzeTurn}
            disabled={analyzing}
            className="text-xs border-violet-500/50"
          >
            {analyzing ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              'Refresh'
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {analyzing ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-4"
            >
              <Loader2 className="h-8 w-8 mx-auto text-violet-400 animate-spin mb-2" />
              <p className="text-xs text-slate-400 font-mono">Analyzing tactical situation...</p>
            </motion.div>
          ) : recommendation ? (
            <motion.div
              key="recommendations"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3 text-sm"
            >
              {recommendation.priority_target && (
                <div className="flex items-start gap-2">
                  <Target className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-red-400 font-mono text-xs">PRIORITY TARGET:</span>
                    <p className="text-slate-300">{recommendation.priority_target}</p>
                  </div>
                </div>
              )}
              
              {recommendation.recommended_action && (
                <div className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-violet-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-violet-400 font-mono text-xs">RECOMMENDED ACTION:</span>
                    <p className="text-slate-300">{recommendation.recommended_action}</p>
                  </div>
                </div>
              )}
              
              {recommendation.sp_economy && (
                <div className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-green-400 font-mono text-xs">SP ECONOMY:</span>
                    <p className="text-slate-300">{recommendation.sp_economy}</p>
                  </div>
                </div>
              )}
              
              {recommendation.positioning && (
                <div className="flex items-start gap-2">
                  <Target className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-blue-400 font-mono text-xs">POSITIONING:</span>
                    <p className="text-slate-300">{recommendation.positioning}</p>
                  </div>
                </div>
              )}
              
              {recommendation.reaction_advice && (
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-orange-400 font-mono text-xs">REACTION:</span>
                    <p className="text-slate-300">{recommendation.reaction_advice}</p>
                  </div>
                </div>
              )}
              
              {recommendation.risk_assessment && (
                <div className="pt-2 border-t border-violet-500/30">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-yellow-400 font-mono text-xs">RISK:</span>
                      <p className="text-slate-300">{recommendation.risk_assessment}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-4"
            >
              <Radio className="h-8 w-8 mx-auto text-slate-600 mb-2" />
              <p className="text-xs text-slate-500">Click analyze to get tactical recommendations</p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}