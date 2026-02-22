import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Package, Search, Filter, SortAsc, Trash2, Plus, 
  Pencil, Weight, AlertTriangle, Check, ChevronDown, ChevronUp, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const DEFAULT_CATEGORIES = ['Weapons', 'Armor', 'Consumables', 'Utility', 'Tech', 'Quest Items', 'Misc'];

const CATEGORY_COLORS = {
  'Weapons': 'border-red-500/50 text-red-300 bg-red-950/20',
  'Armor': 'border-blue-500/50 text-blue-300 bg-blue-950/20',
  'Consumables': 'border-green-500/50 text-green-300 bg-green-950/20',
  'Utility': 'border-yellow-500/50 text-yellow-300 bg-yellow-950/20',
  'Tech': 'border-cyan-500/50 text-cyan-300 bg-cyan-950/20',
  'Quest Items': 'border-violet-500/50 text-violet-300 bg-violet-950/20',
  'Misc': 'border-slate-500/50 text-slate-300 bg-slate-800/50',
};

const emptyItem = () => ({
  id: Date.now().toString(),
  name: '',
  quantity: 1,
  weight: 0,
  category: 'Misc',
  description: '',
  equipped: false,
});

function ItemForm({ item, categories, onSave, onClose }) {
  const [form, setForm] = useState(item || emptyItem());
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.name.trim()) { toast.error('Item name is required'); return; }
    onSave({ ...form, quantity: Number(form.quantity) || 1, weight: parseFloat(form.weight) || 0 });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1 block">Item Name *</label>
          <Input value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="Item name..." className="bg-slate-900 border-slate-600 text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1 block">Quantity</label>
          <Input type="number" min="1" value={form.quantity} onChange={e => set('quantity', e.target.value)}
            className="bg-slate-900 border-slate-600 text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1 block">Weight (lbs)</label>
          <Input type="number" min="0" step="0.1" value={form.weight} onChange={e => set('weight', e.target.value)}
            className="bg-slate-900 border-slate-600 text-white" />
        </div>
        <div className="col-span-2">
          <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1 block">Category</label>
          <Select value={form.category} onValueChange={v => set('category', v)}>
            <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2">
          <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1 block">Description</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
            rows={3} placeholder="Item description, effects, notes..."
            className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500" />
        </div>
        <div className="col-span-2 flex items-center gap-3">
          <button onClick={() => set('equipped', !form.equipped)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all",
              form.equipped 
                ? "border-violet-500 bg-violet-500/20 text-violet-300" 
                : "border-slate-600 bg-slate-800 text-slate-400"
            )}>
            {form.equipped && <Check className="h-4 w-4" />}
            {form.equipped ? 'Equipped' : 'Not Equipped'}
          </button>
          <span className="text-xs text-slate-500">Toggle to mark item as actively equipped</span>
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-2 border-t border-slate-700">
        <Button variant="ghost" onClick={onClose} className="text-slate-400">Cancel</Button>
        <Button onClick={handleSave} className="bg-violet-600 hover:bg-violet-700">
          {item?.id ? 'Update Item' : 'Add Item'}
        </Button>
      </div>
    </div>
  );
}

