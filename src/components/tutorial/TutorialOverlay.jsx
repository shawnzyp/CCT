import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, ChevronLeft, ChevronRight, Lightbulb, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTutorial } from './TutorialSystem';

export default function TutorialOverlay() {
  const {
    activeTutorial,
    currentStep,
    nextStep,
    previousStep,
    skipTutorial,
    getCurrentStepData
  } = useTutorial();

  const stepData = getCurrentStepData();
  const highlightRef = useRef(null);

  useEffect(() => {
    if (stepData?.target) {
      const element = document.querySelector(stepData.target);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        highlightRef.current = element;
      }
    }
  }, [stepData]);

  if (!activeTutorial || !stepData) return null;

  const totalSteps = activeTutorial.steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100]"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        {/* Spotlight Effect */}
        {stepData.target && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute pointer-events-none"
            style={{
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
              borderRadius: '12px',
              transition: 'all 0.3s ease'
            }}
          />
        )}

        {/* Tutorial Card */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className={cn(
            "absolute z-[101]",
            stepData.position === 'top' && "top-4 left-1/2 -translate-x-1/2",
            stepData.position === 'bottom' && "bottom-4 left-1/2 -translate-x-1/2",
            stepData.position === 'left' && "left-4 top-1/2 -translate-y-1/2",
            stepData.position === 'right' && "right-4 top-1/2 -translate-y-1/2",
            stepData.position === 'center' && "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            !stepData.position && "bottom-8 right-8"
          )}
        >
          <Card className="bg-gradient-to-br from-violet-900 to-slate-900 border-violet-500 shadow-2xl max-w-md">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {stepData.icon === 'lightbulb' ? (
                    <Lightbulb className="h-5 w-5 text-yellow-400" />
                  ) : (
                    <Sparkles className="h-5 w-5 text-violet-400" />
                  )}
                  <div>
                    <h3 className="text-white font-bold text-lg">{stepData.title}</h3>
                    <p className="text-xs text-slate-400">
                      Step {currentStep + 1} of {totalSteps}
                    </p>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={skipTutorial}
                  className="h-8 w-8 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full mb-4 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-500"
                />
              </div>

              {/* Content */}
              <div className="mb-6">
                <p className="text-slate-200 text-sm leading-relaxed mb-3">
                  {stepData.description}
                </p>

                {stepData.tips && stepData.tips.length > 0 && (
                  <div className="bg-violet-500/10 border border-violet-500/30 rounded-lg p-3 space-y-1">
                    {stepData.tips.map((tip, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-violet-400 text-xs">💡</span>
                        <span className="text-xs text-violet-200">{tip}</span>
                      </div>
                    ))}
                  </div>
                )}

                {stepData.action && (
                  <div className="mt-3 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                    <p className="text-xs text-amber-200">
                      <strong>Try it:</strong> {stepData.action}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  onClick={skipTutorial}
                  className="text-xs border-slate-600 text-slate-400 hover:text-white"
                >
                  Skip Tutorial
                </Button>

                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <Button
                      variant="outline"
                      onClick={previousStep}
                      className="border-violet-500 text-violet-400"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Back
                    </Button>
                  )}
                  <Button
                    onClick={nextStep}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
                    {currentStep < totalSteps - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}