import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Zap, Users, BookOpen, Swords, Shield, ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: Users,
      title: 'Create Characters',
      description: 'Build unique vigilantes with custom powers and backgrounds',
      link: 'CreateCharacter',
      color: 'from-violet-500 to-purple-600'
    },
    {
      icon: BookOpen,
      title: 'Manage Campaigns',
      description: 'Track quests, story arcs, and world events',
      link: 'Campaigns',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: Swords,
      title: 'Run Combat',
      description: 'Tactical encounters with initiative and positioning',
      link: 'Campaigns',
      color: 'from-red-500 to-orange-600'
    },
    {
      icon: Shield,
      title: 'DM Tools',
      description: 'Game master utilities and controls',
      link: 'DMTools',
      color: 'from-amber-500 to-yellow-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 relative overflow-hidden">
      {/* Animated Background Effects */}
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

      <div className="relative max-w-7xl mx-auto px-4 py-20">
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
            className="flex gap-4 justify-center"
          >
            <Link to={createPageUrl('CreateCharacter')}>
              <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 gap-2 px-8 py-6 text-lg">
                <Sparkles className="h-5 w-5" />
                Create Character
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to={createPageUrl('Campaigns')}>
              <Button variant="outline" className="border-violet-500 text-violet-400 hover:bg-violet-500/20 px-8 py-6 text-lg">
                View Campaigns
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <Link to={createPageUrl(feature.link)}>
                <Card className="bg-slate-800/50 border-slate-700 hover:border-violet-500/50 transition-all h-full group cursor-pointer">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-slate-400">{feature.description}</p>
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
    </div>
  );
}