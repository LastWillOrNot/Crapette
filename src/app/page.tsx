'use client'

import React, { useReducer, useEffect } from "react";
import { motion } from "framer-motion";
import { PlayerArea } from "@/components/game/PlayerArea";
import { SharedPilesArea } from "@/components/game/SharedPilesArea";
import { FoundationPilesArea } from "@/components/game/FoundationPilesArea";
import { GameState, SelectedCardInfo, Card , CardSource} from "@/lib/game/types";
import { initialState} from "@/lib/game/gameTypes";
import { canPlaceOnFoundation, canPlaceOnShared, canPlaceOnDrawPile, canPlaceOnDiscard, countMoveableCard } from "@/lib/game/rules";
import {gameReducer} from "@/lib/game/useEffectReducer"
import {initGame, selectCard, moveCard, switchPlayer, setWinner} from "@/lib/game/gameActions"
// import { logger } from "@/lib/logger"

export default function CrapetteGame() {
  
  const [gameState, dispatch] = useReducer(gameReducer, initialState);

    // Initialisation
    useEffect(() => {
      dispatch(
        initGame()
      );
    }, []);
  
    // Gestion des clics
    const handleSelectCard = (source: CardSource) => {
      if (source.type === 'shared') {
        const card = gameState.sharedPiles[source.index][source.cardIndex ?? 0];
        dispatch(selectCard(card, source, source.cardIndex ?? 0));
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
        };
    
        if (card) {
//          dispatch(selectCard({ card, source: {type:"player",source.zone,source.playerIndex },
//            null,gameState.currentPlayer}));
        }
    }};   


    // Gestion des déplacements
    const attemptMove = (targetZone: string, index?: number, playerTarget?: number) => {
    
      const card = gameState.selectedCard?.card;
      const source =gameState.selectedCard?.source;
      const cardIndex = gameState.selectedCard?.cardIndex;
      
      const newState = JSON.parse(JSON.stringify(gameState)); // Deep clone
      let moveIsValid = false;
    
      // Récupérer la pile cible en fonction de la zone et vérifier si le déplacement est valide
      let targetPile: Card[] = [];
      if (targetZone === 'foundation' && index !== null) {
          if (index !== undefined && card !== undefined) {
            targetPile = newState.sharedFoundationPiles[index];
            moveIsValid = canPlaceOnFoundation(card, targetPile);
            console.log(`Tentative de déplacement de ${card.value} ${card.suit} vers une FoundationPile`);
          }
          console.log(`Déplacement valide ? ${moveIsValid}`);
      } else if (targetZone === 'shared' && index !== null) {
          if (index !== undefined && card !== undefined) {
            targetPile = newState.sharedPiles[index];
            moveIsValid = canPlaceOnShared(card, targetPile);
            console.log(`Tentative de déplacement de ${card.value} ${card.suit} vers une SharedPile`);
          }        
          console.log(`Déplacement valide ? ${moveIsValid}`);
      } else if (targetZone === 'drawPile' && gameState.currentPlayer && playerTarget) {
        if (index !== undefined && card !== undefined) {
          targetPile = newState.players[playerTarget - 1].drawPile;
          moveIsValid = canPlaceOnDrawPile(card, targetPile);
          console.log(`Tentative de déplacement de ${card.value} ${card.suit} vers la DrawPile du Joueur ${playerTarget}`);
        }   
          console.log(`Déplacement valide ? ${moveIsValid}`);
      } else if (targetZone === 'discard' && gameState.currentPlayer && playerTarget) {
        console.log(`Tentative de déplacement vers la défausse du joueur ${playerTarget}`);
        targetPile = newState.players[playerTarget - 1].discardPile;
        if (playerTarget === gameState.currentPlayer) {
          // Permettre de placer n'importe quelle carte sur sa défausse
                  moveIsValid = true}
            else {
          // Permettre de placer une carte sur la défausse adverse si elle respecte les règles
              if (card !== undefined) {
              moveIsValid =canPlaceOnDiscard(card, targetPile);
            }}
        console.log(`Déplacement valide ? ${moveIsValid}`);
      }
      
      let sourcePile: Card[] | undefined;
      let cardsToMove: Card[] | undefined; // Declare cardsToMove
      
      if (gameState.selectedCard?.source.type === 'shared'){
        let indexPile = gameState.selectedCard.source.index 
      } else {let indexPile = 0};


      if (moveIsValid && cardIndex!= null && cardIndex >0) {
        if (cardIndex > countMoveableCard(newState.sharedPiles)) {
          moveIsValid = false
        } else {
          const sourcePile = gameState.selectedCard?.source.type === 'shared' 
            ? newState.sharedPiles[indexPile] 
            : undefined;
          cardsToMove = sourcePile.slice(-cardIndex - 1); // Prend toutes les cartes du groupe    
        }
      };
      if (cardsToMove === undefined && card !== undefined){
        cardsToMove = [card]; // Convertir en tableau pour uniformité
      }
    
      if (moveIsValid && cardsToMove !== undefined) {
        // Ajouter la carte à la pile cible
        if (targetZone === 'foundation' && indexShared !== null) {
          newState.sharedFoundationPiles[indexPile].push(...cardsToMove);
        } else if (targetZone === 'shared' && index !== null) {
          newState.sharedPiles[indexPile].push(...cardsToMove);
        } else if (targetZone === 'drawPile' && playerTarget) {
          newState.players[playerTarget - 1].drawPile.push(...cardsToMove);
        } else if (targetZone === 'discard' && playerTarget) {
          newState.players[playerTarget - 1].discardPile.push(...cardsToMove);
        }
    
        // Retirer la carte de la source
        if (gameState.selectedCard?.source.type === 'shared') {
          if (cardIndex !== null && sourcePile!== undefined) {
            newState.sharedPiles[gameState.selectedCard?.source.index] = sourcePile.slice(0, -gameState.selectedCard?.source.cardIndex - 1);
          }
        } else if (gameState.selectedCard?.source.zone === 'drawPile') {
          newState.players[gameState.selectedCard?.source.playerIndex].drawPile.pop();
        } else if (gameState.selectedCard?.source.zone === 'hand') {
          newState.players[gameState.selectedCard?.source.playerIndex].hand.pop();
          gameState.players[gameState.selectedCard?.source.playerIndex].isHandSelected = false;
        } 
        dispatch({type : 'MOVE_CARD'})
    
        // Changer de joueur si la carte est placée sur sa propre défausse
        if (targetZone === 'discard' && gameState.currentPlayer === playerTarget) {
          dispatch({
            type: 'SWITCH_PLAYER'
          });
        }
      } 
    };
    

  // Mise à jour de l'état du joueur actif
