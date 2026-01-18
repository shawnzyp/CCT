import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, Upload, FileJson } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

export default function ImportExportCharacter({ character, onImport }) {
  const fileInputRef = useRef(null);

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(character, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${character.name.replace(/\s+/g, '_')}_character.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Character exported as JSON');
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Title
    doc.setFontSize(20);
    doc.text(character.name, pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // Secret Identity
    doc.setFontSize(12);
    doc.text(`Secret Identity: ${character.secret_identity || 'Unknown'}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Basic Info
    doc.setFontSize(14);
    doc.text('Character Information', 20, yPos);
    yPos += 8;
    doc.setFontSize(10);
    doc.text(`Level: ${character.level} | Tier: ${character.tier} | XP: ${character.current_xp}`, 20, yPos);
    yPos += 6;
    doc.text(`Classification: ${character.classification} | Origin: ${character.origin_story}`, 20, yPos);
    yPos += 6;
    doc.text(`Alignment: ${character.alignment}`, 20, yPos);
    yPos += 10;

    // Ability Scores
    doc.setFontSize(14);
    doc.text('Ability Scores', 20, yPos);
    yPos += 8;
    doc.setFontSize(10);
    const scores = character.ability_scores || {};
    doc.text(`STR: ${scores.STR || 10} | DEX: ${scores.DEX || 10} | CON: ${scores.CON || 10}`, 20, yPos);
    yPos += 6;
    doc.text(`INT: ${scores.INT || 10} | WIS: ${scores.WIS || 10} | CHA: ${scores.CHA || 10}`, 20, yPos);
    yPos += 10;

    // Combat Stats
    doc.setFontSize(14);
    doc.text('Combat Stats', 20, yPos);
    yPos += 8;
    doc.setFontSize(10);
    doc.text(`HP: ${character.current_hp}/${character.max_hp} | TC: ${character.toughness_class}`, 20, yPos);
    yPos += 6;
    doc.text(`Speed: ${character.speed || 30} ft | Initiative: +${character.initiative_modifier || 0}`, 20, yPos);
    yPos += 10;

    // Powers
    if (character.powers && character.powers.length > 0) {
      doc.setFontSize(14);
      doc.text('Powers', 20, yPos);
      yPos += 8;
      doc.setFontSize(10);
      
      character.powers.forEach((power, index) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        const powerText = `${power.name} (${power.sp_cost} SP) - ${power.range}`;
        doc.text(powerText, 20, yPos);
        yPos += 6;
        if (power.description) {
          const lines = doc.splitTextToSize(power.description, pageWidth - 40);
          doc.text(lines, 25, yPos);
          yPos += lines.length * 5 + 3;
        }
      });
    }

    // Save PDF
    doc.save(`${character.name.replace(/\s+/g, '_')}_character.pdf`);
    toast.success('Character exported as PDF');
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        // Remove system fields that shouldn't be imported
        const { id, created_date, updated_date, created_by, ...characterData } = imported;
        onImport(characterData);
        toast.success('Character imported successfully');
      } catch (error) {
        toast.error('Invalid character file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-violet-500 text-violet-400 hover:bg-violet-500/20 gap-2">
          <FileJson className="h-4 w-4" />
          Import/Export
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Import/Export Character</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Button
            onClick={handleExportJSON}
            className="w-full bg-violet-600 hover:bg-violet-700 gap-2 justify-start"
          >
            <Download className="h-4 w-4" />
            Export as JSON
          </Button>
          <Button
            onClick={handleExportPDF}
            className="w-full bg-blue-600 hover:bg-blue-700 gap-2 justify-start"
          >
            <Download className="h-4 w-4" />
            Export as PDF
          </Button>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full border-violet-500 text-violet-400 hover:bg-violet-500/20 gap-2 justify-start"
            >
              <Upload className="h-4 w-4" />
              Import from JSON
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}