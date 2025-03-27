import { SUITS, CARD_VALUES } from './constants';
import { CardItem } from "./types";

export function shuffleDeck(deck: CardItem[]) {
  return deck.sort(() => Math.random() - 0.5);
}

export function createShuffledDeck() {
  const newDeck: CardItem[] = [];
  SUITS.forEach((suit) => {
    CARD_VALUES.forEach((value) => {
      newDeck.push({ suit, value });
    });
  });
  return shuffleDeck(newDeck);
}