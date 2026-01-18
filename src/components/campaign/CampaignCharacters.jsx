import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CharacterCard from "@/components/character/CharacterCard";

export default function CampaignCharacters({ campaignId, characters }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Campaign Characters</h2>
        <Link to={createPageUrl(`CreateCharacter?campaign=${campaignId}`)}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Character
          </Button>
        </Link>
      </div>
      
      {characters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters.map(character => (
            <Link key={character.id} to={createPageUrl(`CharacterSheet?id=${character.id}`)}>
              <CharacterCard character={character} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500">
          No characters in this campaign yet
        </div>
      )}
    </div>
  );
}