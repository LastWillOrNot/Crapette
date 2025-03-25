import React from "react";
import { CardZone } from "./CardZone";
import { Player,SelectedCardInfo,  Card, CardSource } from "@/lib/game/types";

interface PlayerAreaProps {
  player: {
    drawPile: Card[];
    hand: Card[];
    discardPile: Card[];
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

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl mb-2">Joueur {playerIndex + 1}</h2>

      {/* Zone Pioche */}
      <CardZone
        title="Pioche"
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
      <CardZone
        title="Main"
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
      />

      {/* Zone Défausse */}
      <CardZone
        title="Défausse"
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