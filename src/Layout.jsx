import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { Users, Zap, BookOpen, Menu, X, User, RefreshCw, Book, HelpCircle, Radio, Settings, Package } from 'lucide-react';
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
import { TutorialProvider } from '@/components/tutorial/TutorialSystem';
import TutorialOverlay from '@/components/tutorial/TutorialOverlay';
import DMLoginFooter from '@/components/dm/DMLoginFooter';
import { useSettings } from '@/components/utils/useSettings';

export default function Layout({ children }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentCharacter, setCurrentCharacter] = useState(null);
  const [showCharacterSelector, setShowCharacterSelector] = useState(false);
  const [isDM, setIsDM] = useState(false);
  const { play } = useSoundEffects();
  const { settings } = useSettings();

  const { data: characters = [] } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.Character.list('-created_date'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
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
  
  const navCategories = [
    {
      name: 'Character',
      items: [
        { name: 'My Characters', path: 'Characters', icon: Users },
        { name: 'Create Character', path: 'CreateCharacter', icon: User },
      ]
    },
    {
      name: 'Campaign',
      items: [
        { name: 'Campaigns', path: 'Campaigns', icon: BookOpen },
      ]
    },
    {
      name: 'Tools',
      items: [
        { name: 'Dice Roller', path: 'DiceRoller', icon: Zap },
        { name: 'Economy', path: 'Economy', icon: Package },
      ]
    },
    {
      name: 'Reference',
      items: [
        { name: 'Rules', path: 'Rules', icon: Book },
        { name: 'Help', path: 'Help', icon: HelpCircle },
      ]
    },
    {
      name: 'System',
      items: [
        { name: 'Settings', path: 'Settings', icon: Settings },
      ]
    }
  ];
  
  const isActive = (path) => {
    return location.pathname.includes(path);
  };
  
  const fontSizeClass = {
    small: 'text-sm',
    medium: '',
    large: 'text-lg',
    xlarge: 'text-xl'
  }[settings.fontSize] || '';

  return (
    <TutorialProvider>
      <AegisProvider>
        <div className={cn(
          "min-h-screen bg-slate-950 overflow-x-hidden relative",
          fontSizeClass,
          settings.highContrast && "contrast-125"
        )}>
          {/* Scanline effect */}
          {settings.scanlineEffect && <div className="scanline" />}

      {/* Military grid background */}
      {settings.particleEffects && (
        <div className="fixed inset-0 military-grid opacity-30 pointer-events-none" />
      )}
      

      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-lg border-b border-violet-500/30 shadow-lg shadow-violet-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              to={createPageUrl('Home')} 
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
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
              {navCategories.map(category => (
                <div key={category.name} className="relative group">
                  <Button
                    variant="ghost"
                    className="gap-2 text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    {category.name}
                    <Menu className="h-3 w-3" />
                  </Button>
                  <div className="absolute top-full left-0 mt-1 w-48 bg-slate-900 border border-violet-500/30 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <div className="p-2 space-y-1">
                      {category.items.map(item => (
                        <Link
                          key={item.path}
                          to={createPageUrl(item.path)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                            isActive(item.path) 
                              ? "bg-violet-600 text-white" 
                              : "text-slate-300 hover:bg-slate-800 hover:text-white"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
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
          <div className="md:hidden border-t border-slate-800 bg-slate-900 max-h-[80vh] overflow-y-auto">
            <nav className="px-4 py-3 space-y-4">
              {navCategories.map(category => (
                <div key={category.name}>
                  <div className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-2 px-3">
                    {category.name}
                  </div>
                  <div className="space-y-1">
                    {category.items.map(item => (
                      <Link 
                        key={item.path} 
                        to={createPageUrl(item.path)}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start gap-2 text-slate-300 hover:text-white hover:bg-slate-800",
                            isActive(item.path) && "bg-violet-600 text-white hover:bg-violet-700"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.name}
                        </Button>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        )}
      </header>
      
      {/* Main Content */}
      <main className="pt-16 pb-16 relative z-10">
        <div className="overflow-y-auto scroll-smooth">
          {children}
        </div>
      </main>

      {/* DM Login Footer */}
      <DMLoginFooter 
        isDM={isDM}
        onDMLogin={() => setIsDM(true)}
        onDMLogout={() => setIsDM(false)}
      />

      {showCharacterSelector && (
        <CharacterSelector
          characters={characters}
          onSelect={handleCharacterSelect}
          onClose={() => setShowCharacterSelector(false)}
        />
      )}

        <AegisAssistant />
        <TutorialOverlay />
      </div>
    </AegisProvider>
    </TutorialProvider>
  );
}