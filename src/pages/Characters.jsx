import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import CharacterCard from "@/components/character/CharacterCard";
import { motion } from "framer-motion";

export default function Characters() {
  const [search, setSearch] = useState('');
  
  const { data: characters = [], isLoading } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.Character.list('-created_date')
  });
  
  const filteredCharacters = characters.filter(char => 
    char.name?.toLowerCase().includes(search.toLowerCase()) ||
    char.real_name?.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950">
      {/* Ambient glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
              <div className="p-2 rounded-xl bg-violet-500/20">
                <Users className="h-7 w-7 text-violet-400" />
              </div>
              Vigilantes
            </h1>
            <p className="text-slate-400 mt-1">Your roster of heroes and anti-heroes</p>
          </div>
          
          <Link to={createPageUrl('CreateCharacter')}>
            <Button className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
              <Plus className="h-4 w-4" />
              New Vigilante
            </Button>
          </Link>
        </div>
        
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search vigilantes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>
        
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Zap className="h-8 w-8 text-violet-400" />
            </motion.div>
          </div>
        )}
        
        {/* Empty State */}
        {!isLoading && characters.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
              <Users className="h-10 w-10 text-slate-600" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No Vigilantes Yet</h2>
            <p className="text-slate-400 mb-6">Create your first character to begin your adventure</p>
            <Link to={createPageUrl('CreateCharacter')}>
              <Button className="bg-violet-600 hover:bg-violet-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Vigilante
              </Button>
            </Link>
          </motion.div>
        )}
        
        {/* Character Grid */}
        {!isLoading && filteredCharacters.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCharacters.map((character, index) => (
              <motion.div
                key={character.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={createPageUrl(`CharacterSheet?id=${character.id}`)}>
                  <CharacterCard character={character} />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
        
        {/* No Results */}
        {!isLoading && characters.length > 0 && filteredCharacters.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400">No vigilantes match your search</p>
          </div>
        )}
      </div>
    </div>
  );
}