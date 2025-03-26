import React from "react";
import { CardZone } from "./CardZone";
import { CardZoneHand } from "./CardZoneHand";
import { Player,SelectedCardInfo,  Card, CardSource } from "@/lib/game/types";

interface PlayerAreaProps {
  player: {
    drawPile: Card[];
    hand: Card[];
    discardPile: Card[];
    isActive: boolean;
  };
  playerIndex: number;
  currentPlayer?: number;
  gameWinner: number | null;
  currentlySelectedCard: { card: Card; source: CardSource } | null;
  onSelectCard: (source: CardSource) => void;
  onAttemptMove: (
    targetZone: "foundation" | "shared" | "discard" | "drawPile",
    index: number | null,
    playerTarget: number | null
  ) => void;
}

export function PlayerArea({
  player,
  playerIndex,
  currentPlayer,
  gameWinner,
  currentlySelectedCard,
  onSelectCard,
  onAttemptMove
}: PlayerAreaProps) {
  const isActivePlayer = currentPlayer === playerIndex + 1;
  console.log(`currentlySelectedCard ${currentlySelectedCard}`);

  return (
    <div className={`p-4 rounded-lg w-full max-w-3xl ${player.isActive ? "bg-yellow-300" : "bg-gray-300"}`}>
      <h2 className="text-center font-bold">Joueur {playerIndex + 1}</h2>

      {/* Zone Pioche */}
      <CardZone
//        title="Pioche"
        pile={player.drawPile}
        onClick={() => {
          if (!currentlySelectedCard && player.drawPile.length > 0) {
            onSelectCard({
              type: "player",
              zone: "drawPile",
              playerIndex,
            });
          } else if (currentlySelectedCard) {
            onAttemptMove("drawPile", null, playerIndex + 1);
          }
        }}
        disabled={player.drawPile.length === 0 || gameWinner !== null }
      />

      {/* Zone Main */}
      <CardZoneHand
//        title="Main"
        pile={player.hand}
        onClick={() => {
          if (!currentlySelectedCard && player.hand.length > 0 && isActivePlayer) {
            onSelectCard({
              type: "player",
              zone: "hand",
              playerIndex,
            });
          }
        }}
        disabled={player.hand.length === 0 || gameWinner !== null || !isActivePlayer}
        handSelected={isActivePlayer && currentlySelectedCard !== null}

      />

      {/* Zone Défausse */}
      <CardZone
  //      title="Défausse"
          pile={player.discardPile}
        onClick={() => {
          if (currentlySelectedCard) {
            onAttemptMove("discard", null, playerIndex + 1);
          }
        }}
        disabled={gameWinner !== null}
      />
    </div>
  );
}