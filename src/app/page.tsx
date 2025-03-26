'use client'

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PlayerArea } from "@/components/game/PlayerArea";
import { SharedPilesArea } from "@/components/game/SharedPilesArea";
import { FoundationPilesArea } from "@/components/game/FoundationPilesArea";
import { createShuffledDeck } from "@/lib/game/cardUtils";
import { compareSuitsCards } from "@/lib/game/rules";
import { GameState, SelectedCardInfo, Card , CardSource} from "@/lib/game/types";
import { canPlaceOnFoundation, canPlaceOnShared, canPlaceOnDrawPile, canPlaceOnDiscard, countMoveableCard } from "@/lib/game/rules";

export default function CrapetteGame() {
const [gameState, setGameState] = useState<GameState>({
  players: [
    { drawPile: [], hand: [], discardPile: [],isActive: false, isHandSelected:false },
    { drawPile: [], hand: [], discardPile: [],isActive: false, isHandSelected:false }
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
      { drawPile: initPlayers[0].drawPile, hand: initPlayers[0].hand, discardPile: [],isActive: false, isHandSelected:false },
      { drawPile: initPlayers[1].drawPile, hand: initPlayers[1].hand, discardPile: [],isActive: false, isHandSelected:false },
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
// Prioriré 1 : remplissage des zones des foundations 
// Etape 1 : lecture des dernières cartes des piles fondation
// Etape 2 : vérification de la disponibilité d'une carte pouvant aller sur une pile fondation. Cette vérification doit se faire parmi
// les cartes disponibles pour le joueur actif (sa pioche, sa main et les cartes partagées).

// Pour les cartes partagées, il faut calculer le nombre de degré de liberté, puis vérifier parmi toutes les cartes atteignables si une carte
// peut être placée sur une pile fondation.

// Etape 3 : si une crapette est possible, écriture d'un message. Déplacement de la carte du joueur actif vers sa défausse.
// C'est la fin de son tour

// Priorité 2 : libération d'un espace libre

// A FAIRE...

// Gestion de la sélection d'un groupe de carte
const handleSelectGroupCard = (source: CardSource) => {
  if (source.type != "shared") return;
//        if (source.type === "shared" && cardIndex) {
        // Gestion pile partagée
//        if (gameState.sharedPiles[source.index].length === 0) return;
//        const card = gameState.sharedPiles[source.index]?.slice(-cardIndex)[0];
//        setCurrentlySelectedCardInfo({ card, source, cardIndex });
//      } 
    };
  
// Gestion du déplacement d'un groupe de carte
const attemptGroupMove = (targetZone: string, index: number | null, playerTarget: number | null) => {
    if (!currentlySelectedCardInfo || gameState.gameWinner) return;
    const { card, source, cardIndex } = currentlySelectedCardInfo;
      if (source.type === "shared") {
        const newState = JSON.parse(JSON.stringify(gameState)); // Deep clone
        let moveIsValid = false;
    
      // Récupérer la pile cible en fonction de la zone et vérifier si le déplacement est valide
        let targetPile: Card[] = [];
        if (targetZone === 'shared' && index !== null) {
            targetPile = newState.sharedPiles[index];
            console.log(`Tentative de déplacement de groupe ${card.value} ${card.suit} vers une SharedPile`);
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
            // Impossible  de placer un groupe de carte sur sa défausse
                    moveIsValid = false}
              else {
            // Permettre de placer une carte sur la défausse adverse si elle respecte les règles
            moveIsValid =canPlaceOnDiscard(card, targetPile);
              }
          console.log(`Déplacement valide ? ${moveIsValid}`);
        }
    
        if (moveIsValid && cardIndex !== null && cardIndex > 0 && cardIndex < countMoveableCard(newState.sharedPiles && cardIndex >0 )) {
          const sourcePile = newState.sharedPiles[source.index];
          const cardsToMove = sourcePile.slice(-cardIndex - 1); // Prend toutes les cartes du groupe
          
          // Ajouter les cartes à la pile cible
          if (targetZone === 'shared' && index !== null) {
            newState.sharedPiles[index].push(...cardsToMove);
          } else if (targetZone === 'drawPile' && playerTarget) {
              newState.players[playerTarget - 1].drawPile.push(...cardsToMove);
          } else if (targetZone === 'discard' && playerTarget) {
              newState.players[playerTarget - 1].discardPile.push(...cardsToMove);
          }
          // Retirer les cartes de la source
          newState.sharedPiles[source.index] = sourcePile.slice(0, -cardIndex - 1);
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
        // groupe qui ne serait pas en provenance des piles partagées ???
      setCurrentlySelectedCardInfo(null);
      }
          };

const handleSelectCard = (source: CardSource) => {
  if (source.type === "shared") {
    // Gestion pile partagée
    if (gameState.sharedPiles[source.index].length === 0) return;
    const card = gameState.sharedPiles[source.index]?.slice(-1)[0];
    setCurrentlySelectedCardInfo({ card, source, cardIndex: null });
  } else {
    // Gestion zone joueur
    const player = gameState.players[source.playerIndex];
    let card: Card | undefined;
    
    if (source.zone === "drawPile") {
      if (gameState.players[source.playerIndex].isHandSelected)
        {
          // Cas où l'on sélectionnerait la pioche après avoir sélectionner la main
        }
      else {
        card = player.drawPile.slice(-1)[0];
      }
     } else if (source.zone === "hand") {
      card = player.hand.slice(-1)[0];
      gameState.players[source.playerIndex].isHandSelected= true;
    }

//    if (source.zone === "discardPile") card = player.discardPile.slice(-1)[0];

    if (card) {
      setCurrentlySelectedCardInfo({ card, source, cardIndex:null });
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
      gameState.players[source.playerIndex].isHandSelected = false;
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
const [cardIndex, setCardIndex] = useState<number | null>(null);

return (
  <div>
<div className="flex justify-center min-h-screen bg-gray-100 p-4">

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
        onSelectGroupCard={(source) => handleSelectGroupCard(source)}
        onAttemptMove={attemptMove}
        onAttemptGroupMove={(zone, index, playerTarget) => attemptGroupMove(zone, index, playerTarget)}
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
        {/* État du jeu */}
        <motion.div
        className="text-center"
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
  
)}};
