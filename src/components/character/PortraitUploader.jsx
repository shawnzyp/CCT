import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PortraitUploader({ currentUrl, onUpload, size = "lg" }) {
  const [uploading, setUploading] = useState(false);
  
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      onUpload(result.file_url);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };
  
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32"
  };
  
  return (
    <div className="space-y-2">
      <Label className="text-slate-300">Character Portrait</Label>
      <div className="flex items-center gap-4">
        <div className={cn(
          "rounded-xl overflow-hidden bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center",
          sizeClasses[size]
        )}>
          {currentUrl ? (
            <img src={currentUrl} alt="Portrait" className="w-full h-full object-cover" />
          ) : (
            <Upload className="h-8 w-8 text-white/60" />
          )}
        </div>
        
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="portrait-upload"
          />
          <label htmlFor="portrait-upload">
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              className="cursor-pointer"
              asChild
            >
              <span>
                {uploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Upload Portrait
              </span>
            </Button>
          </label>
          <p className="text-xs text-slate-500 mt-1">JPG, PNG up to 5MB</p>
        </div>
      </div>
    </div>
  );
}