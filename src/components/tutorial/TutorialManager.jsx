import React from 'react';
import { useTutorial } from './TutorialSystem';
import { TUTORIALS } from './TutorialData';
import { Button } from '@/components/ui/button';
import { HelpCircle, RotateCcw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

/**
 * TutorialManager - UI for managing tutorials (reset, enable/disable, etc.)
 * Can be integrated into Settings or Help pages
 */
export default function TutorialManager() {
  const {
    completedTutorials,
    tutorialsEnabled,
    toggleTutorials,
    resetTutorial,
    resetAllTutorials,
    startTutorial
  } = useTutorial();

  const tutorialList = Object.values(TUTORIALS);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Tutorial System</h3>
        <Button
          variant={tutorialsEnabled ? 'default' : 'outline'}
          size="sm"
          onClick={toggleTutorials}
          className={cn(
            tutorialsEnabled && 'bg-green-600 hover:bg-green-700'
          )}
        >
          {tutorialsEnabled ? '✓ Enabled' : 'Disabled'}
        </Button>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-slate-400">Available Tutorials</h4>
        <div className="space-y-2">
          {tutorialList.map((tutorial) => {
            const isCompleted = completedTutorials.includes(tutorial.id);
            return (
              <div
                key={tutorial.id}
                className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 p-3"
              >
                <div>
                  <p className="font-mono text-sm font-semibold text-slate-200">
                    {tutorial.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {tutorial.steps.length} steps
                  </p>
                </div>
                <div className="flex gap-2">
                  {isCompleted && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resetTutorial(tutorial.id)}
                      className="text-xs"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Reset
                    </Button>
                  )}
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => startTutorial(tutorial.id, tutorial.steps)}
                    className="text-xs"
                  >
                    <HelpCircle className="h-3 w-3 mr-1" />
                    {isCompleted ? 'Restart' : 'Start'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {completedTutorials.length > 0 && (
        <div className="pt-2 border-t border-slate-700">
          <Button
            variant="outline"
            size="sm"
            onClick={resetAllTutorials}
            className="w-full text-xs"
          >
            <RotateCcw className="h-3 w-3 mr-2" />
            Reset All Tutorials
          </Button>
        </div>
      )}
    </div>
  );
}