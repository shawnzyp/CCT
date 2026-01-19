import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Save, X } from "lucide-react";
import { toast } from "sonner";

const STATS = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
const SKILLS = ['athletics', 'acrobatics', 'stealth', 'investigation', 'perception', 'insight', 'persuasion', 'deception', 'intimidation', 'technology', 'medicine', 'survival'];

export default function CharacterEditor({ character, isOpen, onClose, onSave }) {
  const [editedCharacter, setEditedCharacter] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const startEditing = () => {
    setEditedCharacter(JSON.parse(JSON.stringify(character)));
    setHasChanges(false);
  };

  const updateField = (path, value) => {
    setEditedCharacter(prev => {
      const newChar = { ...prev };
      const keys = path.split('.');
      let current = newChar;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newChar;
    });
    setHasChanges(true);
  };

  const handleClose = () => {
    if (hasChanges) {
      setShowExitConfirm(true);
    } else {
      setEditedCharacter(null);
      onClose();
    }
  };

  const handleSave = () => {
    onSave(editedCharacter);
    setEditedCharacter(null);
    setHasChanges(false);
    toast.success('Character updated!');
  };

  const handleCancel = () => {
    setEditedCharacter(null);
    setHasChanges(false);
    setShowExitConfirm(false);
    onClose();
    toast.info('Changes discarded');
  };

  if (!editedCharacter && isOpen) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-slate-900 border-2 border-violet-500 text-white">
          <DialogHeader>
            <DialogTitle className="text-violet-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Edit Character
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-slate-300">
              You are about to edit <span className="text-white font-semibold">{character.name}</span>.
            </p>
            <div className="p-4 bg-orange-900/20 border border-orange-500/30 rounded">
              <p className="text-sm text-orange-300">
                ⚠️ You will be modifying core character attributes. Make sure you understand what you're changing.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={onClose} variant="outline">Cancel</Button>
            <Button onClick={startEditing} className="bg-violet-600 hover:bg-violet-700">
              Continue to Editor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (!editedCharacter) return null;

  return (
    <>
      <Dialog open={isOpen && !showExitConfirm} onOpenChange={handleClose}>
        <DialogContent className="bg-slate-900 border-2 border-violet-500 text-white max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-violet-400 text-xl">
              Editing: {editedCharacter.name}
            </DialogTitle>
            {hasChanges && (
              <p className="text-xs text-orange-400">● Unsaved changes</p>
            )}
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="bg-slate-800 border border-slate-700 grid grid-cols-5 w-full">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="stats">Stats</TabsTrigger>
              <TabsTrigger value="combat">Combat</TabsTrigger>
              <TabsTrigger value="background">Background</TabsTrigger>
              <TabsTrigger value="progression">Progression</TabsTrigger>
            </TabsList>

            {/* Basic Info */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-400">Vigilante Name</Label>
                  <Input
                    value={editedCharacter.name || ''}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-400">Secret Identity</Label>
                  <Input
                    value={editedCharacter.secret_identity || ''}
                    onChange={(e) => updateField('secret_identity', e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div>
                <Label className="text-slate-400">Classification</Label>
                <Select value={editedCharacter.classification} onValueChange={(v) => updateField('classification', v)}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mutant">Mutant</SelectItem>
                    <SelectItem value="enhanced_human">Enhanced Human</SelectItem>
                    <SelectItem value="magic_user">Magic User</SelectItem>
                    <SelectItem value="alien">Alien</SelectItem>
                    <SelectItem value="mystical_being">Mystical Being</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-400">Origin Story</Label>
                <Select value={editedCharacter.origin_story} onValueChange={(v) => updateField('origin_story', v)}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="the_accident">The Accident</SelectItem>
                    <SelectItem value="the_experiment">The Experiment</SelectItem>
                    <SelectItem value="the_legacy">The Legacy</SelectItem>
                    <SelectItem value="the_awakening">The Awakening</SelectItem>
                    <SelectItem value="the_pact">The Pact</SelectItem>
                    <SelectItem value="the_lost_time">The Lost Time</SelectItem>
                    <SelectItem value="the_exposure">The Exposure</SelectItem>
                    <SelectItem value="the_rebirth">The Rebirth</SelectItem>
                    <SelectItem value="the_vigil">The Vigil</SelectItem>
                    <SelectItem value="the_redemption">The Redemption</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-400">Tier (0=Legendary, 5=Rookie)</Label>
                  <Select value={editedCharacter.tier?.toString()} onValueChange={(v) => updateField('tier', parseInt(v))}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5].map(t => (
                        <SelectItem key={t} value={t.toString()}>Tier {t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-400">Level</Label>
                  <Input
                    type="number"
                    value={editedCharacter.level || 1}
                    onChange={(e) => updateField('level', parseInt(e.target.value))}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Stats */}
            <TabsContent value="stats" className="space-y-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Ability Scores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {STATS.map(stat => (
                      <div key={stat}>
                        <Label className="text-slate-400">{stat}</Label>
                        <Input
                          type="number"
                          value={editedCharacter.ability_scores?.[stat] || 10}
                          onChange={(e) => updateField(`ability_scores.${stat}`, parseInt(e.target.value))}
                          className="bg-slate-900 border-slate-600 text-white"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {SKILLS.map(skill => (
                      <div key={skill}>
                        <Label className="text-slate-400 capitalize">{skill}</Label>
                        <Select 
                          value={editedCharacter.skills?.[skill] || 'none'} 
                          onValueChange={(v) => updateField(`skills.${skill}`, v)}
                        >
                          <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="proficient">Proficient</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Combat */}
            <TabsContent value="combat" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-slate-400">Current HP</Label>
                  <Input
                    type="number"
                    value={editedCharacter.current_hp || 0}
                    onChange={(e) => updateField('current_hp', parseInt(e.target.value))}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-400">Max HP</Label>
                  <Input
                    type="number"
                    value={editedCharacter.max_hp || 0}
                    onChange={(e) => updateField('max_hp', parseInt(e.target.value))}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-400">Speed</Label>
                  <Input
                    type="number"
                    value={editedCharacter.speed || 30}
                    onChange={(e) => updateField('speed', parseInt(e.target.value))}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-slate-400">Current SP</Label>
                  <Input
                    type="number"
                    value={editedCharacter.current_sp || 0}
                    onChange={(e) => updateField('current_sp', parseInt(e.target.value))}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-400">Max SP</Label>
                  <Input
                    type="number"
                    value={editedCharacter.max_sp || 0}
                    onChange={(e) => updateField('max_sp', parseInt(e.target.value))}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-400">Toughness Class (TC)</Label>
                  <Input
                    type="number"
                    value={editedCharacter.toughness_class || 10}
                    onChange={(e) => updateField('toughness_class', parseInt(e.target.value))}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Background */}
            <TabsContent value="background" className="space-y-4">
              <div>
                <Label className="text-slate-400">Alignment</Label>
                <Select value={editedCharacter.alignment} onValueChange={(v) => updateField('alignment', v)}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paragon">Paragon</SelectItem>
                    <SelectItem value="guardian">Guardian</SelectItem>
                    <SelectItem value="vigilante">Vigilante</SelectItem>
                    <SelectItem value="sentinel">Sentinel</SelectItem>
                    <SelectItem value="outsider">Outsider</SelectItem>
                    <SelectItem value="wildcard">Wildcard</SelectItem>
                    <SelectItem value="inquisitor">Inquisitor</SelectItem>
                    <SelectItem value="anti_hero">Anti-Hero</SelectItem>
                    <SelectItem value="renegade">Renegade</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-400">Backstory Notes</Label>
                <Textarea
                  value={editedCharacter.backstory_notes || ''}
                  onChange={(e) => updateField('backstory_notes', e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white h-32"
                />
              </div>

              <div>
                <Label className="text-slate-400">Classification Perk</Label>
                <Input
                  value={editedCharacter.classification_perk || ''}
                  onChange={(e) => updateField('classification_perk', e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>

              <div>
                <Label className="text-slate-400">Origin Perk</Label>
                <Input
                  value={editedCharacter.origin_perk || ''}
                  onChange={(e) => updateField('origin_perk', e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>

              <div>
                <Label className="text-slate-400">Alignment Perk</Label>
                <Input
                  value={editedCharacter.alignment_perk || ''}
                  onChange={(e) => updateField('alignment_perk', e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </TabsContent>

            {/* Progression */}
            <TabsContent value="progression" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-400">Current XP</Label>
                  <Input
                    type="number"
                    value={editedCharacter.current_xp || 0}
                    onChange={(e) => updateField('current_xp', parseInt(e.target.value))}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-400">Credits</Label>
                  <Input
                    type="number"
                    value={editedCharacter.gold || 0}
                    onChange={(e) => updateField('gold', parseInt(e.target.value))}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div className="p-4 bg-violet-900/20 border border-violet-500/30 rounded">
                <p className="text-xs text-violet-300">
                  Note: Equipment and Powers should be edited from their dedicated panels in the main character sheet for better management.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="gap-2">
            <Button onClick={handleClose} variant="outline">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-violet-600 hover:bg-violet-700">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exit Confirmation Dialog */}
      <Dialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <DialogContent className="bg-slate-900 border-2 border-orange-500 text-white">
          <DialogHeader>
            <DialogTitle className="text-orange-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Unsaved Changes
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-300">
              You have unsaved changes. Are you sure you want to exit?
            </p>
            <p className="text-sm text-slate-400 mt-2">
              All changes will be discarded and your character will revert to its previous state.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowExitConfirm(false)} variant="outline">
              Keep Editing
            </Button>
            <Button onClick={handleCancel} className="bg-red-600 hover:bg-red-700">
              Discard Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}