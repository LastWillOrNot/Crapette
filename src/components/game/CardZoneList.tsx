import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Card as CardType } from "@/lib/game/types";
import { lettersFromSuits } from "@/lib/game/rules";

interface CardZoneListProps {
  title: string;
  pile: CardType[];
  onClick: () => void;
  disabled: boolean;
}

export function CardZoneList({ title, pile, onClick, disabled }: CardZoneListProps) {
  const [isHovered, setIsHovered] = useState(false);
  const topCard = pile.length > 0 ? pile[pile.length - 1] : null;
  const imagePath = topCard ? `/cards/${topCard.value}${lettersFromSuits(topCard.suit)}.gif` : undefined;

  return (
    <Card className="mb-2 text-center p-2 relative">
      <CardContent>{title}: {pile.length} cartes</CardContent>

      <div className="relative"> 
      <Button 
        onClick={onClick} 
        disabled={disabled}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="bg-blue-500 hover:bg-blue-600 text-white"
      >
        {topCard ? (
          <img src={imagePath} alt={`${topCard.value} de ${topCard.suit}`} className="w-12 h-16 rounded shadow-md" />
        ) : (
          "Vide"
        )}
      </Button>
      
      {/* Liste qui apparaît au hover */}
      {isHovered && pile.length > 1 && (
        <div className="absolute z-10 mt-2 w-full max-h-64 overflow-y-auto bg-white shadow-lg rounded-md border border-gray-200">
          {[...pile].reverse().map((card, index) => {
            if (index === 0) {
              return null; // Skip the first card
            }
            const cardImagePath = `/cards/${card.value}${lettersFromSuits(card.suit)}.gif`;
            return (
              <div key={index} className="p-1 hover:bg-gray-100 flex justify-center">
                <img 
                  src={cardImagePath} 
                  alt={`${card.value} de ${card.suit}`} 
                  className="w-12 h-16 rounded shadow-md" 
                />
              </div>
            );
          })}
        </div>
      )}
      </div>
    </Card>
  );
}