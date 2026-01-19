import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

const TutorialContext = createContext();

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within TutorialProvider');
  }
  return context;
};

export const TutorialProvider = ({ children }) => {
  const [activeTutorial, setActiveTutorial] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedTutorials, setCompletedTutorials] = useState(() => {
    const saved = localStorage.getItem('catalystCore_completedTutorials');
    return saved ? JSON.parse(saved) : [];
  });
  const [tutorialsEnabled, setTutorialsEnabled] = useState(() => {
    const saved = localStorage.getItem('catalystCore_tutorialsEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('catalystCore_completedTutorials', JSON.stringify(completedTutorials));
  }, [completedTutorials]);

  useEffect(() => {
    localStorage.setItem('catalystCore_tutorialsEnabled', JSON.stringify(tutorialsEnabled));
  }, [tutorialsEnabled]);

  const startTutorial = (tutorialId, steps) => {
    if (!tutorialsEnabled || completedTutorials.includes(tutorialId)) {
      return;
    }
    setActiveTutorial({ id: tutorialId, steps });
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (!activeTutorial) return;
    
    if (currentStep < activeTutorial.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTutorial();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const skipTutorial = () => {
    if (activeTutorial) {
      markAsCompleted(activeTutorial.id);
    }
    setActiveTutorial(null);
    setCurrentStep(0);
    toast.info('Tutorial skipped');
  };

  const completeTutorial = () => {
    if (activeTutorial) {
      markAsCompleted(activeTutorial.id);
      toast.success('Tutorial completed!');
    }
    setActiveTutorial(null);
    setCurrentStep(0);
  };

  const markAsCompleted = (tutorialId) => {
    setCompletedTutorials(prev => 
      prev.includes(tutorialId) ? prev : [...prev, tutorialId]
    );
  };

  const resetTutorial = (tutorialId) => {
    setCompletedTutorials(prev => prev.filter(id => id !== tutorialId));
  };

  const resetAllTutorials = () => {
    setCompletedTutorials([]);
    toast.success('All tutorials reset');
  };

  const toggleTutorials = () => {
    setTutorialsEnabled(prev => !prev);
  };

  const getCurrentStepData = () => {
    if (!activeTutorial) return null;
    return activeTutorial.steps[currentStep];
  };

  return (
    <TutorialContext.Provider
      value={{
        activeTutorial,
        currentStep,
        completedTutorials,
        tutorialsEnabled,
        startTutorial,
        nextStep,
        previousStep,
        skipTutorial,
        completeTutorial,
        resetTutorial,
        resetAllTutorials,
        toggleTutorials,
        getCurrentStepData,
        isTutorialComplete: (id) => completedTutorials.includes(id)
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
};