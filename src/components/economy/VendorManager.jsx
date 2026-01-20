import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Store, Plus, Edit, Trash2, Package, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function VendorManager({ campaign, isGM = false }) {
  const [showCreateVendor, setShowCreateVendor] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [vendorForm, setVendorForm] = useState({
    name: '',
    description: '',
    location: '',
    specialty: 'general',
    inventory: [],
    reputation_required: 0
  });

  const queryClient = useQueryClient();

  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors', campaign?.id],
    queryFn: () => base44.entities.VendorNPC.filter({ campaign_id: campaign.id }),
    enabled: !!campaign
  });

  const createVendor = useMutation({
    mutationFn: (data) => base44.entities.VendorNPC.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['vendors']);
      toast.success('Vendor created!');
      resetForm();
    }
  });

  const updateVendor = useMutation({
    mutationFn: ({ id, data }) => base44.entities.VendorNPC.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['vendors']);
      toast.success('Vendor updated!');
    }
  });

  const deleteVendor = useMutation({
    mutationFn: (id) => base44.entities.VendorNPC.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['vendors']);
      toast.success('Vendor removed');
    }
  });

  const resetForm = () => {
    setShowCreateVendor(false);
    setEditingVendor(null);
    setVendorForm({
      name: '',
      description: '',
      location: '',
      specialty: 'general',
      inventory: [],
      reputation_required: 0
    });
  };

  const saveVendor = () => {
    if (!vendorForm.name) {
      toast.error('Enter vendor name');
      return;
    }

    const vendorData = {
      ...vendorForm,
      campaign_id: campaign.id
    };

    if (editingVendor) {
      updateVendor.mutate({ id: editingVendor.id, data: vendorData });
    } else {
      createVendor.mutate(vendorData);
    }
  };

  const addItemToVendor = (item, price, stock) => {
    setVendorForm({
      ...vendorForm,
      inventory: [
        ...vendorForm.inventory,
        { item, price, stock, discount: 0 }
      ]
    });
  };

  return (
    <div className="space-y-4">
      {isGM && (
        <Button
          onClick={() => setShowCreateVendor(true)}
          className="bg-violet-600 hover:bg-violet-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Vendor
        </Button>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {vendors.map(vendor => (
          <Card key={vendor.id} className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-violet-400" />
                  <div>
                    <CardTitle className="text-white">{vendor.name}</CardTitle>
                    <p className="text-xs text-slate-400 mt-1">{vendor.location}</p>
                  </div>
                </div>
                {isGM && (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingVendor(vendor);
                        setVendorForm(vendor);
                        setShowCreateVendor(true);
                      }}
                      className="h-7 text-slate-400"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteVendor.mutate(vendor.id)}
                      className="h-7 text-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-300 mb-3">{vendor.description}</p>
              <Badge className="bg-violet-600 mb-3">{vendor.specialty}</Badge>
              
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {(vendor.inventory || []).map((inv, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                      <div className="flex-1">
                        <p className="text-sm text-white">{inv.item.name}</p>
                        <p className="text-xs text-slate-500">Stock: {inv.stock}</p>
                      </div>
                      <Badge variant="outline" className="text-emerald-400 border-emerald-400">
                        {inv.price} CR
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Vendor Dialog */}
      <Dialog open={showCreateVendor} onOpenChange={setShowCreateVendor}>
        <DialogContent className="bg-slate-900 border-2 border-violet-500 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-violet-400">
              {editingVendor ? 'Edit Vendor' : 'Create Vendor NPC'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 uppercase">Vendor Name</label>
              <Input
                value={vendorForm.name}
                onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                placeholder="e.g., Marcus' Armory"
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase">Description</label>
              <Textarea
                value={vendorForm.description}
                onChange={(e) => setVendorForm({ ...vendorForm, description: e.target.value })}
                placeholder="Describe the vendor..."
                className="bg-slate-800 border-slate-600 text-white h-20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 uppercase">Location</label>
                <Input
                  value={vendorForm.location}
                  onChange={(e) => setVendorForm({ ...vendorForm, location: e.target.value })}
                  placeholder="Where are they?"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase">Specialty</label>
                <Select value={vendorForm.specialty} onValueChange={(v) => setVendorForm({ ...vendorForm, specialty: v })}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weapons">Weapons</SelectItem>
                    <SelectItem value="armor">Armor</SelectItem>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="consumables">Consumables</SelectItem>
                    <SelectItem value="rare_items">Rare Items</SelectItem>
                    <SelectItem value="general">General Goods</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={resetForm} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={saveVendor} className="flex-1 bg-violet-600 hover:bg-violet-700">
                {editingVendor ? 'Update' : 'Create'} Vendor
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}