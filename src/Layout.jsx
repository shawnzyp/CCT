import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { Users, Zap, BookOpen, Menu, X, User, RefreshCw, Book, HelpCircle, Radio, Settings, Package, Save, Check, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CharacterSelector from '@/components/character/CharacterSelector';
import { motion, AnimatePresence } from 'framer-motion';
import useSoundEffects from '@/components/sounds/useSoundEffects';
import AegisAssistant from '@/components/aegis/AegisAssistant';
import { AegisProvider } from '@/components/aegis/AegisContext';
import { TutorialProvider } from '@/components/tutorial/TutorialSystem';
import TutorialOverlay from '@/components/tutorial/TutorialOverlay';
import DMLoginFooter from '@/components/dm/DMLoginFooter';
import { useSettings } from '@/components/utils/useSettings';
import { toast } from 'sonner';

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentCharacter, setCurrentCharacter] = useState(null);
  const [showCharacterSelector, setShowCharacterSelector] = useState(false);
  const [isDM, setIsDM] = useState(() => {
    return localStorage.getItem('isDM') === 'true';
  });
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const { play } = useSoundEffects();
  const { settings } = useSettings();

  useEffect(() => {
    const handleDMStatusChange = () => {
      setIsDM(localStorage.getItem('isDM') === 'true');
    };

    window.addEventListener('dm-status-changed', handleDMStatusChange);
    return () => window.removeEventListener('dm-status-changed', handleDMStatusChange);
  }, []);

  const { data: characters = [] } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.Character.list('-created_date'),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  useEffect(() => {
    const stored = localStorage.getItem('currentCharacter');
    if (stored) {
      try {
        const parsedChar = JSON.parse(stored);
        setCurrentCharacter(parsedChar);
      } catch (e) {
        localStorage.removeItem('currentCharacter');
      }
    }
  }, []);

  useEffect(() => {
    const handleCharacterChange = (e) => {
      setCurrentCharacter(e.detail);
    };

    window.addEventListener('characterChanged', handleCharacterChange);
    return () => window.removeEventListener('characterChanged', handleCharacterChange);
  }, []);

  // Listen for save events from pages
  useEffect(() => {
    const handleSaveComplete = () => {
      setLastSaved(new Date());
    };

    window.addEventListener('appSaved', handleSaveComplete);
    return () => window.removeEventListener('appSaved', handleSaveComplete);
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    
    // Broadcast save event to all pages
    window.dispatchEvent(new CustomEvent('triggerSave'));
    
    // Visual feedback
    setTimeout(() => {
      setIsSaving(false);
      setLastSaved(new Date());
      toast.success('Progress saved!');
      play && play('resource_gain');
    }, 500);
  };

  const formatLastSaved = () => {
    if (!lastSaved) return 'Not saved yet';
    
    const now = new Date();
    const diff = Math.floor((now - lastSaved) / 1000); // seconds
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return lastSaved.toLocaleDateString();
  };

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
        { name: 'My Characters', path: 'Home', icon: Users, action: 'characterSelector' },
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
        ...(isDM ? [{ name: 'Director Hub', path: 'DMHub', icon: Settings }] : []),
        { name: 'Settings', path: 'Settings', icon: Settings },
      ]
    }
  ];
  
  const isActive = (path) => {
    return location.pathname.includes(path);
  };
  
  // Detect sub-pages (any page with query params or not the root pages)
  const isSubPage = location.search.length > 0 || 
    (location.pathname !== '/' && !['Home', 'Campaigns', 'Settings', 'CreateCharacter'].some(p => location.pathname.includes(p)));
  
  // Bottom nav items for mobile
  const bottomNavItems = [
    { label: 'Home', path: 'Home', icon: Home },
    { label: 'Characters', path: 'CreateCharacter', icon: User },
    { label: 'Campaigns', path: 'Campaigns', icon: BookOpen },
    { label: 'Settings', path: 'Settings', icon: Settings },
  ];
  
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
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-lg border-b border-violet-500/30 shadow-lg shadow-violet-500/10"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Back button on sub-pages (mobile) */}
            {isSubPage && (
              <button
                onClick={() => navigate(-1)}
                className="md:hidden flex-shrink-0 h-11 w-11 flex items-center justify-center text-slate-400 hover:text-white -ml-1"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}

            {/* Logo */}
            <Link 
              to={createPageUrl('Home')} 
              className="flex items-center gap-2 sm:gap-3"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696d1e71c654a257ffdf4599/6fb07bdd9_IMG_4419.jpeg" 
                  alt="DC Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="font-bold text-white text-sm sm:text-base lg:text-lg tracking-wider truncate">CATALYST CORE</span>
                  <Radio className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-violet-400 animate-pulse flex-shrink-0" />
                </div>
                <span className="hidden md:block text-[8px] sm:text-[9px] text-violet-400 uppercase tracking-[0.2em] font-mono">
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
                        item.action === 'characterSelector' ? (
                          <button
                            key={item.path}
                            onClick={() => setShowCharacterSelector(true)}
                            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-slate-300 hover:bg-slate-800 hover:text-white w-full text-left"
                          >
                            <item.icon className="h-4 w-4" />
                            {item.name}
                          </button>
                        ) : (
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
                        )
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </nav>

            {/* Current Character + Save Button */}
            <div className="flex items-center gap-2">
              <div className="hidden lg:flex items-center">
                {currentCharacter ? (
                  <Button
                    variant="ghost"
                    onClick={handleCharacterSwitch}
                    className="gap-1.5 text-slate-400 hover:text-white text-xs lg:text-sm px-2 lg:px-4"
                  >
                    <User className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                    <span className="max-w-[100px] truncate">{currentCharacter.name}</span>
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setShowCharacterSelector(true)}
                    className="gap-1.5 border-violet-500 text-violet-400 hover:bg-violet-500/20 text-xs lg:text-sm px-2 lg:px-4"
                  >
                    <User className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                    <span className="hidden xl:inline">Select Character</span>
                    <span className="xl:hidden">Select</span>
                  </Button>
                )}
              </div>

              {/* Save Button */}
              <div className="flex flex-col items-center justify-start">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={cn(
                    "gap-1.5 text-xs h-7 sm:h-8 px-2 sm:px-3 transition-all",
                    isSaving 
                      ? "bg-green-600 hover:bg-green-600" 
                      : "bg-violet-600 hover:bg-violet-700"
                  )}
                >
                  <AnimatePresence mode="wait">
                    {isSaving ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      >
                        <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="save"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Save className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <span className="hidden sm:inline">Save</span>
                </Button>
                <span className="text-[8px] text-slate-500 mt-0.5 whitespace-nowrap leading-none">
                  {formatLastSaved()}
                </span>
              </div>
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
                      item.action === 'characterSelector' ? (
                        <Button
                          key={item.path}
                          onClick={() => {
                            setShowCharacterSelector(true);
                            setMobileMenuOpen(false);
                          }}
                          variant="ghost"
                          className="w-full justify-start gap-2 text-slate-300 hover:text-white hover:bg-slate-800"
                        >
                          <item.icon className="h-4 w-4" />
                          {item.name}
                        </Button>
                      ) : (
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
                      )
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        )}
      </header>
      
      {/* Main Content */}
      <main className="pt-14 sm:pt-16 relative z-10 pb-16 md:pb-0" style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))' }}>
        <div className="overflow-y-auto scroll-smooth md:pb-0">
          {children}
        </div>
        
        {/* GM Login Footer - at bottom of page flow */}
        <DMLoginFooter 
          isDM={isDM}
          onDMLogin={() => setIsDM(true)}
          onDMLogout={() => setIsDM(false)}
        />
      </main>
      
      {/* Mobile Bottom Navigation */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-lg border-t border-violet-500/30"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-around h-16">
          {bottomNavItems.map(item => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={createPageUrl(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 min-w-[44px] h-full px-3 transition-colors",
                  active ? "text-violet-400" : "text-slate-500"
                )}
              >
                <item.icon className={cn("h-5 w-5", active && "drop-shadow-[0_0_6px_rgba(139,92,246,0.8)]")} />
                <span className="text-[10px] font-medium">{item.label}</span>
                {active && <span className="absolute bottom-0 w-8 h-0.5 bg-violet-500 rounded-full" />}
              </Link>
            );
          })}
        </div>
      </nav>

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