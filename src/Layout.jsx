import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { Users, Zap, BookOpen, Menu, X, User, RefreshCw, Book, HelpCircle, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CharacterSelector from '@/components/character/CharacterSelector';
import { motion } from 'framer-motion';
import useSoundEffects from '@/components/sounds/useSoundEffects';
import AegisAssistant from '@/components/aegis/AegisAssistant';
import { AegisProvider } from '@/components/aegis/AegisContext';

export default function Layout({ children }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentCharacter, setCurrentCharacter] = useState(null);
  const [showCharacterSelector, setShowCharacterSelector] = useState(false);
  const { play } = useSoundEffects();

  const { data: characters = [] } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.Character.list('-created_date')
  });

  useEffect(() => {
    const stored = localStorage.getItem('currentCharacter');
    if (stored) {
      try {
        setCurrentCharacter(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem('currentCharacter');
      }
    }
  }, []);

  const handleCharacterSelect = (character) => {
    setCurrentCharacter(character);
    localStorage.setItem('currentCharacter', JSON.stringify(character));
    setShowCharacterSelector(false);
    window.dispatchEvent(new CustomEvent('characterChanged', { detail: character }));
  };

  const handleCharacterSwitch = () => {
    setShowCharacterSelector(true);
  };
  
  const navItems = [
    { name: 'Home', path: 'Home', icon: Zap },
    { name: 'Campaigns', path: 'Campaigns', icon: BookOpen },
    { name: 'Characters', path: 'Characters', icon: Users },
    { name: 'Rules', path: 'Rules', icon: Book },
    { name: 'Help', path: 'Help', icon: HelpCircle },
  ];
  
  const isActive = (path) => {
    return location.pathname.includes(path);
  };
  
  return (
    <AegisProvider>
    <div className="min-h-screen bg-slate-950 overflow-x-hidden relative">
      {/* Scanline effect */}
      <div className="scanline" />
      
      {/* Military grid background */}
      <div className="fixed inset-0 military-grid opacity-30 pointer-events-none" />
      
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute top-1/4 left-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5]
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 1 }}
        />
      </div>
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-lg border-b border-violet-500/30 shadow-lg shadow-violet-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              to={createPageUrl('Home')} 
              className="flex items-center gap-3" 
              onClick={(e) => {
                e.preventDefault();
                play('navigate', 0.2);
                window.history.pushState({}, '', createPageUrl('Home'));
                window.location.reload();
              }}
            >
              <motion.div 
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center relative"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Zap className="h-5 w-5 text-white" />
                <div className="absolute inset-0 rounded-xl bg-violet-400/20 animate-pulse" />
              </motion.div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-lg tracking-wider">CATALYST CORE</span>
                  <Radio className="h-3 w-3 text-violet-400 animate-pulse" />
                </div>
                <span className="hidden md:block text-[9px] text-violet-400 uppercase tracking-[0.2em] font-mono">
                  TACTICAL SYSTEM v2.0
                </span>
              </div>
            </Link>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(item => (
                <Link key={item.path} to={createPageUrl(item.path)}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      onMouseEnter={() => play('hover', 0.1)}
                      onClick={() => play('click', 0.2)}
                      className={cn(
                        "gap-2 text-slate-400 hover:text-white hover:bg-violet-500/10 border border-transparent hover:border-violet-500/30 transition-all",
                        isActive(item.path) && "text-white bg-violet-500/20 border-violet-500/50"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Button>
                  </motion.div>
                </Link>
              ))}
            </nav>

            {/* Current Character */}
            <div className="hidden md:flex items-center gap-2">
              {currentCharacter ? (
                <Button
                  variant="ghost"
                  onClick={handleCharacterSwitch}
                  className="gap-2 text-slate-400 hover:text-white"
                >
                  <User className="h-4 w-4" />
                  {currentCharacter.name}
                  <RefreshCw className="h-3 w-3" />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowCharacterSelector(true)}
                  className="gap-2 border-violet-500 text-violet-400 hover:bg-violet-500/20"
                >
                  <User className="h-4 w-4" />
                  Select Character
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-slate-400"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-900">
            <nav className="px-4 py-3 space-y-1">
              {navItems.map(item => (
                <Link 
                  key={item.path} 
                  to={createPageUrl(item.path)}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-2 text-slate-400 hover:text-white hover:bg-slate-800",
                      isActive(item.path) && "text-white bg-slate-800"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
      
      {/* Main Content */}
      <main className="pt-16 relative z-10">
        <div className="overflow-y-auto scroll-smooth">
          {children}
        </div>
      </main>

      {/* Bottom tactical bar */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-violet-500/50 to-transparent pointer-events-none z-50" />

      {showCharacterSelector && (
        <CharacterSelector
          characters={characters}
          onSelect={handleCharacterSelect}
          onClose={() => setShowCharacterSelector(false)}
        />
      )}

      <AegisAssistant />
      </div>
      </AegisProvider>
      );
      }