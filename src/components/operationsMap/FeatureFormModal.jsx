import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { FACTION_COLORS, LAYER_TYPES } from './mapConfig';

const VISIBILITY_OPTIONS = ['player', 'gm', 'hidden'];

export default function FeatureFormModal({ layerKey, coords, existingFeature, onSave, onClose }) {
  const layerDef = LAYER_TYPES.find(l => l.key === layerKey) || {};
  const isPolygon = ['territories', 'fog'].includes(layerKey);

  const [form, setForm] = useState({
    label: existingFeature?.label || '',
    description: existingFeature?.description || '',
    visibility: existingFeature?.visibility || 'player',
    faction: existingFeature?.faction || 'neutral',
    urgency: existingFeature?.urgency || 1,
    control: existingFeature?.control || 50,
    hostility: existingFeature?.hostility || 0,
    eta_minutes: existingFeature?.eta_minutes || null,
  });

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = () => {
    if (!form.label.trim()) return;
    const id = existingFeature?.id || `${layerKey}_${Date.now()}`;
    const feature = {
      id,
      type: layerKey,
      label: form.label,
      description: form.description,
      visibility: form.visibility,
      faction: form.faction,
      coords: existingFeature?.coords || coords,
      metadata: {
        urgency: Number(form.urgency),
        control: Number(form.control),
        hostility: Number(form.hostility),
        eta_minutes: form.eta_minutes ? Number(form.eta_minutes) : null,
        created_at: existingFeature?.metadata?.created_at || new Date().toISOString(),
      }
    };
    onSave(feature);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-slate-900 border border-violet-500/30 rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-lg">{layerDef.icon}</span>
            <span className="font-semibold text-white">
              {existingFeature ? 'Edit' : 'Place'} {layerDef.label?.replace(/s$/, '')}
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider">Label *</label>
            <Input
              value={form.label}
              onChange={e => set('label', e.target.value)}
              placeholder={`${layerDef.label} name...`}
              className="mt-1 bg-slate-800 border-slate-600 text-white"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider">Description</label>
            <Input
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Optional details..."
              className="mt-1 bg-slate-800 border-slate-600 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider">Visibility</label>
              <select
                value={form.visibility}
                onChange={e => set('visibility', e.target.value)}
                className="mt-1 w-full bg-slate-800 border border-slate-600 text-white rounded-md px-3 py-2 text-sm"
              >
                {VISIBILITY_OPTIONS.map(v => (
                  <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider">Faction</label>
              <select
                value={form.faction}
                onChange={e => set('faction', e.target.value)}
                className="mt-1 w-full bg-slate-800 border border-slate-600 text-white rounded-md px-3 py-2 text-sm"
              >
                {Object.keys(FACTION_COLORS).map(f => (
                  <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {layerKey === 'sos' && (
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider">Urgency (1–5)</label>
              <input
                type="range" min={1} max={5} step={1}
                value={form.urgency}
                onChange={e => set('urgency', e.target.value)}
                className="mt-1 w-full accent-red-500"
              />
              <div className="text-center text-sm font-bold text-red-400">{form.urgency}</div>
            </div>
          )}

          {layerKey === 'drops' && (
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider">ETA (minutes)</label>
              <Input
                type="number" min={0}
                value={form.eta_minutes || ''}
                onChange={e => set('eta_minutes', e.target.value)}
                placeholder="Leave blank if arrived"
                className="mt-1 bg-slate-800 border-slate-600 text-white"
              />
            </div>
          )}

          {isPolygon && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider">Control %</label>
                <input
                  type="range" min={0} max={100}
                  value={form.control}
                  onChange={e => set('control', e.target.value)}
                  className="mt-1 w-full accent-violet-500"
                />
                <div className="text-center text-xs text-slate-400">{form.control}%</div>
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider">Hostility %</label>
                <input
                  type="range" min={0} max={100}
                  value={form.hostility}
                  onChange={e => set('hostility', e.target.value)}
                  className="mt-1 w-full accent-red-500"
                />
                <div className="text-center text-xs text-slate-400">{form.hostility}%</div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 p-4 border-t border-slate-700">
          <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={!form.label.trim()}
            className="flex-1 bg-violet-600 hover:bg-violet-700"
          >
            {existingFeature ? 'Update' : 'Place Feature'}
          </Button>
        </div>
      </div>
    </div>
  );
}