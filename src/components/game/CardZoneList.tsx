import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Card as CardType } from "@/lib/game/types";
import { lettersFromSuits } from "@/lib/game/rules";

interface CardZoneListProps {
  title: string;
  pile: CardType[];
  onClick: (cardIndex?: number) => void; // Modifié pour accepter un index de carte
  disabled: boolean;
}

export function CardZoneList({ title, pile, onClick, disabled }: CardZoneListProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isListVisible, setIsListVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const topCard = pile.length > 0 ? pile[pile.length - 1] : null;
  const imagePath = topCard ? `/cards/${topCard.value}${lettersFromSuits(topCard.suit)}.gif` : undefined;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsHovered(true);
    setIsListVisible(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false);
      setIsListVisible(false);
    }, 300); // Petit délai pour permettre les interactions avec la liste
  };

  const handleCardClick = (cardIndex: number) => {
    onClick(cardIndex); // Passe l'index de la carte sélectionnée
    setIsListVisible(false);
  };

  return (
    <Card className="mb-2 text-center p-2 relative">
      <CardContent>{title}: {pile.length} cartes</CardContent>

      <div 
        ref={containerRef}
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Button 
          onClick={() => onClick()} 
          disabled={disabled}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          {topCard ? (
            <img src={imagePath} alt={`${topCard.value} de ${topCard.suit}`} className="w-12 h-16 rounded shadow-md" />
          ) : (
            "Vide"
          )}
        </Button>
        
        {/* Liste sélectionnable qui apparaît au hover */}
        {isHovered && isListVisible && pile.length > 1 && (
          <div 
            className="absolute z-10 mt-2 w-full max-h-64 overflow-y-auto bg-white shadow-lg rounded-md border border-gray-200"
            onMouseEnter={() => {
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
              }
            }}
            onMouseLeave={handleMouseLeave}
          >
            {[...pile].reverse().map((card, index) => {
              if (index === 0) {
                return null; // Skip the first card
              }
              const cardImagePath = `/cards/${card.value}${lettersFromSuits(card.suit)}.gif`;
              return (
                <div key={index} className="p-1 hover:bg-gray-100 flex justify-center">
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick(pile.length - 1 - index);
                    }} 
                    disabled={disabled}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <img 
                      src={cardImagePath} 
                      alt={`${card.value} de ${card.suit}`} 
                      className="w-12 h-16 rounded shadow-md" 
                    />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}