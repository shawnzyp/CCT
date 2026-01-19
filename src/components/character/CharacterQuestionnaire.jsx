import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, BookOpen, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { DEEP_CHARACTER_QUESTIONS } from '@/components/rules/RulesData';

export default function CharacterQuestionnaire({ character, onUpdate }) {
  const [answers, setAnswers] = useState(character.identity_questions || {});
  const [hasChanges, setHasChanges] = useState(false);

  const questionKeys = [
    'who_behind_mask',
    'what_is_justice',
    'biggest_fear',
    'legacy',
    'power_moment',
    'origin_meaning',
    'life_before',
    'powers_scare',
    'signature_move',
    'emotionally_compromised',
    'never_cross',
    'alignment_identity',
    'whose_opinion',
    'what_drives',
    'walk_away',
    'major_secret',
    'most_vulnerable',
    'admire_teammate',
    'without_powers'
  ];

  const updateAnswer = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdate({ identity_questions: answers });
    setHasChanges(false);
    toast.success('Questionnaire saved!');
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-violet-400" />
          Character Questionnaire
        </CardTitle>
        <p className="text-xs text-slate-400">
          Answer these questions to deepen your character's identity and provide narrative fuel for roleplay
        </p>
        {hasChanges && (
          <div className="flex items-center gap-2 mt-2">
            <Sparkles className="h-3 w-3 text-orange-400" />
            <span className="text-xs text-orange-400">Unsaved changes</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {DEEP_CHARACTER_QUESTIONS.map((question, idx) => (
          <div key={questionKeys[idx]} className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              {idx + 1}. {question}
            </label>
            <Textarea
              value={answers[questionKeys[idx]] || ''}
              onChange={(e) => updateAnswer(questionKeys[idx], e.target.value)}
              placeholder="Your answer..."
              className="bg-slate-900/50 border-slate-700 text-white min-h-[80px]"
            />
          </div>
        ))}

        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSave}
            disabled={!hasChanges}
            className="bg-violet-600 hover:bg-violet-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Answers
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}