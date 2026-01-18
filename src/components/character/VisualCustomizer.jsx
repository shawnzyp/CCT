import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Palette, User, Shirt } from "lucide-react";

const SKIN_TONES = ['#FFDFC4', '#F0D5BE', '#EECEB3', '#E1B899', '#CE967C', '#C68642', '#8D5524', '#624134'];
const HAIR_COLORS = ['#2C1B18', '#59351F', '#A56B46', '#B89778', '#C9A588', '#E6CEA8', '#FFF5E1', '#DC143C', '#9966CC', '#00CED1'];
const EYE_COLORS = ['#8B4513', '#228B22', '#4169E1', '#808080', '#20B2AA', '#9370DB'];
const COSTUME_COLORS = ['#000000', '#FFFFFF', '#FF0000', '#0000FF', '#FFD700', '#800080', '#00FF00', '#FF1493', '#1E90FF', '#FF4500', '#2F4F4F', '#8B0000'];
const BODY_TYPES = ['Athletic', 'Muscular', 'Slim', 'Average', 'Stocky'];
const COSTUME_STYLES = ['Armored', 'Tactical', 'Classic', 'Sleek', 'Rugged', 'Mystical'];
const MASK_STYLES = ['Full Face', 'Half Mask', 'Domino Mask', 'Hood', 'Goggles', 'None'];

export default function VisualCustomizer({ customization = {}, onChange, onClose }) {
  const [data, setData] = useState(customization);
  
  const updateData = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSave = () => {
    onChange(data);
    onClose();
  };
  
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-violet-400" />
            Visual Customization
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="physical" className="space-y-4">
          <TabsList className="bg-slate-800">
            <TabsTrigger value="physical"><User className="h-4 w-4 mr-2" />Physical</TabsTrigger>
            <TabsTrigger value="costume"><Shirt className="h-4 w-4 mr-2" />Costume</TabsTrigger>
          </TabsList>
          
          <TabsContent value="physical" className="space-y-4">
            {/* Skin Tone */}
            <div>
              <Label className="text-slate-300 mb-2 block">Skin Tone</Label>
              <div className="flex flex-wrap gap-2">
                {SKIN_TONES.map(color => (
                  <button
                    key={color}
                    onClick={() => updateData('skin_tone', color)}
                    className={cn(
                      "w-10 h-10 rounded-full border-2 transition-all",
                      data.skin_tone === color ? "border-violet-500 scale-110" : "border-slate-600"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            
            {/* Hair Color */}
            <div>
              <Label className="text-slate-300 mb-2 block">Hair Color</Label>
              <div className="flex flex-wrap gap-2">
                {HAIR_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => updateData('hair_color', color)}
                    className={cn(
                      "w-10 h-10 rounded-full border-2 transition-all",
                      data.hair_color === color ? "border-violet-500 scale-110" : "border-slate-600"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            
            {/* Eye Color */}
            <div>
              <Label className="text-slate-300 mb-2 block">Eye Color</Label>
              <div className="flex flex-wrap gap-2">
                {EYE_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => updateData('eye_color', color)}
                    className={cn(
                      "w-10 h-10 rounded-full border-2 transition-all",
                      data.eye_color === color ? "border-violet-500 scale-110" : "border-slate-600"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            
            {/* Body Type */}
            <div>
              <Label className="text-slate-300 mb-2 block">Body Type</Label>
              <div className="flex flex-wrap gap-2">
                {BODY_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => updateData('body_type', type)}
                    className={cn(
                      "px-4 py-2 rounded-lg border transition-all text-sm",
                      data.body_type === type 
                        ? "border-violet-500 bg-violet-500/20 text-white" 
                        : "border-slate-600 text-slate-400 hover:border-slate-500"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="costume" className="space-y-4">
            {/* Primary Color */}
            <div>
              <Label className="text-slate-300 mb-2 block">Primary Color</Label>
              <div className="flex flex-wrap gap-2">
                {COSTUME_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => updateData('costume_primary_color', color)}
                    className={cn(
                      "w-10 h-10 rounded-lg border-2 transition-all",
                      data.costume_primary_color === color ? "border-violet-500 scale-110" : "border-slate-600"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            
            {/* Secondary Color */}
            <div>
              <Label className="text-slate-300 mb-2 block">Secondary Color</Label>
              <div className="flex flex-wrap gap-2">
                {COSTUME_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => updateData('costume_secondary_color', color)}
                    className={cn(
                      "w-10 h-10 rounded-lg border-2 transition-all",
                      data.costume_secondary_color === color ? "border-violet-500 scale-110" : "border-slate-600"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            
            {/* Costume Style */}
            <div>
              <Label className="text-slate-300 mb-2 block">Costume Style</Label>
              <div className="flex flex-wrap gap-2">
                {COSTUME_STYLES.map(style => (
                  <button
                    key={style}
                    onClick={() => updateData('costume_style', style)}
                    className={cn(
                      "px-4 py-2 rounded-lg border transition-all text-sm",
                      data.costume_style === style 
                        ? "border-violet-500 bg-violet-500/20 text-white" 
                        : "border-slate-600 text-slate-400 hover:border-slate-500"
                    )}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Mask Style */}
            <div>
              <Label className="text-slate-300 mb-2 block">Mask/Headgear</Label>
              <div className="flex flex-wrap gap-2">
                {MASK_STYLES.map(mask => (
                  <button
                    key={mask}
                    onClick={() => updateData('mask_style', mask)}
                    className={cn(
                      "px-4 py-2 rounded-lg border transition-all text-sm",
                      data.mask_style === mask 
                        ? "border-violet-500 bg-violet-500/20 text-white" 
                        : "border-slate-600 text-slate-400 hover:border-slate-500"
                    )}
                  >
                    {mask}
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} className="bg-violet-600 hover:bg-violet-700">Save Customization</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}