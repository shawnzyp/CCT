import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload } from "lucide-react";

export default function CreateCampaignDialog({ onClose }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [logoUrl, setLogoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Campaign.create(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries(['campaigns']);
      navigate(createPageUrl(`CampaignDetail?id=${result.id}`));
    }
  });
  
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setLogoUrl(result.file_url);
    } catch (error) {
      console.error('Failed to upload logo:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      name,
      description,
      status,
      logo_url: logoUrl,
      journal_entries: [],
      world_events: [],
      resources: {}
    });
  };
  
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Campaign Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Rise of the Catalyst"
              className="bg-slate-800 border-slate-700 text-white mt-1"
              required
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief overview of the campaign..."
              className="bg-slate-800 border-slate-700 text-white mt-1 h-20"
            />
          </div>
          <div>
            <Label>Campaign Logo (Optional)</Label>
            <div className="mt-1">
              {logoUrl ? (
                <div className="relative">
                  <img src={logoUrl} alt="Campaign logo" className="w-32 h-32 rounded-lg object-cover border-2 border-slate-700" />
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="absolute top-1 right-1"
                    onClick={() => setLogoUrl('')}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-violet-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  <Upload className="h-5 w-5 text-slate-400" />
                  <span className="text-slate-400">
                    {uploading ? 'Uploading...' : 'Upload Logo'}
                  </span>
                </label>
              )}
            </div>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={!name.trim() || createMutation.isPending}>
              Create Campaign
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}