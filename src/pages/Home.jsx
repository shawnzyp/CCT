import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Zap, Users, BookOpen, Swords, Shield, ArrowRight, Sparkles, User, FileText, Dices, Heart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CharacterSelector from '@/components/character/CharacterSelector';

export default function Home() {
  const [showCharacterSelector, setShowCharacterSelector] = useState(false);

  const { data: characters = [] } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.Character.list('-created_date')
  });

  const handleCharacterSelect = (character) => {
    localStorage.setItem('currentCharacter', JSON.stringify(character));
    setShowCharacterSelector(false);
    window.dispatchEvent(new CustomEvent('characterChanged', { detail: character }));
  };
  const features = [
    {
      icon: Users,
      title: 'My Characters',
      description: 'View and manage your hero roster',
      link: 'Characters',
      color: 'from-violet-500 to-purple-600'
    },
    {
      icon: BookOpen,
      title: 'Campaigns',
      description: 'Join or manage active campaigns',
      link: 'Campaigns',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: Sparkles,
      title: 'Create Character',
      description: 'Build a new vigilante hero',
      link: 'CreateCharacter',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: Swords,
      title: 'Combat Tracker',
      description: 'Your character combat stats',
      link: characters.length > 0 ? `CharacterSheet?id=${characters[0].id}` : 'Characters',
      color: 'from-red-500 to-orange-600'
    },
    {
      icon: Dices,
      title: 'Dice Roller',
      description: 'Roll d20s and skill checks',
      link: characters.length > 0 ? `CharacterSheet?id=${characters[0].id}` : 'Characters',
      color: 'from-emerald-500 to-green-600'
    },
    {
      icon: Shield,
      title: 'DM Tools',
      description: 'Game master utilities',
      link: 'DMTools',
      color: 'from-amber-500 to-yellow-600'
    },
    {
      icon: FileText,
      title: 'Rules',
      description: 'Game system reference',
      link: 'Rules',
      color: 'from-slate-500 to-slate-600'
    },
    {
      icon: Heart,
      title: 'Help',
      description: 'Guides and support',
      link: 'Help',
      color: 'from-rose-500 to-pink-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 -left-20 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 1 }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 pb-24">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"
          >
            <Zap className="h-12 w-12 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold text-white mb-4"
          >
            Catalyst Core
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto mb-8"
          >
            The ultimate character tracker for tabletop RPG vigilante heroes. 
            Create characters, manage campaigns, and run epic battles.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col gap-3 items-center w-full max-w-md mx-auto"
          >
            <Button 
              onClick={() => setShowCharacterSelector(true)}
              variant="outline"
              className="w-full border-violet-500 text-violet-400 hover:bg-violet-500/20 px-6 py-5 text-base"
            >
              <User className="h-4 w-4" />
              Load Character
            </Button>
            <Link to={createPageUrl('CreateCharacter')} className="w-full">
              <Button className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 gap-2 px-6 py-5 text-base">
                <Sparkles className="h-4 w-4" />
                Create Character
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to={createPageUrl('Campaigns')} className="w-full">
              <Button variant="outline" className="w-full border-violet-500 text-violet-400 hover:bg-violet-500/20 px-6 py-5 text-base">
                View Campaigns
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <Link to={createPageUrl(feature.link)}>
                <Card className="bg-slate-800/50 border-slate-700 hover:border-violet-500/50 transition-all h-full group cursor-pointer">
                  <CardContent className="p-4">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1">{feature.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">{feature.description}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-16 grid grid-cols-3 gap-8 max-w-3xl mx-auto"
        >
          {[
            { label: 'Power Styles', value: '7+' },
            { label: 'Origins', value: '10' },
            { label: 'Alignments', value: '9' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.4 + index * 0.1, type: 'spring', stiffness: 200 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-violet-400 mb-1">{stat.value}</div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {showCharacterSelector && (
        <CharacterSelector
          characters={characters}
          onSelect={handleCharacterSelect}
          onClose={() => setShowCharacterSelector(false)}
        />
      )}
    </div>
  );
}