function InventoryItem({ item, onEdit, onDelete, onToggleEquip, onQtyChange }) {
  const [expanded, setExpanded] = useState(false);
  const catColor = CATEGORY_COLORS[item.category] || CATEGORY_COLORS['Misc'];

  return (
    <div className={cn(
      "rounded-lg border transition-all",
      item.equipped ? "border-violet-500/50 bg-violet-950/20" : "border-slate-700 bg-slate-800/50"
    )}>
      <div className="flex items-center gap-2 p-3">
        {/* Equip toggle */}
        <button onClick={() => onToggleEquip(item)}
          className={cn(
            "w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all",
            item.equipped ? "border-violet-400 bg-violet-500" : "border-slate-600 hover:border-violet-500/50"
          )}>
          {item.equipped && <Check className="h-3 w-3 text-white" />}
        </button>

        {/* Item info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("font-semibold text-sm", item.equipped ? "text-violet-200" : "text-white")}>
              {item.name}
            </span>
            <Badge className={cn("text-[10px] px-1.5 py-0", catColor)}>{item.category}</Badge>
            {item.equipped && <Badge className="text-[10px] px-1.5 py-0 bg-violet-600 text-white border-0">Equipped</Badge>}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-slate-400">
              {item.weight > 0 ? `${(item.weight * item.quantity).toFixed(1)} lbs total` : 'No weight'}
            </span>
          </div>
        </div>

        {/* Quantity control */}
        <div className="flex items-center gap-1">
          <button onClick={() => onQtyChange(item, -1)}
            className="h-6 w-6 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold flex items-center justify-center">
            −
          </button>
          <span className="text-white font-mono text-sm w-6 text-center">{item.quantity}</span>
          <button onClick={() => onQtyChange(item, 1)}
            className="h-6 w-6 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold flex items-center justify-center">
            +
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-1">
          {item.description && (
            <button onClick={() => setExpanded(!expanded)}
              className="h-7 w-7 rounded text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center">
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          )}
          <button onClick={() => onEdit(item)}
            className="h-7 w-7 rounded text-slate-400 hover:text-violet-300 hover:bg-violet-500/20 flex items-center justify-center">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => onDelete(item)}
            className="h-7 w-7 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/20 flex items-center justify-center">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {expanded && item.description && (
        <div className="px-4 pb-3 pt-0 border-t border-slate-700/50">
          <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
        </div>
      )}
    </div>
  );
}

