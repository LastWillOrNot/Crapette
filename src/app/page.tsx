'use client'

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Hand } from "lucide-react";


//Constantes du jeu
const SUITS = ["♠️", "♥️", "♦️", "♣️"]; // Couleurs
const CARD_VALUES = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]; // Valeurs des cartes


// Fonctions utilitaires du jeu

function shuffleDeck(deck: Array<{ suit: string; value: string }>) {
  return deck.sort(() => Math.random() - 0.5);
}

function createShuffledDeck() {
  const newDeck: { suit: string; value: string }[] = [];
  SUITS.forEach((suit) => {
    CARD_VALUES.forEach((value) => {
      newDeck.push({ suit, value });
    });
  });
  return shuffleDeck(newDeck);
}

function areCardsConsecutive(card1: { suit: string; value: string }, card2: { suit: string; value: string }) {
  const index1 = CARD_VALUES.indexOf(card1.value);
  const index2 = CARD_VALUES.indexOf(card2.value);
  return Math.abs(index1 - index2) === 1;
}

function areCardsColorDifferent(card1: { suit: string; value: string }, card2: { suit: string; value: string }) {
  const RED = ["♥️", "♦️"];
  return RED.includes(card1.suit) !== RED.includes(card2.suit);
}



// Deck = Pioche (démarrage avec 13 cartes)
// commonTablePiles = Zone de 2 fois 4 cartes au centre de la table
// Hand = Main du joueur
// Discard = Défausse du joueur (vide au départ)

