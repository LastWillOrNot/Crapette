import React from "react";
import { Button } from "@/components/ui/button";
import { Card as CardType } from "@/lib/game/types";
import { lettersFromSuits } from "@/lib/game/rules";

interface CardZoneProps {
  pile: CardType[];
  onClick: () => void;
  disabled: boolean;
}

export function CardZone({ pile, onClick, disabled }: CardZoneProps) {
  const topCard = pile.length > 0 ? pile[pile.length - 1] : null;
  const imagePath = topCard 
    ? `/cards/${topCard.value}${lettersFromSuits(topCard.suit)}.gif` 
    : `/cards/noCard.gif`;

  return (
    <Button 
      onClick={onClick} 
      disabled={disabled} 
      className="p-0 bg-transparent hover:bg-transparent"
      variant="ghost"
    >
      <img 
        src={imagePath} 
        alt={topCard ? `${topCard.value} de ${topCard.suit}` : "Vide"} 
        className="w-12 h-16 rounded shadow-md" 
      />
    </Button>
  );
}