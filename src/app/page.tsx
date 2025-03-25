'use client'

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PlayerArea } from "@/components/game/PlayerArea";
import { SharedPilesArea } from "@/components/game/SharedPilesArea";
import { FoundationPilesArea } from "@/components/game/FoundationPilesArea";
import { createShuffledDeck } from "@/lib/game/utils";
import { compareSuitsCards } from "@/lib/game/rules";
import { GameState, SelectedCardInfo, Card , CardSource} from "@/lib/game/types";
import { canPlaceOnFoundation, canPlaceOnShared, canPlaceOnDrawPile, canPlaceOnDiscard } from "@/lib/game/rules";

export default function CrapetteGame() {
  const [gameState, setGameState] = useState<GameState>({
    players: [
      { drawPile: [], hand: [], discardPile: [] },
      { drawPile: [], hand: [], discardPile: [] }
    ],
    sharedPiles: [[], [], [], [], [], [], [], []],
    sharedFoundationPiles: [[], [], [], [], [], [], [], []],
    currentPlayer: undefined,
    gameWinner: null
  });
  
  const [currentlySelectedCardInfo, setCurrentlySelectedCardInfo] = useState<SelectedCardInfo | null>(null);
  const [isGameInitialized, setIsGameInitialized] = useState(false);

  // Initialisation du jeu
  useEffect(() => {
    const initPlayers = [0, 1].map(() => {
      const deck = createShuffledDeck();
      return {
        drawPile: deck.slice(0, 13),
        hand: deck.slice(17, 52),
        discardPile: [],
        shared: deck.slice(13, 17),
        topDrawCard: deck[0],
        topHandCard: deck[17],
      };
    });

    setGameState(prev => ({
      ...prev,
      players: [
        { drawPile: initPlayers[0].drawPile, hand: initPlayers[0].hand, discardPile: [] },
        { drawPile: initPlayers[1].drawPile, hand: initPlayers[1].hand, discardPile: [] },
      ]
    }));

    const updatedShared = Array(8).fill([]).map((_, i) => 
      i < 4 ? [initPlayers[0].shared[i]] : [initPlayers[1].shared[i - 4]]
    );

    setGameState(prev => ({
      ...prev,
      sharedPiles: updatedShared
    }));

    // Détermination du premier joueur
    const comparison = compareSuitsCards(initPlayers[0].topDrawCard, initPlayers[1].topDrawCard);
    let firstPlayer: number;
    
    if (comparison > 0) {
      firstPlayer = 2;
    } else if (comparison < 0) {
      firstPlayer = 1;
    } else {
      const comparison2 = compareSuitsCards(initPlayers[0].topHandCard, initPlayers[1].topHandCard);
      firstPlayer = comparison2 > 0 ? 2 : comparison2 < 0 ? 1 : Math.floor(Math.random() * 2) + 1;
    }

    setGameState(prev => ({
      ...prev,
      currentPlayer: firstPlayer
    }));

    setIsGameInitialized(true);
  }, []);

  // Après le déplacement de la dernière carte de la main, les cartes de la défausse sont déplacées dans la main
  useEffect(() => {
    if (!isGameInitialized) return;
    if (gameState.currentPlayer && gameState.players[gameState.currentPlayer - 1].hand.length === 0) {
      const newState = JSON.parse(JSON.stringify(gameState));
      newState.players[gameState.currentPlayer - 1].hand = gameState.players[gameState.currentPlayer - 1].discardPile;
      newState.players[gameState.currentPlayer - 1].discardPile = [];
      setGameState(newState);
    }

  }, [gameState.players]);

  // Détection du gagnant
  useEffect(() => {
    if (!isGameInitialized) return;

    const winner = gameState.players.findIndex(player => 
      player.drawPile.length === 0 && 
      player.hand.length === 0 && 
      player.discardPile.length === 0
    );

    if (winner !== -1) {
      setGameState(prev => ({
        ...prev,
        gameWinner: winner + 1
      }));
    }
  }, [gameState.players, isGameInitialized]);

  const handleSelectCard = (source: CardSource) => {
    if (source.type === "shared") {
      // Gestion pile partagée
      const card = gameState.sharedPiles[source.index]?.slice(-1)[0];
      setCurrentlySelectedCardInfo({ card, source });
    } else {
      // Gestion zone joueur
      const player = gameState.players[source.playerIndex];
      let card: Card | undefined;
      
      if (source.zone === "drawPile") card = player.drawPile.slice(-1)[0];
      if (source.zone === "hand") card = player.hand.slice(-1)[0];
  //    if (source.zone === "discardPile") card = player.discardPile.slice(-1)[0];
  
      if (card) setCurrentlySelectedCardInfo({ card, source });
    }
  };

  const attemptMove = (targetZone: string, index: number | null, playerTarget: number | null) => {
    if (!currentlySelectedCardInfo || gameState.gameWinner) return;
  
    const { card, source } = currentlySelectedCardInfo;
    const newState = JSON.parse(JSON.stringify(gameState)); // Deep clone
    let moveIsValid = false;
  
    // Récupérer la pile cible en fonction de la zone et vérifier si le déplacement est valide
    let targetPile: Card[] = [];
    if (targetZone === 'foundation' && index !== null) {
        targetPile = newState.sharedFoundationPiles[index];
        moveIsValid = canPlaceOnFoundation(card, targetPile);
    } else if (targetZone === 'shared' && index !== null) {
        targetPile = newState.sharedPiles[index];
        moveIsValid = canPlaceOnShared(card, targetPile);
    } else if (targetZone === 'drawPile' && gameState.currentPlayer && playerTarget) {
        targetPile = newState.players[playerTarget - 1].drawPile;
        moveIsValid = canPlaceOnDrawPile(card, targetPile);
    } else if (targetZone === 'discard' && gameState.currentPlayer && playerTarget) {
      targetPile = newState.players[playerTarget - 1].discardPile;
      if (playerTarget === gameState.currentPlayer) {
        // Permettre de placer n'importe quelle carte sur sa défausse
                moveIsValid = true}
          else {
        // Permettre de placer une carte sur la défausse adverse si elle respecte les règles
        moveIsValid =canPlaceOnDiscard(card, targetPile);
          }
    }
    
    if (moveIsValid) {
      // Ajouter la carte à la pile cible
      if (targetZone === 'foundation' && index !== null) {
        newState.sharedFoundationPiles[index].push(card);
      } else if (targetZone === 'shared' && index !== null) {
        newState.sharedPiles[index].push(card);
      } else if (targetZone === 'drawPile' && playerTarget) {
        newState.players[playerTarget - 1].drawPile.push(card);
      } else if (targetZone === 'discard' && playerTarget) {
        newState.players[playerTarget - 1].discardPile.push(card);
      }
  
      // Retirer la carte de la source
      if (source.type === 'shared') {
        newState.sharedPiles[source.index].pop();
      } else if (source.zone === 'drawPile') {
        newState.players[source.playerIndex].drawPile.pop();
      } else if (source.zone === 'hand') {
        newState.players[source.playerIndex].hand.pop();
      } 

      setGameState(newState);
      setCurrentlySelectedCardInfo(null);
  
      // Changer de joueur si la carte est placée sur sa propre défausse
      if (targetZone === 'discard' && gameState.currentPlayer === playerTarget) {
        setGameState(prev => ({
          ...prev,
          currentPlayer: prev.currentPlayer === 1 ? 2 : 1
        }));
      }
    } else {
      setCurrentlySelectedCardInfo(null);
    }
  };

  return (
    <div className="p-4 grid grid-cols-2 gap-4">
      {gameState.players.map((player, idx) => (
      <PlayerArea
        key={`player-${idx}`}
        player={gameState.players[idx]}
        playerIndex={idx}
        currentPlayer={gameState.currentPlayer}
        gameWinner={gameState.gameWinner}
        currentlySelectedCard={currentlySelectedCardInfo}
        onSelectCard={handleSelectCard}
        onAttemptMove={attemptMove}
      />
      ))}

      <SharedPilesArea 
        sharedPiles={gameState.sharedPiles}
        gameWinner={gameState.gameWinner}
        currentlySelectedCard={currentlySelectedCardInfo}
        onSelectCard={(source) => handleSelectCard(source)}
        onAttemptMove={attemptMove}
      />

      <FoundationPilesArea
        sharedFoundationPiles={gameState.sharedFoundationPiles}
        gameWinner={gameState.gameWinner}
        onAttemptMove={attemptMove}
      />

      <motion.div
        className="col-span-2 mt-4 text-center text-lg"
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {gameState.gameWinner
          ? `Le Joueur ${gameState.gameWinner} a gagné !`
          : gameState.currentPlayer
            ? currentlySelectedCardInfo
              ? `Tour du Joueur ${gameState.currentPlayer} - ${currentlySelectedCardInfo.card.value} ${currentlySelectedCardInfo.card.suit} sélectionnée`
              : `Tour du Joueur ${gameState.currentPlayer}`
            : `Détermination du premier joueur...`}
      </motion.div>
    </div>
  );
}