export default function CrapetteGame() {
  const [player1DrawPile, setPlayer1DrawPile] = useState<{ suit: string; value: string }[]>([]);
  const [player1DiscardPile, setPlayer1DiscardPile] = useState<{ suit: string; value: string }[]>([]);
  const [player1Hand, setPlayer1Hand] = useState<{ suit: string; value: string }[]>([]);
  
  const [player2DrawPile, setPlayer2DrawPile] = useState<{ suit: string; value: string }[]>([]);
  const [player2DiscardPile, setPlayer2DiscardPile] = useState<{ suit: string; value: string }[]>([]);
  const [player2Hand, setPlayer2Hand] = useState<{ suit: string; value: string }[]>([]);
  
  const [sharedPiles, setSharedPiles] = useState<Array<Array<{ suit: string; value: string }>>>([[], [], [], [], [], [], [], []]);
  const [sharedFoundationPiles, setSharedFoundationPiles] = useState<Array<Array<{ suit: string; value: string }>>>([[], [], [], [], [], [], [], []]);
  
  const [currentPlayer, setCurrentPlayer] = useState<number>();
  const [gameWinner, setGameWinner] = useState<number | null>(null);
  
  const [currentlySelectedCardInfo, setcurrentlySelectedCardInfo] = useState<{ card: { suit: string; value: string }; zone: any } | null>(null);
  const [isCardBeingSelected, setIsCardSelected] = useState(false);

// Effets REACT

useEffect(() => {
  const deck1 = createShuffledDeck();
  setPlayer1DrawPile(deck1.slice(0, 13));
  setPlayer1Hand(deck1.slice(17, 52));
  const player1SharedCards = deck1.slice(13, 17);

  const deck2 = createShuffledDeck();
  setPlayer2DrawPile(deck2.slice(0, 13));
  setPlayer2Hand(deck2.slice(17, 52));
  const player2SharedCards = deck2.slice(13, 17);

  setSharedPiles((prev) => {
    const updatedPiles = [...prev];
    for (let i = 0; i < 4; i++) {
      updatedPiles[i] = [player1SharedCards[i]];
    }
    for (let i = 4; i < 8; i++) {
      updatedPiles[i] = [player2SharedCards[i - 4]];
    }
    return updatedPiles;
  });
}, []);

useEffect(() => {
  const player1Empty = player1DrawPile.length === 0 && player1DiscardPile.length === 0 && player1Hand.length === 0;
  const player2Empty = player2DrawPile.length === 0 && player2DiscardPile.length === 0 && player2Hand.length === 0;
  
  if (player1Empty) setGameWinner(1);
  else if (player2Empty) setGameWinner(2);
  else setGameWinner(null);
}, [player1DrawPile, player1DiscardPile, player1Hand, player2DrawPile, player2DiscardPile, player2Hand]);

//Désignation du joueur qui démarrera la partie
useEffect(() => {
  setCurrentPlayer(Math.random() < 0.5 ? 1 : 2);
}
);

// Fonctions de jeu

const handleCardSelect = (card: { suit: string; value: string }, zone: { type: string; player?: number; index?: number }) => {
  if (gameWinner) return;

//  if (isCardBeingSelected && currentlySelectedCardInfo) {
//    handleCardPlacement({ card, zone });
//    return;
//  }

  setcurrentlySelectedCardInfo({ card, zone });
  setIsCardSelected(true);
};

const handleCardPlacement = (target: { card: { suit: string; value: string }; zone: { type: string; player?: number; index?: number } }) => {
  if (!currentlySelectedCardInfo || !isCardBeingSelected) return;
  let moveIsValid = false;

  // Dépôt sur les fondations communes (commençant par As)
  if (target.zone.type === 'sharedFoundationPiles') {
    const foundationPile = target.zone.index !== undefined ? [...sharedFoundationPiles[target.zone.index]] : [];
    if (foundationPile.length === 0 && currentlySelectedCardInfo.card.value === 'A') {
      foundationPile.push(currentlySelectedCardInfo.card);
      moveIsValid = true;
    } else if (foundationPile.length > 0) {
      const topCard = foundationPile[foundationPile.length - 1];
      const topIndex = CARD_VALUES.indexOf(topCard.value);
      const selectedIndex = CARD_VALUES.indexOf(currentlySelectedCardInfo.card.value);
      if (topCard.suit === currentlySelectedCardInfo.card.suit && selectedIndex === topIndex + 1) {
        foundationPile.push(currentlySelectedCardInfo.card);
        moveIsValid = true;
      }
    }
    if (moveIsValid) {
      const updatedfoundationPiles = [...sharedFoundationPiles];
      if (target.zone.index !== undefined) {
        updatedfoundationPiles[target.zone.index] = foundationPile;
      }
      setSharedFoundationPiles(updatedfoundationPiles);
    }
  }

  // Dépôt sur les piles communes (séquence ±1)
  if (target.zone.type === 'sharedPiles') {
    const pile = target.zone.index !== undefined ? [...sharedPiles[target.zone.index]] : [];
    if (pile.length === 0) {
      pile.push(currentlySelectedCardInfo.card);
      moveIsValid = true;
    } else {
      const topCard = pile[pile.length - 1];
      const topIndex = CARD_VALUES.indexOf(topCard.value);
      const selectedIndex = CARD_VALUES.indexOf(currentlySelectedCardInfo.card.value);
      if (areCardsColorDifferent(topCard, currentlySelectedCardInfo.card) && Math.abs(selectedIndex - topIndex) === 1) {
        pile.push(currentlySelectedCardInfo.card);
        moveIsValid = true;
      }
    }
    if (moveIsValid) {
      const updatedPiles = [...sharedPiles];
      if (target.zone.index !== undefined) {
        updatedPiles[target.zone.index] = pile;
      }
      setSharedPiles(updatedPiles);
    }
  }

  // Défausse
  if (target.zone.type === 'discardPile') {
    if (target.zone.player === 1) {
      setPlayer1DiscardPile([...player1DiscardPile, currentlySelectedCardInfo.card]);
      moveIsValid = true;
    } else {
      setPlayer2DiscardPile([...player2DiscardPile, currentlySelectedCardInfo.card]);
      moveIsValid = true;
    }
  }

    // Pioche
    if (target.zone.type === 'drawPile') {
      if (target.zone.player === 1 && currentPlayer === 2) {
        const topDrawCard = player1DrawPile[player1DrawPile.length - 1];
        if (areCardsConsecutive(topDrawCard, currentlySelectedCardInfo.card)) {
          setPlayer1DrawPile(player1DrawPile.filter(c => c !== topDrawCard));
          setPlayer1DiscardPile([...player1DiscardPile, topDrawCard]);
          moveIsValid = true;
        } else if (target.zone.player === 2 && currentPlayer === 1) {
          const topDrawCard = player2DrawPile[player2DrawPile.length - 1];
          if (areCardsConsecutive(topDrawCard, currentlySelectedCardInfo.card)) {
            setPlayer2DrawPile(player2DrawPile.filter(c => c !== topDrawCard));
            setPlayer2DiscardPile([...player2DiscardPile, topDrawCard]);
            moveIsValid = true;
          };
      } else {
        moveIsValid = false;
      }
    }
  }
  // Nettoyage de la zone source
  if (moveIsValid) {
    if (currentlySelectedCardInfo.zone.type === 'hand') {
      if (currentlySelectedCardInfo.zone.player === 1) {
        setPlayer1Hand(player1Hand.filter(c => c !== currentlySelectedCardInfo.card));
      } else {
        setPlayer2Hand(player2Hand.filter(c => c !== currentlySelectedCardInfo.card));
      }
    } else if (currentlySelectedCardInfo.zone.type === 'drawPile') {
      if (currentlySelectedCardInfo.zone.player === 1) {
        setPlayer1DrawPile(player1DrawPile.filter(c => c !== currentlySelectedCardInfo.card));
      } else {
        setPlayer2DrawPile(player2DrawPile.filter(c => c !== currentlySelectedCardInfo.card));
      }
    } else if (currentlySelectedCardInfo.zone.type === 'sharedPiles') {
      const updatedPiles = [...sharedPiles];
      updatedPiles[currentlySelectedCardInfo.zone.index] = updatedPiles[currentlySelectedCardInfo.zone.index].filter(c => c !== currentlySelectedCardInfo.card);
      setSharedPiles(updatedPiles)
     } else if (currentlySelectedCardInfo.zone.type === 'discardPile') {
        if (currentlySelectedCardInfo.zone.player === 1) {
          setPlayer1DiscardPile(player1DiscardPile.filter(c => c !== currentlySelectedCardInfo.card));
        } else {
          setPlayer2DiscardPile(player2DiscardPile.filter(c => c !== currentlySelectedCardInfo.card));
        };
        if ((currentPlayer === 1 && currentlySelectedCardInfo.zone.player === 1)||(currentPlayer === 2 && currentlySelectedCardInfo.zone.player === 2)) {
            setCurrentPlayer(currentPlayer === 1 ? 2 : 1);;
        };
    }

    setcurrentlySelectedCardInfo(null);
    setIsCardSelected(false);
//    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
  }
};



// Affichage

  return (
    <div className="p-4 grid grid-cols-2 gap-4">
      <div className="flex flex-col items-center">
        <h2 className="text-xl mb-2">Joueur 1</h2>
        <Card className="mb-2">
          <CardContent>Pioche: {player1DrawPile.length} cartes</CardContent>
          <Button
        onClick={() => {
          if (isCardBeingSelected && currentlySelectedCardInfo && currentPlayer === 2) {
            // Si une carte est déjà sélectionnée, tenter de la placer
            const index = 1; // Replace 0 with the appropriate value or logic to determine the index
            handleCardPlacement({ card: currentlySelectedCardInfo.card, zone: { type: 'player1DrawPile', index } });
          } else {
            // Sinon, sélectionner la carte
            if (player1DrawPile.length > 0) {
              handleCardSelect(player1DrawPile[player1DrawPile.length - 1],{ type: 'drawPile', player: 1  })
            };
          }
        }}
        disabled={!!gameWinner || (isCardBeingSelected && !currentlySelectedCardInfo)}
      >
        {player1DrawPile.length > 0 ? `${player1DrawPile[player1DrawPile.length - 1].value} ${player1DrawPile[player1DrawPile.length - 1].suit}` : 'Vide'}
      </Button>
        </Card>
        <Card className="mb-2">
          <CardContent>Main: {player1Hand.length} cartes</CardContent>
          <div className="flex space-x-2 mt-2">
          <Button onClick={() => {
            if (isCardBeingSelected && currentlySelectedCardInfo) {
            } else {
              handleCardSelect(player1Hand[player1Hand.length - 1], { type: 'hand', player: 1 });
            }}}
             disabled={currentPlayer !== 1 || player1Hand.length === 0 || !!gameWinner}>
          {player1Hand.length > 0 ? `${player1Hand[player1Hand.length - 1].value} ${player1Hand[player1Hand.length - 1].suit}` : 'Vide'}
              </Button>
          </div>
        </Card>
        <Card className="mb-2">
          <CardContent>Défausse: {player1DiscardPile.length} cartes</CardContent>
          <Button onClick={() => {
            if (isCardBeingSelected && currentlySelectedCardInfo) {
          currentlySelectedCardInfo && handleCardPlacement({
            card: currentlySelectedCardInfo.card,
            zone: { type: 'discard', player: 1 }
          })}
         }}
          disabled={!!gameWinner}>
          {player1DiscardPile.length > 0 ? `${player1DiscardPile[player1DiscardPile.length - 1].value} ${player1DiscardPile[player1DiscardPile.length - 1].suit}` : 'Vide'}
          </Button>
        </Card>
      </div>

      <div className="flex flex-col items-center">
        <h2 className="text-xl mb-2">Joueur 2</h2>
        <Card className="mb-2">
          <CardContent>Pioche: {player2DrawPile.length} cartes</CardContent>
          <Button onClick={() => {
            if (isCardBeingSelected && currentlySelectedCardInfo && currentPlayer === 1) {
              currentlySelectedCardInfo && handleCardPlacement({
                card: currentlySelectedCardInfo.card,
                zone: { type: 'drawPile', player: 2 }
              })
            } else {
              handleCardSelect(player2DrawPile[player2DrawPile.length - 1], 
            { type: 'drawPile', player: 2 })}
              }}
             disabled={currentPlayer !== 2 || player2DrawPile.length === 0 || !!gameWinner}>
          {player2DrawPile.length > 0 ? `${player2DrawPile[player2DrawPile.length - 1].value} ${player2DrawPile[player2DrawPile.length - 1].suit}` : 'Vide'}
          </Button>
        </Card>
        <Card className="mb-2">
          <CardContent>Main: {player2Hand.length} cartes</CardContent>
          <div className="flex space-x-2 mt-2">
          <Button onClick={() => handleCardSelect(player2Hand[player2Hand.length - 1], 
            { type: 'hand', player: 2 })} disabled={currentPlayer !== 2 || player2Hand.length === 0 || !!gameWinner}>
          {player2Hand.length > 0 ? `${player2Hand[player2Hand.length - 1].value} ${player2Hand[player2Hand.length - 1].suit}` : 'Vide'}
          </Button>
          </div>
        </Card>
        <Card className="mb-2">
          <CardContent>Défausse: {player2DiscardPile.length} cartes</CardContent>
          <Button onClick={() => handleCardPlacement({ card: player2DiscardPile[player2DiscardPile.length - 1],
             zone: { type: 'discard', player: 2 } })} disabled={currentPlayer !== 2 && player2DiscardPile.length === 0 || !!gameWinner}>
          {player2DiscardPile.length > 0 ? `${player2DiscardPile[player2DiscardPile.length - 1].value} ${player2DiscardPile[player2DiscardPile.length - 1].suit}` : 'Vide'}
          </Button>
        </Card>
      </div>

      <div className="col-span-2 flex justify-center mt-4">
      <div className="grid grid-cols-4 gap-4">
  {sharedPiles.map((pile, index) => (
    <Card key={index} className="p-2 text-center">
 <Button
        onClick={() => {
          if (isCardBeingSelected && currentlySelectedCardInfo) {
            // Si une carte est déjà sélectionnée, tenter de la placer
            handleCardPlacement({ card: currentlySelectedCardInfo.card, zone: { type: 'sharedPiles', index } });
          } else {
            // Sinon, sélectionner la carte
            if (pile.length > 0) {
              handleCardSelect(pile[pile.length - 1], { type: 'sharedPiles', index });
            }
          }
        }}
        disabled={!!gameWinner || (isCardBeingSelected && !currentlySelectedCardInfo)}
      >
        {pile.length > 0 ? `${pile[pile.length - 1].value} ${pile[pile.length - 1].suit}` : 'Vide'}
      </Button>
    </Card>
  ))}
</div>
      </div>
      <div className="col-span-2 flex justify-center mt-4">
        <div className="grid grid-cols-4 gap-4">
          {sharedFoundationPiles.map((pack, index) => (
            <Card key={index} className="p-2 text-center">
 <Button
        onClick={() => {
          if (isCardBeingSelected && currentlySelectedCardInfo) {
            // Si une carte est déjà sélectionnée, tenter de la placer
            handleCardPlacement({ card: currentlySelectedCardInfo.card, zone: { type: 'sharedFoundationPiles', index } });
            if (pack.length > 0) {
              handleCardSelect(pack[pack.length - 1], { type: 'sharedFoundationPiles', index });
            }
            // Sinon, sélectionner la carte
            if (pack.length > 0) {
              handleCardSelect(pack[pack.length - 1], { type: 'sharedFoundationPiles', index });
            }
          }
        }}
        disabled={!!gameWinner || (isCardBeingSelected && !currentlySelectedCardInfo)}
      >
                {pack.length > 0 ? `${pack[pack.length - 1].value} ${pack[pack.length - 1].suit}` : 'Vide'}
                </Button>
            </Card>
          ))}
        </div>
      </div>

      <motion.div
  className="col-span-2 mt-4 text-center text-lg"
  animate={{ opacity: 1 }}
  initial={{ opacity: 0 }}
  transition={{ duration: 0.5 }}
>
  {gameWinner
    ? `Le Joueur ${gameWinner} a gagné !`
    : currentlySelectedCardInfo
    ? `Sélectionnez une zone pour poser ${currentlySelectedCardInfo.card.value} ${currentlySelectedCardInfo.card.suit}`
    : `Tour du Joueur ${currentPlayer}`}
</motion.div>

    </div>
  );
}
