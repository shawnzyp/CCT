import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Radio, Search, MessageSquare, User, Calendar } from "lucide-react";
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';

export default function AegisLogs() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: queries = [], isLoading } = useQuery({
    queryKey: ['aegis-queries'],
    queryFn: () => base44.entities.AegisQuery.list('-created_date', 100),
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const filteredQueries = queries.filter(q => 
    q.query?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.character_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Radio className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">A.E.G.I.S. Query Logs</h1>
            <p className="text-slate-400">All player queries to A.E.G.I.S. system</p>
          </div>
        </div>

        {/* Search */}
        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search queries, users, or characters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-violet-400" />
                Total Queries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{queries.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Radio className="h-4 w-4 text-green-400" />
                Game-Related
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {queries.filter(q => q.is_game_related).length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <User className="h-4 w-4 text-blue-400" />
                Unique Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {new Set(queries.map(q => q.user_email)).size}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Queries List */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Query History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-slate-400">Loading queries...</div>
            ) : filteredQueries.length === 0 ? (
              <div className="text-center py-8 text-slate-400">No queries found</div>
            ) : (
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {filteredQueries.map((query) => (
                    <div
                      key={query.id}
                      className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 hover:border-violet-500/50 transition-colors"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-300">{query.user_email}</span>
                          {query.character_name && query.character_name !== 'Unknown' && (
                            <>
                              <span className="text-slate-600">•</span>
                              <span className="text-sm text-violet-400">{query.character_name}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={query.is_game_related ? "default" : "outline"} className="text-xs">
                            {query.is_game_related ? 'Game' : 'Non-Game'}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(query.created_date), 'MMM d, h:mm a')}
                          </div>
                        </div>
                      </div>

                      {/* Query */}
                      <div className="mb-3">
                        <div className="text-xs text-slate-500 mb-1">Query:</div>
                        <div className="bg-slate-800 rounded-lg p-3 text-white text-sm">
                          {query.query}
                        </div>
                      </div>

                      {/* Response */}
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Response:</div>
                        <div className="bg-slate-800 rounded-lg p-3">
                          <ReactMarkdown
                            className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                            components={{
                              p: ({ children }) => <p className="mb-2 last:mb-0 text-sm text-slate-300">{children}</p>,
                              ul: ({ children }) => <ul className="mb-2 ml-4 list-disc text-sm text-slate-300">{children}</ul>,
                              ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal text-sm text-slate-300">{children}</ol>,
                              li: ({ children }) => <li className="mb-1">{children}</li>,
                              strong: ({ children }) => <strong className="text-violet-400">{children}</strong>,
                              code: ({ inline, children }) => inline ? (
                                <code className="bg-slate-900 px-1 py-0.5 rounded text-violet-300 text-xs">{children}</code>
                              ) : (
                                <code className="block bg-slate-900 p-2 rounded my-2 text-xs">{children}</code>
                              ),
                            }}
                          >
                            {query.response}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}