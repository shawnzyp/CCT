import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, BookOpen } from "lucide-react";
import { toast } from "sonner";

const QUESTIONNAIRE = [
  {
    section: "Identity & Morality",
    questions: [
      { id: 'who_behind_mask', question: 'Who are you behind the mask?' },
      { id: 'what_is_justice', question: 'What does justice mean to you?' },
      { id: 'biggest_fear', question: 'What is your biggest fear or unresolved trauma?' },
      { id: 'legacy', question: 'What legacy do you want to leave behind?' }
    ]
  },
  {
    section: "Powers & Origin",
    questions: [
      { id: 'first_power_moment', question: 'What moment first defined your sense of power—was it thrilling, terrifying, or tragic?' },
      { id: 'origin_meaning', question: 'What does your Origin Story mean to you now?' },
      { id: 'life_before_powers', question: 'What was your life like before you had powers or before you remembered having them?' },
      { id: 'powers_scare_you', question: 'What is one way your powers scare even you?' },
      { id: 'signature_move_meaning', question: 'What is your signature move or ability, and how does it reflect who you are?' },
      { id: 'emotionally_compromised', question: 'What happens to your powers when you are emotionally compromised?' }
    ]
  },
  {
    section: "Boundaries & Principles",
    questions: [
      { id: 'never_cross', question: 'What line will you never cross—even if the world burns around you?' },
      { id: 'alignment_identity', question: 'Which Alignment do you identify with, and which do you fear becoming?' },
      { id: 'whose_opinion', question: 'Whose opinion matters more to you—civilians, teammates, or your faction superiors? Why?' },
      { id: 'what_drives_you', question: 'What drives you to fight—justice, guilt, revenge, legacy, redemption, or something else?' },
      { id: 'walk_away', question: 'What would make you walk away from this life for good?' }
    ]
  },
  {
    section: "Relationships & Vulnerabilities",
    questions: [
      { id: 'major_secret', question: 'What is one major secret you are keeping from the rest of the team?' },
      { id: 'most_vulnerable', question: 'What situation leaves you the most vulnerable—physically, emotionally, or strategically?' },
      { id: 'admired_teammate', question: 'Which teammate do you admire the most and what do they have that you lack?' },
      { id: 'without_powers', question: 'If you lost your powers tomorrow, who would you still be?' }
    ]
  }
];

export default function CharacterQuestionnaire({ character, onUpdate }) {
  const [answers, setAnswers] = useState(character.identity_questions || {});
  const [hasChanges, setHasChanges] = useState(false);

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
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
          Character Development Questionnaire
        </CardTitle>
        <CardDescription className="text-slate-400">
          Explore your character's identity, motivations, and moral compass. These answers help build 
          immersive stories, richer character arcs, and stronger party dynamics.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {QUESTIONNAIRE.map((section, sIdx) => (
          <div key={sIdx} className="space-y-4">
            <h3 className="text-lg font-semibold text-violet-400 border-b border-slate-700 pb-2">
              {section.section}
            </h3>
            {section.questions.map(q => (
              <div key={q.id} className="space-y-2">
                <Label className="text-slate-300 font-medium">{q.question}</Label>
                <Textarea
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  placeholder="Your answer..."
                  className="bg-slate-900/50 border-slate-700 text-white min-h-[80px]"
                />
              </div>
            ))}
          </div>
        ))}

        <Button 
          onClick={handleSave}
          disabled={!hasChanges}
          className="w-full bg-violet-600 hover:bg-violet-700"
        >
          <Save className="h-4 w-4 mr-2" />
          {hasChanges ? 'Save Answers' : 'Saved'}
        </Button>
      </CardContent>
    </Card>
  );
}