import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Coins, Edit } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_CURRENCIES = [
  { id: 'credits', name: 'Credits', symbol: '₵', color: '#00E5FF', exchange_rate: 1 },
];

export default function CurrencyManager({ campaign, onUpdate }) {
  const currencies = campaign?.custom_currencies || DEFAULT_CURRENCIES;
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', symbol: '', color: '#00E5FF', exchange_rate: 1 });

  const openNew = () => { setForm({ name: '', symbol: '', color: '#00E5FF', exchange_rate: 1 }); setEditing(null); setShowDialog(true); };
  const openEdit = (c) => { setForm(c); setEditing(c); setShowDialog(true); };

  const save = () => {
    if (!form.name || !form.symbol) return;
    let updated;
    if (editing) {
      updated = currencies.map(c => c.id === editing.id ? { ...form, id: editing.id } : c);
    } else {
      updated = [...currencies, { ...form, id: `cur_${Date.now()}` }];
    }
    onUpdate({ custom_currencies: updated });
    setShowDialog(false);
    toast.success(editing ? 'Currency updated' : 'Currency created');
  };

  const remove = (id) => {
    if (id === 'credits') return toast.error("Can't delete the base Credits currency");
    onUpdate({ custom_currencies: currencies.filter(c => c.id !== id) });
    toast.success('Currency removed');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-mono font-semibold text-slate-200 flex items-center gap-2">
          <Coins className="h-4 w-4 text-yellow-400" /> Campaign Currencies
        </h3>
        <Button size="sm" onClick={openNew} className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs">
          <Plus className="h-3 w-3 mr-1" /> Add Currency
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {currencies.map(cur => (
          <div key={cur.id} className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold" style={{ color: cur.color }}>{cur.symbol}</span>
              <div>
                <p className="text-sm font-semibold text-white">{cur.name}</p>
                <p className="text-[10px] text-slate-400 font-mono">1 {cur.symbol} = {cur.exchange_rate} ₵</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => openEdit(cur)} className="h-7 w-7 p-0 text-slate-400 hover:text-white">
                <Edit className="h-3 w-3" />
              </Button>
              {cur.id !== 'credits' && (
                <Button size="sm" variant="ghost" onClick={() => remove(cur.id)} className="h-7 w-7 p-0 text-red-400 hover:text-red-300">
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-slate-900 border-slate-600 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-cyan-400">{editing ? 'Edit' : 'Add'} Currency</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 uppercase">Name</label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-slate-800 border-slate-600 text-white mt-1" placeholder="e.g., Gold Pieces" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 uppercase">Symbol</label>
                <Input value={form.symbol} onChange={e => setForm({ ...form, symbol: e.target.value })} className="bg-slate-800 border-slate-600 text-white mt-1" placeholder="e.g., GP" />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase">Exchange Rate (to ₵)</label>
                <Input type="number" value={form.exchange_rate} onChange={e => setForm({ ...form, exchange_rate: parseFloat(e.target.value) })} className="bg-slate-800 border-slate-600 text-white mt-1" />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase">Color</label>
              <div className="flex items-center gap-2 mt-1">
                <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="h-8 w-12 rounded border-0 cursor-pointer bg-transparent" />
                <Input value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="bg-slate-800 border-slate-600 text-white flex-1" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 border-slate-600" onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700" onClick={save} disabled={!form.name || !form.symbol}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}