//useEffect(() => {
//  gameState.players[gameState.currentPlayer - 1].isActive = true;
// }, [gameState.currentPlayer]);



// Après le déplacement de la dernière carte de la main, les cartes de la défausse sont déplacées dans la main
useEffect(() => {
  if (gameState.currentPlayer && gameState.players[gameState.currentPlayer - 1].hand.length === 0
    && gameState.players[gameState.currentPlayer - 1].discardPile.length > 0
  ) {
    dispatch({
      type: 'RECYCLE_DISCARD',
      playerIndex: gameState.currentPlayer - 1
    });
  }},
   [gameState.players[gameState.currentPlayer ? gameState.currentPlayer - 1 : 0]?.hand]);

// Détection du gagnant
useEffect(() => {
  const winner = gameState.players.findIndex(player => 
    player.drawPile.length === 0 && 
    player.hand.length === 0 && 
    player.discardPile.length === 0
  );

  if (winner !== -1) {
  dispatch({
    type: 'SET_WINNER',
    playerIndex: winner
  });
  }},
 [gameState.players]);



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
        currentlySelectedCard={gameState.selectedCard}
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
        currentlySelectedCard={gameState.selectedCard}
        onSelectCard={(source) => handleSelectCard}
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
          currentlySelectedCard={gameState.selectedCard}
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
            ? gameState.selectedCard
              ? `Tour du Joueur ${gameState.currentPlayer} - ${gameState.selectedCard.card.value} ${gameState.selectedCard.card.suit} sélectionnée`
              : `Tour du Joueur ${gameState.currentPlayer}`
            : `Détermination du premier joueur...`}
      </motion.div>
  
      </div>
  
)};

// A FAIRE...

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

  