import React from "react";
//import { CardZone } from "./CardZone";
import { Card, SelectedCardInfo } from "@/lib/game/types";
import { CardZoneList } from "./CardZoneList";

interface SharedPilesAreaProps {
  sharedPiles: Card[][];
  gameWinner: number | null;
  currentlySelectedCard: SelectedCardInfo | null;
  onSelectCard: (source: { type: 'shared'; index: number }) => void;
  onSelectGroupCard: (source: { type: 'shared'; index: number}) => void;
  onAttemptMove: (zone: string, index: number | null, playerTarget: number | null) => void;
  onAttemptGroupMove: (zone: string, index: number | null, playerTarget: number | null) => void;
  
}


export function SharedPilesArea({
  sharedPiles,
  gameWinner,
  currentlySelectedCard,
  onSelectCard,
  onSelectGroupCard,
  onAttemptMove,
  onAttemptGroupMove
}: SharedPilesAreaProps) {
  return (
    <div className="w-full max-w-3xl p-6 my-4 bg-green-300 rounded-lg flex flex-wrap justify-center">
      <div className="grid grid-cols-4 gap-4">
        {sharedPiles.map((pile, index) => (
          <CardZoneList
            key={index}
            title={`Pile ${index + 1}`}
            pile={pile}
            onClick={(cardindex) => {
              if (!currentlySelectedCard) {
                if (cardindex === undefined) {
                  onSelectCard({ type: 'shared', index });
                } else {
                  onSelectGroupCard({ type: 'shared', index });
                }
              } else {
                if (cardindex === undefined) {
                  onAttemptMove('shared', index, null);
                } else {
                  onAttemptGroupMove('shared', index, null);
                }
              }
            }}
            disabled={gameWinner !== null}
          />
        ))}
      </div>
    </div>
  );
}