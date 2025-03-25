import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Card as CardType } from "@/lib/game/types";



interface CardZoneProps {
  title: string;
  pile: CardType[];
  onClick: () => void;
  disabled: boolean;
}

export function CardZone({ title, pile, onClick, disabled }: CardZoneProps) {
  return (
    <Card className="mb-2 text-center">
      <CardContent>{title}: {pile.length} cartes</CardContent>
      <Button onClick={onClick} disabled={disabled} className="bg-blue-500 hover:bg-blue-600 text-white">
        {pile.length > 0 ? `${pile[pile.length - 1].value} ${pile[pile.length - 1].suit}` : 'Vide'}
      </Button>
    </Card>
  );
}

