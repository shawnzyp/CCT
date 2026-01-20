import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightLeft, Send, X, Check, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function TradingSystem({ campaign, currentCharacter, allCharacters }) {
  const [showCreateTrade, setShowCreateTrade] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState('');
  const [offeredItems, setOfferedItems] = useState([]);
  const [offeredCredits, setOfferedCredits] = useState(0);
  const [requestedItems, setRequestedItems] = useState([]);
  const [requestedCredits, setRequestedCredits] = useState(0);
  const [message, setMessage] = useState('');

  const queryClient = useQueryClient();

  const { data: trades = [] } = useQuery({
    queryKey: ['trades', campaign?.id],
    queryFn: () => base44.entities.TradeOffer.filter({ campaign_id: campaign.id }, '-created_date'),
    enabled: !!campaign
  });

  const createTrade = useMutation({
    mutationFn: (data) => base44.entities.TradeOffer.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['trades']);
      toast.success('Trade offer sent!');
      resetForm();
    }
  });

  const updateTrade = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TradeOffer.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['trades']);
    }
  });

  const resetForm = () => {
    setShowCreateTrade(false);
    setSelectedPartner('');
    setOfferedItems([]);
    setOfferedCredits(0);
    setRequestedItems([]);
    setRequestedCredits(0);
    setMessage('');
  };

  const sendTradeOffer = () => {
    if (!selectedPartner) {
      toast.error('Select a trading partner');
      return;
    }

    const partner = allCharacters.find(c => c.id === selectedPartner);

    createTrade.mutate({
      from_character_id: currentCharacter.id,
      from_character_name: currentCharacter.name,
      to_character_id: selectedPartner,
      to_character_name: partner.name,
      campaign_id: campaign.id,
      offered_items: offeredItems,
      offered_credits: offeredCredits,
      requested_items: requestedItems,
      requested_credits: requestedCredits,
      message,
      status: 'pending',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });
  };

  const acceptTrade = async (trade) => {
    // Execute trade
    const fromChar = allCharacters.find(c => c.id === trade.from_character_id);
    const toChar = allCharacters.find(c => c.id === trade.to_character_id);

    if (toChar.credits < trade.requested_credits) {
      toast.error('Insufficient credits');
      return;
    }

    // Update inventories and credits
    await base44.entities.Character.update(trade.from_character_id, {
      inventory: [...(fromChar.inventory || []).filter(item => !trade.offered_items.find(o => o.name === item.name)), ...trade.requested_items],
      credits: fromChar.credits - trade.offered_credits + trade.requested_credits
    });

    await base44.entities.Character.update(trade.to_character_id, {
      inventory: [...(toChar.inventory || []).filter(item => !trade.requested_items.find(r => r.name === item.name)), ...trade.offered_items],
      credits: toChar.credits + trade.offered_credits - trade.requested_credits
    });

    updateTrade.mutate({ id: trade.id, data: { status: 'accepted' } });
    toast.success('Trade completed!');
  };

  const myTrades = trades.filter(t => 
    t.from_character_id === currentCharacter?.id || t.to_character_id === currentCharacter?.id
  );

  const pendingReceived = myTrades.filter(t => 
    t.to_character_id === currentCharacter?.id && t.status === 'pending'
  );

  const pendingSent = myTrades.filter(t => 
    t.from_character_id === currentCharacter?.id && t.status === 'pending'
  );

  return (
    <div className="space-y-4">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5 text-emerald-400" />
              Player Trading
            </CardTitle>
            <Button
              onClick={() => setShowCreateTrade(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Propose Trade
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Incoming Trades */}
          {pendingReceived.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm text-slate-400 uppercase mb-2">Incoming Offers</h3>
              <div className="space-y-2">
                {pendingReceived.map(trade => (
                  <Card key={trade.id} className="bg-emerald-900/20 border-emerald-500/30">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-white font-semibold">From: {trade.from_character_name}</p>
                          <div className="mt-2 text-sm text-slate-300">
                            <p>Offering: {trade.offered_items.map(i => i.name).join(', ') || 'Nothing'} {trade.offered_credits > 0 && `+ ${trade.offered_credits} credits`}</p>
                            <p>Requesting: {trade.requested_items.map(i => i.name).join(', ') || 'Nothing'} {trade.requested_credits > 0 && `+ ${trade.requested_credits} credits`}</p>
                            {trade.message && <p className="italic mt-1">"{trade.message}"</p>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => acceptTrade(trade)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateTrade.mutate({ id: trade.id, data: { status: 'rejected' } })}
                            className="border-red-500 text-red-400"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Sent Trades */}
          {pendingSent.length > 0 && (
            <div>
              <h3 className="text-sm text-slate-400 uppercase mb-2">Pending Sent Offers</h3>
              <div className="space-y-2">
                {pendingSent.map(trade => (
                  <Card key={trade.id} className="bg-slate-700/50 border-slate-600">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-white font-semibold">To: {trade.to_character_name}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {trade.offered_items.map(i => i.name).join(', ')} + {trade.offered_credits} credits
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateTrade.mutate({ id: trade.id, data: { status: 'cancelled' } })}
                          className="text-red-400"
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Trade Dialog */}
      <Dialog open={showCreateTrade} onOpenChange={setShowCreateTrade}>
        <DialogContent className="bg-slate-900 border-2 border-emerald-500 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-emerald-400">Propose Trade</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 uppercase">Trade With</label>
              <Select value={selectedPartner} onValueChange={setSelectedPartner}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue placeholder="Select character" />
                </SelectTrigger>
                <SelectContent>
                  {allCharacters.filter(c => c.id !== currentCharacter?.id).map(char => (
                    <SelectItem key={char.id} value={char.id}>{char.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-emerald-400 uppercase">You Offer</label>
                <Input
                  type="number"
                  placeholder="Credits"
                  value={offeredCredits}
                  onChange={(e) => setOfferedCredits(parseInt(e.target.value) || 0)}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-orange-400 uppercase">You Request</label>
                <Input
                  type="number"
                  placeholder="Credits"
                  value={requestedCredits}
                  onChange={(e) => setRequestedCredits(parseInt(e.target.value) || 0)}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase">Message (Optional)</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a note to your trade partner..."
                className="bg-slate-800 border-slate-600 text-white h-20"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={resetForm} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={sendTradeOffer} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                <Send className="h-4 w-4 mr-2" />
                Send Offer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}