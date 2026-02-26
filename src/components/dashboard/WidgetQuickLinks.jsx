import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Swords, BookOpen, Dices, Map, DollarSign, Scroll, Settings, User } from 'lucide-react';

const LINKS = [
  { icon: Swords,    label: 'Character Sheet', page: 'Home' },
  { icon: BookOpen,  label: 'Campaigns',       page: 'Campaigns' },
  { icon: Dices,     label: 'Dice Roller',      page: 'DiceRoller' },
  { icon: Map,       label: 'Ops Map',          page: 'OperationsMap' },
  { icon: DollarSign,label: 'Economy',          page: 'Economy' },
  { icon: Scroll,    label: 'Rules',            page: 'Rules' },
  { icon: Settings,  label: 'Settings',         page: 'Settings' },
];

export default function WidgetQuickLinks({ accentA, panel1, text1, muted }) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {LINKS.map(l => (
        <Link key={l.page} to={createPageUrl(l.page)}>
          <div
            className="flex items-center gap-2 rounded px-2.5 py-2 transition-all hover:opacity-80"
            style={{ background: panel1, borderLeft: `2px solid ${accentA}50` }}
          >
            <l.icon className="h-3.5 w-3.5 flex-shrink-0" style={{ color: accentA }} />
            <span className="text-[10px] font-mono truncate" style={{ color: text1 }}>{l.label}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}