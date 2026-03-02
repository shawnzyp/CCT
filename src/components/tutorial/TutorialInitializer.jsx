import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useTutorial } from './TutorialSystem';
import { TUTORIALS } from './TutorialData';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Sparkles, User } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

export default function TutorialInitializer() {
  const { startTutorial, completedTutorials, tutorialsEnabled } = useTutorial();
  const [showIntroChoice, setShowIntroChoice] = useState(false);
  const navigate = useNavigate();

  const { data: characters = [] } = useQuery({
    queryKey: ['characters-for-tutorial'],
    queryFn: () => base44.entities.Character.list(),
    staleTime: 5 * 60 * 1000
  });

  useEffect(() => {
    if (!tutorialsEnabled) return;

    const hasSeenIntro = localStorage.getItem('hasSeenIntroChoice');
    const hasCompletedCharCreationTutorial = completedTutorials.includes('character_creation');

    // Show intro choice on first visit
    if (!hasSeenIntro && !hasCompletedCharCreationTutorial) {
      const timer = setTimeout(() => {
        setShowIntroChoice(true);
        localStorage.setItem('hasSeenIntroChoice', 'true');
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [tutorialsEnabled, completedTutorials]);

  const handleCreateNew = () => {
    setShowIntroChoice(false);
    startTutorial('character_creation', TUTORIALS.CHARACTER_CREATION.steps);
  };

  const handleLoadExisting = () => {
    setShowIntroChoice(false);
  };

  const handleOptOut = () => {
    setShowIntroChoice(false);
    localStorage.setItem('tutorialsDisabledByUser', 'true');
  };

  if (!showIntroChoice) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        {/* Choice Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative z-[101]"
        >
          <Card className="bg-gradient-to-br from-violet-900 to-slate-900 border-violet-500 shadow-2xl w-96">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-violet-400" />
                  <h2 className="text-white font-bold text-lg">Welcome Back!</h2>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleOptOut}
                  className="h-8 w-8 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="mb-6">
                <p className="text-slate-200 text-sm mb-4">
                  {characters.length > 0
                    ? 'We found your existing character. Would you like a guided tour or create a new one?'
                    : "Let's create your first superhero! We can guide you through the process step-by-step."}
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                {characters.length > 0 && (
                  <Button
                    onClick={handleLoadExisting}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Load My Character
                  </Button>
                )}
                <Button
                  onClick={handleCreateNew}
                  className="w-full bg-violet-600 hover:bg-violet-700"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {characters.length > 0 ? 'Create New Character' : 'Start Guided Tour'}
                </Button>
                <Button
                  onClick={handleOptOut}
                  variant="outline"
                  className="w-full border-slate-600 text-slate-400 hover:text-white"
                >
                  Skip Tutorial
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}