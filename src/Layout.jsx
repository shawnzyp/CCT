import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { Users, Zap, BookOpen, Menu, X, User, RefreshCw, Book, HelpCircle, Radio, Settings, Package, Save, Check, Home, ArrowLeft, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { useTheme } from '@/components/theme/useTheme';
import BootGate from '@/components/theme/BootGate';

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentCharacter, setCurrentCharacter] = useState(null);
  const [showCharacterSelector, setShowCharacterSelector] = useState(false);
  const [isDM, setIsDM] = useState(() => localStorage.getItem('isDM') === 'true');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const { play } = useSoundEffects();
  const { settings } = useSettings();
  const { theme, factionId } = useTheme();



  // Apply CSS vars whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme?.css) {
      Object.entries(theme.css).forEach(([k, v]) => root.style.setProperty(k, v));
    }
  }, [theme]);

  useEffect(() => {
    const handleDMStatusChange = () => setIsDM(localStorage.getItem('isDM') === 'true');
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
      try { setCurrentCharacter(JSON.parse(stored)); }
      catch { localStorage.removeItem('currentCharacter'); }
    }
  }, []);

  useEffect(() => {
    const handler = (e) => setCurrentCharacter(e.detail);
    window.addEventListener('characterChanged', handler);
    return () => window.removeEventListener('characterChanged', handler);
  }, []);

  useEffect(() => {
    const handler = () => setLastSaved(new Date());
    window.addEventListener('appSaved', handler);
    return () => window.removeEventListener('appSaved', handler);
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    window.dispatchEvent(new CustomEvent('triggerSave'));
    setTimeout(() => {
      setIsSaving(false);
      setLastSaved(new Date());
      toast.success('Progress saved!');
      play?.('resource_gain');
    }, 500);
  };

  const formatLastSaved = () => {
    if (!lastSaved) return 'Not saved';
    const diff = Math.floor((new Date() - lastSaved) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  const handleCharacterSelect = (character) => {
    setCurrentCharacter(character);
    localStorage.setItem('currentCharacter', JSON.stringify(character));
    setShowCharacterSelector(false);
    window.dispatchEvent(new CustomEvent('characterChanged', { detail: character }));
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
      items: [{ name: 'Campaigns', path: 'Campaigns', icon: BookOpen }]
    },
    {
      name: 'Tools',
      items: [
        { name: 'Dice Roller', path: 'DiceRoller', icon: Zap },
        { name: 'Economy', path: 'Economy', icon: Package },
        { name: 'Operations Map', path: 'OperationsMap', icon: Map },
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

  const isActive = (path) => location.pathname.includes(path);

  const isSubPage = location.search.length > 0 ||
    (location.pathname !== '/' && !['Home', 'Campaigns', 'Settings', 'CreateCharacter', 'OperationsMap'].some(p => location.pathname.includes(p)));

  const bottomNavItems = [
    { label: 'Home', path: 'Home', icon: Home },
    { label: 'Characters', path: 'CreateCharacter', icon: User },
    { label: 'Campaigns', path: 'Campaigns', icon: BookOpen },
    { label: 'Settings', path: 'Settings', icon: Settings },
  ];

  const fontSizeClass = { small: 'text-sm', medium: '', large: 'text-lg', xlarge: 'text-xl' }[settings.fontSize] || '';

  const accentA = theme?.colors?.accentA || '#00E5FF';
  const bg0 = theme?.colors?.bg0 || '#0F1216';
  const panel0 = theme?.colors?.panel0 || '#1A1F26';
  const text1 = theme?.colors?.text1 || '#8EA0B5';
  const muted = theme?.colors?.muted || '#5F6E80';

  return (
    <TutorialProvider>
      <AegisProvider>

        <div
          className={cn("min-h-screen overflow-x-hidden relative", fontSizeClass, settings.highContrast && "contrast-125")}
          style={{ background: theme?.background?.gradient || '#0F1216' }}
        >
          {/* Scanline */}
          {settings.scanlineEffect && !settings.reducedMotion && <div className="cc-scanline-layer" />}

          {/* Grid */}
          {settings.particleEffects && (theme?.background?.gridOpacity || 0) > 0 && (
            <div className="fixed inset-0 military-grid opacity-30 pointer-events-none" />
          )}

          {/* ── HEADER ── */}
          <header
            className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg border-b"
            style={{
              background: bg0 + 'F0',
              borderColor: accentA + '30',
              boxShadow: `0 1px 20px ${accentA}18`,
              paddingTop: 'env(safe-area-inset-top)',
              transition: 'background 400ms, border-color 250ms',
            }}
          >
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
              <div className="flex items-center justify-between h-14 sm:h-16">

                {/* Back (mobile sub-pages) */}
                {isSubPage && (
                  <button
                    onClick={() => navigate(-1)}
                    className="md:hidden flex-shrink-0 h-11 w-11 flex items-center justify-center -ml-1"
                    style={{ color: text1 }}
                    aria-label="Go back"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                )}

                {/* Logo */}
                <Link to={createPageUrl('Home')} className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
                    style={{ border: `1px solid ${accentA}30` }}>
                    <img
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696d1e71c654a257ffdf4599/6fb07bdd9_IMG_4419.jpeg"
                      alt="DC Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="font-bold text-sm sm:text-base lg:text-lg tracking-wider truncate"
                        style={{ color: theme?.colors?.text0 || '#E6F1FF' }}>
                        CATALYST CORE
                      </span>
                      <Radio className="h-2.5 w-2.5 sm:h-3 sm:w-3 animate-pulse flex-shrink-0" style={{ color: accentA }} />
                    </div>
                    <span className="hidden md:block text-[8px] sm:text-[9px] uppercase tracking-[0.2em] font-mono" style={{ color: muted }}>
                      {theme?.faction || 'O.M.N.I.'} // FIELD EDITION
                    </span>
                  </div>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-1">
                  {navCategories.map(category => (
                    <div key={category.name} className="relative group">
                      <button
                        className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm transition-colors"
                        style={{ color: text1 }}
                      >
                        {category.name}
                        <Menu className="h-3 w-3" />
                      </button>
                      <div
                        className="absolute top-full left-0 mt-1 w-48 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 border"
                        style={{ background: panel0, borderColor: accentA + '25' }}
                      >
                        <div className="p-2 space-y-1">
                          {category.items.map(item => (
                            item.action === 'characterSelector' ? (
                              <button
                                key={item.path}
                                onClick={() => setShowCharacterSelector(true)}
                                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium w-full text-left transition-colors hover:opacity-80"
                                style={{ color: text1 }}
                              >
                                <item.icon className="h-4 w-4" />
                                {item.name}
                              </button>
                            ) : (
                              <Link
                                key={item.path}
                                to={createPageUrl(item.path)}
                                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                style={isActive(item.path)
                                  ? { background: accentA + '20', color: accentA }
                                  : { color: text1 }}
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

                {/* Character + Save */}
                <div className="flex items-center gap-2">
                  <div className="hidden lg:flex items-center">
                    {currentCharacter ? (
                      <button
                        onClick={() => setShowCharacterSelector(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors border"
                        style={{ color: text1, borderColor: accentA + '30', background: 'transparent' }}
                      >
                        <User className="h-3.5 w-3.5" />
                        <span className="max-w-[100px] truncate">{currentCharacter.name}</span>
                        <RefreshCw className="h-3 w-3" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowCharacterSelector(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs border transition-all"
                        style={{ color: accentA, borderColor: accentA + '60', background: accentA + '10' }}
                      >
                        <User className="h-3.5 w-3.5" />
                        <span className="hidden xl:inline">Select Character</span>
                        <span className="xl:hidden">Select</span>
                      </button>
                    )}
                  </div>

                  {/* Save Button */}
                  <div className="flex flex-col items-center">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-1.5 px-2.5 h-8 rounded-md text-xs font-medium transition-all"
                      style={{
                            background: isSaving ? (theme?.colors?.success || '#00D1B2') : accentA,
                            color: '#000',
                            transition: `background ${theme?.motion?.med || 220}ms ease-out`,
                          }}
                    >
                      <AnimatePresence mode="wait">
                        {isSaving ? (
                          <motion.div key="check" initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}>
                            <Check className="h-3 w-3" />
                          </motion.div>
                        ) : (
                          <motion.div key="save" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                            <Save className="h-3 w-3" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <span className="hidden sm:inline">Save</span>
                    </button>
                    <span className="text-[8px] mt-0.5 whitespace-nowrap leading-none font-mono" style={{ color: muted }}>
                      {formatLastSaved()}
                    </span>
                  </div>
                </div>

                {/* Mobile menu toggle */}
                <button
                  className="md:hidden h-11 w-11 flex items-center justify-center"
                  style={{ color: text1 }}
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="md:hidden border-t max-h-[80vh] overflow-y-auto"
                style={{ background: panel0, borderColor: accentA + '20' }}>
                <nav className="px-4 py-3 space-y-4">
                  {navCategories.map(category => (
                    <div key={category.name}>
                      <div className="text-xs font-semibold uppercase tracking-wider mb-2 px-3 font-mono"
                        style={{ color: accentA }}>
                        {category.name}
                      </div>
                      <div className="space-y-1">
                        {category.items.map(item => (
                          item.action === 'characterSelector' ? (
                            <button
                              key={item.path}
                              onClick={() => { setShowCharacterSelector(true); setMobileMenuOpen(false); }}
                              className="flex items-center gap-2 w-full px-3 py-2.5 rounded-md text-sm font-medium transition-colors"
                              style={{ color: text1 }}
                            >
                              <item.icon className="h-4 w-4" />
                              {item.name}
                            </button>
                          ) : (
                            <Link
                              key={item.path}
                              to={createPageUrl(item.path)}
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors"
                              style={isActive(item.path)
                                ? { background: accentA + '20', color: accentA }
                                : { color: text1 }}
                            >
                              <item.icon className="h-4 w-4" />
                              {item.name}
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
          <main className="pt-14 sm:pt-16 relative z-10" style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))' }}>
            <div className="overflow-y-auto scroll-smooth">
              {children}
            </div>
            <DMLoginFooter
              isDM={isDM}
              onDMLogin={() => setIsDM(true)}
              onDMLogout={() => setIsDM(false)}
            />
          </main>

          {/* Mobile Bottom Navigation */}
          <nav
            className="md:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-lg border-t"
            style={{
              background: bg0 + 'F5',
              borderColor: accentA + '30',
              paddingBottom: 'env(safe-area-inset-bottom)',
              transition: 'background 400ms, border-color 250ms',
            }}
          >
            <div className="flex items-center justify-around h-16">
              {bottomNavItems.map(item => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={createPageUrl(item.path)}
                    className="flex flex-col items-center justify-center gap-0.5 min-w-[44px] h-full px-3 relative"
                    style={{
                              color: active ? accentA : muted,
                              transition: `color ${theme?.motion?.fast || 120}ms ease-out`,
                            }}
                  >
                    <item.icon
                      className="h-5 w-5"
                      style={active ? { filter: `drop-shadow(0 0 5px ${accentA})` } : {}}
                    />
                    <span className="text-[10px] font-mono">{item.label}</span>
                    {active && (
                      <span
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                        style={{ background: accentA }}
                      />
                    )}
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