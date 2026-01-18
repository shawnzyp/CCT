import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Swords, Shield, Zap, Heart, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const getActionIcon = (action) => {
  if (action.includes('attack')) return Swords;
  if (action.includes('power') || action.includes('ability')) return Zap;
  if (action.includes('defend') || action.includes('block')) return Shield;
  if (action.includes('heal') || action.includes('restore')) return Heart;
  return AlertCircle;
};

const getActionColor = (action, result) => {
  if (result?.includes('miss') || result?.includes('fail')) return 'text-slate-500';
  if (result?.includes('critical') || result?.includes('crit')) return 'text-orange-400';
  if (action.includes('attack')) return 'text-red-400';
  if (action.includes('power')) return 'text-violet-400';
  if (action.includes('heal')) return 'text-green-400';
  return 'text-slate-300';
};

export default function CombatLog({ logs = [] }) {
  const scrollRef = useRef(null);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs.length]);
  
  return (
    <Card className="bg-slate-800/50 border-slate-700 corner-frame">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2 font-mono uppercase tracking-wider text-sm">
          <BookOpen className="h-4 w-4 text-violet-400" />
          Combat Log
          {logs.length > 0 && (
            <Badge variant="outline" className="ml-auto text-xs border-violet-500/50 text-violet-400">
              {logs.length} Events
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64" ref={scrollRef}>
          <div className="space-y-2 pr-4">
            <AnimatePresence initial={false}>
              {logs.length > 0 ? (
                logs.map((log, index) => {
                  const Icon = getActionIcon(log.action);
                  const color = getActionColor(log.action, log.result);
                  
                  return (
                    <motion.div
                      key={`${log.round}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        "text-sm border-l-2 pl-3 py-2 rounded-r bg-slate-900/50",
                        log.result?.includes('critical') ? "border-orange-500" :
                        log.result?.includes('miss') ? "border-slate-600" :
                        "border-violet-500/50"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          variant="outline" 
                          className="text-xs border-slate-600 text-slate-400 font-mono"
                        >
                          R{log.round}
                        </Badge>
                        <Icon className={cn("h-3 w-3", color)} />
                        <span className="text-violet-400 font-medium font-mono">{log.actor}</span>
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed">{log.action}</p>
                      {log.result && (
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={cn(
                            "text-xs mt-1 font-mono",
                            log.result.includes('critical') ? "text-orange-400 font-bold" :
                            log.result.includes('miss') ? "text-slate-500" :
                            "text-slate-400"
                          )}
                        >
                          → {log.result}
                        </motion.p>
                      )}
                      
                      {/* Critical hit indicator */}
                      {log.result?.includes('critical') && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute right-2 top-2"
                        >
                          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 text-slate-500"
                >
                  <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-mono">No combat actions yet</p>
                  <p className="text-xs mt-1">Actions will appear here...</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}