export default function EnhancedInventorySystem({ character, onUpdate }) {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterEquipped, setFilterEquipped] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const inventory = character.inventory || [];
  const inventoryMeta = character.inventoryMeta || {};
  const customCategories = inventoryMeta.customCategories || [];
  const carryCapacity = inventoryMeta.carryCapacity || 0;
  const allCategories = [...DEFAULT_CATEGORIES, ...customCategories];

  const totalWeight = useMemo(() =>
    inventory.reduce((sum, item) => sum + ((parseFloat(item.weight) || 0) * (parseInt(item.quantity) || 1)), 0),
  [inventory]);

  const overEncumbered = carryCapacity > 0 && totalWeight > carryCapacity;

  const filtered = useMemo(() => {
    return inventory
      .filter(item => {
        const matchSearch = !search || 
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          (item.description || '').toLowerCase().includes(search.toLowerCase());
        const matchCat = filterCategory === 'all' || item.category === filterCategory;
        const matchEquip = filterEquipped === 'all' || 
          (filterEquipped === 'equipped' && item.equipped) ||
          (filterEquipped === 'unequipped' && !item.equipped);
        return matchSearch && matchCat && matchEquip;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'category') return (a.category || '').localeCompare(b.category || '');
        if (sortBy === 'weight') return ((b.weight || 0) * (b.quantity || 1)) - ((a.weight || 0) * (a.quantity || 1));
        if (sortBy === 'quantity') return (b.quantity || 0) - (a.quantity || 0);
        return 0;
      });
  }, [inventory, search, filterCategory, filterEquipped, sortBy]);

  const saveInventory = (newInventory, newMeta) => {
    onUpdate({ 
      inventory: newInventory,
      ...(newMeta ? { inventoryMeta: newMeta } : {})
    });
  };

  const handleSaveItem = (itemData) => {
    let newInventory;
    if (editingItem) {
      newInventory = inventory.map(i => i.id === editingItem.id ? { ...itemData, id: editingItem.id } : i);
      toast.success('Item updated');
    } else {
      newInventory = [...inventory, { ...itemData, id: Date.now().toString() }];
      toast.success('Item added');
    }
    saveInventory(newInventory);
    setShowAddModal(false);
    setEditingItem(null);
  };

  const handleDelete = (item) => {
    saveInventory(inventory.filter(i => i.id !== item.id));
    toast.success(`${item.name} removed`);
  };

  const handleToggleEquip = (item) => {
    saveInventory(inventory.map(i => i.id === item.id ? { ...i, equipped: !i.equipped } : i));
  };

  const handleQtyChange = (item, delta) => {
    const newQty = Math.max(1, (item.quantity || 1) + delta);
    saveInventory(inventory.map(i => i.id === item.id ? { ...i, quantity: newQty } : i));
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setShowAddModal(true);
  };

  const equippedCount = inventory.filter(i => i.equipped).length;

  return (
    <div className="space-y-4">
      {/* Weight Summary Bar */}
      <div className={cn("rounded-xl p-4 flex flex-wrap items-center gap-4 hud-panel", overEncumbered && "hud-panel-danger")}
        style={overEncumbered ? {} : { borderColor: 'rgba(0,212,255,0.2)' }}>
        <div className="flex items-center gap-2">
          <Weight className={cn("h-5 w-5", overEncumbered ? "text-red-400" : "text-violet-400")} />
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider">Carry Weight</div>
            <div className={cn("text-xl font-bold font-mono", overEncumbered ? "text-red-300" : "text-white")}>
              {totalWeight.toFixed(1)}
              {carryCapacity > 0 && <span className="text-sm text-slate-400 font-normal"> / {carryCapacity} lbs</span>}
              {carryCapacity === 0 && <span className="text-sm text-slate-400 font-normal"> lbs</span>}
            </div>
          </div>
        </div>
        {overEncumbered && (
          <div className="flex items-center gap-1.5 text-red-400 text-sm font-semibold">
            <AlertTriangle className="h-4 w-4" />
            Encumbered
          </div>
        )}
        <div className="ml-auto flex items-center gap-4 text-sm text-slate-400">
          <span><span className="text-white font-semibold">{inventory.length}</span> items</span>
          <span><span className="text-violet-300 font-semibold">{equippedCount}</span> equipped</span>
        </div>
        {carryCapacity > 0 && (
          <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className={cn("h-full rounded-full transition-all", overEncumbered ? "bg-red-500" : "bg-violet-500")}
              style={{ width: `${Math.min(100, (totalWeight / carryCapacity) * 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search items..." className="pl-10 bg-slate-800 border-slate-600 text-white" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[140px] bg-slate-800 border-slate-600 text-white">
            <Filter className="h-3.5 w-3.5 mr-1.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {allCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterEquipped} onValueChange={setFilterEquipped}>
          <SelectTrigger className="w-[130px] bg-slate-800 border-slate-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Items</SelectItem>
            <SelectItem value="equipped">Equipped</SelectItem>
            <SelectItem value="unequipped">Unequipped</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[130px] bg-slate-800 border-slate-600 text-white">
            <SortAsc className="h-3.5 w-3.5 mr-1.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name A–Z</SelectItem>
            <SelectItem value="category">Category</SelectItem>
            <SelectItem value="weight">Weight</SelectItem>
            <SelectItem value="quantity">Quantity</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => { setEditingItem(null); setShowAddModal(true); }}
          className="bg-violet-600 hover:bg-violet-700 gap-1.5">
          <Plus className="h-4 w-4" /> Add Item
        </Button>
      </div>

      {/* Items List */}
      <ScrollArea className="h-[55vh] pr-1">
        {filtered.length > 0 ? (
          <div className="space-y-2">
            {filtered.map(item => (
              <InventoryItem
                key={item.id}
                item={item}
                onEdit={openEdit}
                onDelete={handleDelete}
                onToggleEquip={handleToggleEquip}
                onQtyChange={handleQtyChange}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-500">
            <Package className="h-12 w-12 mx-auto mb-3 text-slate-600" />
            <p className="font-medium">{search || filterCategory !== 'all' ? 'No items match your filters' : 'No items yet'}</p>
            {!search && filterCategory === 'all' && (
              <Button onClick={() => setShowAddModal(true)} variant="outline"
                className="mt-4 border-violet-500 text-violet-400">
                Add Your First Item
              </Button>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Add / Edit Modal */}
      <Dialog open={showAddModal} onOpenChange={(v) => { if (!v) { setShowAddModal(false); setEditingItem(null); } }}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Package className="h-5 w-5 text-violet-400" />
              {editingItem ? 'Edit Item' : 'Add Item'}
            </DialogTitle>
          </DialogHeader>
          <ItemForm
            item={editingItem}
            categories={allCategories}
            onSave={handleSaveItem}
            onClose={() => { setShowAddModal(false); setEditingItem(null); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}