import { useEffect } from 'react';
import { useTutorial } from './TutorialSystem';
import { TUTORIALS } from './TutorialData';

/**
 * TutorialInitializer - Automatically triggers tutorials based on user state
 * (First visit, character creation, etc.)
 */
export default function TutorialInitializer() {
  const { startTutorial, completedTutorials, tutorialsEnabled } = useTutorial();

  useEffect(() => {
    if (!tutorialsEnabled) return;

    const hasCreatedCharacter = localStorage.getItem('hasCreatedCharacter');
    const hasCompletedCharCreationTutorial = completedTutorials.includes('character_creation');

    // First visit - offer character creation tutorial
    if (!hasCreatedCharacter && !hasCompletedCharCreationTutorial) {
      const timer = setTimeout(() => {
        startTutorial('character_creation', TUTORIALS.CHARACTER_CREATION.steps);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [tutorialsEnabled, completedTutorials, startTutorial]);

  return null;
}