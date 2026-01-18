import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import { format } from "date-fns";

export default function CombatLog({ logs = [] }) {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-violet-400" />
          Combat Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <div key={index} className="text-sm border-l-2 border-violet-500/50 pl-3 py-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      Round {log.round}
                    </Badge>
                    <span className="text-violet-400 font-medium">{log.actor}</span>
                  </div>
                  <p className="text-slate-300">{log.action}</p>
                  {log.result && (
                    <p className="text-slate-500 text-xs mt-0.5">{log.result}</p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                No combat actions yet
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}