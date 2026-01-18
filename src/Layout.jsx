import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { Users, Zap, BookOpen, Menu, X, User, RefreshCw, Book, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CharacterSelector from '@/components/character/CharacterSelector';

export default function Layout({ children }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentCharacter, setCurrentCharacter] = useState(null);
  const [showCharacterSelector, setShowCharacterSelector] = useState(false);

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
    <div className="min-h-screen bg-slate-950 overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-white text-lg">Catalyst Core</span>
                <span className="hidden md:block text-[10px] text-slate-500 uppercase tracking-wider">Character Tracker</span>
              </div>
            </Link>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(item => (
                <Link key={item.path} to={createPageUrl(item.path)}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "gap-2 text-slate-400 hover:text-white hover:bg-slate-800",
                      isActive(item.path) && "text-white bg-slate-800"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Button>
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
      <main className="pt-16">
        <div className="overflow-y-auto scroll-smooth">
          {children}
        </div>
      </main>

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