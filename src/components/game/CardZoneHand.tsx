import React from "react";
import { Button } from "@/components/ui/button";
import { Card as CardType } from "@/lib/game/types";
import { lettersFromSuits } from "@/lib/game/rules";

interface CardZoneHandProps {
  pile: CardType[];
  onClick: () => void;
  disabled: boolean;
  handSelected:boolean;
}

export function CardZoneHand({pile, onClick, disabled, handSelected }: CardZoneHandProps) {
  const topCard = pile.length > 0 ? pile[pile.length - 1] : null;
//  console.log(topCard ? `topCard ${topCard.value} + ${topCard.suit}` : "topCard is null");
  const imagePath = topCard 
    ? `/cards/${topCard.value}${lettersFromSuits(topCard.suit)}.gif` 
    : `/cards/noCard.gif`;
//  console.log (`imagePath ${imagePath}`);
//  console.log(topCard ? `/cards/${topCard.value}${lettersFromSuits(topCard.suit)}.gif` : "No top card available");

// si la main n'est pas sélectionnée

if (!handSelected) {
  return (
    <Button
    onClick={onClick}
    disabled={disabled} 
    className="p-0 bg-transparent hover:bg-transparent"
    variant ="ghost"
    >
        <img src={`/cards/back.gif`} 
        alt={`Vide`}
         className="w-12 h-16 rounded shadow-md" />
    </Button>
  )
}
  else return (
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
  )}




