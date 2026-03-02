import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, User, Coins, Package, Edit } from 'lucide-react';
import { toast } from 'sonner';

export default function NPCAssetManager({ campaign, onUpdate }) {
  const npcAssets = campaign?.npc_assets || [];
  const currencies = campaign?.custom_currencies || [{ id: 'credits', name: 'Credits', symbol: '₵' }];
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', role: '', currency: 'credits', balance: 0, items: '', notes: '' });

  const openNew = () => { setForm({ name: '', role: '', currency: 'credits', balance: 0, items: '', notes: '' }); setEditing(null); setShowDialog(true); };
  const openEdit = (a) => { setForm(a); setEditing(a); setShowDialog(true); };

  const save = () => {
    if (!form.name) return;
    let updated;
    if (editing) {
      updated = npcAssets.map(a => a.id === editing.id ? { ...form, id: editing.id } : a);
    } else {
      updated = [...npcAssets, { ...form, id: `npc_asset_${Date.now()}` }];
    }
    onUpdate({ npc_assets: updated });
    setShowDialog(false);
    toast.success(editing ? 'NPC assets updated' : 'NPC asset record created');
  };

  const remove = (id) => {
    onUpdate({ npc_assets: npcAssets.filter(a => a.id !== id) });
    toast.success('Removed');
  };

  const adjustBalance = (id, currentBalance, name) => {
    const amount = prompt(`Adjust ${name}'s balance (use - for deduction):`);
    if (amount !== null && !isNaN(amount)) {
      const updated = npcAssets.map(a => a.id === id ? { ...a, balance: Math.max(0, (a.balance || 0) + parseInt(amount)) } : a);
      onUpdate({ npc_assets: updated });
      toast.success('Balance updated');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-mono font-semibold text-slate-200 flex items-center gap-2">
          <User className="h-4 w-4 text-violet-400" /> NPC Assets
        </h3>
        <Button size="sm" onClick={openNew} className="bg-violet-600 hover:bg-violet-700 text-white text-xs">
          <Plus className="h-3 w-3 mr-1" /> Add NPC
        </Button>
      </div>

      {npcAssets.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-sm border border-dashed border-slate-700 rounded-lg">
          No NPC asset records yet
        </div>
      ) : (
        <div className="space-y-2">
          {npcAssets.map(npc => {
            const cur = currencies.find(c => c.id === npc.currency) || currencies[0];
            return (
              <div key={npc.id} className="rounded-lg border border-slate-700 bg-slate-800/60 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white truncate">{npc.name}</p>
                      {npc.role && <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-900/50 text-violet-300 border border-violet-700/50">{npc.role}</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm font-mono font-bold text-emerald-400">{cur?.symbol || '₵'} {(npc.balance || 0).toLocaleString()}</span>
                    </div>
                    {npc.items && <p className="text-xs text-slate-400 mt-1 truncate"><Package className="h-3 w-3 inline mr-1" />{npc.items}</p>}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => adjustBalance(npc.id, npc.balance, npc.name)} className="h-7 px-2 text-emerald-400 hover:text-emerald-300 text-xs">
                      <Coins className="h-3 w-3 mr-1" /> Adjust
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => openEdit(npc)} className="h-7 w-7 p-0 text-slate-400 hover:text-white">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(npc.id)} className="h-7 w-7 p-0 text-red-400 hover:text-red-300">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-slate-900 border-slate-600 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-violet-400">{editing ? 'Edit' : 'Add'} NPC Assets</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 uppercase">NPC Name</label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-slate-800 border-slate-600 text-white mt-1" />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase">Role</label>
                <Input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="bg-slate-800 border-slate-600 text-white mt-1" placeholder="e.g., Merchant" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 uppercase">Currency</label>
                <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-md text-sm">
                  {currencies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase">Balance</label>
                <Input type="number" value={form.balance} onChange={e => setForm({ ...form, balance: parseInt(e.target.value) || 0 })} className="bg-slate-800 border-slate-600 text-white mt-1" />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase">Notable Items</label>
              <Input value={form.items} onChange={e => setForm({ ...form, items: e.target.value })} className="bg-slate-800 border-slate-600 text-white mt-1" placeholder="e.g., Mythic Sword, Stolen Ledger" />
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase">Notes</label>
              <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="bg-slate-800 border-slate-600 text-white mt-1 h-16 text-xs" />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 border-slate-600" onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button className="flex-1 bg-violet-600 hover:bg-violet-700" onClick={save} disabled={!form.name}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}