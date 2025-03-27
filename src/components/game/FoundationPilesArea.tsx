import React from "react";
import { CardZone } from "./CardZone";
import { CardItem, CardPosition } from "@/lib/game/types";

interface FoundationPilesAreaProps {
  sharedFoundationPiles: CardItem[][];
  gameWinner: number | null;
  onAttemptMove: (target: CardPosition) => void;
}

export function FoundationPilesArea({
  sharedFoundationPiles,
  gameWinner,
  onAttemptMove
}: FoundationPilesAreaProps) {
  return (
    <div className="w-full p-4">
      <div className="w-full max-w-3xl p-6 my-4 bg-green-300 rounded-lg flex flex-wrap justify-center">
      <div className="grid grid-cols-4 gap-4">
        {sharedFoundationPiles.map((pile, index) => (
          <CardZone
            key={index}
            pile={pile}
            onClick={() => onAttemptMove({
              type: 'foundation',
              index: index}
            )}
            disabled={gameWinner === null}
          />
        ))}
      </div>
    </div>
    </div>
  );
}

