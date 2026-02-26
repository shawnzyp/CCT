import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Save, RotateCcw, Trash2, Edit3, Check, X } from 'lucide-react';
import { useTheme } from '@/components/theme/useTheme';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function ManualSaveSlots({ character, onClose }) {
  const { theme } = useTheme();
  const accentA = theme?.colors?.accentA || '#00E5FF';
  const panel0 = theme?.colors?.panel0 || '#1A1F26';
  const panel1 = theme?.colors?.panel1 || '#202833';
  const text0 = theme?.colors?.text0 || '#E6F1FF';
  const text1 = theme?.colors?.text1 || '#8EA0B5';
  const muted = theme?.colors?.muted || '#5F6E80';

  const qc = useQueryClient();
  const [editingSlot, setEditingSlot] = useState(null);
  const [editLabel, setEditLabel] = useState('');

  const { data: slots = [], isLoading } = useQuery({
    queryKey: ['saveSlots', character?.id],
    queryFn: () => base44.entities.CharacterSaveSlot.filter({ character_id: character.id }),
    enabled: !!character?.id,
  });

  const getSlot = (n) => slots.find(s => s.slot_number === n);

  const saveMut = useMutation({
    mutationFn: ({ num, label }) => {
      const existing = getSlot(num);
      const payload = {
        character_id: character.id,
        character_name: character.name,
        slot_number: num,
        slot_label: label || existing?.slot_label || `Slot ${num}`,
        character_data: { ...character },
        saved_at: new Date().toISOString(),
      };
      return existing
        ? base44.entities.CharacterSaveSlot.update(existing.id, payload)
        : base44.entities.CharacterSaveSlot.create(payload);
    },
    onSuccess: (_, { num }) => {
      qc.invalidateQueries({ queryKey: ['saveSlots', character?.id] });
      window.dispatchEvent(new CustomEvent('appSaved'));
      toast.success(`Saved to Slot ${num}`);
    },
  });

  const loadMut = useMutation({
    mutationFn: (slot) => {
      // Strip meta fields before restoring
      const { id, created_date, updated_date, created_by, ...data } = slot.character_data;
      return base44.entities.Character.update(character.id, data);
    },
    onSuccess: (_, slot) => {
      qc.invalidateQueries({ queryKey: ['characters'] });
      window.dispatchEvent(new CustomEvent('appSaved'));
      toast.success(`Character restored from "${slot.slot_label || `Slot ${slot.slot_number}`}"`);
    },
  });

  const clearMut = useMutation({
    mutationFn: (id) => base44.entities.CharacterSaveSlot.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['saveSlots', character?.id] });
      toast.success('Slot cleared');
    },
  });

  const confirmLoad = (slot) => {
    if (window.confirm(`Restore character from "${slot.slot_label || `Slot ${slot.slot_number}`}"?\nThis will overwrite current character state.`)) {
      loadMut.mutate(slot);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.18 }}
        className="w-full max-w-md rounded-xl border overflow-hidden shadow-2xl"
        style={{ background: panel0, borderColor: `${accentA}30` }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: `${accentA}18` }}
        >
          <div>
            <div className="font-mono font-bold tracking-widest text-xs uppercase" style={{ color: accentA }}>
              Manual Save Slots
            </div>
            <div className="text-[11px] font-mono mt-0.5" style={{ color: muted }}>
              {character?.name} · 5 save slots
            </div>
          </div>
          <button
            onClick={onClose}
            className="cc-sm-target flex items-center justify-center"
            style={{ color: muted }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Slots */}
        <div className="p-4 space-y-2">
          {isLoading ? (
            <div className="text-center py-6 font-mono text-xs" style={{ color: muted }}>Loading slots…</div>
          ) : (
            [1, 2, 3, 4, 5].map(num => {
              const slot = getSlot(num);
              const isEditing = editingSlot === num;

              return (
                <div
                  key={num}
                  className="rounded-lg border flex items-center gap-3 px-3 py-2.5 transition-all"
                  style={{
                    background: slot ? panel1 : `${panel1}50`,
                    borderColor: slot ? `${accentA}22` : `${accentA}08`,
                  }}
                >
                  {/* Slot badge */}
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center font-mono font-bold text-xs flex-shrink-0"
                    style={{
                      background: slot ? `${accentA}18` : `${muted}10`,
                      color: slot ? accentA : muted,
                      border: `1px solid ${slot ? accentA + '30' : muted + '12'}`,
                    }}
                  >
                    {num}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {slot ? (
                      isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            value={editLabel}
                            onChange={e => setEditLabel(e.target.value)}
                            className="flex-1 text-xs font-mono rounded px-2 py-0.5 min-w-0"
                            style={{
                              background: panel0,
                              border: `1px solid ${accentA}40`,
                              color: text0,
                              minHeight: 0,
                            }}
                            autoFocus
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                saveMut.mutate({ num, label: editLabel });
                                setEditingSlot(null);
                              }
                              if (e.key === 'Escape') setEditingSlot(null);
                            }}
                          />
                          <button
                            onClick={() => { saveMut.mutate({ num, label: editLabel }); setEditingSlot(null); }}
                            style={{ color: accentA }}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => setEditingSlot(null)} style={{ color: muted }}>
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-mono font-semibold truncate" style={{ color: text0 }}>
                              {slot.slot_label || `Slot ${num}`}
                            </span>
                            <button
                              onClick={() => { setEditingSlot(num); setEditLabel(slot.slot_label || ''); }}
                              className="cc-sm-target flex items-center justify-center"
                              style={{ color: muted }}
                            >
                              <Edit3 className="h-2.5 w-2.5" />
                            </button>
                          </div>
                          <div className="text-[10px] font-mono" style={{ color: muted }}>
                            Lv {slot.character_data?.level ?? '?'} ·{' '}
                            {slot.character_data?.current_hp ?? '?'}/{slot.character_data?.max_hp ?? '?'} HP ·{' '}
                            {slot.saved_at ? format(new Date(slot.saved_at), 'MMM d, HH:mm') : '—'}
                          </div>
                        </>
                      )
                    ) : (
                      <span className="text-xs font-mono" style={{ color: muted }}>Empty Slot</span>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => saveMut.mutate({ num })}
                      disabled={saveMut.isPending}
                      className="cc-sm-target flex items-center justify-center rounded border transition-opacity hover:opacity-80"
                      style={{
                        background: `${accentA}12`,
                        color: accentA,
                        borderColor: `${accentA}28`,
                        padding: '4px 8px',
                        minHeight: 0,
                      }}
                      title="Save current character here"
                    >
                      <Save className="h-3 w-3" />
                    </button>
                    {slot && (
                      <>
                        <button
                          onClick={() => confirmLoad(slot)}
                          disabled={loadMut.isPending}
                          className="cc-sm-target flex items-center justify-center rounded border transition-opacity hover:opacity-80"
                          style={{
                            background: `${accentA}08`,
                            color: text1,
                            borderColor: `${accentA}18`,
                            padding: '4px 8px',
                            minHeight: 0,
                          }}
                          title="Load this save"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => clearMut.mutate(slot.id)}
                          className="cc-sm-target flex items-center justify-center rounded border transition-opacity hover:opacity-80"
                          style={{
                            background: 'rgba(255,59,59,0.08)',
                            color: '#FF3B3B',
                            borderColor: 'rgba(255,59,59,0.2)',
                            padding: '4px 8px',
                            minHeight: 0,
                          }}
                          title="Clear slot"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="px-5 pb-4 pt-1">
          <p className="text-[10px] font-mono text-center" style={{ color: muted }}>
            💾 Save snapshots · ↺ Restore any saved state · Syncs to ccdc.base44.app in real-time
          </p>
        </div>
      </motion.div>
    </div>
  );
}