import React from "react";
import { CardZone } from "./CardZone";
import { CardZoneHand } from "./CardZoneHand";
import { CardItem, CardPosition,SelectedCardInfo } from "@/lib/game/types";

interface PlayerAreaProps {
  player: {
    drawPile: CardItem[];
    hand: CardItem[];
    discardPile: CardItem[];
    isActive: boolean;
  };
  playerIndex: number;
  currentPlayer?: number;
  gameWinner: number;
  currentlySelectedCard: SelectedCardInfo | null;
  onSelectCard: (source: CardPosition) => void;
  onAttemptMove: (target: CardPosition) => void;
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
            onAttemptMove({ 
              type: 'player',
              zone: 'drawPile',
              playerIndex: playerIndex 
            });
          }
        }}
        disabled={player.drawPile.length === 0 || gameWinner !== 0 }
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
        disabled={player.hand.length === 0 || gameWinner !== 0 || !isActivePlayer}
        handSelected={isActivePlayer && currentlySelectedCard !== null}

      />

      {/* Zone Défausse */}
      <CardZone
  //      title="Défausse"
          pile={player.discardPile}
        onClick={() => {
          if (currentlySelectedCard) {
            onAttemptMove({
              type: 'player',
              zone: 'discard',
              playerIndex: playerIndex   })   
          }
        }}
        disabled={gameWinner !== 0}
      />
    </div>
  );
}