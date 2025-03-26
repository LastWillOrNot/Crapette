import { SUITS, CARD_VALUES } from './constants';
import { Card as CardType } from "./types";

export function shuffleDeck(deck: CardType[]) {
  return deck.sort(() => Math.random() - 0.5);
}

export function createShuffledDeck() {
  const newDeck: CardType[] = [];
  SUITS.forEach((suit) => {
    CARD_VALUES.forEach((value) => {
      newDeck.push({ suit, value });
    });
  });
  return shuffleDeck(newDeck);
}