'use client'

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const suits = ["♠️", "♥️", "♦️", "♣️"];
const values = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function generateDeck() {
  const deck = [];
  suits.forEach((suit) => {
    values.forEach((value) => {
      deck.push({ suit, value });
    });
  });
  return (shuffle(deck));
}

function isOneValueApart(card1, card2) {
  const index1 = values.indexOf(card1.value);
  const index2 = values.indexOf(card2.value);
  return Math.abs(index1 - index2) === 1;
}

// Deck = Pioche (démarrage avec 13 cartes)
// CommonPiles = Zone de 2 fois 4 cartes au centre de la table
// Hand = Main du joueur
// Discard = Défausse du joueur (vide au départ)

export default function CrapetteGame() {
  const [player1Deck, setPlayer1Deck] = useState([]);
  const [player1Discard, setPlayer1Discard] = useState([]);
  const [player1Hand, setPlayer1Hand] = useState([]);
   
  const [player2Deck, setPlayer2Deck] = useState([]);
  const [player2Discard, setPlayer2Discard] = useState([]);
  const [player2Hand, setPlayer2Hand] = useState([]);

  const [commonPiles, setCommonPiles] = useState<Array<Array<any>>>([[], [], [], [],[], [], [], []]);
  const [commonPacks, setCommonPacks] = useState<Array<Array<any>>>([[], [], [], [],[], [], [], []]);
  const [turn, setTurn] = useState(1);

  useEffect(() => {
    const deck1 = generateDeck();
    setPlayer1Deck(deck1.slice(0, 13));
    setPlayer1Hand(deck1.slice(17, 52));
    const ExtractDeck1 = deck1.slice(13, 17); // Extrait 4 cartes de deck1
  
    const deck2 = generateDeck();
    setPlayer2Deck(deck2.slice(0, 13));
    setPlayer2Hand(deck2.slice(17, 52));
    const ExtractDeck2 = deck2.slice(13, 17); // Extrait 4 cartes de deck2
  
    setCommonPiles((prevPiles) => {
      const newPiles = [...prevPiles];
  
      // Distribuer les 4 cartes de deck1 dans les 4 premières piles
      for (let i = 0; i < 4; i++) {
        newPiles[i] = [ExtractDeck1[i]];
      }
  
      // Distribuer les 4 cartes de deck2 dans les 4 piles suivantes
      for (let i = 4; i < 8; i++) {
        newPiles[i] = [ExtractDeck2[i - 4]];
      }
  
      return newPiles;
    });
  }, []);

  const drawCard = (player) => {
    if (player === 1 && player1Deck.length > 0) {
      const newDeck = [...player1Deck];
      const card = newDeck.pop();
      setPlayer1Deck(newDeck);
      setPlayer1Discard([...player1Discard, card]);
      setTurn(2);
    } else if (player === 2 && player2Deck.length > 0) {
      const newDeck = [...player2Deck];
      const card = newDeck.pop();
      setPlayer2Deck(newDeck);
      setPlayer2Discard([...player2Discard, card]);
      setTurn(1);
    }
  };

  const playHandCard = (player, index) => {
    if (player === 1) {
      const hand = [...player1Hand];
      const card = hand.splice(index, 1)[0];
      setPlayer1Discard([...player1Discard, card]);
      setPlayer1Hand(hand);
      setTurn(2);
    } else {
      const hand = [...player2Hand];
      const card = hand.splice(index, 1)[0];
      setPlayer2Discard([...player2Discard, card]);
      setPlayer2Hand(hand);
      setTurn(1);
    }
  };

  const playToCommonPile = (player, pileIndex, card) => {
    const newCommonPiles = [...commonPiles];
    if (newCommonPiles[pileIndex].length === 0 && card.value === "A") {
      newCommonPiles[pileIndex].push(card);
      if (player === 1) setPlayer1Hand(player1Hand.filter((c) => c !== card));
      else setPlayer2Hand(player2Hand.filter((c) => c !== card));
    } else if (newCommonPiles[pileIndex].length > 0) {
      const topCard =
        newCommonPiles[pileIndex][newCommonPiles[pileIndex].length - 1];
      const indexTop = values.indexOf(topCard.value);
      const indexCard = values.indexOf(card.value);
      if (card.suit === topCard.suit && indexCard === indexTop + 1) {
        newCommonPiles[pileIndex].push(card);
        if (player === 1) setPlayer1Hand(player1Hand.filter((c) => c !== card));
        else setPlayer2Hand(player2Hand.filter((c) => c !== card));
      }
    }
    setCommonPiles(newCommonPiles);
  };

  return (
    <div className="p-4 grid grid-cols-2 gap-4">
      <div className="flex flex-col items-center">
        <h2 className="text-xl mb-2">Joueur 1</h2>
        <Card className="mb-2">
          <CardContent>Pile: {player1Hand.length} cartes 
          {player1Hand.length > 0
          ? `${player1Hand[player1Hand.length - 1].value}
                  ${player1Hand[player1Hand.length - 1].suit}`
                  : "Vide"}
                   </CardContent>`
        </Card>
        <Card className="mb-2">
          <CardContent>
            Défausse:{" "}
            {player1Discard.length > 0
              ? `${player1Discard[player1Discard.length - 1].value} ${
                  player1Discard[player1Discard.length - 1].suit
                }`
              : "Vide"}
          </CardContent>
        </Card>
        <Card className="mb-2">
          <CardContent>Pioche: {player1Deck.length} cartes 
          {player1Deck.length > 0
          ? `${player1Deck[player1Deck.length - 1].value}
                  ${player1Deck[player1Deck.length - 1].suit}`
                  : "Vide"}
                   </CardContent>`
        </Card>
        <div className="flex space-x-2 mb-2">
          {player1Hand.map((card, index) => (
            <Button
              key={index}
              onClick={() => playHandCard(1, index)}
              disabled={turn !== 1}
            >
              {card.value} {card.suit}
            </Button>
          ))}
        </div>
        <Button
          onClick={() => drawCard(1)}
          disabled={turn !== 1 || player1Deck.length === 0}
        >
          Piocher
        </Button>
      </div>

      <div className="flex flex-col items-center">
        <h2 className="text-xl mb-2">Joueur 2</h2>
        <Card className="mb-2">
        <CardContent>Pile: {player2Hand.length} cartes 
          {player2Hand.length > 0
          ? `${player2Hand[player2Hand.length - 1].value}
                  ${player2Hand[player2Hand.length - 1].suit}`
                  : "Vide"}
                   </CardContent>`
        </Card>
        <Card className="mb-2">
          <CardContent>
            Défausse:{" "}
            {player2Discard.length > 0
              ? `${player2Discard[player2Discard.length - 1].value} ${
                  player2Discard[player2Discard.length - 1].suit
                }`
              : "Vide"}
          </CardContent>
        </Card>
        <Card className="mb-2">
          <CardContent>Pioche: {player2Deck.length} cartes 
          {player2Deck.length > 0
          ? `${player2Deck[player2Deck.length - 1].value}
                  ${player2Deck[player2Deck.length - 1].suit}`
                  : "Vide"}
                   </CardContent>`
        </Card>
        <div className="flex space-x-2 mb-2">
          {player2Hand.map((card, index) => (
            <Button
              key={index}
              onClick={() => playHandCard(2, index)}
              disabled={turn !== 2}
            >
              {card.value} {card.suit}
            </Button>
          ))}
        </div>
        <Button
          onClick={() => drawCard(2)}
          disabled={turn !== 2 || player2Deck.length === 0}
        >
          Piocher
        </Button>
      </div>

      <div className="col-span-2 flex justify-center mt-4">
        <div className="grid grid-cols-4 gap-4">
          {commonPiles.map((pile, index) => (
            <Card key={index} className="p-2 text-center">
              <CardContent>
                {pile.length > 0
                  ? `${pile[pile.length - 1].value} ${
                      pile[pile.length - 1].suit
                    }`
                  : "Vide"}
              </CardContent>
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
        Tour du Joueur {turn}
      </motion.div>
      <div>
      <h3>Pioche joueur 1:</h3>
        <pre>{JSON.stringify(player1Deck, null, 2)}</pre>

      <h3>Main joueur 1:</h3>
        <pre>{JSON.stringify(player1Hand, null, 2)}</pre>

        <h3>Common Piles:</h3>
        <pre>{JSON.stringify(commonPiles, null, 2)}</pre>
      </div>
    
    </div>
    
  );
}
