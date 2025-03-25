import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Card as CardType } from "@/lib/game/types";
import { lettersFromSuits } from "@/lib/game/rules";

interface CardZoneHandProps {
  title: string;
  pile: CardType[];
  onClick: () => void;
  disabled: boolean;
  selected: boolean;
}

export function CardZoneHand({ title, pile, onClick, disabled, selected }: CardZoneHandProps) {
  const topCard = pile.length > 0 ? pile[pile.length - 1] : null;
//  console.log(topCard ? `topCard ${topCard.value} + ${topCard.suit}` : "topCard is null");
  const imagePath = topCard ? `/cards/${topCard.value}${lettersFromSuits(topCard.suit)}.gif` : undefined;
//  console.log (`imagePath ${imagePath}`);
//  console.log(topCard ? `/cards/${topCard.value}${lettersFromSuits(topCard.suit)}.gif` : "No top card available");
  if (pile.length === 0 || topCard === null) {
    return (
      <Card className="mb-2 text-center p-2">
      <CardContent>{title}: {pile.length} cartes</CardContent>
      <Button onClick={onClick} disabled={disabled} className="bg-blue-500 hover:bg-blue-600 text-white">
          <img src={`/cards/noCard.gif`} alt={`Vide`} className="w-12 h-16 rounded shadow-md" />
      </Button>
      </Card>
    )
  }
    else if (!selected) {return (
    <Card className="mb-2 text-center p-2">
      <CardContent>{title}: {pile.length} cartes</CardContent>
      <Button onClick={onClick} disabled={disabled} className="bg-blue-500 hover:bg-blue-600 text-white">
          <img src={`/cards/back.gif`} alt={`Carte?`} className="w-12 h-16 rounded shadow-md" />
      </Button>
      </Card>)}
else {return (
    <Card className="mb-2 text-center p-2">
      <CardContent>{title}: {pile.length} cartes</CardContent>
      <Button onClick={onClick} disabled={disabled} className="bg-blue-500 hover:bg-blue-600 text-white">
          <img src={imagePath} alt={`${topCard.value} de ${topCard.suit}`} className="w-12 h-16 rounded shadow-md" />
      </Button>
    </Card>
  );
}}

