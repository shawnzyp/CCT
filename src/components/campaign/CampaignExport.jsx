import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";

export default function CampaignExport({ campaign, characters }) {
  const exportCampaign = () => {
    const data = {
      campaign,
      characters,
      exported_at: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${campaign.name.replace(/\s+/g, '_')}_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Campaign exported successfully!');
  };

  const importCampaign = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        // Store in localStorage for review
        localStorage.setItem('campaignImportData', JSON.stringify(data));
        toast.success('Campaign data loaded - review in settings to restore');
      } catch (error) {
        toast.error('Failed to parse campaign file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={exportCampaign}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Download className="h-3 w-3" />
        Export Campaign
      </Button>
      <label>
        <input
          type="file"
          accept=".json"
          onChange={importCampaign}
          className="hidden"
        />
        <Button variant="outline" size="sm" className="gap-2" asChild>
          <span>
            <Upload className="h-3 w-3" />
            Import Backup
          </span>
        </Button>
      </label>
    </div>
  );
}