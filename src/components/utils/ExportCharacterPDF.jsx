import React from 'react';
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { toast } from "sonner";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function ExportCharacterPDF({ character }) {
  const exportToPDF = async () => {
    try {
      toast.info('Generating PDF...');
      
      // Create a temporary div with character sheet HTML
      const tempDiv = document.createElement('div');
      tempDiv.style.padding = '40px';
      tempDiv.style.background = 'white';
      tempDiv.style.width = '800px';
      tempDiv.innerHTML = `
        <div style="font-family: Arial, sans-serif; color: #000;">
          <h1 style="color: #8b5cf6; margin-bottom: 20px;">${character.name}</h1>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div>
              <strong>Classification:</strong> ${character.classification}<br/>
              <strong>Origin:</strong> ${character.origin_story}<br/>
              <strong>Alignment:</strong> ${character.alignment}<br/>
              <strong>Level:</strong> ${character.level || 1} (Tier ${character.tier})
            </div>
            <div>
              <strong>HP:</strong> ${character.current_hp}/${character.max_hp}<br/>
              <strong>TC:</strong> ${character.toughness_class}<br/>
              <strong>Speed:</strong> ${character.speed}ft<br/>
              <strong>Credits:</strong> ${character.credits || 0}
            </div>
          </div>
          <h3 style="color: #8b5cf6; margin-top: 20px;">Ability Scores</h3>
          <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; margin-bottom: 20px;">
            ${['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map(stat => `
              <div style="border: 1px solid #ccc; padding: 10px; text-align: center;">
                <strong>${stat}</strong><br/>
                ${character.ability_scores?.[stat] || 10}
              </div>
            `).join('')}
          </div>
          <h3 style="color: #8b5cf6; margin-top: 20px;">Powers</h3>
          <ul style="list-style: none; padding: 0;">
            ${(character.powers || []).map(p => `
              <li style="margin-bottom: 10px; border-left: 3px solid #8b5cf6; padding-left: 10px;">
                <strong>${p.name}</strong> (${p.sp_cost} SP)<br/>
                <small>${p.effect}</small>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
      
      document.body.appendChild(tempDiv);
      
      const canvas = await html2canvas(tempDiv);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${character.name}_Character_Sheet.pdf`);
      
      document.body.removeChild(tempDiv);
      toast.success('Character sheet exported!');
      
    } catch (error) {
      console.error('PDF export failed:', error);
      toast.error('Failed to export PDF');
    }
  };

  return (
    <Button
      onClick={exportToPDF}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <FileDown className="h-3 w-3" />
      Export PDF
    </Button>
  );
}