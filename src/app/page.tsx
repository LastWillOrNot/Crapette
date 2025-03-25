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
      { drawPile: [], hand: [], discardPile: [],isActive: false },
      { drawPile: [], hand: [], discardPile: [],isActive: false }
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
        { drawPile: initPlayers[0].drawPile, hand: initPlayers[0].hand, discardPile: [],isActive: false },
        { drawPile: initPlayers[1].drawPile, hand: initPlayers[1].hand, discardPile: [],isActive: false },
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

  // Mise à jour de l'état du joueur actif
  useEffect(() => {
    if (!isGameInitialized || !gameState.currentPlayer) return;
    gameState.players[gameState.currentPlayer - 1].isActive = true;
  }, [gameState.currentPlayer]);

  

  // Après le déplacement de la dernière carte de la main, les cartes de la défausse sont déplacées dans la main
  useEffect(() => {
    if (!isGameInitialized || !gameState.currentPlayer) return;
      const player = gameState.players[gameState.currentPlayer - 1];
      console.log(`Vérification de la longueur de la main du joueur ${gameState.currentPlayer} : ${player.hand.length}`);	
    if (player.hand.length === 0 && player.discardPile.length > 0) {
        const newState = JSON.parse(JSON.stringify(gameState));
        newState.players[gameState.currentPlayer - 1].hand = newState.players[gameState.currentPlayer - 1].discardPile.reverse();
        newState.players[gameState.currentPlayer - 1].discardPile = [];
        setGameState(newState);
        console.log("Main remplie depuis la défausse !");
    }
}, [gameState.currentPlayer !== undefined ? gameState.players[gameState.currentPlayer - 1]?.hand : null]);

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

  // Détection d 'un état de crapette
  // Prioriré 1 : remplissage des zones des paquets
  // Priorité 2 : libération d'un espace libre

  //useEffect(() => {
  //  const isCrapette = false;
  //  if (!isGameInitialized) return;

    // Nombre d'espace vide
  //  let SpacePlaceCount = 0;
  //  for (let i = 0; i < 8; i++) {
  //    if (gameState.sharedPiles[i].length === 0) {
  //      SpacePlaceCount++;
  //    }
  //  }
    // Liste les cartes disponibles pour un déplacement
  //  const AvailableCards: Card[] = [];
  //  for (let i = 0; i < 8; i++) {
  //    if (gameState.sharedPiles[i].length > 0) {
  //      AvailableCards.push(gameState.sharedPiles[i].slice(-1)[0]);
  //    }
  //  }

    // Liste des cartes foundations
  //  const foundationCards = gameState.sharedFoundationPiles.map(pile => pile.length > 0 ? pile.slice(-1)[0] : null);

  //}, []);


  const handleSelectCard = (source: CardSource) => {
    if (source.type === "shared") {
      // Gestion pile partagée
      if (gameState.sharedPiles[source.index].length === 0) return;
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
        console.log(`Tentative de déplacement de ${card.value} ${card.suit} vers une FoundationPile`);
        moveIsValid = canPlaceOnFoundation(card, targetPile);
        console.log(`Déplacement valide ? ${moveIsValid}`);
    } else if (targetZone === 'shared' && index !== null) {
        targetPile = newState.sharedPiles[index];
        console.log(`Tentative de déplacement de ${card.value} ${card.suit} vers une SharedPile`);
        moveIsValid = canPlaceOnShared(card, targetPile);
        console.log(`Déplacement valide ? ${moveIsValid}`);
    } else if (targetZone === 'drawPile' && gameState.currentPlayer && playerTarget) {
        console.log(`Tentative de déplacement de ${card.value} ${card.suit} vers la DrawPile du Joueur ${playerTarget}`);
        targetPile = newState.players[playerTarget - 1].drawPile;
        moveIsValid = canPlaceOnDrawPile(card, targetPile);
        console.log(`Déplacement valide ? ${moveIsValid}`);
    } else if (targetZone === 'discard' && gameState.currentPlayer && playerTarget) {
      console.log(`Tentative de déplacement vers la défausse du joueur ${playerTarget}`);
      targetPile = newState.players[playerTarget - 1].discardPile;
      if (playerTarget === gameState.currentPlayer) {
        // Permettre de placer n'importe quelle carte sur sa défausse
                moveIsValid = true}
          else {
        // Permettre de placer une carte sur la défausse adverse si elle respecte les règles
        moveIsValid =canPlaceOnDiscard(card, targetPile);
          }
      console.log(`Déplacement valide ? ${moveIsValid}`);
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
    <div>
  <div className="flex justify-center min-h-screen bg-gray-100 p-4">

      {/* État du jeu */}
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
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">


      {/* Joueur 1 */}
      <div className="flex flex-col p-4 w-1/4 rounded-lg"
           style={{ backgroundColor: gameState.currentPlayer === 1 ? "#FFEB3B" : "#E0E0E0" }}>
        <PlayerArea
          player={gameState.players[0]}
          playerIndex={0}
          currentPlayer={gameState.currentPlayer}
          gameWinner={gameState.gameWinner}
          currentlySelectedCard={currentlySelectedCardInfo}
          onSelectCard={handleSelectCard}
          onAttemptMove={attemptMove}
        />
      </div>

      {/* Zone partagée */}
      <div className="flex flex-col p-6 mx-4 w-1/3 rounded-lg bg-green-300">
        <h2 className="text-center font-bold">Partagé</h2>
        <SharedPilesArea 
          sharedPiles={gameState.sharedPiles}
          gameWinner={gameState.gameWinner}
          currentlySelectedCard={currentlySelectedCardInfo}
          onSelectCard={(source) => handleSelectCard(source)}
          onAttemptMove={attemptMove}
        />
        <h2 className="text-center font-bold mt-4">Foundation</h2>
        <FoundationPilesArea
          sharedFoundationPiles={gameState.sharedFoundationPiles}
          gameWinner={gameState.gameWinner}
          onAttemptMove={attemptMove}
        />
      </div>

      {/* Joueur 2 */}
      <div className="flex flex-col p-4 w-1/4 rounded-lg"
           style={{ backgroundColor: gameState.currentPlayer === 2 ? "#FFEB3B" : "#E0E0E0" }}>
        <PlayerArea
          player={gameState.players[1]}
          playerIndex={1}
          currentPlayer={gameState.currentPlayer}
          gameWinner={gameState.gameWinner}
          currentlySelectedCard={currentlySelectedCardInfo}
          onSelectCard={handleSelectCard}
          onAttemptMove={attemptMove}
        />
      </div>
      </div>
      </div>
  );
}