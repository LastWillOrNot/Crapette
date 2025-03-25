import React from "react";
import { CardZone } from "./CardZone";
import { Card, SelectedCardInfo } from "@/lib/game/types";


interface FoundationPilesAreaProps {
  sharedFoundationPiles: Card[][];
  gameWinner: number | null;
  onAttemptMove: (zone: string, index: number | null, playerTarget: number | null) => void;
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
            title={`Paquet ${index + 1}`}
            pile={pile}
            onClick={() => onAttemptMove('foundation', index, null)}
            disabled={gameWinner !== null}
          />
        ))}
      </div>
    </div>
    </div>
  );
}

