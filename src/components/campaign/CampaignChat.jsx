import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Dice6, Megaphone, Lock, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import moment from 'moment';

export default function CampaignChat({ campaign, currentUser, myCharacter, characters, isDM, onUpdate }) {
  const [activeTab, setActiveTab] = useState('party');
  const [message, setMessage] = useState('');
  const [diceRoll, setDiceRoll] = useState('');
  const [recipient, setRecipient] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [campaign.messages]);

  const messages = campaign.messages || [];
  
  const partyMessages = messages.filter(m => m.type === 'party');
  const dmMessages = messages.filter(m => m.type === 'dm' && (
    isDM || m.from === currentUser?.email || m.to === currentUser?.email
  ));
  const announcements = messages.filter(m => m.type === 'announcement');

  const handleSendMessage = (type = 'party', specialData = null) => {
    if (!message.trim() && !specialData) return;

    const newMessage = {
      id: Date.now().toString(),
      type,
      from: currentUser?.email,
      from_character: myCharacter?.name,
      to: type === 'dm' ? recipient : null,
      content: message,
      timestamp: new Date().toISOString(),
      ...specialData
    };

    const updatedMessages = [...messages, newMessage];
    onUpdate({ messages: updatedMessages });
    setMessage('');
    setDiceRoll('');
  };

  const rollDice = () => {
    if (!diceRoll) return;
    
    const match = diceRoll.match(/(\d+)d(\d+)([+-]\d+)?/i);
    if (!match) return;

    const [_, count, sides, modifier] = match;
    const rolls = [];
    let total = 0;
    
    for (let i = 0; i < parseInt(count); i++) {
      const roll = Math.floor(Math.random() * parseInt(sides)) + 1;
      rolls.push(roll);
      total += roll;
    }
    
    if (modifier) {
      total += parseInt(modifier);
    }

    const rollData = {
      is_dice_roll: true,
      dice_notation: diceRoll,
      rolls,
      total,
      modifier: modifier || '+0'
    };

    handleSendMessage(activeTab, rollData);
  };

  const sendAnnouncement = () => {
    if (!message.trim()) return;
    handleSendMessage('announcement');
  };

  const renderMessage = (msg) => {
    const isOwn = msg.from === currentUser?.email;
    const characterName = msg.from_character || 'Unknown';
    
    return (
      <div key={msg.id} className={cn("mb-3", isOwn && "flex justify-end")}>
        <div className={cn(
          "max-w-[80%] rounded-lg p-3",
          isOwn ? "bg-violet-600" : "bg-slate-700"
        )}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-white">{characterName}</span>
            {msg.type === 'dm' && <Lock className="h-3 w-3 text-amber-400" />}
            <span className="text-[10px] text-slate-300">
              {moment(msg.timestamp).fromNow()}
            </span>
          </div>
          
          {msg.is_dice_roll ? (
            <div className="bg-slate-900/50 rounded p-2">
              <div className="flex items-center gap-2 mb-1">
                <Dice6 className="h-4 w-4 text-violet-400" />
                <span className="text-sm font-bold text-white">{msg.dice_notation}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-400">Rolls:</span>
                {msg.rolls.map((r, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {r}
                  </Badge>
                ))}
                {msg.modifier !== '+0' && (
                  <Badge className="text-xs bg-blue-500">{msg.modifier}</Badge>
                )}
              </div>
              <div className="mt-2 text-xl font-bold text-violet-400">
                Total: {msg.total}
              </div>
            </div>
          ) : (
            <p className="text-sm text-white whitespace-pre-wrap">{msg.content}</p>
          )}
        </div>
      </div>
    );
  };

  const renderAnnouncement = (msg) => (
    <div key={msg.id} className="mb-3">
      <div className="bg-amber-500/20 border border-amber-500/50 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <Megaphone className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-bold text-amber-400 uppercase">Announcement</span>
          <span className="text-[10px] text-slate-400">
            {moment(msg.timestamp).fromNow()}
          </span>
        </div>
        <p className="text-sm text-white font-medium">{msg.content}</p>
      </div>
    </div>
  );

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Users className="h-5 w-5" />
          Campaign Chat
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="party">Party Chat</TabsTrigger>
            <TabsTrigger value="dm">
              DM Messages
              {isDM && <Badge className="ml-2 h-4 text-[10px]">DM</Badge>}
            </TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
          </TabsList>

          <TabsContent value="party" className="space-y-4">
            <div className="h-96 overflow-y-auto bg-slate-900/50 rounded-lg p-3 space-y-2">
              {partyMessages.map(renderMessage)}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="bg-slate-700 border-slate-600 text-white"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage('party')}
                />
                <Button onClick={() => handleSendMessage('party')} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Input
                  value={diceRoll}
                  onChange={(e) => setDiceRoll(e.target.value)}
                  placeholder="Dice (e.g., 1d20+5)"
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Button onClick={rollDice} variant="outline" size="icon">
                  <Dice6 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="dm" className="space-y-4">
            <div className="h-96 overflow-y-auto bg-slate-900/50 rounded-lg p-3 space-y-2">
              {dmMessages.map(renderMessage)}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="space-y-2">
              {isDM && (
                <Select value={recipient} onValueChange={setRecipient}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select player..." />
                  </SelectTrigger>
                  <SelectContent>
                    {characters.map(char => (
                      <SelectItem key={char.id} value={char.created_by}>
                        {char.name} ({char.created_by})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Private message..."
                  className="bg-slate-700 border-slate-600 text-white"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage('dm')}
                  disabled={isDM && !recipient}
                />
                <Button 
                  onClick={() => handleSendMessage('dm')} 
                  size="icon"
                  disabled={isDM && !recipient}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="announcements" className="space-y-4">
            <div className="h-96 overflow-y-auto bg-slate-900/50 rounded-lg p-3 space-y-2">
              {announcements.map(renderAnnouncement)}
              <div ref={messagesEndRef} />
            </div>
            
            {isDM && (
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type announcement..."
                  className="bg-slate-700 border-slate-600 text-white"
                  onKeyPress={(e) => e.key === 'Enter' && sendAnnouncement()}
                />
                <Button onClick={sendAnnouncement} className="gap-2 bg-amber-600 hover:bg-amber-700">
                  <Megaphone className="h-4 w-4" />
                  Post
                </Button>
              </div>
            )}
            {!isDM && announcements.length === 0 && (
              <p className="text-center text-slate-400 py-8">No announcements yet</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}