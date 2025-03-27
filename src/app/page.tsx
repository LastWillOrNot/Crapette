'use client'

import React, { useReducer, useEffect } from "react";
import { motion } from "framer-motion";
import { PlayerArea } from "@/components/game/PlayerArea";
import { SharedPilesArea } from "@/components/game/SharedPilesArea";
import { FoundationPilesArea } from "@/components/game/FoundationPilesArea";
import { GameState, SelectedCardInfo, CardItem, CardPosition } from "@/lib/game/types";
import { initialState } from "@/lib/game/gameTypes";
import { canPlaceOnFoundation, canPlaceOnShared, canPlaceOnDrawPile, canPlaceOnDiscard, countMoveableCard } from "@/lib/game/rules";
import { gameReducer } from "@/lib/game/useEffectReducer"
import { initGame, selectCard, moveCard, switchPlayer, setWinner } from "@/lib/game/gameActions"
// import { logger } from "@/lib/logger"

export default function CrapetteGame() {

  const [gameState, dispatch] = useReducer(gameReducer, initialState);

  // Initialisation
  useEffect(() => {
    dispatch(
      initGame()
    );
  }, []);

  // Gestion de la sélection des cartes
  const handleSelectCard = (source: CardPosition) => {
    if (source.type === 'shared') {
      const card = gameState.sharedPiles[source.index][source.cardIndex ?? 0];
      dispatch(selectCard(card, source));
    } else if (source.type === 'player') {
      // Gestion zone joueur
      const player = gameState.players[source.playerIndex];
      let card: CardItem | undefined;

      if (source.zone === "drawPile") {
        if (gameState.players[source.playerIndex].isHandSelected) {
          // Cas où l'on sélectionnerait la pioche après avoir sélectionné la main
        }
        else {
          card = player.drawPile.slice(-1)[0];
        }
      } else if (source.zone === "hand") {
        card = player.hand.slice(-1)[0];
        gameState.players[source.playerIndex].isHandSelected = true;
      };

      if (card) {
        dispatch(selectCard(card, source));
      }
    }
  };


  // Gestion des déplacements
  const attemptMove = (targetZone: CardPosition) => {
    if (!gameState.selectedCard) return;
      const {cardItem : card, position: source } = gameState.selectedCard;
      let moveIsValid = false;
      let cardsToMove: CardItem[] = [];

      // Récupérer la pile cible en fonction de la zone et vérifier si le déplacement est valide
      let targetPile: CardItem[] = [];
      if (targetZone.type === 'foundation') {
        moveIsValid = canPlaceOnFoundation(card, gameState.sharedFoundationPiles[targetZone.index]);
        console.log(`Tentative de déplacement de ${card.value} ${card.suit} vers une FoundationPile`);
      }
      else if (targetZone.type === 'shared') {
        moveIsValid = canPlaceOnShared(card, gameState.sharedPiles[targetZone.index]);
        if (moveIsValid && source.type === 'shared') {
          const movableCards = countMoveableCard(gameState.sharedPiles)
          if (source.cardIndex >= movableCards) {
            moveIsValid = false;
          } else 
          {
            cardsToMove = gameState.sharedPiles[source.index].slice(-(source.cardIndex + 1))
          };
        console.log(`Tentative de déplacement de ${card.value} ${card.suit} vers une SharedPile`);
       }
      } else if (targetZone.type === 'player') {
        if (targetZone.zone === 'drawPile') {
          moveIsValid = canPlaceOnDrawPile(card, gameState.players[targetZone.playerIndex - 1].drawPile);
          console.log(`Tentative de déplacement de ${card.value} ${card.suit} vers la DrawPile du Joueur ${targetZone.playerIndex}`);
        }
        else if (targetZone.zone === 'discard') {
          console.log(`Tentative de déplacement de ${card.value} ${card.suit} vers la défausse du joueur ${targetZone.playerIndex}`);
          if (targetZone.playerIndex === gameState.currentPlayer) {
            // Permettre de placer n'importe quelle carte sur sa défausse
            moveIsValid = true
          }
          else {
            // Permettre de placer une carte sur la défausse adverse si elle respecte les règles
            moveIsValid = canPlaceOnDiscard(card, gameState.players[targetZone.playerIndex - 1].discardPile);
          }
        }
      }

      console.log(`Déplacement valide ? ${moveIsValid}`);

  // 2. Dispatcher l'action si valide
      if (moveIsValid) {
        dispatch({
          type: 'MOVE_CARD',
          source,
          targetZone,
          cardsToMove: cardsToMove.length > 0 ? cardsToMove : [card], // Prendre cardsToMove ou la carte sélectionnée
        });
      } else {
        dispatch({ type: 'CANCEL_SELECTION' }); // Annuler la sélection si invalide
      }
        // Changer de joueur si la carte est placée sur sa propre défausse
      if (targetZone.type === 'player') {
        if (targetZone.playerIndex === gameState.currentPlayer) {
          dispatch({
            type: 'SWITCH_PLAYER'
          });
        }
      };
    };


    // Mise à jour de l'état du joueur actif
    //useEffect(() => {
    //  gameState.players[gameState.currentPlayer - 1].isActive = true;
    // }, [gameState.currentPlayer]);



    // Après le déplacement de la dernière carte de la main, les cartes de la défausse sont déplacées dans la main
    const isRequiredToRefillTheHand = () => {
      if (gameState.currentPlayer && gameState.players[gameState.currentPlayer - 1].hand.length === 0
        && gameState.players[gameState.currentPlayer - 1].discardPile.length > 0
      ) {
        dispatch({
          type: 'RECYCLE_DISCARD',
          playerIndex: gameState.currentPlayer - 1
        });
      }
    };

    // Détection du gagnant
    const winner = () => {
       gameState.players.findIndex(player =>
        player.drawPile.length === 0 &&
        player.hand.length === 0 &&
        player.discardPile.length === 0
      );
      console.log (`Identifiant du gagnant ${winner}`)
      if (winner !== -1) {
        dispatch({
          type: 'SET_WINNER',
          playerIndex: winner 
        });
      }};

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
            onSelectCard={handleSelectCard}
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
              ? `Tour du Joueur ${gameState.currentPlayer} - ${gameState.selectedCard.cardItem.value} ${gameState.selectedCard.cardItem.suit} sélectionnée`
              : `Tour du Joueur ${gameState.currentPlayer}`
            : `Détermination du premier joueur...`}
      </motion.div>

    </div>

  )
};

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

