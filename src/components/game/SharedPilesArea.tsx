import React from "react";
//import { CardZone } from "./CardZone";
import { CardItem, SelectedCardInfo, CardPosition } from "@/lib/game/types";
import { CardZoneList } from "./CardZoneList";

interface SharedPilesAreaProps {
  sharedPiles: CardItem[][];
  gameWinner: number | null;
  currentlySelectedCard: SelectedCardInfo | null;
  onSelectCard: (source: CardPosition) => void;
  onAttemptMove: (target: CardPosition) => void;
}


export function SharedPilesArea({
  sharedPiles,
  gameWinner,
  currentlySelectedCard,
  onSelectCard,
  onAttemptMove
}: SharedPilesAreaProps) {
  return (
    <div className="w-full max-w-3xl p-6 my-4 bg-green-300 rounded-lg flex flex-wrap justify-center">
      <div className="grid grid-cols-4 gap-4">
        {sharedPiles.map((pile, index) => (
          <CardZoneList
            key={index}
            title={`Pile ${index + 1}`}
            pile={pile}
            onClick={(cardIndex) => {
// si aucune carte n'est déjà sélectionnée, alors la carte est sélectionnée
              if (!currentlySelectedCard) {
                  onSelectCard({
                    type:'shared',
                    index: index,
                    cardIndex: cardIndex ?? 0
                  });
              } else {
// sinon, on tente un déplacement
                  onAttemptMove({
                     type: 'shared',
                     index: index,
                     cardIndex: 0
                  });
              }
            }}
            disabled={gameWinner === null}
          />
        ))}
      </div>
    </div>
  );
}